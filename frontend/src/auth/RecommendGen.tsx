import type { RecommendResponse } from "@/types/generated-plan";
import type { FullPlanData, UserProfile } from "@/types/types";

export type AnalyzeRequest = {
    plan: FullPlanData;
    profile: UserProfile;
    user_prompt?: string;
    calorie_target: number;
};

export type AnalyzeChange = {
    category: "amount" | "ingredient" | "meal";
    title: string;
    description: string;
    meal_name?: string;
};

export type AnalyzeResponse = {
    summary: string;
    missing: string[];
    changes: AnalyzeChange[];
    proposed_plan?: FullPlanData;
};

export class ApiRequestError extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.name = "ApiRequestError";
        this.status = status;
    }
}

async function readApiError(response: Response, fallback: string): Promise<ApiRequestError> {
    let message = fallback;

    try {
        const payload: unknown = await response.json();
        if (typeof payload === "object" && payload !== null && "detail" in payload && typeof payload.detail === "string") {
            message = payload.detail;
        } else if (typeof payload === "string") {
            message = payload;
        }
    } catch {
        const text = await response.text().catch(() => "");
        if (text.trim()) message = text.trim();
    }

    return new ApiRequestError(message, response.status);
}

export async function getAIRec(token: string, constraints: UserProfile & {goal_calories: number})
{
    let response: Response;
    try {
        response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/recommend`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(constraints)
        });
    } catch {
        throw new ApiRequestError("We couldn't reach the recommendation service. Check your connection and try again.", 0);
    }

    if (!response.ok)
    {
        throw await readApiError(response, "Unable to generate meal plans right now.");
    }

    const data = await response.json()
    if (data == -1)
    {
        throw new ApiRequestError("Your session has expired. Please sign in again.", 401);
    }
    // data is Generated plan 
    return data as RecommendResponse
}

export async function getAnalyzed(token: string, request: AnalyzeRequest): Promise<AnalyzeResponse>
{
    let response: Response;
    try {
        response = await fetch(`${import.meta.env.VITE_FASTAPI_URL}/analyze`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(request)
        });
    } catch {
        throw new ApiRequestError("We couldn't reach the analysis service. Check your connection and try again.", 0);
    }

    if (!response.ok)
    {
        throw await readApiError(response, "Unable to analyze this meal plan.");
    }

    const data = await response.json()
    if (data == -1)
    {
        throw new Error("Your session has expired. Please sign in again.");
    }

    return data as AnalyzeResponse;
}