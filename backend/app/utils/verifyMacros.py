from copy import deepcopy

from app.models.mealModels import AnalyzePlan, PlanData
from app.models.outputModels import GeminiOutput


def _fibre_value(food: dict) -> float:
    return float(food.get("fibre", food.get("fiber", 0)) or 0)


def _food_with_amount(food: dict, amount: float) -> dict:
    result = deepcopy(food)
    result["amount"] = amount
    result["fibre"] = _fibre_value(food)
    result.pop("fiber", None)
    return result


def hydrate_plan(plan: PlanData | AnalyzePlan, regional: list[dict]) -> dict:
    lookup = {int(item["id"]): item for item in regional}
    plan_data = {
        "name": plan.name,
        "meals": [],
        "total_calories": 0.0,
        "total_carbs": 0.0,
        "total_fats": 0.0,
        "total_protein": 0.0,
        "total_fibre": 0.0,
    }

    for meal in plan.meals:
        meal_data = {
            "name": meal.name,
            "ingredients": [],
            "total_calories": 0.0,
            "total_carbs": 0.0,
            "total_fats": 0.0,
            "total_protein": 0.0,
            "total_fibre": 0.0,
        }

        for ingredient in meal.ingredients:
            food = lookup.get(int(ingredient.id))
            if food is None:
                raise ValueError(f"Unknown food item id: {ingredient.id}")

            amount = float(ingredient.amount)
            hydrated_food = _food_with_amount(food, amount)
            scale = amount / 100
            meal_data["ingredients"].append(hydrated_food)
            meal_data["total_calories"] += float(food.get("calories", 0)) * scale
            meal_data["total_carbs"] += float(food.get("carbs", 0)) * scale
            meal_data["total_fats"] += float(food.get("fat", 0)) * scale
            meal_data["total_protein"] += float(food.get("protein", 0)) * scale
            meal_data["total_fibre"] += float(food.get("fibre", 0)) * scale

        for key in ("total_calories", "total_carbs", "total_fats", "total_protein", "total_fibre"):
            meal_data[key] = round(meal_data[key], 2)
            plan_data[key] += meal_data[key]
        plan_data["meals"].append(meal_data)

    for key in ("total_calories", "total_carbs", "total_fats", "total_protein", "total_fibre"):
        plan_data[key] = round(plan_data[key], 2)
    return plan_data


def hydrate_plans(output: GeminiOutput, regional: list[dict]) -> list[dict]:
    plans = []
    for plan in output.plans:
        try:
            plans.append(hydrate_plan(plan, regional))
        except ValueError:
            continue
    return plans
