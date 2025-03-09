<script lang="ts" setup>
import { ref, computed } from 'vue';
import { taskFromFile, useTaskStore, type TaskItem } from '@/util/pinia';
import { VscDebugRestart } from 'vue-icons-plus/vsc';
import { BiCloudUpload, BiPin } from 'vue-icons-plus/bi';
import { IpDeleteFive } from 'vue-icons-plus/ip';
import { postUploadContent } from '@/api/postUploadContent';
import { useRoute, useRouter } from 'vue-router';
import { postRePin } from '@/api/postRepin';

const taskStore = useTaskStore();
const selectedTab = ref<'transfer' | 'success' | 'failed'>('transfer');
const showPinTasks = ref(false); // 控制是否显示固定任务

// 计算任务分类
const transferringTasks = computed(() =>
    Array.from(taskStore.task_map.values()).filter(t =>
        !t.upload.response || !taskStore.failure_task_list.includes(t)
    )
);

const successTasks = computed(() =>
    taskStore.success_task_list.filter(t =>
        showPinTasks.value ? t.pin.response : true
    )
);

const failedTasks = computed(() =>
    taskStore.failure_task_list.filter(t =>
        showPinTasks.value ? t.pin.response : true
    )
);

const currentTasks = computed(() => {
    switch (selectedTab.value) {
        case 'transfer': return transferringTasks.value;
        case 'success': return successTasks.value;
        case 'failed': return failedTasks.value;
    }
});

const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const showUploadOptions = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const folderInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
    fileInput.value?.click();
};

const triggerFolderUpload = () => {
    folderInput.value?.click();
};

const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    const path = document.location.pathname;
    if (files) {
        // 处理文件上传逻辑
        for (const file of files) {
            const task: TaskItem = taskFromFile(path, file);
            taskStore.task_map.set(task.id, task);
            taskStore.pool.add(() => postUploadContent(task));
        }
    }
};

const handleFolderUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    const path = document.location.pathname;
    if (files) {
        // 处理文件夹上传逻辑
        for (const file of files) {
            const task: TaskItem = taskFromFile(path, file);
            taskStore.task_map.set(task.id, task);
            taskStore.pool.add(() => postUploadContent(task));
        }
    }
};

const selectedTasks = ref<string[]>([]); // 存储选中的任务ID

// 重试选中任务
const retrySelectedTasks = async () => {
    for (const taskId of selectedTasks.value) {
        const task = taskStore.failure_task_list.find(t => t.id === taskId)
        if (task) {
            taskStore.failure_task_list = taskStore.failure_task_list.filter(t => t.id !== taskId);
            taskStore.task_map.set(taskId, task);
            if (task.upload.status === 'success') {
                await postRePin(task);
            } else {
                task.upload = {
                    status: 'wait',
                    progress: '0',
                    response: null
                }
                task.pin = {
                    status: 'wait',
                    response: null
                }

                // 重新加入传输队列

                // 重新执行上传
                taskStore.pool.add(() => postUploadContent(task));
            }
        }
    }
    selectedTasks.value = [] // 清空选中状态
}

const retryTasks = async (taskId: string) => {
    const task = taskStore.failure_task_list.find(t => t.id === taskId)
    if (task) {
        taskStore.failure_task_list = taskStore.failure_task_list.filter(t => t.id !== taskId);
        taskStore.task_map.set(taskId, task);
        // 重置任务状态
        if (task.upload.status === 'success') {
            await postRePin(task);
        } else {
            task.upload = {
                status: 'wait',
                progress: '0',
                response: null
            }
            task.pin = {
                status: 'wait',
                response: null
            }
            taskStore.pool.add(() => postUploadContent(task));
        }
    }
}

const delTask = (taskId: string) => {
    taskStore.failure_task_list = taskStore.failure_task_list.filter(t => t.id !== taskId);
}

const isAllSelected = computed({
    get: () => {
        return failedTasks.value.length > 0 &&
            failedTasks.value.every(t => selectedTasks.value.includes(t.id))
    },
    set: (value) => {
        if (value) {
            selectedTasks.value = failedTasks.value.map(t => t.id)
        } else {
            selectedTasks.value = []
        }
    }
})

