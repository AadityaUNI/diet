from collections import defaultdict
from models.models import GeminiOutput 

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