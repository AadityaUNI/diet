from pydantic import BaseModel, Field, PositiveInt, field_validator
from typing import Literal

class Ingredients(BaseModel):
    id: PositiveInt
    amount: float = Field(gt=0)
    
class Meals(BaseModel):
    name: str
    ingredients: list[Ingredients]
    
class PlanData(BaseModel):
    name: str
    meals: list[Meals] = Field(min_length=1)


class SavedFoodItem(BaseModel):
    id: PositiveInt
    name: str
    calories: float = Field(ge=0)
    protein: float = Field(ge=0)
    carbs: float = Field(ge=0)
    fat: float = Field(ge=0)
    fibre: float | None = Field(default=None, ge=0)
    fiber: float | None = Field(default=None, ge=0)


class SavedMealItem(BaseModel):
    amount: float = Field(gt=0)
    foodID: PositiveInt
    food_item: SavedFoodItem


class SavedMeal(BaseModel):
    id: PositiveInt
    name: str
    total_calories: float | None = Field(default=None, ge=0)
    total_carbs: float | None = Field(default=None, ge=0)
    total_fats: float | None = Field(default=None, ge=0)
    total_fibre: float | None = Field(default=None, ge=0)
    total_protein: float | None = Field(default=None, ge=0)
    planID: PositiveInt
    meal_completed: bool = False
    meal_items: list[SavedMealItem] = Field(min_length=1)


class SavedPlan(BaseModel):
    id: PositiveInt
    name: str
    total_calories: float | None = Field(default=None, ge=0)
    total_carbs: float | None = Field(default=None, ge=0)
    total_fats: float | None = Field(default=None, ge=0)
    total_fibre: float | None = Field(default=None, ge=0)
    total_protein: float | None = Field(default=None, ge=0)
    userID: str
    meals: list[SavedMeal] = Field(min_length=1)


class PlanIngredientChange(BaseModel):
    id: PositiveInt
    amount: float = Field(gt=0)


class AnalyzeMeal(BaseModel):
    name: str
    ingredients: list[PlanIngredientChange] = Field(min_length=1)


class AnalyzePlan(BaseModel):
    name: str
    meals: list[AnalyzeMeal] = Field(min_length=1)


class AnalyzeProfile(BaseModel):
    region: str = Field(min_length=1)
    fitness_goals: str = ""
    protein_target: float | str | None = None
    carbs_target: float | str | None = None
    fat_target: float | str | None = None
    fibre_target: float | str | None = None
    health_conditions: list[str] = Field(default_factory=list)
    dietary_restrictions: list[str] = Field(default_factory=list)
    required_food_items: list[str] = Field(default_factory=list)
    goal_calories: float | str | None = None


class AnalyzeRequest(BaseModel):
    plan: SavedPlan
    profile: AnalyzeProfile
    user_prompt: str | None = Field(default=None, max_length=500)
    calorie_target: PositiveInt

    @field_validator("user_prompt")
    @classmethod
    def normalize_prompt(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
