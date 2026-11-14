"use client";

import * as React from "react";
import { WifiOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { flushOfflineScanQueue } from "@/lib/idb-queue";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncCount, setSyncCount] = React.useState(0);

  React.useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const updateOnlineStatus = () => {
      const offline = !navigator.onLine;
      setIsOffline(offline);

      if (!offline) {
        // Just came online, flush queue
        setIsSyncing(true);
        flushOfflineScanQueue()
          .then((count) => {
            if (count > 0) {
              setSyncCount(count);
              setTimeout(() => setSyncCount(0), 4000);
            }
          })
          .finally(() => setIsSyncing(false));
      }
    };

    setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (syncCount > 0) {
    return (
      <div className="fixed top-20 right-4 z-50 bg-crop-600 text-white text-xs px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
        <CheckCircle2 className="h-4 w-4" />
        <span>Synced {syncCount} offline scans!</span>
      </div>
    );
  }

  if (!isOffline && !isSyncing) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-amber-600 text-white text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2"
    >
      {isSyncing ? (
        <>
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing offline scans...</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline mode: Scans will queue locally</span>
        </>
      )}
    </div>
  );
}
