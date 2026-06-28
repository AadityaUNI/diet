// AppLayout.tsx

import { Outlet } from "react-router-dom";
import { TopNav } from "@/components/navbar";
import BottomNav from "@/components/bottomNav";
import useIsMobile from "@/hooks/use-is-mobile";

export default function Layout() {
  const {isMobile} = useIsMobile()

  return (
    <div className="min-h-screen flex flex-col">
      {isMobile ? <TopNav /> : <BottomNav />} 
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}