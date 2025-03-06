import { axiosAuth } from "@/util/axios";
import { useUserStore, type Task } from "@/util/pinia";
import type { PinStatus, UploadFileResponse } from "@/util/type/crust";

async function postUploadContent(task: Task) {
    const userStore = useUserStore();
    const formData = new FormData();
    if (Array.isArray(task.content)) {
        for (const file of task.content as File[]) {
            formData.append('file', file, file.webkitRelativePath);
        }
    } else {
        formData.append('file', task.content as File);;
    }
    try {
        userStore.updateTaskStatus(task.id, 'upload');
        let res: UploadFileResponse | UploadFileResponse[] = await axiosAuth.post(`${userStore.upload_gateway}/api/v0/add?pin=true&cid-version=1&hash=sha2-256`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    // 计算上传进度百分比
                    const percentCompleted = ((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
                    userStore.updateTaskProgress(task.id, percentCompleted);
                }
            },
        });
        if (typeof res === 'string') {
            const jsonObjects = (res as string).split(/(?<=})\s*(?={)/g);

            // 解析每个 JSON 对象
            const parsedObjects = jsonObjects.map(json => JSON.parse(json));
            res = parsedObjects as UploadFileResponse[];
        }

        userStore.updateTaskResponse(task.id, res);
        userStore.updateTaskStatus(task.id, 'success');

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
    } catch {
        userStore.updateTaskStatus(task.id, 'fail');
    }
}

export {
    postUploadContent,
}