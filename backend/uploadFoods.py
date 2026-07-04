from supabase import create_client
from dotenv import dotenv_values
import json 

config = dotenv_values()
supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_SECRET_KEY"])

# add all food items according to their regions.
food_file = open("../data/food_items_cleaned.json", 'r') 
global_file = open("../data/globalCleaned.json", 'r')

foods = json.load(food_file)

globals = json.load(global_file)

food_data = supabase.table("FoodItem").insert(foods).execute()
global_data = supabase.table("FoodItem").insert(globals).execute()

# Assert we pulled real data.
assert len(food_data.data) > 0
assert len(global_data.data) > 0
    
    






