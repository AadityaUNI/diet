from mock_test_data import FOOD_CATALOG

HYDRATED = {
        "name": "Plan 1",
        "meals": [
            {
                "id": 11,
                "name": "Breakfast",
                "ingredients": [
                    {
                        "id": 1,
                        "name": "Apples, Fuji, With Skin, Raw",
                        "calories": 64.7,
                        "protein": 0.15,
                        "carbs": 15.7,
                        "fat": 0.16,
                        "fibre": 2.08,
                        "amount": 150,
                    }
                ],
                "total_calories": 97.05,
                "total_carbs": 23.55,
                "total_fats": 0.24,
                "total_fibre": 3.12,
                "total_protein": 0.22,
            },
            {
                "id": 12,
                "name": "Lunch",
                "ingredients": [
                    {
                        "id": 2,
                        "name": "Apples, Gala, With Skin, Raw",
                        "calories": 61.0,
                        "protein": 0.13,
                        "carbs": 14.8,
                        "fat": 0.15,
                        "fibre": 2.11,
                        "amount": 100,
                    }
                ],
                "total_calories": 61.0,
                "total_carbs": 14.8,
                "total_fats": 0.15,
                "total_fibre": 2.11,
                "total_protein": 0.13,
            },
        ],
        "total_calories": 158.05,
        "total_carbs": 38.35,
        "total_fats": 0.39,
        "total_protein": 0.35,
        "total_fibre": 5.23
    }

USER_ID = "user-1"

FUJI = {"id": 1, "name": "Apples, Fuji, With Skin, Raw", "calories": 64.7, "protein": 0.15, "carbs": 15.7, "fat": 0.16, "fibre": 2.08}
GALA = {"id": 2, "name": "Apples, Gala, With Skin, Raw", "calories": 61.0, "protein": 0.13, "carbs": 14.8, "fat": 0.15, "fibre": 2.11}
GRANNY_SMITH = {"id": 3, "name": "Apples, Granny Smith, With Skin, Raw", "calories": 58.9, "protein": 0.27, "carbs": 14.1, "fat": 0.14, "fibre": 2.51}

# saved meals in the original plans, with different ingredients/amounts to HYDRATED
ORIGINAL_BREAKFAST = {
    "id": 11,
    "name": "Breakfast",
    "total_calories": 58.9,
    "total_carbs": 14.1,
    "total_fats": 0.14,
    "total_fibre": 2.51,
    "total_protein": 0.27,
    "planID": 5,
    "meal_completed": True,
    "meal_items": [
        {"amount": 100, "foodID": 3, "food_item": GRANNY_SMITH},
    ],
}

ORIGINAL_LUNCH = {
    "id": 12,
    "name": "Lunch",
    "total_calories": 152.5,
    "total_carbs": 37.0,
    "total_fats": 0.38,
    "total_fibre": 5.28,
    "total_protein": 0.33,
    "planID": 5,
    "meal_completed": False,
    "meal_items": [
        {"amount": 250, "foodID": 2, "food_item": GALA},
    ],
}

ORIGINAL_DINNER = {
    "id": 13,
    "name": "Dinner",
    "total_calories": 64.7,
    "total_carbs": 15.7,
    "total_fats": 0.16,
    "total_fibre": 2.08,
    "total_protein": 0.15,
    "planID": 5,
    "meal_completed": False,
    "meal_items": [
        {"amount": 100, "foodID": 1, "food_item": FUJI},
    ],
}

# meals frontend_plan should produce from HYDRATED
EXPECTED_BREAKFAST = {
    "id": 11,
    "name": "Breakfast",
    "total_calories": 97.05,
    "total_carbs": 23.55,
    "total_fats": 0.24,
    "total_fibre": 3.12,
    "total_protein": 0.22,
    "planID": 5,
    "meal_completed": False,
    "meal_items": [
        {"amount": 150, "foodID": 1, "mealID": 11, "food_item": FUJI},
    ],
}

EXPECTED_LUNCH = {
    "id": 12,
    "name": "Lunch",
    "total_calories": 61.0,
    "total_carbs": 14.8,
    "total_fats": 0.15,
    "total_fibre": 2.11,
    "total_protein": 0.13,
    "planID": 5,
    "meal_completed": False,
    "meal_items": [
        {"amount": 100, "foodID": 2, "mealID": 12, "food_item": GALA},
    ],
}

# lunch id isn't in the original plan, so it becomes a new meal
EXPECTED_NEW_LUNCH = {
    **EXPECTED_LUNCH,
    "id": -1,
    "meal_items": [
        {"amount": 100, "foodID": 2, "mealID": -1, "food_item": GALA},
    ],
}

EXPECTED_PLAN_FIELDS = {
    "id": 5,
    "name": "Plan 1",
    "total_calories": 158.05,
    "total_carbs": 38.35,
    "total_fats": 0.39,
    "total_fibre": 5.23,
    "total_protein": 0.35,
    "userID": USER_ID,
}


# same meals ids, different ingredients 
ORIGINAL_1 = {
    "id": 5,
    "name": "Old Plan",
    "total_calories": 211.4,
    "total_carbs": 51.1,
    "total_fats": 0.52,
    "total_fibre": 7.79,
    "total_protein": 0.6,
    "userID": USER_ID,
    "meals": [ORIGINAL_BREAKFAST, ORIGINAL_LUNCH],
}

EXPECTED_1 = {
    **EXPECTED_PLAN_FIELDS,
    "meals": [EXPECTED_BREAKFAST, EXPECTED_LUNCH],
}


# more meals
ORIGINAL_2 = {
    "id": 5,
    "name": "Old Plan",
    "total_calories": 58.9,
    "total_carbs": 14.1,
    "total_fats": 0.14,
    "total_fibre": 2.51,
    "total_protein": 0.27,
    "userID": USER_ID,
    "meals": [ORIGINAL_BREAKFAST],
}

EXPECTED_2 = {
    **EXPECTED_PLAN_FIELDS,
    "meals": [EXPECTED_BREAKFAST, EXPECTED_NEW_LUNCH],
}


# lesser meals 
ORIGINAL_3 = {
    "id": 5,
    "name": "Old Plan",
    "total_calories": 276.1,
    "total_carbs": 66.8,
    "total_fats": 0.68,
    "total_fibre": 9.87,
    "total_protein": 0.75,
    "userID": USER_ID,
    "meals": [ORIGINAL_BREAKFAST, ORIGINAL_LUNCH, ORIGINAL_DINNER],
}

EXPECTED_3 = {
    **EXPECTED_PLAN_FIELDS,
    "meals": [EXPECTED_BREAKFAST, EXPECTED_LUNCH],
}
