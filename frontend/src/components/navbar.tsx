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
    <nav className="hidden md:flex items-center justify-between mx-3 rounded-xl mt-1 px-8 py-4 border-b border-border bg-background">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5">
        <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-primary to-chart-2" />
        <span className="text-sm font-semibold tracking-wide">DietGrid</span>
      </Link>

      {/* Nav items */}
      <NavigationMenu>
        <NavigationMenuList>

          <NavigationMenuItem>
            <NavigationMenuLink
              href="/saved"
              className={`${navigationMenuTriggerStyle()} bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary`}
            >
              Saved
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <Button className="font-semibold shadow-none">
              <Link to="/generate">Create For You</Link>
            </Button>
          </NavigationMenuItem>

        </NavigationMenuList>
      </NavigationMenu>

      {/* Profile avatar */}
      <Link to="/profile">
        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-sm font-semibold text-primary">
          {user?.email?.[0].toUpperCase() ?? "?"}
        </div>
      </Link>

    </nav>
  )
}
