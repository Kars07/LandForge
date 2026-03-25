import hashlib
import logging
import base64
import json
from typing import Optional

from pydantic import BaseModel, Field

from nat.builder.builder import Builder
from nat.builder.framework_enum import LLMFrameworkEnum
from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.function import FunctionBaseConfig

logger = logging.getLogger(__name__)


class VerifyDocumentInput(BaseModel):
    document_base64: str = Field(
        description="Base64-encoded document bytes (PDF or image scan)."
    )
    document_type: str = Field(
        description=(
            "Type of document. Must be one of: title_deed, certificate_of_occupancy, "
            "survey_plan, deed_of_assignment, power_of_attorney."
        )
    )
    agent_additional_context: Optional[str] = Field(
        default=None,
        description="Optional note from the agent about the document."
    )


class VerifyDocumentOutput(BaseModel):
    document_type: str
    is_verified: bool
    extracted_fields: dict
    missing_fields: list
    confidence_score: float
    rejection_reasons: list
    raw_text_preview: str
    document_base64: str
    next_step: str


class LandforgeVerifyDocumentFunctionConfig(FunctionBaseConfig, name="landforge_verify_document"):
    """Verifies a real estate document and extracts key fields."""
    supported_doc_types: list[str] = Field(
        default=[
            "title_deed",
            "certificate_of_occupancy",
            "survey_plan",
            "deed_of_assignment",
            "power_of_attorney",
        ],
    )
    verification_strictness: str = Field(default="strict")


@register_function(
    config_type=LandforgeVerifyDocumentFunctionConfig,
    framework_wrappers=[LLMFrameworkEnum.LANGCHAIN],
)
async def landforge_verify_document_function(
    config: LandforgeVerifyDocumentFunctionConfig,
    builder: Builder,
):
    async def verify_document(input: VerifyDocumentInput) -> VerifyDocumentOutput:
        """
        Verifies a real estate document uploaded by an agent.
        Accepts a base64-encoded document (PDF or image), validates the document type,
        extracts all required fields, and returns a structured verification report.
        If is_verified is true, immediately call hash_document with the same
        document_base64 and the extracted_fields JSON string.
        """
        document_base64 = input.document_base64
        document_type = input.document_type
        agent_additional_context = input.agent_additional_context

        if document_type not in config.supported_doc_types:
            return VerifyDocumentOutput(
                document_type=document_type,
                is_verified=False,
                extracted_fields={},
                missing_fields=[],
                confidence_score=0.0,
                rejection_reasons=[
                    f"Unsupported document type '{document_type}'. "
                    f"Accepted: {config.supported_doc_types}"
                ],
                raw_text_preview="",
                document_base64=document_base64,
                next_step="Verification failed — unsupported document type.",
            )

        try:
            doc_bytes = base64.b64decode(document_base64)
        except Exception as exc:
            return VerifyDocumentOutput(
                document_type=document_type,
                is_verified=False,
                extracted_fields={},
                missing_fields=[],
                confidence_score=0.0,
                rejection_reasons=[f"Failed to decode base64: {str(exc)}"],
                raw_text_preview="",
                document_base64=document_base64,
                next_step="Verification failed — invalid base64.",
            )

        required_fields_map = {
            "title_deed": ["owner_name", "property_address", "plot_number",
                           "registration_number", "issuing_authority", "date_of_issue"],
            "certificate_of_occupancy": ["owner_name", "property_address", "c_of_o_number",
                                          "state_government", "date_of_issue", "expiry_date"],
            "survey_plan": ["surveyor_name", "surveyor_license_number", "property_address",
                            "beacon_numbers", "area_sqm", "date_of_survey"],
            "deed_of_assignment": ["assignor_name", "assignee_name", "property_address",
                                   "consideration_amount", "date_of_assignment", "witnesses"],
            "power_of_attorney": ["grantor_name", "attorney_name", "scope_of_authority",
                                  "property_address", "date_of_execution", "notary_seal"],
        }

        required_fields = required_fields_map.get(document_type, [])

        try:
            doc_text = doc_bytes.decode("utf-8")
        except Exception:
            doc_text = doc_bytes.decode("latin-1", errors="replace")

        prefix_map = {
            "owner_name":              ["Owner Name:", "Owner:"],
            "property_address":        ["Property Address:", "Address:"],
            "c_of_o_number":           ["C of O Number:", "CofO:"],
            "state_government":        ["State Government:", "State:"],
            "date_of_issue":           ["Date of Issue:", "Issued:"],
            "expiry_date":             ["Expiry Date:", "Expiry:"],
            "plot_number":             ["Plot Number:", "Plot:"],
            "registration_number":     ["Registration Number:", "Registration:"],
            "issuing_authority":       ["Issuing Authority:", "Authority:"],
            "surveyor_name":           ["Surveyor Name:", "Surveyor:"],
            "surveyor_license_number": ["License Number:", "License:"],
            "beacon_numbers":          ["Beacon Numbers:", "Beacon:"],
            "area_sqm":                ["Area (sqm):", "Area:"],
            "date_of_survey":          ["Date of Survey:", "Survey Date:"],
            "assignor_name":           ["Assignor Name:", "Assignor:"],
            "assignee_name":           ["Assignee Name:", "Assignee:"],
            "consideration_amount":    ["Consideration:", "Amount:"],
            "date_of_assignment":      ["Date of Assignment:", "Assignment Date:"],
            "witnesses":               ["Witnesses:", "Witness:"],
            "grantor_name":            ["Grantor Name:", "Grantor:"],
            "attorney_name":           ["Attorney Name:", "Attorney:"],
            "scope_of_authority":      ["Scope of Authority:", "Scope:"],
            "date_of_execution":       ["Date of Execution:", "Execution Date:"],
            "notary_seal":             ["Notary Seal:", "Notary:"],
        }

        extracted = {}
        missing = []
        for field in required_fields:
            value = None
            for line in doc_text.splitlines():
                for prefix in prefix_map.get(field, []):
                    if line.strip().lower().startswith(prefix.lower()):
                        value = line.split(":", 1)[-1].strip()
                        break
                if value:
                    break
            if value:
                extracted[field] = value
            else:
                missing.append(field)

        is_verified = (
            len(missing) == 0 if config.verification_strictness == "strict"
            else (len(extracted) / len(required_fields) >= 0.7 if required_fields else True)
        )
        confidence = round(len(extracted) / len(required_fields), 2) if required_fields else 1.0

        logger.info("verify_document | type=%s | verified=%s | confidence=%.2f",
                    document_type, is_verified, confidence)

        return VerifyDocumentOutput(
            document_type=document_type,
            is_verified=is_verified,
            extracted_fields=extracted,
            missing_fields=missing,
            confidence_score=confidence,
            rejection_reasons=([f"Missing required fields: {missing}"] if missing else []),
            raw_text_preview=doc_text[:500],
            document_base64=document_base64,
            next_step=(
                f"is_verified=true. Call hash_document now. "
                f"Use document_base64 from this result and pass this exact string as verified_fields_json: "
                f"{json.dumps(extracted, separators=(',', ':'))}"
            ) if is_verified else "Verification failed. Do not proceed to hashing.",
        )

    yield FunctionInfo.from_fn(
        verify_document,
        input_schema=VerifyDocumentInput,
        description=verify_document.__doc__,
    )