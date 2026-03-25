import logging
import json
from typing import Optional

from pydantic import BaseModel, Field

from nat.builder.builder import Builder
from nat.builder.framework_enum import LLMFrameworkEnum
from nat.builder.function_info import FunctionInfo
from nat.cli.register_workflow import register_function
from nat.data_models.function import FunctionBaseConfig

logger = logging.getLogger(__name__)


class AreaIntelligenceInput(BaseModel):
    location: str = Field(
        description=(
            "Property address or neighbourhood to research. "
            "Examples: 'Lekki Phase 1, Lagos', 'Maitama, Abuja', 'GRA, Port Harcourt'."
        )
    )
    topics: Optional[str] = Field(
        default=None,
        description=(
            "Optional comma-separated topics to search. "
            "E.g. 'flood risk,school proximity'. "
            "Defaults to: flood risk, safety, infrastructure, development plans, environmental hazards."
        )
    )


class AreaIntelligenceOutput(BaseModel):
    location: str
    country: str
    topics: list
    search_query_plan: dict
    max_results_per_topic: int
    next_step: str


class LandforgeAreaIntelligenceFunctionConfig(FunctionBaseConfig, name="landforge_area_intelligence"):
    """Generates web search queries for Nigerian property area intelligence."""
    default_topics: list[str] = Field(
        default=[
            "flood risk",
            "safety and crime rate",
            "road and infrastructure quality",
            "development plans",
            "environmental hazards",
            "schools hospitals markets proximity",
        ],
    )
    max_results_per_topic: int = Field(default=3)
    default_country: str = Field(default="Nigeria")


@register_function(
    config_type=LandforgeAreaIntelligenceFunctionConfig,
    framework_wrappers=[LLMFrameworkEnum.LANGCHAIN],
)
async def landforge_area_intelligence_function(
    config: LandforgeAreaIntelligenceFunctionConfig,
    builder: Builder,
):
    async def gather_area_intelligence(input: AreaIntelligenceInput) -> AreaIntelligenceOutput:
        """
        Generates a web search plan for a Nigerian property location covering flood risk,
        safety, crime rate, infrastructure, development plans, and environmental hazards.
        After calling this tool, execute each query in search_query_plan using
        tavily_internet_search, then write a risk_summary paragraph for the buyer.
        """
        topic_list = (
            [t.strip() for t in input.topics.split(",") if t.strip()]
            if input.topics
            else config.default_topics
        )

        search_query_plan = {
            topic: f'"{input.location}" {config.default_country} {topic}'
            for topic in topic_list
        }

        logger.info("gather_area_intelligence | location=%s", input.location)

        return AreaIntelligenceOutput(
            location=input.location,
            country=config.default_country,
            topics=topic_list,
            search_query_plan=search_query_plan,
            max_results_per_topic=config.max_results_per_topic,
            next_step=(
                f"Call tavily_internet_search for each query in search_query_plan. "
                f"Collect up to {config.max_results_per_topic} results per topic. "
                "Summarise findings as a risk_summary for the buyer."
            ),
        )

    yield FunctionInfo.from_fn(
        gather_area_intelligence,
        input_schema=AreaIntelligenceInput,
        description=gather_area_intelligence.__doc__,
    )