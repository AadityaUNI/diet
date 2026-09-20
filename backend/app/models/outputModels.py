from pydantic import BaseModel, Field
from typing import Literal
from app.models.mealModels import AnalyzePlan, PlanData

class GeminiOutput(BaseModel):
    skipped_items: list[str]
    plans: list[PlanData]


class AnalyzeChange(BaseModel):
    category: Literal["amount", "ingredient", "meal"]
    title: str
    description: str
    meal_name: str | None = None


class AnalyzedOutput(BaseModel):
    summary: str
    missing: list[str]
    changes: list[AnalyzeChange]
    proposed_plan: AnalyzePlan
    