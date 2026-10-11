from pydantic import BaseModel, PositiveFloat, PositiveInt
from typing import Literal

class ConstraintInput(BaseModel):
    fitness_goals: str
    age: PositiveInt
    sex: Literal["Male", "Female"]
    height: PositiveFloat
    weight: PositiveFloat
    region: str
    activity_level: str 
    health_conditions: list[str]
    required_food_items: list[str]
    dietary_restrictions: list[str]
    goal_calories: PositiveInt
