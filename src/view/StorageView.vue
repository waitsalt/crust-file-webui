<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { getStorageInfo } from '@/api/getPinStatusList';
import { IpShare } from 'vue-icons-plus/ip';
import { RiDeleteBin5Line } from 'vue-icons-plus/ri';
import { postUploadContent } from '@/api/postUploadContent';
import { TaskFromContent, useUserStore } from '@/util/pinia';
import { deletePin } from '@/api/deletePin';
import type { PinListResponse } from '@/util/type/crust';

// 定义存储信息状态
const storageInfo = ref<null | PinListResponse>(null);
const isLoading = ref(true); // 加载状态
const errorMessage = ref<string | null>(null); // 错误信息

const userStore = useUserStore();

// 获取存储信息
onMounted(async () => {
    try {
        const data = await getStorageInfo();
        storageInfo.value = data;
    } catch (error) {
        errorMessage.value = '无法获取存储信息，请检查 access_token 或 seeds。';
        storageInfo.value = null;
    } finally {
        isLoading.value = false; // 无论成功或失败，加载完成
    }
});

// 悬浮面板状态
const showUploadPanel = ref(false);

// 切换悬浮面板的显示状态
const toggleUploadPanel = () => {
    showUploadPanel.value = !showUploadPanel.value;
};

// 触发文件上传
const triggerFileUpload = () => {
    const fileInput = document.getElementById('uploadFile') as HTMLInputElement;
    fileInput.click(); // 触发文件选择对话框
};

// 触发文件夹上传
const triggerFolderUpload = () => {
    const folderInput = document.getElementById('uploadFolder') as HTMLInputElement;
    folderInput.click(); // 触发文件夹选择对话框
};

// 处理文件上传
const handleFileUpload = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
        for (const file of files) {
            const task = TaskFromContent(file);
            userStore.addTask(task);
            userStore.pool.add(() => postUploadContent(task));
        }
    }
};

// 处理文件夹上传
const handleFolderUpload = (event: Event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
        const task = TaskFromContent(Array.from(files));
        userStore.addTask(task);
        userStore.pool.add(() => postUploadContent(task));
    }
};

// 监听全局点击事件
const handleClickOutside = (event: MouseEvent) => {
    const uploadPanel = document.querySelector('.uploadPanel');
    const uploadTypeShow = document.querySelector('.uploadTypeShow');

    if (uploadPanel && !uploadPanel.contains(event.target as Node) &&
        uploadTypeShow && !uploadTypeShow.contains(event.target as Node)) {
        showUploadPanel.value = false;
    }
};

const openContent = async (cid: string) => {
    window.open(`${userStore.download_gateway}/ipfs/${cid}`)
}

function exportToJsonFile() {
    const jsonString = JSON.stringify(Object.fromEntries(userStore.task_map.entries()));
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// 在组件挂载时添加全局点击事件监听器
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

// 在组件卸载时移除全局点击事件监听器
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="storageContainer">
        <div class="uploadChoose">
            <button class="uploadTypeShow" @click="toggleUploadPanel">
                上传
            </button>
            <button @click="exportToJsonFile">导出</button>
            <!-- 悬浮面板 -->
            <div v-if="showUploadPanel" class="uploadPanel">
                <button @click="triggerFileUpload">文件</button>
                <button @click="triggerFolderUpload">文件夹</button>
            </div>
        </div>
        <!-- 文件选择输入框（隐藏） -->
        <input v-if="showUploadPanel" type="file" id="uploadFile" ref="uploadFile" style="display: none"
            @change="handleFileUpload" multiple />
        <input v-if="showUploadPanel" type="file" id="uploadFolder" ref="uploadFolder" style="display: none"
            webkitdirectory @change="handleFolderUpload" />
        <!-- 加载状态 -->
        <div v-if="isLoading" class="loading fileList">
            <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="storageInfo === null" class="error fileList">
            <p>获取存储信息失败{{ errorMessage }}</p>
        </div>

        <!-- 成功状态 -->
        <div v-else>
            <div>
                <div class="fileList">
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>名称</th>
                                <th>CID</th>
                                <th>状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in storageInfo.results" :key="item.requestId" class="fileCard">
                                <td>{{ index + 1 }}</td>
                                <td>{{ item.pin.name }}</td>
                                <td>{{ item.pin.cid }}</td>
                                <td>{{ item.status }}</td>
                                <td>
                                    <div class="storageAction">
                                        <div class="storageOpen">
                                            <IpShare @click="openContent(item.pin.cid)" />
                                        </div>
                                        <div class="storageDelete">
                                            <RiDeleteBin5Line @click="deletePin(item.requestId)" />
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.storageContainer {
    margin: 0;
    padding: 10px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.loading,
.error {
    text-align: center;
    font-size: 18px;
    color: #666;
    margin-top: 20px;
}

.uploadChoose {
    position: relative;
    display: inline-block;
    margin-bottom: 10px;
}

.uploadTypeShow {
    width: 80px;
    padding: 8px 10px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.uploadPanel {
    position: absolute;
    width: 80px;
    top: 100%;
    left: 0;
    margin-top: 8px;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
}

.uploadPanel button {
    display: block;
    width: 100%;
    padding: 8px 16px;
    background-color: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
}

.uploadPanel button:hover {
    background-color: #f5f5f5;
}

.fileList {
    margin-top: 0px;
    height: 80vh;
    overflow-y: auto;
    border: 1px solid #ddd;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

table {
    width: 100%;
    border-collapse: collapse;
}

th,
td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

th {
    background-color: #f5f5f5;
    font-weight: 600;
    color: #333;
    position: sticky;
    top: 0;
    z-index: 1;
}

.fileCard:hover {
    background-color: #f9f9f9;
}

.storageAction {
    display: flex;
    gap: 5px;
}

.storageOpen,
.storageDelete,
.storageScan {
    cursor: pointer;
    color: #666;
    transition: color 0.3s ease;
}

.storageOpen:hover {
    color: #007bff;
}

.storageDelete:hover {
    color: #ff4d4f;
}

.storageScan:hover {
    color: #28a745;
}
</style>