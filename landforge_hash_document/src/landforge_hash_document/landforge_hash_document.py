import hashlib
import logging
import base64
import json

from pydantic import BaseModel, Field

from nat.builder.builder import Builder
from nat.builder.framework_enum import LLMFrameworkEnum
from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.function import FunctionBaseConfig

logger = logging.getLogger(__name__)


class HashDocumentInput(BaseModel):
    document_base64: str = Field(
        description="The exact same base64 document bytes passed to verify_document."
    )
    verified_fields_json: str = Field(
        description=(
            "The extracted_fields from verify_document serialised as a JSON string. "
            "Example: '{\"owner_name\": \"John\", \"property_address\": \"Lagos\"}'"
        )
    )


class HashDocumentOutput(BaseModel):
    document_hash: str
    fields_hash: str
    algorithm: str
    document_bytes: int
    status: str


class LandforgeHashDocumentFunctionConfig(FunctionBaseConfig, name="landforge_hash_document"):
    """Generates SHA-256 fingerprints of a verified document for smart contract anchoring."""


@register_function(
    config_type=LandforgeHashDocumentFunctionConfig,
    framework_wrappers=[LLMFrameworkEnum.LANGCHAIN],
)
async def landforge_hash_document_function(
    config: LandforgeHashDocumentFunctionConfig,
    builder: Builder,
):
    async def hash_document(input: HashDocumentInput) -> HashDocumentOutput:
        """
        Generates SHA-256 fingerprints of a verified real estate document for smart contract use.
        Only call this after verify_document returns is_verified=true.
        Returns document_hash for on-chain smart contract storage and fields_hash for metadata integrity.
        Pass the full extracted_fields dict from verify_document as a JSON string in verified_fields_json.
        """
        try:
            doc_bytes = base64.b64decode(input.document_base64)
        except Exception as exc:
            return HashDocumentOutput(
                document_hash="",
                fields_hash="",
                algorithm="sha256",
                document_bytes=0,
                status=f"Error: Failed to decode document: {str(exc)}",
            )

        document_hash = hashlib.sha256(doc_bytes).hexdigest()

        # Be tolerant of what the model passes — try to parse, fall back gracefully
        fields_hash = ""
        fields_status = ""
        raw = input.verified_fields_json.strip()

        # Model sometimes passes just "{" or a truncated string — detect and recover
        if not raw or raw in ("{", "}", "{}", "null", "None"):
            # Nothing usable — hash an empty object, note it in status
            fields_hash = hashlib.sha256(b"{}").hexdigest()
            fields_status = (
                "Warning: verified_fields_json was empty or malformed — "
                "fields_hash computed from empty object. "
                "Pass the full extracted_fields JSON for a valid fields_hash."
            )
        else:
            try:
                fields_obj = json.loads(raw)
                canonical = json.dumps(fields_obj, sort_keys=True, separators=(",", ":"))
                fields_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
                fields_status = (
                    "Fingerprinting complete. Pass document_hash to the smart contract "
                    "for on-chain storage. The listing is now cleared as verified."
                )
            except json.JSONDecodeError:
                # Try wrapping in braces in case model forgot them
                try:
                    fixed = raw if raw.startswith("{") else "{" + raw + "}"
                    fields_obj = json.loads(fixed)
                    canonical = json.dumps(fields_obj, sort_keys=True, separators=(",", ":"))
                    fields_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
                    fields_status = (
                        "Fingerprinting complete (fields JSON auto-corrected). "
                        "Pass document_hash to the smart contract for on-chain storage."
                    )
                except Exception:
                    # Last resort: hash the raw string as-is
                    fields_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()
                    fields_status = (
                        f"Warning: Could not parse verified_fields_json as JSON — "
                        f"fields_hash computed from raw string. "
                        f"document_hash is still valid for smart contract use."
                    )

        logger.info("hash_document | doc_hash=%s | fields_hash=%s", document_hash, fields_hash)

        return HashDocumentOutput(
            document_hash=document_hash,
            fields_hash=fields_hash,
            algorithm="sha256",
            document_bytes=len(doc_bytes),
            status=fields_status,
        )

    yield FunctionInfo.from_fn(
        hash_document,
        input_schema=HashDocumentInput,
        description=hash_document.__doc__,
    )