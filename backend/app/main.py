from fastapi import FastAPI, Header, HTTPException, status
from google import genai
from cloudflare import Cloudflare
from supabase import create_client
from typing import Annotated
import jwt 
import os
from dotenv import load_dotenv
from app.models.inputModels import ConstraintInput
from app.models.mealModels import AnalyzeRequest
from app.models.outputModels import AnalyzedOutput, GeminiOutput
from app.services.JWTService import verify_jwt
from app.services.cfService import get_list
from app.utils.verifyMacros import hydrate_plan, hydrate_plans
from app.services.geminiService import call_gemini, gemini_analyze
load_dotenv()

# dot env vals
config = os.environ

# load clients
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8080", "http://206.189.43.151:8080"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase = create_client(config["SUPABASE_URL"], config["SUPABASE_SECRET_KEY"])
gemini = genai.Client(api_key=config['GEMINI_API_KEY'])

jwkClient = jwt.PyJWKClient(config["JWK_DISCOVERY_URL"], cache_keys=True, max_cached_keys=32, lifespan=600)

cloudflare = Cloudflare(
    api_token=config["CLOUDFLARE_API_TOKEN"],  # This is the default and can be omitted
)

cl_account_id = config["CLOUDFLARE_ACCOUNT_ID"]
cl_namespace_id = config["CLOUDFLARE_NAMESPACE_ID"]
 
# gemini call
@app.post('/recommend')
def recommend(authorization: Annotated[str | None, Header()], constraints: ConstraintInput):
    # verify user token
    if not verify_jwt(jwkClient,authorization):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

    try:
        regional = get_list(cloudflare, constraints.region, cl_account_id, cl_namespace_id, supabase)
        if not regional:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Food catalog is unavailable.")

        output = call_gemini(constraints, regional, gemini)
        output = GeminiOutput.model_validate(output)
        plans = hydrate_plans(output, regional)
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    except Exception as error:
        print(f"Unable to generate meal plans: {error}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Meal plan generation could not be completed.") from error

    return {"skipped_items": output.skipped_items, "plans": plans}


def _profile_context(profile: dict, region: str) -> dict:
    return {
        "fitness_goal": profile.get("fitness_goals", ""),
        "goal_calories": profile.get("goal_calories", profile.get("calorie_target")),
        "protein_target": profile.get("protein_target"),
        "carbs_target": profile.get("carbs_target"),
        "fat_target": profile.get("fat_target"),
        "fibre_target": profile.get("fibre_target", profile.get("fiber_target")),
        "health_conditions": profile.get("health_conditions", []),
        "dietary_restrictions": profile.get("dietary_restrictions", []),
        "required_food_items": profile.get("required_food_items", []),
        "region": region,
    }


def _frontend_plan(original, hydrated: dict, user_id: str) -> dict:
    proposed = {
        "id": original.id,
        "name": hydrated["name"],
        "total_calories": hydrated["total_calories"],
        "total_carbs": hydrated["total_carbs"],
        "total_fats": hydrated["total_fats"],
        "total_fibre": hydrated["total_fibre"],
        "total_protein": hydrated["total_protein"],
        "userID": user_id,
        "meals": [],
    }

    for index, meal in enumerate(hydrated["meals"]):
        source_meal = original.meals[index] if index < len(original.meals) else original.meals[-1]
        meal_data = {
            "id": source_meal.id,
            "name": meal["name"],
            "total_calories": meal["total_calories"],
            "total_carbs": meal["total_carbs"],
            "total_fats": meal["total_fats"],
            "total_fibre": meal["total_fibre"],
            "total_protein": meal["total_protein"],
            "planID": original.id,
            "meal_completed": False,
            "meal_items": [],
        }
        for ingredient in meal["ingredients"]:
            food_item = {key: value for key, value in ingredient.items() if key != "amount"}
            meal_data["meal_items"].append({
                "amount": ingredient["amount"],
                "foodID": ingredient["id"],
                "mealID": source_meal.id,
                "food_item": food_item,
            })
        proposed["meals"].append(meal_data)
    return proposed


# modify current plan, provide insights etc. 
@app.post("/analyze")
def analyze(authorization: Annotated[str | None, Header()], request: AnalyzeRequest):
    claims = verify_jwt(jwkClient, authorization)
    if not claims or not claims.get("sub"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")

    user_id = claims["sub"]
    if request.plan.userID != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="This plan does not belong to the authenticated user.")

    profile = request.profile.model_dump()
    try:
        regional = get_list(cloudflare, request.profile.region, cl_account_id, cl_namespace_id, supabase)
        if not regional:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Food catalog is unavailable.")

        raw_analyzed = gemini_analyze({
            "plan": request.plan,
            "profile": _profile_context(profile, request.profile.region),
            "user_prompt": request.user_prompt,
            "regional_list": regional,
        }, gemini)
        analyzed = AnalyzedOutput.model_validate(raw_analyzed)
        hydrated_proposed = hydrate_plan(analyzed.proposed_plan, regional)
    except HTTPException:
        raise
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(error)) from error
    except Exception as error:
        print(f"Unable to analyze meal plan: {error}")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="The meal plan analysis could not be completed.") from error

    return {
        "summary": analyzed.summary,
        "missing": analyzed.missing,
        "changes": [change.model_dump() for change in analyzed.changes],
        "proposed_plan": _frontend_plan(request.plan, hydrated_proposed, user_id),
    }