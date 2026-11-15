/**
 * CropGuard AI - Offline Scan Queue (IndexedDB)
 * Stores pending leaf scans when connection drops and syncs automatically when online (Section 4.1 & 8).
 */

export interface QueuedScan {
  id: string;
  blob: Blob;
  locale: string;
  cropHint?: string;
  createdAt: number;
  retryCount: number;
}

const DB_NAME = "cropguard_pwa_db";
const STORE_NAME = "offline_scans";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function enqueueOfflineScan(blob: Blob, locale: string, cropHint?: string): Promise<string> {
  const db = await openDB();
  const id = `scan_offline_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: QueuedScan = {
    id,
    blob,
    locale,
    cropHint,
    createdAt: Date.now(),
    retryCount: 0,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.add(item);
    req.onsuccess = () => resolve(id);
    req.onerror = () => reject(req.error);
  });
}

export async function getQueuedScans(): Promise<QueuedScan[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeQueuedScan(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function flushOfflineScanQueue(
  onSuccess?: (scanId: string, result: any) => void
): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return 0;
  }

  const items = await getQueuedScans();
  if (items.length === 0) return 0;

  let synced = 0;
  for (const item of items) {
    try {
      const formData = new FormData();
      formData.append("file", item.blob, "offline_leaf.jpg");
      formData.append("locale", item.locale);
      if (item.cropHint) formData.append("crop_hint", item.cropHint);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scans`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        await removeQueuedScan(item.id);
        synced++;
        if (onSuccess) onSuccess(data.scanId, data);
      }
    } catch (e) {
      console.warn(`Retry failed for queued scan ${item.id}:`, e);
    }
  }

  return synced;
}
