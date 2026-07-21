import Profile from "@/components/profile";
import { AppHeader } from "@/components/header";
import { DashboardTabs } from "@/components/dashboard/dashboardTabs";
import RecommendButton from "@/components/recommendButton";

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>

      <AppHeader loading={false} />

      <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28">

        {/* ── Profile ── */}
        <Profile />

        {/* ── Tabs ── */}
        <DashboardTabs />
      </main>

      {/* ── Floating AI Button ── */}
      <RecommendButton />
    </div>
  );
}
