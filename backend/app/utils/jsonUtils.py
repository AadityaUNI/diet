import json 

def cleaned_json(response):
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        cleaned = response.strip().removeprefix("```json").removesuffix("```").strip()
        return json.loads(cleaned)