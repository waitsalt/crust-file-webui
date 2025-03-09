import axios from "axios";
import { getAccessToken } from "./token";
import { useSettingStore } from "./pinia";

// 普通资源
const axiosBase = axios.create({
    timeout: 30000
});

axiosBase.interceptors.request.use(
    (config) => {
        return config;
    }
)

axiosBase.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
)


// 认证资源
const axiosAuth = axios.create({
    timeout: 3000000
});

axiosAuth.interceptors.request.use(
    async (config) => {
        const settingStore = useSettingStore();
        settingStore.user.token = `Basic c3Vic3RyYXRlLWNUR2ZLYXk0c0tDb0VTTW43WVpxcThtQVZ1SzhSbjJNV2I5N1JZRXlaZ3BkRmZYWDM6MHgxNDVlOGY0MmIwMmIyNzBjODhjYzk1NzYzNDUwYTdkZTVkOTk2NDNjYjA0ZDM4OGY5MzVjZTJlNWY2OTNiMzNhNzk2NWIyNTdiN2M4ZTQ5MmM1NjhjYTU1MmJiY2M1YzQxYjM0ZTRkYmE4ZDJjM2VkM2FlMTdmN2Y2MGU0YTk4NQ==`;
        if (settingStore.user.token !== null) {
            config.headers.Authorization = settingStore.user.token;
        } else {
            const access_token = await getAccessToken();
            settingStore.user.token = access_token;
            config.headers.Authorization = access_token;
        }
        return config;
    }
)

axiosAuth.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
)

export {
    axiosAuth,
    axiosBase
}