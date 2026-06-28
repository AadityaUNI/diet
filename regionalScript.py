import pyarrow.parquet as pq
import pandas as pd
import json
import os

# ── CONFIG ────────────────────────────────────────────────────────────────────
TARGET_COUNT = 100              # products per region
OUTPUT_DIR   = "data"
INDIAN_FILE = "off-india.parquet"
AUS_FILE = "off-aus.parquet"

COLUMNS = [
    "code",
    "product_name",
    "countries_tags",
    "categories_tags",
    "food_groups_tags",
    "nova_group",
    "nutriscore_grade",
    "nutriments",
    "popularity_key",
    "obsolete",
    "no_nutrition_data",
]

# categories that clearly disqualify a product from a diet plan
EXCLUDE_KEYWORDS = [
    "sodas", "soft-drinks", "carbonated-drinks", "energy-drinks",
    "candies", "sweet-snacks", "lollipops", "chewing-gums",
    "chips", "crisps", "fried-snacks",
    "alcoholic", "beers", "wines", "spirits", "liqueurs", "confectioneries",
]

# nutriscore grades considered acceptable for a diet plan
GOOD_NUTRISCORE = {"a", "b", "c"}

# fats and oils naturally score D/E on nutriscore despite being valid
# diet ingredients — give them a pass on the nutriscore filter
FAT_KEYWORDS = ["oils", "fats", "butter", "ghee", "olive-oil"]

# ── HELPERS ───────────────────────────────────────────────────────────────────

def get_product_name(field) -> str | None:
    """
    product_name is PA_LANGUAGE_FIELD_DATATYPE:
    a list of {lang: str, text: str} structs.
    Prefer English, fall back to first available.
    """
    if field is None:
        return None

    items = field if isinstance(field, list) else list(field)

    # prefer English
    for item in items:
        if isinstance(item, dict) and item.get("lang") == "en":
            text = (item.get("text") or "").strip()
            if text:
                return text

    # fallback — first non-empty text
    for item in items:
        if isinstance(item, dict):
            text = (item.get("text") or "").strip()
            if text:
                return text

    return None


def get_nutrients(field) -> dict | None:
    """
    nutriments is PA_NUTRIMENTS_DATATYPE:
    a list of {name, 100g, serving, unit, ...} structs.
    Returns a flat dict of {nutrient_name: value_per_100g}.
    """
    if field is None:
        return None

    result = {}
    items = field if isinstance(field, list) else list(field)

    for item in items:
        if not isinstance(item, dict):
            continue
        name = item.get("name")
        value = item.get("100g")
        if name and value is not None:
            try:
                result[name] = float(value)
            except (TypeError, ValueError):
                pass

    return result if result else None


def is_junk(categories: list | None) -> bool:
    if categories is None:
        return False
    joined = " ".join(categories).lower()
    return any(kw in joined for kw in EXCLUDE_KEYWORDS)


def is_low_calorie_beverage(categories: list | None) -> bool:
    """
    Tea, coffee, herbal infusions — near-zero calories but valid must-haves.
    Allow them through nova and nutriscore filters.
    """
    if categories is None:
        return False
    joined = " ".join(categories).lower()
    return any(kw in joined for kw in ["teas", "coffees", "herbal-teas", "infusions"])


def is_fat_or_oil(categories: list | None) -> bool:
    """
    Fats and oils score D/E on nutriscore but are valid diet ingredients.
    Skip nutriscore filter for these.
    """
    if categories is None:
        return False
    joined = " ".join(categories).lower()
    return any(kw in joined for kw in FAT_KEYWORDS)


def passes_nova(nova_group, is_beverage: bool) -> bool:
    """
    NOVA 1 — unprocessed (raw meat, vegetables, eggs): always include
    NOVA 2 — minimally processed (flours, dried legumes): always include
    NOVA 3 — processed (canned veg, cheese, smoked fish): include
    NOVA 4 — ultra-processed (chips, sodas, snack bars): exclude
    None   — unknown, give benefit of the doubt and include
    """
    if nova_group is None or float('NaN'):
        return True
    if is_beverage:
        return True  # tea/coffee often land as NOVA 4, give them a pass
    return int(nova_group) <= 3


