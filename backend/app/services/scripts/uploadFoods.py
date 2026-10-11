from supabase import create_client
from dotenv import dotenv_values
import json 

config = dotenv_values()
supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_SECRET_KEY"])

# add all food items according to their regions.
food_file = open("../../../data/all_foods_cleaned.json", 'r')

# new_food = open("../../../data/all_foods_cleaned.json", 'w')

foods = json.load(food_file)

# for item in foods:
#     # item is a dictionary 
#     item["fibre"] = item.pop("fiber")

# json.dump(foods, new_food)

food_data = supabase.table("FoodItems").insert(foods).execute()
# global_data = supabase.table("FoodItems").insert(globals).execute()

# Assert we pulled real data.
# assert len(food_data.data) > 0
assert len(food_data.data) > 0
    
    






