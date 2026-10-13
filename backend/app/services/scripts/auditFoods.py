"""Read-only audit of FoodItems nutrition values (all per 100g). Never writes to the database."""

import argparse
import os

from dotenv import load_dotenv
from supabase import create_client


MACROS = ("calories", "protein", "carbs", "fat", "fibre")
KJ_PER_KCAL = 4.184


def fetch_food_items(supabase) -> list[dict]:
	rows, start, page = [], 0, 1000
	while True:
		response = supabase.table("FoodItems").select("*").order("id").range(start, start + page - 1).execute()
		rows += response.data
		if len(response.data) < page:
			return rows
		start += page


def macro_kcal_range(protein: float, carbs: float, fat: float, fibre: float) -> tuple[float, float]:
	"""Atwater estimate; carbs may or may not already include fibre depending on the source."""
	fibre_excluded = 4 * protein + 4 * carbs + 9 * fat + 2 * fibre
	fibre_included = 4 * protein + 4 * max(carbs - fibre, 0) + 9 * fat + 2 * fibre
	return min(fibre_excluded, fibre_included), max(fibre_excluded, fibre_included)


def audit_row(row: dict) -> list[str]:
	issues = []
	values = {key: row.get(key) for key in MACROS}

	for key, value in values.items():
		if value is None:
			issues.append(f"{key} is null")
		elif value < 0:
			issues.append(f"{key} is negative ({value})")
	if any(value is None for value in values.values()):
		return issues

	calories, protein, carbs, fat, fibre = (values[key] for key in MACROS)

	if all(values[key] == 0 for key in ("calories", "protein", "carbs", "fat")):
		issues.append("missing data: calories/protein/carbs/fat are all 0")
		return issues
	if calories == 0:
		issues.append("missing data: calories is 0 but macros are present")
	if carbs == 0 and fat == 0 and calories == 0 and protein > 0:
		issues.append("missing data: only protein/fibre populated")

	if max(protein, carbs, fat, fibre) > 100:
		issues.append("a macro exceeds 100g per 100g")
	if protein + carbs + fat > 100.5:
		issues.append(f"protein+carbs+fat = {protein + carbs + fat:.1f}g > 100g")
	if calories > 900:
		issues.append(f"calories {calories} > 900 (pure fat is ~900)")

	low, high = macro_kcal_range(protein, carbs, fat, fibre)
	tolerance = max(25, 0.2 * max(calories, high))
	if calories and (calories < low - tolerance or calories > high + tolerance):
		as_kcal = calories / KJ_PER_KCAL
		if low - tolerance <= as_kcal <= high + tolerance:
			issues.append(f"calories look like kJ: {calories} kJ = {as_kcal:.0f} kcal (macros imply {low:.0f}-{high:.0f})")
		else:
			issues.append(f"calories {calories} don't match macros ({low:.0f}-{high:.0f} kcal)")

	for key in ("whole_serving", "cup_serving"):
		if row.get(key) is not None and row[key] <= 0:
			issues.append(f"{key} <= 0")
	return issues


def audit(show_all: bool = False) -> None:
	load_dotenv()
	supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SECRET_KEY"])
	rows = fetch_food_items(supabase)

	flagged = 0
	for row in rows:
		issues = audit_row(row)
		if not issues and not show_all:
			continue
		flagged += bool(issues)
		print(
			f"[{row['id']}] {row['name']} ({row.get('region')}) "
			f"kcal={row['calories']} P={row['protein']} C={row['carbs']} F={row['fat']} Fb={row['fibre']}"
		)
		for issue in issues:
			print(f"    - {issue}")
	print(f"\n{len(rows)} rows checked, {flagged} flagged")


if __name__ == "__main__":
	parser = argparse.ArgumentParser(description=__doc__)
	parser.add_argument("--all", action="store_true", help="print every row, not just flagged ones")
	audit(parser.parse_args().all)
