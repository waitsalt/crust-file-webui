<script setup lang="ts">
import { postRePin } from '@/api/postRepin';
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
    return tasks.filter((task) => task.pin.status === activeMenuItem.value);
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
        <button :class="{ active: activeMenuItem === 'start' }" @click="activeMenuItem = 'start'">
            开始
        </button>
        <button :class="{ active: activeMenuItem === 'success' }" @click="activeMenuItem = 'success'">
            成功
        </button>
        <button :class="{ active: activeMenuItem === 'fail' }" @click="activeMenuItem = 'fail'">
            失败
        </button>
    </div>

    <div class="pinView" v-for="task in filteredTasks" :key="task.id">
        <div class="task-left">
            <div class="taskName">{{ task.name }}</div>
        </div>
        <div class="task-right">
            <div class="taskSize">{{ formatFileSize(task.size) }}</div>
            <div class="pinAction">
                <div class="pinRetry">
                    <MdRestartAlt @click="postRePin(task)" />
                </div>
            </div>
            <div :class="['taskStatus', task.pin.status]">{{ task.pin.status }}</div>
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

.pinView {
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

.pinView:hover {
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
    width: 60px;
    color: #666;
}

.pinRetry:hover {
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

.taskStatus.start {
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