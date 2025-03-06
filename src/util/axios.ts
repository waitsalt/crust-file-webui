import axios from "axios";
import { useUserStore } from "./pinia";
import { getAccessToken } from "./token";

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
        const userStore = useUserStore();
        if (userStore.access_token !== null) {
            config.headers.Authorization = `Basic c3Vic3RyYXRlLWNUR2ZLYXk0c0tDb0VTTW43WVpxcThtQVZ1SzhSbjJNV2I5N1JZRXlaZ3BkRmZYWDM6MHgxNDVlOGY0MmIwMmIyNzBjODhjYzk1NzYzNDUwYTdkZTVkOTk2NDNjYjA0ZDM4OGY5MzVjZTJlNWY2OTNiMzNhNzk2NWIyNTdiN2M4ZTQ5MmM1NjhjYTU1MmJiY2M1YzQxYjM0ZTRkYmE4ZDJjM2VkM2FlMTdmN2Y2MGU0YTk4NQ==`;
            // config.headers.Authorization = `Bearer ${userStore.access_token}`;
        } else {
            config.headers.Authorization = `Basic c3Vic3RyYXRlLWNUR2ZLYXk0c0tDb0VTTW43WVpxcThtQVZ1SzhSbjJNV2I5N1JZRXlaZ3BkRmZYWDM6MHgxNDVlOGY0MmIwMmIyNzBjODhjYzk1NzYzNDUwYTdkZTVkOTk2NDNjYjA0ZDM4OGY5MzVjZTJlNWY2OTNiMzNhNzk2NWIyNTdiN2M4ZTQ5MmM1NjhjYTU1MmJiY2M1YzQxYjM0ZTRkYmE4ZDJjM2VkM2FlMTdmN2Y2MGU0YTk4NQ==`;
            // const access_token = await getAccessToken();
            // userStore.access_token = access_token;
            // config.headers.Authorization = `Bearer ${access_token}`;
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