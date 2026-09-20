import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import HomeButton from "@/components/homeButton";

interface RecommendErrorProps {
  message?: string;
  onRetry: () => void;
  retrying?: boolean;
}

export function RecommendError({
  message = "We couldn't generate your plans right now. Please try again in a moment.",
  onRetry,
  retrying = false,
}: RecommendErrorProps) {
  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>

        <h2 className="text-lg font-semibold text-foreground">
          Something went wrong
        </h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          {message}
        </p>
        <Button onClick={onRetry} disabled={retrying} className="min-h-12 w-full max-w-sm gap-2 px-6 text-base">
          <RotateCcw className="h-4 w-4" />
          {retrying ? "Trying again..." : "Try again"}
        </Button>
      </div>
      <HomeButton loading={false} />
    </>
  );
}