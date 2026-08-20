import Profile from "@/components/profile";
import { AppHeader } from "@/components/header";
import { DashboardTabs } from "@/components/dashboard/dashboardTabs";
import RecommendButton from "@/components/recommendButton";

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>

      <AppHeader loading={false} />

      <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28">
        <div className="rounded-3xl bg-black/[0.03] px-3 py-1 dark:bg-transparent sm:px-4">
          <Profile />
          <DashboardTabs />
        </div>
      </main>

      {/* ── Floating AI Button ── */}
      <RecommendButton />
    </div>
  );
}
