import { createPinia, defineStore } from "pinia";
import { uuid } from "./uuid";
import type { PinStatus, UploadFileResponse } from "./type/crust";
import { PromisePool } from "./task_pool";

const pinia = createPinia()

type Task = {
    id: string,
    name: string,
    content: File | File[],
    size: number,
    upload: {
        status: string,
        progress: string,
        response: null | UploadFileResponse | UploadFileResponse[],
    },
    pin: {
        status: string,
        response: null | PinStatus,
    }
}

function TaskFromContent(content: File | File[]): Task {
    if (Array.isArray(content)) {
        const path = (content as File[])[0].webkitRelativePath;
        let size = 0;
        for (const file of content) {
            size = size + file.size;
        }
        const name = path.split("/")[0];
        return {
            id: uuid(),
            name: name,
            content: content,
            size: size,
            upload: {
                status: 'wait',
                progress: '0',
                response: null,
            },
            pin: {
                status: 'wait',
                response: null,
            }
        }
    } else {
        return {
            id: uuid(),
            name: content.name,
            content: content,
            size: content.size,
            upload: {
                status: 'wait',
                progress: '0',
                response: null,
            },
            pin: {
                status: 'wait',
                response: null,
            }
        }
    }
}

type User = {
    seeds: null | string,
    access_token: null | string,
    task_map: Map<string, Task>,
    pool: PromisePool,
    upload_gateway: string,
    upload_gateway_list: string[],
    download_gateway: string,
    download_gateway_list: string[],
    pin_server: string,
}

const useUserStore = defineStore('user', {
    state: (): User => ({
        seeds: null,
        access_token: null,
        task_map: new Map(),
        pool: new PromisePool(5),
        upload_gateway: 'https://gw.crustfiles.net',
        upload_gateway_list: [
            'https://gw.crustfiles.net',
            'https://crustipfs.xyz',
            'https://ipfs-gw.decloud.foundation',
            'https://gw.w3ipfs.cn:10443',
            'https://gw.smallwolf.me',
            'https://gw.w3ipfs.com:7443',
        ],
        download_gateway: "https://ipfs.io",
        download_gateway_list: [
            'https://ipfs.io',
            'https://gw.w3ipfs.org.cn',
            'https://crustgateway.online',
            "https://dweb.link"
        ],
        pin_server: 'https://pin.crustcode.com'
    }),
    actions: {
        addTask(task: Task) {
            this.task_map.set(task.id, task);
        },
        updateTaskStatus(id: string, status: string) {
            const task = this.task_map.get(id);
            if (task) {
                task.upload.status = status;
            }
        },
        updateTaskProgress(id: string, progress: string) {
            const task = this.task_map.get(id);
            if (task) {
                task.upload.progress = progress;
            }
        },
        updateTaskResponse(id: string, respronse: UploadFileResponse | UploadFileResponse[]) {
            const task = this.task_map.get(id);
            if (task) {
                task.upload.response = respronse;
            }
        },
        updateTaskPinResponse(id: string, response: PinStatus) {
            const task = this.task_map.get(id);
            if (task) {
                task.pin.response = response;
            }
        },
        updateTaskPinStatus(id: string, status: string) {
            const task = this.task_map.get(id);
            if (task) {
                task.pin.status = status;
            }
        }
    },
})

export {
    pinia,
    useUserStore,
    type Task,
    TaskFromContent,
}