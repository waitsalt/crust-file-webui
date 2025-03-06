<script setup lang="ts">
import { postReUploadContent } from '@/api/postReUploadContent';
import { useUserStore } from '@/util/pinia';
import { ref, computed } from 'vue';
import { MdRestartAlt } from 'vue-icons-plus/md';

const userStore = useUserStore();
const activeMenuItem = ref('all'); // 默认显示所有任务

// 根据 activeMenuItem 过滤任务
const filteredTasks = computed(() => {
    const tasks = Array.from(userStore.task_map.values());
    if (activeMenuItem.value === 'all') {
        return tasks;
    }
    return tasks.filter((task) => task.upload.status === activeMenuItem.value);
});

// 格式化文件大小（B -> KB, MB, GB）
const formatFileSize = (size: number): string => {
    if (size < 1024) {
        return size + ' B';
    } else if (size < 1024 * 1024) {
        return (size / 1024).toFixed(2) + ' KB';
    } else if (size < 1024 * 1024 * 1024) {
        return (size / (1024 * 1024)).toFixed(2) + ' MB';
    } else {
        return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }
};
</script>

<template>
    <div class="menu">
        <button :class="{ active: activeMenuItem === 'all' }" @click="activeMenuItem = 'all'">
            全部
        </button>
        <button :class="{ active: activeMenuItem === 'wait' }" @click="activeMenuItem = 'wait'">
            等待
        </button>
        <button :class="{ active: activeMenuItem === 'upload' }" @click="activeMenuItem = 'upload'">
            上传
        </button>
        <button :class="{ active: activeMenuItem === 'success' }" @click="activeMenuItem = 'success'">
            成功
        </button>
        <button :class="{ active: activeMenuItem === 'fail' }" @click="activeMenuItem = 'fail'">
            失败
        </button>
    </div>

    <div class="transferview" v-for="task in filteredTasks" :key="task.id">
        <div class="task-left">
            <div class="taskName">{{ task.name }}</div>
        </div>
        <div class="task-right">
            <div class="taskSize">{{ formatFileSize(task.size) }}</div>
            <div class="taskProgress-container">
                <div class="taskProgress-bar">
                    <div class="progress" :style="{ width: task.upload.progress + '%' }"></div>
                </div>
                <span class="taskProgress-text">{{ task.upload.progress }}%</span>
            </div>
            <div class="taskAction">
                <div class="uploadRetry">
                    <MdRestartAlt @click="postReUploadContent(task)" />
                </div>
            </div>
            <div :class="['taskStatus', task.upload.status]">{{ task.upload.status }}</div>
        </div>
    </div>
</template>

<style scoped>
/* 菜单按钮样式 */
.menu {
    margin: 10px 0px 0px 10px;
    display: flex;
    gap: 5px;
}

.menu button {
    padding: 8px 15px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
    transition: all 0.3s ease;
}

.menu button:hover {
    background-color: #e0e0e0;
}

.menu button.active {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

/* transferview 样式 */
.transferview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px;
    border: 1px solid #e0e0e0;
    border-left: 5px solid #007bff;
    margin: 10px 10px;
    border-radius: 8px;
    background-color: #ffffff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: box-shadow 0.25s ease;
}

.transferview:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 左侧样式 */
.task-left {
    flex: 1;
}

.taskName {
    font-weight: bold;
    font-size: 16px;
    color: #333;
}

/* 右侧样式 */
.task-right {
    flex: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
}

/* taskSize 样式 */
.taskSize {
    font-size: 14px;
    width: 70px;
    color: #666;
}

/* taskProgress 样式 */
.taskProgress-container {
    flex: 1.5;
    display: flex;
    align-items: center;
    gap: 5px;
}

.taskProgress-bar {
    position: relative;
    width: 200px;
    /* 进度条固定长度 */
    height: 10px;
    background-color: #e9ecef;
    /* 背景色 */
    border-radius: 5px;
    overflow: hidden;
}

.progress {
    height: 100%;
    background-color: #007bff;
    transition: width 0.3s ease;
    /* 动态平滑更新进度条宽度 */
}

.taskProgress-text {
    font-size: 14px;
    color: #666;
    min-width: 35px;
    text-align: right;
}

.uploadRetry:hover {
    color: #007bff;
    cursor: pointer;
}

/* taskStatus 样式 */
.taskStatus {
    padding: 4px 8px;
    border-radius: 4px;
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    min-width: 70px;
}

/* 不同状态颜色 */
.taskStatus.wait {
    background-color: #f0ad4e;
    /* 黄色 */
    color: white;
}

.taskStatus.upload {
    background-color: #5bc0de;
    /* 蓝色 */
    color: white;
}

.taskStatus.success {
    background-color: #5cb85c;
    /* 绿色 */
    color: white;
}

.taskStatus.fail {
    background-color: #d9534f;
    /* 红色 */
    color: white;
}
</style>