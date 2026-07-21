// components/layout/app-header.tsx
import { Bolt } from "lucide-react";
import { Logout } from "./logout";
import { Link } from "react-router";

export function AppHeader({ loading = false }: { loading?: boolean }) {

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
        <Link to={'/'} onClick={(e) => {
          if (loading)
          {
            e.preventDefault()
          }
        }}>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <Bolt size={14} className="fill-white text-white" />
          </div>
          <span className="font-outfit text-base font-bold tracking-tight">
            Diet<span className="text-primary">Grid</span>
          </span>
        </div>

        </Link>
        <Logout />
      </div>
    </header>
  );
}