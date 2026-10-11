""" Creates a comprehensive food list customized by our own search parameters """
import json
from dotenv import dotenv_values
from supabase import create_client

config = dotenv_values()
supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_SECRET_KEY"]) 

food_file = open("../../../../data/custom_foods.json")

food_list = json.load(food_file)


cleaned_list = []

region_func = lambda reg : "Global" if reg == "Global" else "AU" if reg == "Australia" else "IN" if reg == "India" else "Global"

for item in food_list:
    # create correct format
    new_item = {"name": item["name"], "added_by": "API", "region": region_func(item["region"]), "protein": item["protein"], "fat": item["fat"], "carbs": item["carbs"], "calories": item["calories"], "fibre": item["fibre"]}

    cleaned_list.append(new_item)

print(cleaned_list)
response = supabase.table("FoodItems").insert(cleaned_list).execute()

print(response.count)