import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/overviewTabs";
import { SavedPlansTab } from "@/components/dashboard/saved/plansTab";

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