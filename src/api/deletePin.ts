import { axiosAuth } from "@/util/axios";
import { useUserStore } from "@/util/pinia";


async function deletePin(requestId: string) {
    const userStore = useUserStore();
    try {
        const res = axiosAuth.delete(`${userStore.pin_server}/psa/pins/${requestId}`);
    } catch {
        alert('删除失败')
    }
}

export {
    deletePin,
}