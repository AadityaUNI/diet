"""Add sensible gram serving sizes to FoodItems with OpenAI."""

import argparse
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client


BATCH_SIZE = 100
MODEL = "gpt-5-mini"
UPDATE_LOG_FILE = Path(__file__).with_name("serving_updates.txt")


def build_prompt(food_items: list[dict]) -> str:
	return f"""
You are assigning serving sizes to foods in a nutrition database.

For every food item, return two values in grams:
- whole_serving: the weight of one typical whole item or piece (e.g. 1 egg, 1 banana, 1 slice of bread)
- cup_serving: the weight of 1 US cup of the food

Rules:
- Use null for whole_serving if the food isn't counted as a single item (e.g. flour, oil, milk, rice, sauces).
- Use null for cup_serving only if a cup measure makes no sense for the food.
- Use plain numbers in grams, not strings.
- Give realistic, typical values. Rough estimates are fine.

Input JSON:
{json.dumps(food_items, ensure_ascii=False)}

Return ONLY a valid JSON array. Each element must be exactly
[food_id, whole_serving, cup_serving]. Return exactly one element for every input
item, preserve every id exactly, and do not include markdown, explanations, or keys.
""".strip()


def parse_servings(response_text: str, expected_ids: set[int]) -> dict[int, tuple[float | None, float | None]]:
	cleaned = response_text.strip()
	if cleaned.startswith("```"):
		cleaned = cleaned.removeprefix("```json").removesuffix("```").strip()

	result = json.loads(cleaned)
	if not isinstance(result, list) or len(result) != len(expected_ids):
		raise ValueError("Gemini returned the wrong number of serving sizes")

	servings: dict[int, tuple[float | None, float | None]] = {}
	for item in result:
		if not isinstance(item, list) or len(item) != 3:
			raise ValueError("Gemini returned an invalid serving size entry")
		food_id, whole_serving, cup_serving = item
		if not isinstance(food_id, int) or food_id not in expected_ids:
			raise ValueError(f"Gemini returned an unexpected food id: {food_id!r}")
		if food_id in servings:
			raise ValueError(f"Gemini returned duplicate food id: {food_id}")
		for value in (whole_serving, cup_serving):
			if value is not None and (isinstance(value, bool) or not isinstance(value, (int, float)) or value <= 0):
				raise ValueError(f"Gemini returned an invalid serving for food id {food_id}")
		servings[food_id] = (whole_serving, cup_serving)

	if set(servings) != expected_ids:
		raise ValueError("Gemini did not return every input food id")
	return servings


def fetch_food_items(supabase) -> list[dict]:
	response = (
		supabase.table("FoodItems")
		.select("id, name, whole_serving, cup_serving")
		.execute()
	)
	return response.data


def add_servings(dry_run: bool = False) -> None:
	load_dotenv()
	supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])
	openai = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
	food_items = fetch_food_items(supabase)
	
	end = 100 if dry_run else len(food_items)

	with UPDATE_LOG_FILE.open("w", encoding="utf-8") as updates_file:
		for offset in range(0, end, BATCH_SIZE):
			batch = food_items[offset:offset + BATCH_SIZE]
			prompt_items = [{"id": item["id"], "name": item["name"]} for item in batch]
			response = openai.chat.completions.create(
				model=MODEL,
				messages=[{"role": "user", "content": build_prompt(prompt_items)}],
				response_format={"type": "json_object"},
			)
			servings = parse_servings(
				response.choices[0].message.content or "",
				{item["id"] for item in batch},
			)

			for item in batch:
				whole_serving, cup_serving = servings[item["id"]]
				updates = {}
				if item["whole_serving"] is None:
					updates["whole_serving"] = whole_serving
				if item["cup_serving"] is None:
					updates["cup_serving"] = cup_serving
				if not updates:
					continue
				update_line = f'{item["id"]}: {item["name"]} -> {updates}'
				print(update_line)
				updates_file.write(update_line + "\n")
				if not dry_run:
					supabase.table("FoodItems").update(updates).eq("id", item["id"]).execute()


if __name__ == "__main__":
	parser = argparse.ArgumentParser(description=__doc__)
	parser.add_argument("--dry-run", action="store_true", help="print proposed changes without updating Supabase")
	args = parser.parse_args()
	add_servings(dry_run=args.dry_run)


