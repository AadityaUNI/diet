import { Link } from "react-router-dom"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/AuthContext"

export function TopNav() {
  const { user } = useAuth()

  return (
    <nav className="hidden md:flex items-center justify-between mx-3 rounded-xl mt-1 px-8 py-4 border-b border-[#1A2844] bg-[#0B1121]">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-[#4F7EFF] to-[#00D47E]" />
        <span className="text-sm font-semibold tracking-wide text-white">DietGrid</span>
      </Link>

      {/* Nav items */}
      <NavigationMenu>
        <NavigationMenuList>

          <NavigationMenuItem>
            <NavigationMenuLink
              href="/saved"
              className={`${navigationMenuTriggerStyle()} bg-transparent text-[#6B82A8] hover:text-white hover:bg-[#1A2844]`}
            >
              Saved
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Button className="bg-[#4F7EFF] hover:bg-[#3D6EEF] text-white font-semibold shadow-none">
              <Link to="/generate">Create For You</Link>
            </Button>
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>

      {/* Profile avatar */}
      <Link to="/profile">
        <div className="w-8 h-8 rounded-full bg-[#1A2844] border border-[#2A3F66] flex items-center justify-center text-xs font-semibold text-[#4F7EFF]">
          {user?.email?.[0].toUpperCase() ?? "?"}
        </div>
      </Link>

    </nav>
  )
}