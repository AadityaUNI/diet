from pydantic import BaseModel, PositiveInt
from typing import Literal

class ConstraintInput(BaseModel):
    fitness_goals: str
    age: PositiveInt
    sex: Literal["Male", "Female"]
    height: PositiveInt
    weight: PositiveInt
    region: str
    activity_level: str 
    health_conditions: list[str]
    required_food_items: list[str]
    dietary_restrictions: list[str]


class Ingredients(BaseModel):
    id: PositiveInt
    amount: float
    
class Meals(BaseModel):
    name: str
    ingredients: list[Ingredients]
    
class PlanData(BaseModel):
    name: str
    meals: list[Meals]

class GeminiOutput(BaseModel):
    skipped_items: list[str]
    plans: list[PlanData]
    