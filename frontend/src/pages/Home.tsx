
// dashboard -> meal target component
// mark meals for today component
// saved component
// generate diet button
import BottomNav from "@/components/bottomNav"
import MacroTargetBar from "@/components/macroTargetBar"
import { TopNav } from "@/components/navbar"
import useIsMobile from "@/hooks/use-is-mobile"
const protein = {"fill" : 10, "target": 100}
const carbs = {"fill" : 10, "target": 100}
const fats = {"fill" : 50, "target": 100}
const energy = {"fill" : 100, "target": 100}
const fibre = {"fill" : 10, "target": 100}

// build bottom navbar for mobile: profile, saved, Create For You (create diet)
export default function Home()
{   
    return(<>
    <MacroTargetBar protein={protein} carbs={carbs} fats={fats} energy={energy} fibre={fibre} />
    </>
    )
}