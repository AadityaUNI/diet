import type { RecommendResponse } from "@/types/generated-plan";
import type { UserProfile } from "@/types/types";

export async function getAIRec(token: string, constraints: UserProfile)
{
    const response = await fetch('http://127.0.0.1:8000/recommend', {
        method: "POST",
        
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(constraints)
    })

    if (!response.ok)
    {
        await response.json();
        return
    }

    const data = await response.json()
    if (data == -1)
    {
        return -1
    }
    // data is Generated plan 
    return data as RecommendResponse
}