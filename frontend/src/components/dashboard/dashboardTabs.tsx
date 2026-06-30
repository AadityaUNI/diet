// components/dashboard/dashboard-tabs.tsx
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/overviewTab";
import { SavedPlansTab } from "@/components/dashboard/saved/savedPlansTab";

// pass all the props this needs down from the parent page that holds your state
export function DashboardTabs(props: /* combine OverviewTabProps & SavedPlansTabProps */ any) {
  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-5 w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>
      <OverviewTab {...props} />
      <SavedPlansTab {...props} />
    </Tabs>
  );
}