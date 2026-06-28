import requests
import json
import os
from typing import List, Dict, Any

# Ensure you have your FDC API key in your environment or replace the string below
API_KEY = "vL1Lfs15L8U4IsiFkgdNEffZOK3NbO2FwrSaBV3U"
BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"

def get_nutrient_value(nutrients: List[Dict], nutrient_names: List[str]) -> float:
    """Helper to safely extract nutrient values by name."""
    for nutrient in nutrients:
        # FDC nutrient names can vary slightly, so we check against a list of possibilities
        if any(name.lower() in nutrient.get("nutrientName", "").lower() for name in nutrient_names):
            return round(float(nutrient.get("value", 0.0)), 2)
    return 0.0

def fetch_foundation_foods() -> List[Dict[str, Any]]:
    global_foods = []
    page_number = 1
    page_size = 200 # Max allowed by the schema
    total_pages = 1
    
    print("Fetching Foundation foods from USDA FDC...")

    while page_number <= total_pages:
        params = {
            "api_key": API_KEY,
            "query": "*", # Wildcard to get all
            "dataType": ["Foundation"],
            "pageSize": page_size,
            "pageNumber": page_number
        }
        
        response = requests.get(BASE_URL, params=params)
        
        if response.status_code != 200:
            print(f"Error fetching data: {response.status_code} - {response.text}")
            break
            
        data = response.json()
        
        if page_number == 1:
            total_pages = data.get("totalPages", 1)
            print(f"Found {data.get('totalHits')} total foods across {total_pages} pages.")
            
        foods = data.get("foods", [])
        
        for food in foods:
            nutrients = food.get("foodNutrients", [])
            
            # Map FDC data to the DietGrid schema
            food_item = {
                "name": food.get("description", "Unknown Food").title(),
                "region": "GLOBAL", # Marking as global since it's from the US DB
                "calories": get_nutrient_value(nutrients, ["energy"]),
                "protein_g": get_nutrient_value(nutrients, ["protein"]),
                "carbs_g": get_nutrient_value(nutrients, ["carbohydrate, by difference"]),
                "fat_g": get_nutrient_value(nutrients, ["total lipid (fat)"]),
                "fiber_g": get_nutrient_value(nutrients, ["fiber, total dietary"]),
                # Using FDC ID instead of Open Food Facts ID
                "fdc_id": str(food.get("fdcId", ""))
            }
            
            global_foods.append(food_item)
            
        print(f"Processed page {page_number}/{total_pages}")
        page_number += 1
        
    return global_foods

def main():
    foods = fetch_foundation_foods()
    
    output_filename = "global.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(foods, f, indent=2)
        
    print(f"\nSuccessfully saved {len(foods)} foundation foods to {output_filename}")

if __name__ == "__main__":
    main()