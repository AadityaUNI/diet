from fastapi import FastAPI, Header
from google import genai
from cloudflare import Cloudflare
from supabase import create_client
from typing import Annotated
import jwt 
import os

from models.models import *
from services.JWTService import verify_jwt
from services.cfService import get_list
from utils.verifyMacros import hydrate_plans
from services.geminiService import call_gemini

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
        return -1

    regional = get_list(constraints.region, cloudflare, cl_account_id, cl_namespace_id)
    
    if not regional: 
        return 10
    
    # # call gemini client
    output = call_gemini(constraints, regional, gemini)
    output = GeminiOutput.model_validate(output)
    plans = hydrate_plans(output, regional)
    return {"skipped_items": output.skipped_items, "plans": plans}
    
    

