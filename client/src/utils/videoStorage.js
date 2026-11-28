// IndexedDB client-side video storage for instant zero-latency playback across page refreshes
const DB_NAME = 'JustFans_VideoVault';
const STORE_NAME = 'cached_videos';

const openVideoDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return resolve(null);
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
};

export const saveVideoToLocalCache = async (key, fileOrBlob) => {
  try {
    if (!key || !fileOrBlob) return false;
    const db = await openVideoDB();
    if (!db) return false;
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(fileOrBlob, key);
    return true;
  } catch (e) {
    console.warn('Could not cache video locally:', e);
    return false;
  }
};

export const getVideoFromLocalCache = async (key) => {
  try {
    if (!key) return null;
    const db = await openVideoDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => {
        if (req.result) {
          resolve(URL.createObjectURL(req.result));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};
