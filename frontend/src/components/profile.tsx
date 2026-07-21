import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Button } from "@/components/ui/button";
import { Edit3 } from "lucide-react";
import { currUserDetails } from "@/auth/UserService";
import type { UserProfile } from "@/types/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { EditProfileDialog } from "./editProfileDialog"

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
    let [editOpen, setEditOpen] = useState(false)

    useEffect(() => {
      async function getUserDetails()
      {
         const data = await currUserDetails();
        if (data) {
         setUserData(data);
        }
        //  console.log("FETCHED USER DATA: ", data);
      }
      getUserDetails()
    }, [])

    const handleSave = (updated: UserProfile) => {
      setUserData(updated)
    }

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
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] text-white">
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
             <div className="mt-4 flex gap-3">
            <Button className="gap-1.5" size="lg" onClick={() => setEditOpen(true)}>
              <Edit3 size={13} /> Edit Profile
            </Button>
          </div>
          </div>

         

          <EditProfileDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            userData={userData}
            onSaved={(updated) => handleSave(updated)}
          />
        </>
        ) : SkeletonAvatar()}
          
        </section>
    )
}