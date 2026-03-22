import type { GeoJSONFeatureCollection } from "../../../types/index.js";

const DB_NAME = "review-geojson";
const DB_VERSION = 1;
const STORE_NAME = "layers";

interface StoredLayer {
  hash: string;
  name: string;
  geojson: GeoJSONFeatureCollection;
  uploadedAt: string;
}

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "hash" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

export const saveLayer = async (
  hash: string,
  name: string,
  geojson: GeoJSONFeatureCollection,
): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({
      hash,
      name,
      geojson,
      uploadedAt: new Date().toISOString(),
    } satisfies StoredLayer);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const loadLayer = async (
  hash: string,
): Promise<StoredLayer | undefined> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(hash);
    request.onsuccess = () => resolve(request.result ?? undefined);
    request.onerror = () => reject(request.error);
  });
};

export const listLayers = async (): Promise<StoredLayer[]> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteLayer = async (hash: string): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(hash);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export const INDEXEDDB_PREFIX = "indexeddb://";

export const isIndexedDbUrl = (url: string): boolean =>
  url.startsWith(INDEXEDDB_PREFIX);

export const hashFromUrl = (url: string): string =>
  url.slice(INDEXEDDB_PREFIX.length);

export const computeHash = async (content: string): Promise<string> => {
  const encoded = new TextEncoder().encode(content);
  const buffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};
