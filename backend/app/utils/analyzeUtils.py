def profile_context(profile: dict, region: str) -> dict:
    return {
        "fitness_goal": profile.get("fitness_goals", ""),
        "goal_calories": profile.get("goal_calories", profile.get("calorie_target")),
        "protein_target": profile.get("protein_target"),
        "carbs_target": profile.get("carbs_target"),
        "fat_target": profile.get("fat_target"),
        "fibre_target": profile.get("fibre_target", profile.get("fiber_target")),
        "health_conditions": profile.get("health_conditions", []),
        "dietary_restrictions": profile.get("dietary_restrictions", []),
        "required_food_items": profile.get("required_food_items", []),
        "region": region,
    }


def match_meal_ids(original_meals, hydrated_meals: list[dict]) -> list[int]:
    # Gemini echoes back each meal's saved id (-1 for new meals). Keep an id only if it
    # belongs to the original plan and hasn't been claimed yet; everything else gets a
    # unique negative id so the frontend inserts it.
    unused = {meal.id for meal in original_meals}
    matched = []
    next_new_id = -1
    for meal in hydrated_meals:
        meal_id = meal.get("id")
        if meal_id in unused:
            unused.remove(meal_id)
        else:
            meal_id = next_new_id
            next_new_id -= 1
        matched.append(meal_id)
    return matched

# takes in the original plan, hydrated new plan, and maps the old plan to the new plan, 
# changing any meal with the same id, adding new meals and removing not found meals. 
def frontend_plan(original, hydrated: dict, user_id: str) -> dict:
    proposed = {
        "id": original.id,
        "name": hydrated["name"],
        "total_calories": hydrated["total_calories"],
        "total_carbs": hydrated["total_carbs"],
        "total_fats": hydrated["total_fats"],
        "total_fibre": hydrated["total_fibre"],
        "total_protein": hydrated["total_protein"],
        "userID": user_id,
        "meals": [],
    }

    meal_ids = match_meal_ids(original.meals, hydrated["meals"])

    for meal, meal_id in zip(hydrated["meals"], meal_ids):
        meal_data = {
            "id": meal_id,
            "name": meal["name"],
            "total_calories": meal["total_calories"],
            "total_carbs": meal["total_carbs"],
            "total_fats": meal["total_fats"],
            "total_fibre": meal["total_fibre"],
            "total_protein": meal["total_protein"],
            "planID": original.id,
            "meal_completed": False,
            "meal_items": [],
        }
        for ingredient in meal["ingredients"]:
            food_item = {key: value for key, value in ingredient.items() if key != "amount"}
            meal_data["meal_items"].append({
                "amount": ingredient["amount"],
                "foodID": ingredient["id"],
                "mealID": meal_id,
                "food_item": food_item,
            })
        proposed["meals"].append(meal_data)
    return proposed
