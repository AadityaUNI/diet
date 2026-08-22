import json 
import io 
import csv
from google.genai import types

from app.models.models import ConstraintInput

def to_csv_string(regional):
    headers = regional[0].keys()
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=headers)
    writer.writeheader()
    
    for row in regional: 
        writer.writerow(row)
    return buffer.getvalue()
    
def call_gemini(constraints: ConstraintInput, regional_list: list, gemini):
    prompt = f"""You are an expert dietitian and home cook specializing in creating therapeutic diets that adhere to specific health conditions (e.g., inflammation, RA) and dietary restrictions (e.g., vegan, vegetarian). Your primary objective is to hit the patient's goal calorie target for the day, and their macronutrient needs (carbohydrates, fats, proteins, fibre), based on their specific fitness goals.

        ### Core Task: Meal Plan Generation
        You will be provided with a CSV list of available food items (regional and global). You must generate 3 distinct daily meal plans based on the user's profile and constraints.

        ### Ingredient Data Format
        All nutrient values (protein, carbs, fat, calories, fibre) in the provided list are PER 100 GRAMS of the food item. When you specify an `amount` for an ingredient in your output, it must be in GRAMS — this amount will be used to scale the per-100g values (actual contribution = value * amount / 100) to compute real macro totals. Choose amounts that are realistic serving sizes and that cause the plan to hit the daily targets once scaled.

        ### Guidelines & Rules
        1. STRICT INGREDIENT USAGE: Use ONLY ingredients from the provided list, referenced ONLY by their exact `id` from that list — do NOT invent or hallucinate food items or ids, and do not output ingredient names, macros, or any other fields.

        2. THINK LIKE A COOK, NOT A CALCULATOR: For every meal, first decide what the meal actually IS — a real, appetizing, recognizable dish or plate (e.g. "paneer and vegetable stir-fry with rice", "oats with fruit and nuts"), appropriate to the meal slot (breakfast/lunch/dinner/snack), the region, and the dietary restrictions. Only after you've settled on the dish concept should you choose ingredient amounts to bring its macros toward the targets. Never assemble a meal by picking whatever ingredients happen to sum to the right numbers — every meal should read like something a person would actually want to sit down and eat, not a bundle of foods optimized for a spreadsheet.

        3. MUST-HAVE FOODS — HIGH PRIORITY: The client's "must-have" foods matter a lot and should be worked into the plans whenever there is any reasonable way to do so, even if that costs some precision elsewhere. Only skip a must-have and list it in `skipped_items` if it is genuinely incompatible — e.g. it directly conflicts with a dietary restriction or health condition, or including it at all would make it impossible to build a sane meal. Do not skip a must-have just because it makes hitting the calorie/macro targets exactly harder; it's fine for the plan to land a bit off-target in order to keep something like "tea" or "must-have vegetable X" in there.

        4. GOAL CALORIES & MACRO TARGETS: The single most important numeric target is the client's Goal Calories, provided below — get each plan's total as close to this number as you reasonably can. Macro targets (protein, carbs, fat, fibre) matter too, but small deviations in either calories or macros are acceptable, especially when they're the trade-off for including a must-have food or keeping a meal realistic and appetizing — a slightly-off plan someone will actually eat is more useful than a perfectly-optimized one that isn't sustainable. Ensure all 3 plans independently land close to the goal calories and are as diverse from each other as possible in ingredients and dishes.

        5. MICRO-NUTRIENTS: Since micro-nutrient data is absent, approximate completeness by ensuring a wide variety of meals and ingredients across the plans.

        LASTLY AND VERY IMPORTANTLY: Treat the Goal Calories figure below as the target to get as close to as possible for each plan, adjusting protein/carbs/fat/fibre to sensible levels around it — by scaling ingredient amounts appropriately or using a well-chosen set of meals — while still keeping every meal a real, coherent dish.


        ### User Constraints
        - Goal calories (target for each plan): {constraints.goal_calories} kcal
        - Fitness goals: {constraints.fitness_goals}
        - Age: {constraints.age} years
        - Biological Sex: {constraints.sex}
        - Height: {constraints.height} cm
        - Weight: {constraints.weight} kg
        - Activity level: {constraints.activity_level}
        - Health conditions: {', '.join(constraints.health_conditions)}
        - Must include: {', '.join(constraints.required_food_items)}
        - Dietary restrictions: {', '.join(constraints.dietary_restrictions)}

        ### Available Ingredients (CSV: id,name,protein,carbs,fat,calories,fibre — all values per 100g)
        {to_csv_string(regional_list)}

        ### Output Format
        Return ONLY a valid JSON object. Do not include markdown formatting, do not include any other text, and do not provide explanations. Each ingredient entry must contain ONLY `foodID` and `amount` (grams) — no other fields. Use the exact schema below:

        {{
        "skipped_items": ["item1", "item2"],
        "plans": [
            {{
            "name": "Plan 1",
            "meals": [
                {{
                "name": "Breakfast",
                "ingredients": [
                    {{
                    "id": 0,
                    "amount": 0
                    }}
                ]
                }}
            ]
            }}
        ]
        }}
        """
        
    print(f"PROMPT LENGTH: {len(prompt)} chars, {len(regional_list)} food items")

    import time
    start = time.time()
    response = gemini.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        # config=types.GenerateContentConfig(
        # thinking_config=types.ThinkingConfig(thinking_level="high")
        # )
    )
    print(f"GEMINI CALL TOOK: {time.time() - start:.2f}s")


    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        cleaned = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)