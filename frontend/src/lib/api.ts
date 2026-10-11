const PROD_FASTAPI_URL = "https://dietgrid-ejeqdpcgg2ebgsax.australiaeast-01.azurewebsites.net";

// Production builds (Vercel) always hit the Azure backend; dev uses VITE_FASTAPI_URL from .env.local.
export const FASTAPI_URL = import.meta.env.DEV
    ? (import.meta.env.VITE_FASTAPI_URL ?? "http://localhost:8000")
    : PROD_FASTAPI_URL;
