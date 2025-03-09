import { createPinia, defineStore } from "pinia";
import type { FolderItem, StorageItem } from "@/type/storage";
import type { PinStatus, UploadFileResponse } from "@/type/crust";
import { PromisePool } from "./task_pool";
import { uuid } from "./uuid";

const pinia = createPinia()

type Setting = {
    user: {
        seed: string | null,
        token: string | null,
    },
    server: {
        upload: {
            use: string,
            list: string[],
        },
        download: {
            use: string,
            list: string[],
        },
        pin: {
            use: string,
            list: string[],
        }
    },
    content: StorageItem[],
}

const useSettingStore = defineStore('setting', {
    state: (): Setting => ({
        user: {
            seed: null,
            token: null,
        },
        server: {
            upload: {
                use: 'https://gw.crustfiles.net',
                list: [
                    'https://gw.crustfiles.net',
                    'https://crustipfs.xyz',
                    'https://ipfs-gw.decloud.foundation',
                    'https://gw.w3ipfs.cn:10443',
                    'https://gw.smallwolf.me',
                    'https://gw.w3ipfs.com:7443',
                ],
            },
            download: {
                use: "https://ipfs.io",
                list: [
                    'https://ipfs.io',
                    'https://gw.w3ipfs.org.cn',
                    'https://crustgateway.online',
                    "https://dweb.link"
                ],
            },
            pin: {
                use: 'https://pin.crustcode.com',
                list: [
                    'https://pin.crustcode.com'
                ],
            }
        },
        content: [],
    }),
    actions: {
        getContentItem(fullPath: string) {
            const path_items = fullPath.split('/').filter((item) => item !== '');
            const length = path_items.length;
            let content = this.content;
            if (fullPath === '/') {
                return content;
            }
            for (let index = 0; index < length - 1; index++) {
                content = (content.find((item) => item.type === 'folder' && item.name === path_items[index]) as FolderItem).children;
            }
            const content_item = content.find((item) => item.name === path_items[length - 1]);
            return content_item;
        }
    }
})

type TaskItem = {
    id: string,
    name: string,
    size: number,
    content: File,
    path: string,
    upload: {
        status: string,
        progress: string,
        response: UploadFileResponse | null,
    },
    pin: {
        status: string,
        response: PinStatus | null,
    }
}

function taskFromFile(path: string, file: File): TaskItem {
    return {
        id: uuid(),
        name: file.name,
        size: file.size,
        content: file,
        path: path,
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

type Task = {
    pool: PromisePool,
    task_map: Map<string, TaskItem>,
    success_task_list: TaskItem[],
    failure_task_list: TaskItem[]
}

const useTaskStore = defineStore('task', {
    state: (): Task => ({
        pool: new PromisePool(5),
        task_map: new Map(),
        success_task_list: [],
        failure_task_list: [],
    }),
    actions: {
        addTask(task: TaskItem) {
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
        updateTaskResponse(id: string, respronse: UploadFileResponse) {
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
    }
})

type Show = {
    user_panel: string | null,
    selected_item: string[],
}

const useShowStore = defineStore("show", {
    state: () => ({
        user_panel: null,
    }),
})

export {
    pinia,
    useSettingStore,
    type TaskItem,
    useTaskStore,
    taskFromFile,
}