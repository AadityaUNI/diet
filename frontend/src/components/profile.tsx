import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { useAuth } from "@/auth/AuthContext"
import { Badge } from "./ui/badge"
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { Share2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { currUserDetails } from "@/auth/UserService";
import type { UserProfile } from "@/lib/types";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonAvatar() {
  return (
    <div className="flex w-fit items-center gap-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="grid gap-2">
        <Skeleton className="h-4 w-[150px]" />
        <Skeleton className="h-4 w-[100px]" />
      </div>
    </div>
  )
}

export default function Profile()
{
    let [userData, setUserData] = useState<UserProfile | null>(null)
    
    useEffect(() => {
      async function getUserDetails()
      {
         const data = await currUserDetails();
         setUserData(data);
      }
      getUserDetails()
    }, [])

    return (

         <section className="py-6">
          {userData ? (
          <>
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <AvatarImage
                  src='https://avataaars.io/?avatarStyle=Circle&topType=WinterHat2&accessoriesType=Kurt&hatColor=PastelRed&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=EyeRoll&eyebrowType=Angry&mouthType=ScreamOpen&skinColor=Yellow'
                  alt={userData.name}
                />
                <AvatarFallback>{userData.name}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[8px] text-white">
                ✓
              </span>
            </div>

            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-none" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.03em" }}>
                  {userData.name}
                </h1>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">
                Fitness Goal: {userData.fitness_goals}, last logged weight: {userData.weight}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button className="flex-1 gap-1.5" size="sm">
              <Edit3 size={13} /> Edit Profile
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 size={13} /> Share
            </Button>
          </div>
        </>
        ) : SkeletonAvatar()}
          
        </section>
    )
}