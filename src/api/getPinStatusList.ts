import { axiosAuth } from "@/util/axios";
import type { PinListResponse } from "@/util/type/crust";

async function getStorageInfo() {
  try {
    const storageInfo: PinListResponse = await axiosAuth.get('https://pin.crustcode.com/psa/pins?limit=100');
    return storageInfo;
  } catch {
    console.log("getStoreageInfo error");
    return null;
  }
}

export { getStorageInfo };
