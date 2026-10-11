import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflinePwaToast() {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline) {
    return null;
  }

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-100 flex items-start gap-3 rounded-2xl border border-destructive/30 bg-background/95 p-4 text-foreground shadow-2xl backdrop-blur sm:left-auto sm:max-w-sm"
    >
      <WifiOff className="mt-0.5 shrink-0 text-destructive" size={20} />
      <div>
        <p className="text-sm font-semibold">Internet required</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Internet required for the app to run. Reconnect and try again.</p>
      </div>
    </div>
  );
}