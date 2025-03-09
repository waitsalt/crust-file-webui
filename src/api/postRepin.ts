import type { PinStatus } from "@/type/crust";
import type { StorageItem } from "@/type/storage";
import { axiosAuth } from "@/util/axios";
import { createFullPath } from "@/util/createFullPath";
import { useSettingStore, useTaskStore, type TaskItem } from "@/util/pinia";


async function postRePin(task: TaskItem) {
    const taskStore = useTaskStore();
    const settingStore = useSettingStore();
    taskStore.updateTaskPinStatus(task.id, "wait");
    const res = task.upload.response;
    if (res === null) {
        alert(`${task.name}: 未能获取cid和name`);
        return;
    }
    try {
        let cid = res.Hash;
        let name = res.Name;
        taskStore.updateTaskPinStatus(task.id, "start");
        const pinRes: PinStatus = await axiosAuth.post(`${settingStore.server.pin.use}/psa/pins`, {
            cid: cid,
            name: name,
        });
        taskStore.updateTaskPinResponse(task.id, pinRes);
        taskStore.updateTaskPinStatus(task.id, "success");

        const fullPath = `/${task.path}/${task.content.webkitRelativePath}`.replace(/\/+/g, '/');
        const storageItem: StorageItem = {
            type: 'file',
            name: task.content.name,
            size: task.content.size,
            created: Date(),
            cid: cid,
            request_id: pinRes.requestId,
        }
        createFullPath(fullPath, storageItem);
    } catch {
        taskStore.updateTaskPinStatus(task.id, "fail");
    }
    if (task.pin.status === 'success' && task.upload.status === "success") {
        taskStore.success_task_list.push(task);
    } else {
        taskStore.failure_task_list.push(task);
    }
    taskStore.task_map.delete(task.id);
}

export {
    postRePin,
}