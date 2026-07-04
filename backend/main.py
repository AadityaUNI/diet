from fastapi import FastAPI
from google import genai
from dotenv import dotenv_values
import os
from cloudflare import Cloudflare
from supabase import create_client
from pydantic import BaseModel, Field
from jose import jwt
import json 
# dot env vals
config = dotenv_values()

# load clients
app = FastAPI()
supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_SECRET_KEY"])
gemini = genai.Client(api_key=config['GEMINI_API_KEY'])
cloudflare = Cloudflare(
    api_token=config["CLOUDFLARE_API_TOKEN"],  # This is the default and can be omitted
)

def verify_jwt(token):
    try:
        decoded = jwt.decode(token, config["SUPABASE_SECRET_KEY"], algorithms=["HS256"])
        # throws error if not valid
        return True
    except:
        return False
    
def check_key_in_kv(region):
    value = cloudflare.kv.namespaces.values.get(
        key_name=f"list_{region}",
        account_id=config["CLOUDFLARE_ACCOUNT_ID"],
        namespace_id=config["CLOUDFLARE_NAMESPACE_ID"],
    )

    print(value)
    content = value.read()
    return content

def put_key_in_kv(key, val):
    value = cloudflare.kv.namespaces.values.update(
        key_name=key,
        account_id=config["CLOUDFLARE_ACCOUNT_ID"],
        namespace_id=config["CLOUDFLARE_NAMESPACE_ID"],
        value=val,
    )
    print(value)
    
class ConstraintInput(BaseModel):
    # constraint inputs
    pass 

class GeminiOutput(BaseModel):
    # output validification from gemini
    pass 
    
async def call_gemini(constraints: ConstraintInput, regional_list: list):
    prompt = f"""
    You are an expert dietician, specializing in creating diets adhering to 
    health issues (like inflammation, RA), 
    dietary restrictions (vegan, vegetarian etc.) 
    while also managing to complete your patient's daily macro needs 
    (calories, carbohydrates, fats, proteins and fibre) based on their fitness goals.
    You will set the daily macro targets based on the inputs: Age, Sex, Height, Weight and Activity Level. 
    
    Creating Diets:
    You will be given a list of regional food 
    items, and global ingredients available to the client. You must generate 3 different daily meal 
    plans for the client, with special attention to any dietary or medical 
    restrictions, and the user's must-have foods. If it is not viable to include 
    some of the client's must have foods, ignore them and state it while 
    generating output plans. Each meal plan will compose multiple meals, and each meal must comprise of ingredients 
    either from the regional or the global item list. Assume the user has access to generic cooking ingredients like spices.
    Give higher priority to the meals which make use of regionally available items.
    There will not be micro-nutrient data for the food items in the list
    , hence, you will have to approximate that the micro-nutrients are completed by ensuring a
    unique and variety selection of meal ingredients.

    USER CONSTRAINTS:
    - Fitness goal: {constraints.fitness_goal}
    - Age: {constraints.age} years
    - Biological Sex: {constraints.sex}
    - Height: {constraints.height} cm
    - Weight: {constraints.weight} kg
    - Activity level: {constraints.activity_level} 
    - Health conditions: {', '.join(constraints.health_conditions)}
    - Must include: {', '.join(constraints.required_food_items)}
    - Dietary restrictions: {', '.join(constraints.dietary_restrictions)}

    AVAILABLE INGREDIENTS (use ONLY these items, referenced by their id):
    {json.dumps(regional_list, indent=2)}

    IMPORTANT RULES:
    - Only use ingredients from the provided list above
    - Reference each ingredient by its exact food_item_id
    - Each plan must hit the daily calorie and macro targets. 
    - Plans must be as diverse as possible from each other
    - If a must-have food is not in the available ingredients list, skip it and mention it in skipped_items

    Return ONLY a JSON object, no other text, no markdown, no explanation:
    {{
        "skipped_items": ["item1", "item2"],
        "plans": [
            {{
                "plan_id": 1,
                "total_calories": 0,
                "total_protein_g": 0,
                "total_carbs_g": 0,
                "total_fat_g": 0,
                "total_fiber_g": 0,
                "meals": [
                    {{
                        "name": "Breakfast",
                        "ingredients": [
                            {{
                                "name": "ingredient name",
                                "amount_grams": 0,
                                "calories": 0,
                                "protein_g": 0,
                                "carbs_g": 0,
                                "fat_g": 0,
                                "fiber_g": 0
                            }}
                        ],
                        "total_calories": 0,
                        "total_protein_g": 0,
                        "total_carbs_g": 0,
                        "total_fat_g": 0,
                        "total_fiber_g": 0
                    }}
                ]
            }}
        ]
    }}
    """

    response = gemini.models.generate_content(
        model="gemini-3-flash",
        contents=prompt
    )

    try:
        return json.loads(response.text)
    except json.JSONDecodeError:
        cleaned = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)
    
# gemini call
@app.post('/recommend')
def recommend(constraints, sessionToken):
    # verify user token
    verify_jwt(sessionToken)
    
    # check file in kv
    try:
        regional = check_key_in_kv(constraints.region)
    except Exception as e:
        # pull result from supabase
        regional = supabase.table('regionalListItems').select("""FoodItem!inner(name)""").eq("region", constraints.region).execute()
        put_key_in_kv(constraints.region, regional)
        
    # call gemini client
    response = call_gemini(constraints, regional)
    

