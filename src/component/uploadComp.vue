<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useTaskStore, type TaskItem } from '@/util/pinia';
import { VscPassFilled, VscError, VscLoading } from 'vue-icons-plus/vsc';
import { BiCloudUpload, BiInfoCircle, BiPin } from 'vue-icons-plus/bi';

const taskStore = useTaskStore();
const selectedTab = ref<'transfer' | 'success' | 'failed'>('transfer');
const showPinTasks = ref(false); // 控制是否显示固定任务

// 计算任务分类
const transferringTasks = computed(() =>
    Array.from(taskStore.task_map.values()).filter(t =>
        !t.upload.response && !taskStore.failure_task_list.includes(t)
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

const getStatusIcon = (task: TaskItem) => {
    if (task.upload.response) return VscPassFilled;
    if (taskStore.failure_task_list.includes(task)) return VscError;
    return VscLoading;
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
    if (files) {
        // 处理文件上传逻辑
        console.log('Selected files:', files);
    }
};

const handleFolderUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (files) {
        // 处理文件夹上传逻辑
        console.log('Selected folder:', files);
    }
};

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
                    <transition name="fade" class="upload-container">
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
                <a v-show="selectedTab === 'success' || selectedTab === 'failed'"
                    :class="{ active: showPinTasks === false }" @click="showPinTasks = false">
                    <BiCloudUpload size="20px" />
                </a>
                <a v-show="selectedTab === 'success' || selectedTab === 'failed'"
                    :class="{ active: showPinTasks === true }" @click="showPinTasks = true">
                    <BiPin size="20px" />
                </a>
            </div>
        </div>

        <!-- 任务列表 -->
        <div class="task-list-container">
            <transition-group name="list" tag="div" class="task-list">
                <div v-for="task in currentTasks" :key="task.id" class="task-item">
                    <!-- 保持原有任务项结构 -->
                    <div class="task-info">
                        <component :is="getStatusIcon(task)" class="status-icon" />
                        <div class="file-meta">
                            <span class="file-name">{{ task.name }}</span>
                            <span class="file-size">{{ formatSize(task.size) }}</span>
                            <!-- 显示固定状态 -->
                            <span v-if="task.pin.response" class="pin-status">
                                <BiPin /> 已固定
                            </span>
                        </div>
                    </div>

                    <div v-if="selectedTab === 'transfer'" class="progress-container">
                        <div class="progress-bar" :style="{ width: task.upload.progress }">
                            <span class="progress-text">{{ task.upload.progress }}</span>
                        </div>
                    </div>
                </div>
            </transition-group>

            <!-- 空状态提示 -->
            <div v-if="currentTasks.length === 0" class="empty-state">
                <span v-if="showPinTasks">没有固定任务</span>
                <span v-else>暂时没有{{ {
                    transfer: '进行中的任务',
                    success: '成功任务',
                    failed: '失败任务'
                }[selectedTab] }}</span>
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
    /* display: grid; */
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

.pin-status {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    color: #48bb78;
    font-size: 0.85rem;
    margin-top: 0.3rem;
}

.empty-state {
    text-align: center;
    color: #a0aec0;
    padding: 2rem;
}
</style>