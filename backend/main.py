from fastapi import FastAPI, Header
from google import genai
from google.genai import types
from dotenv import dotenv_values
from cloudflare import Cloudflare
from supabase import create_client
from pydantic import BaseModel, PositiveInt
from typing import Literal, Annotated
import json 
import io
import jwt 
from collections import defaultdict
import csv 
import os
# dot env vals
config = os.environ

# load clients
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://206.189.43.151:8080"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_SECRET_KEY"])
gemini = genai.Client(api_key=config['GEMINI_API_KEY'])

jwkClient = jwt.PyJWKClient(config["JWK_DISCOVERY_URL"], cache_keys=True, max_cached_keys=32, lifespan=600)

cloudflare = Cloudflare(
    api_token=config["CLOUDFLARE_API_TOKEN"],  # This is the default and can be omitted
)
     
def verify_jwt(auth_string: str):
    token = auth_string[6:].strip()

    try:
        jwk = jwkClient.get_signing_key_from_jwt(token)
        payload = jwt.decode(token, jwk.key, ["ES256"], audience="authenticated")
        return payload
    except Exception as e: 
        # invalid token 
        print(e)
        return None 

cl_account_id = config["CLOUDFLARE_ACCOUNT_ID"]
cl_namespace_id = config["CLOUDFLARE_NAMESPACE_ID"]
    
def get_list(region):
    try: 
        regional_list = cloudflare.kv.namespaces.values.get(f"r-{region}", account_id=cl_account_id, namespace_id=cl_namespace_id)
        regional_list = json.loads(regional_list.read())
        print("RETRIEVED FROM CACHE")
        return regional_list
    
    except: 
        # get the regional list and put it into the kv 
        regional = supabase.table('FoodItems').select("id, name, protein, carbs, fat, calories, fibre").or_(f'region.eq.GLOBAL,region.eq.{region}').execute().data
        reg_str = json.dumps(regional)
        print("PUT THE KEY IN CACHE")
        put_key_in_kv(f"r-{region}", reg_str.encode())
        return regional

def put_key_in_kv(key, val):
    try:
        cloudflare.kv.namespaces.values.update(key, account_id=cl_account_id, namespace_id=cl_namespace_id, value=val)
    except Exception as e:
        print("Unable to put key in kv", e)
        
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
    
def to_csv_string(regional):
    headers = regional[0].keys()
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=headers)
    writer.writeheader()
    
    for row in regional: 
        writer.writerow(row)
    return buffer.getvalue()
    
def call_gemini(constraints: ConstraintInput, regional_list: list):
    prompt = f"""You are an expert dietitian specializing in creating therapeutic diets that adhere to specific health conditions (e.g., inflammation, RA) and dietary restrictions (e.g., vegan, vegetarian). Your primary objective is to fulfill the patient's daily macronutrient needs (calories, carbohydrates, fats, proteins, and fibre) based on their specific fitness goals.

        ### Core Task: Meal Plan Generation
        You will be provided with a CSV list of available food items (regional and global). You must generate 3 distinct daily meal plans based on the user's profile and constraints.

        ### Ingredient Data Format
        All nutrient values (protein, carbs, fat, calories, fibre) in the provided list are PER 100 GRAMS of the food item. When you specify an `amount` for an ingredient in your output, it must be in GRAMS — this amount will be used to scale the per-100g values (actual contribution = value * amount / 100) to compute real macro totals. Choose amounts that are realistic serving sizes and that cause the plan to hit the daily targets once scaled.

        ### Guidelines & Rules
        1. STRICT INGREDIENT USAGE: Use ONLY ingredients from the provided list, referenced by their exact `id`. Do NOT invent or hallucinate food items or ids.
        2. MUST-HAVE FOODS: Attempt to include the client's "must-have" foods. If it is impossible or unviable to include them based on macros or availability, skip them and list them in the `skipped_items` array.
        3. REFERENCING: Reference each ingredient ONLY by its exact `id` from the provided list, mapped as `id` in your output. Do not output ingredient names, macros, or any other fields.
        4. TARGETS & VARIETY: Each of the 3 plans must independently hit the daily calorie and macro targets once amounts are scaled per the formula above. Ensure the plans are as diverse from each other as possible.
        5. MICRO-NUTRIENTS: Since micro-nutrient data is absent, approximate completeness by ensuring a wide variety of meals and ingredients across the plans.
        6. PLAN-NAMING: Each plan should be given a name appropriate to the plan's contents, nutritional amounts.
        
        LASTLY AND VERY IMPORTANTLY: Make sure that each of the macro-nutrient targets (generated by you, given the constraints) is accurately COMPLETED (including calories, protein, carbs, fats) by scaling 
        the ingredient amounts appropriately or having a multitude of meals.
        
        
        ### User Constraints
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
        model="gemini-3.1-flash-lite",
        contents=prompt,
        config=types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="high")
        )
    )
    print(f"GEMINI CALL TOOK: {time.time() - start:.2f}s")


    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        cleaned = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)
    
 
def hydrate_plans(output: GeminiOutput, regional: list[dict]) -> list[dict]:
    lookup = dict()
    # get each regional item in the lookup dictionary for easy retrieval within loops 
    for item in regional:
        lookup[item["id"]] = item 
        
    plans = list()
    
    for item in output.plans:
        plan_data = defaultdict(int)
        plan_data["name"] = item.name
        plan_data["meals"] = list()
        skip_plan = False
        
        for meal in item.meals:
            meal_data = defaultdict(int)
            meal_data["name"] = meal.name
            meal_data["ingredients"] = list()
            
            for ing in meal.ingredients:
                food_data = lookup.get(ing.id)
                if not food_data: 
                    # hallucination, skip the plan
                    skip_plan = True 
                    break
                
                # food data is id, name, protein, carbs, fat, calories, fibre as dictionary 
                food_data['amount'] = ing.amount 
                meal_data["ingredients"].append(food_data)
                scale = ing.amount / 100
                meal_data["total_calories"] += food_data["calories"] * scale 
                meal_data["total_carbs"] += food_data["carbs"] * scale 
                meal_data["total_fats"] += food_data["fat"] * scale 
                meal_data["total_fibre"] += food_data["fibre"] * scale 
                meal_data["total_protein"] += food_data["protein"] * scale 
            
            if (skip_plan):
                break 
            
            plan_data["total_calories"] += meal_data["total_calories"]
            plan_data["total_carbs"] += meal_data["total_carbs"]
            plan_data["total_fats"] += meal_data["total_fats"]
            plan_data["total_protein"] += meal_data["total_protein"]
            plan_data["total_fibre"] += meal_data["total_fibre"]
            plan_data["meals"].append(meal_data)       
        
        if not skip_plan:
            plans.append(plan_data)
    
    return plans 
    
# gemini call
@app.post('/recommend')
def recommend(authorization: Annotated[str | None, Header()], constraints: ConstraintInput):
    # verify user token
    if not verify_jwt(authorization):
        return -1

    regional = get_list(constraints.region)
    
    print("REGIONAL FETCHED")
    if not regional: 
        print("RETURNING HERE")
        return 10
    
    # # call gemini client
    output = call_gemini(constraints, regional)
    output = GeminiOutput.model_validate(output)
    plans = hydrate_plans(output, regional)
    return {"skipped_items": output.skipped_items, "plans": plans}
    
    

