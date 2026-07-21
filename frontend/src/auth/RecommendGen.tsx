import type { RecommendResponse } from "@/types/generated-plan";
import type { UserProfile } from "@/types/types";

export async function getAIRec(token: string, constraints: UserProfile)
{
    console.log("Calling with constraints: ", constraints)
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
        const err = await response.json();
        console.log(err.detail); // array of {loc, msg, type} for each failing field
        return
    }

    const data = await response.json()
    if (data == -1)
    {
        console.log("Invalid Token\n")
        return -1
    }
    // data is Generated plan 
    console.log("Generated data: ", data)
    return data as RecommendResponse
}