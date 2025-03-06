import { useUserStore, type Task } from "@/util/pinia";
import { postUploadContent } from "./postUploadContent";

async function postReUploadContent(task: Task) {
    const userStore = useUserStore();
    userStore.task_map.delete(task.id);
    userStore.pool.add(() => postUploadContent(task));
}

export {
    postReUploadContent,
}