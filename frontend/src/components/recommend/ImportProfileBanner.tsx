import { Sparkles, BookmarkCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ImportProfileBannerProps {
  imported: boolean;
  onImport: () => void;
}

export function ImportProfileBanner({ imported, onImport }: ImportProfileBannerProps) {
  return (
    <Card className="border-border bg-muted">
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Use saved fields</p>
          <p className="text-xs text-muted-foreground">Import restrictions, conditions &amp; foods from your profile</p>
        </div>
        <Button
          size="sm"
          variant={imported ? "ghost" : "default"}
          onClick={onImport}
          className="ml-4 shrink-0 gap-1.5 text-xs"
        >
          {imported
            ? <><BookmarkCheck size={13} className="text-emerald-400" /> Imported</>
            : <><Sparkles size={13} /> Import</>}
        </Button>
      </CardContent>
    </Card>
  );
}