const handleHeaderCheck = (event: Event) => {
    const target = event.target as HTMLInputElement
    isAllSelected.value = target.checked
}

const clearAll = () => {
    if (selectedTab.value === 'failed') {
        taskStore.failure_task_list = [];
    } else if (selectedTab.value === 'success') {
        taskStore.success_task_list = [];
    }
}

const getTaskStatus = (task: TaskItem) => {
    if (task.pin.status === 'success') {
        return 'success'
    } else if (task.upload.status === 'failed' || task.pin.status === 'failed') {
        return 'failed'
    } else if (task.upload.status === 'start' || task.pin.status === 'start') {
        return 'doing'
    } else {
        return 'wait'
    }
}
</script>

<template>
    <div class="upload-comp-container">
        <!-- 顶部导航栏 -->
        <div class="nav-header">
            <div class="nav-left">
                <a :class="{ active: selectedTab === 'transfer' }" @click="selectedTab = 'transfer'">
                    传输 ({{ transferringTasks.length }})
                </a>
                <a :class="{ active: selectedTab === 'success' }" @click="selectedTab = 'success'">
                    成功 ({{ successTasks.length }})
                </a>
                <a :class="{ active: selectedTab === 'failed' }" @click="selectedTab = 'failed'">
                    失败 ({{ failedTasks.length }})
                </a>
            </div>

            <div class="nav-right">
                <div v-show="selectedTab === 'transfer'" class="upload-container" @mouseenter="showUploadOptions = true"
                    @mouseleave="showUploadOptions = false">
                    <a class="upload-main-btn">
                        上传
                    </a>
                    <transition name="fade">
                        <div v-show="showUploadOptions" class="upload-options">
                            <a @click.stop="triggerFileUpload">
                                <span>📄 文件</span>
                                <input ref="fileInput" type="file" multiple hidden @change="handleFileUpload">
                            </a>
                            <a @click.stop="triggerFolderUpload">
                                <span>📁 文件夹</span>
                                <input ref="folderInput" type="file" webkitdirectory hidden
                                    @change="handleFolderUpload">
                            </a>
                        </div>
                    </transition>
                </div>
                <a v-show="selectedTab === 'failed'" @click="retrySelectedTasks" :disabled="selectedTasks.length === 0">
                    重试
                </a>
                <a v-show="selectedTab === 'failed' || selectedTab === 'success'" @click="clearAll"
                    :disabled="selectedTasks.length === 0">
                    清空
                </a>
            </div>
        </div>

        <!-- 任务列表 -->
        <div class="task-list-container">
            <table class="file-table">
                <thead>
                    <tr>
                        <th class="checkbox-cell" v-show="selectedTab === 'failed'">
                            <input type="checkbox" v-model="isAllSelected" @change="handleHeaderCheck">
                        </th>
                        <th class="name-header">名称</th>
                        <th class="size-header">大小</th>
                        <th class="progress-header" v-show="selectedTab === 'transfer'">进程</th>
                        <th class="action-header" v-show="selectedTab === 'failed'">操作</th>
                        <th class="status-header">状态</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="task in currentTasks" :key="task.id" class="file-row">
                        <td class="checkbox-cell" v-show="selectedTab === 'failed'">
                            <input type="checkbox" :value="task.id" v-model="selectedTasks">
                        </td>
                        <td class="name-cell">
                            {{ task.name }}
                        </td>
                        <td class="size-cell">{{ formatSize(task.size) }}</td>
                        <td class="progrese-cell" v-show="selectedTab === 'transfer'">
                            <div class="progress-container">
                                <div class="progress-bar" :style="{ width: task.upload.progress }">
                                    <span class="progress-text">{{ task.upload.progress }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="action-cell" v-show="selectedTab === 'failed'">
                            <div class="action-restart" @click="retryTasks(task.id)">
                                <VscDebugRestart />
                            </div>
                            <div class="action-delete" @click="delTask(task.id)">
                                <IpDeleteFive />
                            </div>
                        </td>
                        <td class="status-cell">
                            {{ getTaskStatus(task) }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- 空状态提示 -->
            <div v-if="currentTasks.length === 0" class="empty-state">
                <span>没有任务</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.upload-comp-container {
    height: 100%;
    overflow-y: auto;
    background: #1a202c;
    color: #e5e7eb;
}

.nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0px;
    background: transparent;
    border-radius: 8px;
    padding: 5px 10px;
}

.nav-left,
.nav-right {
    background-color: #2d3748;
    display: flex;
    align-items: center;
    border-radius: 50px;
    margin: 5px;
    padding: 5px 10px;
    left: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    cursor: default;

    a {
        text-decoration: none;
        color: #a0aec0;
        font-size: 16px;
        size: 16px;
        padding: 3px 15px;
        border-radius: 50px;
        transition: background-color 0.3s, transform 0.2s;

        &:hover {
            color: #1a202c;
            background-color: #cacaca;
            cursor: pointer;
            transition: background-color 0.3s, transform 0.2s;
        }

        &.active {
            color: white;
            background-color: #1a202c;
        }
    }
}

/* 添加以下样式 */
.upload-container {
    position: relative;
    display: flex;
    align-items: center;

    a {
        display: inline-flex;
        align-items: center;
        vertical-align: top;
    }
}

.upload-options {
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 100%;
    right: 0;
    margin-top: 10px;
    background: #2d3748;
    border-radius: 12px;
    padding: 8px 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    min-width: 120px;
    z-index: 10;
}

.upload-options a {
    display: flex;
    padding: 8px 16px;
    color: #e5e7eb;
    text-decoration: none;
    transition: background 0.2s;
}

.upload-options a:hover {
    color: #e5e7eb;
    background: rgba(99, 179, 237, 0.1);
    border-radius: 10px;
}

.upload-options span {
    flex: 1;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.task-list-container {
    padding: 0;
    margin: 10px;
}

/* 表格整体样式 */
.file-table {
    width: 100%;
    border-collapse: collapse;
    background: #2d3748;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 表头样式 */
.file-table thead {
    background: #3c4555;
    border-bottom: 2px solid #4a5568;
}

.file-table th {
    padding: 1rem;
    text-align: left;
    color: #a0aec0;
    font-weight: 500;
    font-size: 0.9rem;
}

/* 表格行样式 */
.file-table tbody tr {
    border-bottom: 1px solid #4a5568;
    transition: background 0.2s;
}

.file-table tbody tr:last-child {
    border-bottom: none;
}

.file-table tbody tr:hover {
    background: rgba(99, 179, 237, 0.05);
}

/* 单元格通用样式 */
.file-table td {
    padding: 1rem;
    color: #e5e7eb;
    font-size: 0.9rem;
    vertical-align: middle;
}

/* 进度条容器 */
.progrese-cell {
    width: 200px;
    /* 固定宽度 */
}

.progress-container {
    background: #1a202c;
    height: 6px;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
}

.progress-bar {
    height: 100%;
    background: #4299e1;
    transition: width 0.3s ease;
    position: relative;
}

.progress-text {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.8rem;
    color: #e5e7eb;
    mix-blend-mode: difference;
}

/* 状态指示器 */
.status-cell {
    position: relative;
    padding-left: 24px;
    min-width: 120px;
}

.checkbox-cell {
    vertical-align: middle;
    padding: 0 1rem;
}

/* 操作按钮 */
.action-cell {
    display: flex;
    gap: 1rem;
}

.action-restart,
.action-delete {
    cursor: pointer;
    padding: 6px;
    border-radius: 4px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
}

.action-restart:hover {
    background: rgba(99, 179, 237, 0.1);
    color: #63b3ed;
}

.action-delete:hover {
    background: rgba(245, 101, 101, 0.1);
    color: #f56565;
}

/* 复选框样式 */
.checkbox-cell {
    width: 40px;
    text-align: center;
}

.checkbox-cell input[type="checkbox"] {
    accent-color: #63b3ed;
    width: 16px;
    height: 16px;
    cursor: pointer;
}

/* 列宽调整 */
.name-cell {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.size-cell {
    width: 120px;
}

.status-cell {
    width: 200px;
}

/* 空状态提示优化 */
.empty-state {
    padding: 2rem;
    color: #a0aec0;
    text-align: center;
    border: 2px dashed #4a5568;
    border-radius: 8px;
    margin: 1rem;
}
</style>