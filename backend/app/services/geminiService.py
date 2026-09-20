import json 
import io 
import csv
from app.models.inputModels import ConstraintInput
from app.models.mealModels import AnalyzePlan
from app.utils.jsonUtils import cleaned_json

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
        model="gemini-3.5-flash",
        contents=prompt,
        # config=types.GenerateContentConfig(
        # thinking_config=types.ThinkingConfig(thinking_level="high")
        # )
    )
    print(f"GEMINI CALL TOOK: {time.time() - start:.2f}s")


    return cleaned_json(response.text)

    
def gemini_analyze(planData, gemini):
    plan = planData["plan"] if isinstance(planData, dict) else planData
    profile = planData.get("profile", {}) if isinstance(planData, dict) else {}
    user_prompt = planData.get("user_prompt") if isinstance(planData, dict) else None
    plan_json = plan.model_dump() if hasattr(plan, "model_dump") else plan

    if user_prompt:
        task_header = """You are an expert dietitian making a specific requested change to an existing
daily meal plan.

The client has asked for something specific — apply ONLY that request. Do not go looking for
unrelated shortcomings (macro drift, variety gaps, etc.) and do not "improve" anything the
client didn't ask about. If satisfying the request causes a minor, unavoidable side effect
(e.g. calories shift because a meal changed), that's fine, but it is never a reason to make
additional changes elsewhere.

Deliver the request in the smallest way that actually satisfies it."""
        must_have_and_order = """### Required change order
Apply in this order and stop at the first that satisfies the request:
1. Adjust ingredient amounts if that is enough.
2. Change or add individual ingredients only when amount changes are insufficient.
3. Replace or restructure a whole meal only when necessary to fulfil the request.

This order is a hard constraint, not a suggestion — do not jump to step 2 or 3 if step 1
would satisfy the request. Preserve every meal and ingredient the request doesn't concern.
Never make a change that isn't traceable directly to the request.

### Must-have foods
If a meal contains one or more of the user's must-have foods, do not replace that meal in
full unless the request specifically requires it. Prefer step 1 or step 2 changes for that
meal instead."""
        context_label = "### Request context"
        instruction_line = f"User request: {user_prompt}"
        missing_field_doc = '"missing": ["what the current plan lacks relative to the request"],'
    else:
        task_header = """You are an expert dietitian reviewing an existing daily meal plan.

Identify meaningful shortcomings in this plan — not cosmetic nitpicks — limited to:
1. Macro targets not met: calories, protein, carbs, or fat deviate materially from the
   profile's targets (a 2-3% gap is not meaningful; flag deviations large enough to matter).
2. Poor variety: a meal or the day leans on a narrow set of foods rather than spanning
   distinct whole-food groups (vegetables, fruits, whole grains, lean proteins, healthy fats,
   dairy/alternatives) needed to cover micronutrients.

Then propose the smallest real fix for the most significant shortcoming."""
        must_have_and_order = """### Required optimization order
Apply in this order and stop at the first that resolves the shortcoming:
1. Adjust ingredient amounts if that is enough.
2. Change individual ingredients only when amount changes are insufficient.
3. Replace or restructure a whole meal only when necessary.

This order is a hard constraint, not a suggestion — do not jump to step 2 or 3 if step 1
would fix it. Preserve meals and ingredients that already work. Never make a change that
isn't traceable to a specific shortcoming you listed.

### Must-have foods
If a meal contains one or more of the user's must-have foods, do not replace that meal in
full. Prefer step 1 or step 2 changes for that meal, or leave it untouched and address the
shortcoming elsewhere in the day."""
        context_label = "### Optimization context"
        instruction_line = "(No specific user request — running a general optimization pass.)"
        missing_field_doc = '"missing": ["specific shortcoming"],'

    prompt = f"""{task_header}

{must_have_and_order}

{context_label}
Profile and targets: {json.dumps(profile, ensure_ascii=True)}
{instruction_line}

### Current plan
{json.dumps(plan_json, ensure_ascii=True)}

### Available food catalog
{to_csv_string(planData["regional_list"])}

Only use ingredient IDs, names, and nutrition values exactly as they appear in the catalog
above. Never invent a food ID or nutrition value.

### Output contract
Return ONLY valid JSON, with no markdown fences and no text outside the JSON, in this exact
shape:
{{
    "summary": "explanations of the main issues",
    {missing_field_doc}
    "changes": [
        {{
            "category": "amount | ingredient | meal",
            "title": "short change title",
            "description": "why this change improves the plan",
            "meal_name": "affected meal name or null"
        }}
    ],
    "proposed_plan": {{
        "name": "plan name",
        "meals": [
            {{
                "name": "meal name",
                "ingredients": [{{"id": 1, "amount": 100}}]
            }}
        ]
    }}
}}

proposed_plan.meals must be the complete day — every meal from the current plan, whether
changed or not — not just the ones you modified. Use only IDs from the catalog, and use
positive gram amounts. Never invent food IDs, nutrition values, or extra fields.
"""
    response = gemini.models.generate_content(
        model="gemini-3.5-flash",
        contents=prompt,
        # config=types.GenerateContentConfig(
        # thinking_config=types.ThinkingConfig(thinking_level="high")
        # )
    )
    return cleaned_json(response.text)