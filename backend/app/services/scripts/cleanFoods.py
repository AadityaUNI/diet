"""Clean the display names in the FoodItems table with Gemini."""

import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from supabase import create_client


BATCH_SIZE = 100
MODEL = "gemini-3.5-flash"
ENV_FILE = Path(__file__).resolve().parents[1] / ".env"


def build_prompt(food_items: list[dict]) -> str:
	"""Build a prompt that keeps useful product distinctions while removing noise."""
	return f"""
You clean food names for display in a diet-planning app.

For every input item, return its exact id and a concise, natural English display name.
Remove preparation, measurement, and catalog noise that does not help a user choose a
food. This commonly includes words such as raw, unsweetened, unprepared, with skin,
without skin, edible portion, 0% moisture, moisture percentage, and similar database
phrasing. Remove brand/catalog codes, package sizes, duplicate punctuation, and
unnecessary parenthetical details.

Keep details that distinguish a genuinely different food or product, including low-fat,
reduced-fat, fat-free, whole-grain, gluten-free, dairy-free, plant-based, flavoured,
smoked, canned, dried, frozen, or a named variety. Do not invent ingredients, change
the food's meaning, translate proper product names, or remove a meaningful variety,
flavour, or dietary attribute. If a name is already clear, return it unchanged except
for capitalization and punctuation cleanup. Use title case only where it reads
naturally; do not capitalize every small word mechanically.

Input JSON:
{json.dumps(food_items, ensure_ascii=False)}

Return ONLY a valid JSON array. Each element must be exactly [food_id, cleaned_name].
Return exactly one element for every input item, preserve every id exactly, and do not
include markdown, explanations, or extra keys.
""".strip()


def parse_cleaned_names(response_text: str, expected_ids: set[int]) -> dict[int, str]:
	"""Validate Gemini's response before anything is written to Supabase."""
	cleaned = response_text.strip()
	if cleaned.startswith("```"):
		cleaned = cleaned.removeprefix("```json").removesuffix("```").strip()

	result = json.loads(cleaned)
	if not isinstance(result, list) or len(result) != len(expected_ids):
		raise ValueError("Gemini returned the wrong number of food names")

	names: dict[int, str] = {}
	for item in result:
		if not isinstance(item, list) or len(item) != 2:
			raise ValueError("Gemini returned an invalid food name entry")
		food_id, name = item
		if not isinstance(food_id, int) or food_id not in expected_ids:
			raise ValueError(f"Gemini returned an unexpected food id: {food_id!r}")
		if not isinstance(name, str) or not name.strip():
			raise ValueError(f"Gemini returned an invalid name for food id {food_id}")
		if food_id in names:
			raise ValueError(f"Gemini returned duplicate food id: {food_id}")
		names[food_id] = name.strip()

	if set(names) != expected_ids:
		raise ValueError("Gemini did not return every input food id")
	return names


def fetch_food_items(supabase) -> list[dict]:
	response = supabase.table("FoodItems").select("id, name").gt("id", 1000).execute()
	return response.data

def clean_foods(dry_run: bool = False) -> None:
    load_dotenv(ENV_FILE)
    supabase = create_client(
        os.environ["SUPABASE_URL"],
        os.environ["SUPABASE_SECRET_KEY"],
    )
    gemini = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    food_items = fetch_food_items(supabase)
    print(len(food_items))

    batch = food_items
    prompt_items = [{"id": item["id"], "name": item["name"]} for item in batch]
    response = gemini.models.generate_content(
        model=MODEL,
        contents=build_prompt(prompt_items),
        config={"response_mime_type": "application/json"},
    )
    cleaned_names = parse_cleaned_names(
        response.text,
        {item["id"] for item in batch},
    )

    changed = 0
    for item in batch:
        new_name = cleaned_names[item["id"]]
        if new_name == item["name"]:
            continue
        print(f'{item["id"]}: {item["name"]!r} -> {new_name!r}')
        if not dry_run:
            supabase.table("FoodItems").update({"name": new_name}).eq(
                "id", item["id"]
            ).execute()
        changed += 1
    print(f"{changed} names changed")

if __name__ == "__main__":
	parser = argparse.ArgumentParser(description=__doc__)
	parser.add_argument(
		"--dry-run",
		action="store_true",
		help="print proposed changes without updating Supabase",
	)
	args = parser.parse_args()
	clean_foods(dry_run=args.dry_run)