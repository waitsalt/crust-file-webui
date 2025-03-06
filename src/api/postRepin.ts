import { axiosAuth } from "@/util/axios";
import { useUserStore, type Task } from "@/util/pinia";
import type { PinStatus } from "@/util/type/crust";

async function postRePin(task: Task) {
    const userStore = useUserStore();
    userStore.updateTaskPinStatus(task.id, "start");
    const res = task.upload.response;
    if (res === null) {
        alert('未能获取cid和name');
        return;
    }
    try {
        let cid = '';
        let name = '';
        if (Array.isArray(res)) {
            const item = res[res.length - 1];
            cid = item.Hash;
            name = item.Name;
        } else {
            cid = res.Hash;
            name = res.Name;
        }
        userStore.updateTaskPinStatus(task.id, "start");
        const pinRes: PinStatus = await axiosAuth.post(`${userStore.pin_server}/psa/pins`, {
            cid: cid,
            name: name,
        });
        userStore.updateTaskPinResponse(task.id, pinRes);
        userStore.updateTaskPinStatus(task.id, "success");
    } catch {
        userStore.updateTaskPinStatus(task.id, "fail");
    }
}

export {
    postRePin,
}