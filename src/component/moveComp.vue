<!-- moveComp.vue -->
<script lang="ts" setup>
import { ref, computed } from 'vue';
import { useSettingStore } from '@/util/pinia';
import { resolveFullPath } from '@/util/resolveFullPath';
import type { StorageItem } from '@/type/storage';

const settingStore = useSettingStore();
const props = defineProps<{
    selectedItems: string[];
    closePanel: () => void;
}>();

const currentPath = window.location.pathname;

// 移动目标路径
const targetPath = ref('');
const pathHistory = ref<string[]>([]);

const currentFolder = computed(() => ({
    path: targetPath.value,
    content: resolveFullPath(targetPath.value)
}));

const moveItems = async () => {
    try {
    } catch (error) {
        console.error('移动失败:', error);
    }
};

const navigateTo = (path: string) => {
    pathHistory.value.push(targetPath.value);
    targetPath.value = path;
};

const goBack = () => {
    if (pathHistory.value.length > 0) {
        targetPath.value = pathHistory.value.pop() || '';
    }
};
</script>

<template>
    <div class="move-dialog">
        <h3>移动项目到</h3>
        <div class="path-navigation">
            <button @click="goBack" :disabled="pathHistory.length === 0">← 返回</button>
            <input v-model="targetPath" placeholder="输入或选择目标路径">
        </div>

        <div class="folder-view">
            <div v-for="item in currentFolder.content" :key="(item as StorageItem).name" class="folder-item"
                @click="navigateTo(`${targetPath}/${(item as StorageItem).name}`.replace(/\/+/g, '/'))">
                <span v-if="(item as StorageItem).type === 'folder'">📁 {{ (item as StorageItem).name }}</span>
            </div>
        </div>

        <div class="action-buttons">
            <button @click="closePanel()">取消</button>
            <button @click="moveItems" :disabled="!targetPath">确认移动</button>
        </div>
    </div>
</template>

<style scoped>
.move-dialog {
    padding: 2rem;
    min-width: 500px;
    background: #2d3748;
    border-radius: 8px;
}

.path-navigation {
    display: flex;
    gap: 0.5rem;
    margin: 1rem 0;
}

input {
    flex: 1;
    padding: 0.5rem;
    background: #1a202c;
    border: 1px solid #4a5568;
    border-radius: 4px;
    color: #e5e7eb;
}

.folder-view {
    max-height: 300px;
    overflow-y: auto;
    margin: 1rem 0;
}

.folder-item {
    padding: 0.75rem;
    margin: 0.25rem 0;
    background: #3c4555;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
}

.folder-item:hover {
    background: #4a5568;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
}

button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>