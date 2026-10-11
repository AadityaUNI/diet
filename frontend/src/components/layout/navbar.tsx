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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatar"

const NAV_AVATAR_SIZE = 32

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
        <Avatar style={{ width: NAV_AVATAR_SIZE, height: NAV_AVATAR_SIZE }}>
          {user && (
            <AvatarImage
              src={getAvatarUrl(user.id, NAV_AVATAR_SIZE)}
              alt="Profile"
              width={NAV_AVATAR_SIZE}
              height={NAV_AVATAR_SIZE}
            />
          )}
          <AvatarFallback className="bg-secondary font-semibold text-primary">
            {user?.email?.[0].toUpperCase() ?? "?"}
          </AvatarFallback>
        </Avatar>
      </Link>

    </nav>
  )
}