def passes_nutriscore(grade, categories: list | None, beverage) -> bool:
    """
    Accept A, B, C grades.
    Reject D and E unless the item is a fat/oil or grade is unknown.
    """
    if grade is None or str(grade).strip() == "" or beverage:
        return True  # unknown — give benefit of the doubt
    if is_fat_or_oil(categories):
        return True  # fats naturally score low, don't penalise them
    return str(grade).strip().lower() in GOOD_NUTRISCORE


# ── MAIN EXTRACTION ───────────────────────────────────────────────────────────

def extract_for_region(df: pd.DataFrame,
                       country_code: str, target: int = 250) -> list[dict]:
    foods = []
    seen  = set()

    for _, row in df.iterrows():

        # ── basic quality gates ───────────────────────────────────────────────
        if row.get("obsolete"):
            continue
        if row.get("no_nutrition_data"):
            continue

        # ── junk filter ───────────────────────────────────────────────────────
        categories = row.get("categories_tags")
        if is_junk(categories):
            continue

        # ── nova filter ───────────────────────────────────────────────────────
        beverage = is_low_calorie_beverage(categories)
        if not passes_nova(row.get("nova_group"), beverage) or not beverage:
            continue

        # ── nutriscore filter ─────────────────────────────────────────────────
        if not passes_nutriscore(row.get("nutriscore_grade"), categories, beverage):
            continue

        # ── name ──────────────────────────────────────────────────────────────
        name = get_product_name(row.get("product_name"))
        if not name or name.lower() in seen:
            continue

        # ── nutrients ─────────────────────────────────────────────────────────
        nutrients = get_nutrients(row.get("nutriments"))
        if not nutrients:
            continue

        calories = nutrients.get("energy-kcal")
        protein  = nutrients.get("proteins")
        carbs    = nutrients.get("carbohydrates")
        fat      = nutrients.get("fat")

        if beverage:
            if calories is None:
                continue
        else:
            if not all(v is not None for v in [calories, protein, carbs, fat]):
                continue
            if calories < 0 or calories > 1000:
                continue

        # ── build record ──────────────────────────────────────────────────────
        foods.append({
            "name":               name,
            "region":             country_code,
            "calories":           round(float(calories or 0), 2),
            "protein_g":          round(float(protein  or 0), 2),
            "carbs_g":            round(float(carbs    or 0), 2),
            "fat_g":              round(float(fat      or 0), 2),
            "fiber_g":            round(float(nutrients.get("fiber") or 0), 2),
            "open_food_facts_id": row.get("code"),
        })

        seen.add(name.lower())

        if len(foods) >= target:
            break

    return foods


# ── ENTRY POINT ───────────────────────────────────────────────────────────────

def main():
    print(f"Reading parquet: {INDIAN_FILE} ...")
    
    table = pq.read_table(INDIAN_FILE, columns=COLUMNS)

    # sort by popularity descending so we pick the most well-known products first
    df = table.to_pandas()
    df = df.sort_values("popularity_key", ascending=False, na_position="last")
    df = df.reset_index(drop=True)

    print(f"Total rows loaded: {len(df):,}")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # ── India ─────────────────────────────────────────────────────────────────
    print("\nExtracting India foods ...")
    india_foods = extract_for_region(df, "IN", TARGET_COUNT)
    out_in = os.path.join(OUTPUT_DIR, "regional_IN_bev.json")
    with open(out_in, "w", encoding="utf-8") as f:
        json.dump(india_foods, f, indent=2, ensure_ascii=False)
    print(f"  → {len(india_foods)} items saved to {out_in}")

    # ── Australia ─────────────────────────────────────────────────────────────
    table = pq.read_table(AUS_FILE, columns=COLUMNS)

    # sort by popularity descending so we pick the most well-known products first
    df = table.to_pandas()
    df = df.sort_values("popularity_key", ascending=False, na_position="last")
    df = df.reset_index(drop=True)
    
    print("\nExtracting Australia foods ...")
    
    aus_foods = extract_for_region(df, "AU", TARGET_COUNT)
    out_au = os.path.join(OUTPUT_DIR, "regional_AU_bev.json")
    with open(out_au, "w", encoding="utf-8") as f:
        json.dump(aus_foods, f, indent=2, ensure_ascii=False)
    print(f"  → {len(aus_foods)} items saved to {out_au}")

    print("\nDone.")


if __name__ == "__main__":
    main()