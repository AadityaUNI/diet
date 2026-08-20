"""
Mock fixture data for testing hydrate_plans().

Notes
-----
- hydrate_plans() returns list[dict] directly (NOT wrapped in {"plans": [...]}).
  skipped_items on the input is never read by the function, so it plays no
  role in the expected output.
- Your function reads food_data["fibre"] (British spelling). The uploaded
  globalCleaned.json uses "fiber" (American). FOOD_CATALOG below uses
  "fibre" to match hydrate_plans() exactly -- double check your real
  `regional` list actually uses "fibre", or the function will KeyError.
- Each hydrated ingredient is the full regional-list dict for that id, with
  "amount" merged in -- not a separate id/amount-only object.
- Dict key order doesn't matter for a plain == comparison in pytest.

Usage
-----
    from hydrate_plans_test_data import (
        FOOD_CATALOG,
        TEST_1_INPUT, TEST_1_EXPECTED,
        TEST_2_INPUT, TEST_2_EXPECTED,
        TEST_3_INPUT, TEST_3_EXPECTED,
    )

    def test_basic_valid():
        result = hydrate_plans(GeminiOutput(**TEST_1_INPUT), FOOD_CATALOG)
        assert result == TEST_1_EXPECTED
"""

# Only the first 3 catalog items are used, to keep every test easy to eyeball.
FOOD_CATALOG = [
    {
        "id": 1,
        "name": "Apples, Fuji, With Skin, Raw",
        "calories": 64.7,
        "protein": 0.15,
        "carbs": 15.7,
        "fat": 0.16,
        "fibre": 2.08,
    },
    {
        "id": 2,
        "name": "Apples, Gala, With Skin, Raw",
        "calories": 61.0,
        "protein": 0.13,
        "carbs": 14.8,
        "fat": 0.15,
        "fibre": 2.11,
    },
    {
        "id": 3,
        "name": "Apples, Granny Smith, With Skin, Raw",
        "calories": 58.9,
        "protein": 0.27,
        "carbs": 14.1,
        "fat": 0.14,
        "fibre": 2.51,
    },
]


# ---------------------------------------------------------------------------
# Test 1 -- basic valid: one plan, two meals, all correct values.
# Nothing should be dropped.
# ---------------------------------------------------------------------------
TEST_1_INPUT = {
    "skipped_items": [],
    "plans": [
        {
            "name": "Plan 1",
            "meals": [
                {"name": "Breakfast", "ingredients": [{"id": 1, "amount": 150}]},
                {"name": "Lunch", "ingredients": [{"id": 2, "amount": 100}]},
            ],
        }
    ],
}

TEST_1_EXPECTED = [
    {
        "name": "Plan 1",
        "meals": [
            {
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
        "total_fibre": 5.23,
    }
]

# invalid id (but valid number) and same for amount 

TEST_3_INPUT = {
    "skipped_items": [],
    "plans": [
        {
            "name": "Plan 1",
            "meals": [
                {"name": "Breakfast", "ingredients": [{"id": 10000, "amount": 100}]},
            ],
        },
        {
            "name": "Plan 2",
            "meals": [
                {"name": "Breakfast", "ingredients": [{"id": 3, "amount": -50}]},
            ],
        },
    ],
}

TEST_3_EXPECTED = []