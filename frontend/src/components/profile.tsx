import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit3, Dumbbell, Flame, Scale, HeartPulse, Wheat, Utensils } from "lucide-react";
import { currUserDetails } from "@/auth/UserService";
import type { UserProfile } from "@/types/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton"
import { EditProfileDialog } from "./editProfileDialog"
import { ACTIVITY_LEVELS } from "@/lib/predefined"
import { calculateCalorieTarget, CALORIE_GOAL_OPTIONS } from "@/lib/calorieTarget"
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/auth/AuthContext";

function ChipRow({
  icon: Icon,
  label,
  values,
}: {
  icon: typeof HeartPulse
  label: string
  values: string[]
}) {
  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
      <div className="flex w-28 shrink-0 items-center gap-1.5 pt-0.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {values.length > 0 ? (
          values.map((value) => (
            <Badge key={value} variant="outline" className="h-6 font-normal">
              {value}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground/70">None added</span>
        )}
      </div>
    </div>
  )
}

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
  const {session_token} = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [editOpen, setEditOpen] = useState(false)

   const profileData = useQuery({
      queryKey: ["userProfile", session_token],
      enabled: Boolean(session_token),
      queryFn: currUserDetails
    })

    useEffect(() => {
      if (profileData.data) {
        setUserData(profileData.data);
      }
    }, [profileData.data]);

    const handleSave = (updated: UserProfile) => {
      setUserData(updated)
    }

    const activityLabel =
      ACTIVITY_LEVELS.find((level) => level.value === userData?.activity_level)?.label
      ?? userData?.activity_level
    const goalLabel = userData
      ? (CALORIE_GOAL_OPTIONS.find((goal) => goal.value === userData.fitness_goals)?.label ?? userData.fitness_goals)
      : ""
    const calorieTarget = userData ? calculateCalorieTarget(userData) : null

    return (

         <section className="py-6">
          {userData ? (
          <>
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
                <AvatarImage
                  src='https://avataaars.io/?avatarStyle=Circle&topType=WinterHat2&accessoriesType=Kurt&hatColor=PastelRed&facialHairType=BeardMedium&facialHairColor=BrownDark&clotheType=ShirtVNeck&clotheColor=PastelGreen&eyeType=EyeRoll&eyebrowType=Angry&mouthType=ScreamOpen&skinColor=Yellow'
                  alt={userData.name}
                />
                <AvatarFallback>{userData.name}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[10px] text-primary-foreground">
                ✓
              </span>
            </div>

            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-start justify-between gap-3">
                <h1 className="text-xl font-bold leading-none" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.03em" }}>
                  {userData.name}
                </h1>
                <Button className="shrink-0 gap-1.5" size="sm" onClick={() => setEditOpen(true)}>
                  <Edit3 size={13} /> Edit
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="h-6 gap-1 font-normal">
                  <Dumbbell className="size-3" />
                  {goalLabel}
                </Badge>
                <Badge variant="secondary" className="h-6 gap-1 font-normal">
                  <Scale className="size-3" />
                  {userData.weight} kg
                </Badge>
                <Badge variant="secondary" className="h-6 gap-1 border-primary/25 bg-primary/10 font-semibold text-primary">
                  <Flame className="size-3" />
                  {calorieTarget?.toLocaleString()} kcal goal
                </Badge>
                <Badge variant="outline" className="h-6 font-normal">
                  {userData.height} cm
                </Badge>
                <Badge variant="outline" className="h-6 font-normal">
                  {activityLabel}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/70 px-3 py-3 dark:bg-card/40">
            <ChipRow icon={HeartPulse} label="Health" values={userData.health_conditions} />
            <ChipRow icon={Wheat} label="Diet" values={userData.dietary_restrictions} />
            <ChipRow icon={Utensils} label="Must-haves" values={userData.required_food_items} />
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
