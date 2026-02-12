
import { vtsApi } from "./apiService";

// Fetch live tracking data for a specific Redis key
export const getLiveTrackingData = async (key) => {
  if (!key) throw new Error("Redis key is required");
  let path = `api/redis/get?key=${encodeURIComponent(key)}`;
  // Remove trailing slash from baseURL and leading slash from path, then join
  let base = vtsApi.defaults.baseURL ? vtsApi.defaults.baseURL.replace(/\/+$/, '') : '';
  path = path.replace(/^\/+/, '');
  const fullUrl = base + '/' + path;
  console.log("[getLiveTrackingData] Request URL:", fullUrl);
  try {
    const res = await vtsApi.get(fullUrl);
    console.log("[getLiveTrackingData] Response:", res);
    return res.data;
  } catch (err) {
    if (err.response) {
      console.error("[getLiveTrackingData] Error Response:", err.response);
    } else {
      console.error("[getLiveTrackingData] Error:", err);
    }
    throw err;
  }
};
