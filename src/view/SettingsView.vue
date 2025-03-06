<script setup lang="ts">
import { useUserStore } from '@/util/pinia';
import { ref } from 'vue';

const userStore = useUserStore();
const accessTokenInput = ref(userStore.access_token);
const seedsInput = ref(userStore.seeds);

const setAccessToken = () => {
    userStore.access_token = accessTokenInput.value;
    alert("access_token 设置成功");
};
const setSeeds = () => {
    userStore.seeds = seedsInput.value;
    alert("seeds 设置成功");
};

const uploadGatewayInput = ref('')
const useUploadGateway = () => {
    if (uploadGatewayInput.value.match(/https?:\/\/[^\?]+/g) === null) {
        alert('不为 url 请重新输入');
        return;
    }
    userStore.upload_gateway = uploadGatewayInput.value;
}

const downloadGatewayInput = ref('')
const useDownloadGateway = () => {
    if (uploadGatewayInput.value.match(/https?:\/\/[^\?]+/g) === null) {
        alert('不为 url 请重新输入');
        return;
    }
    userStore.download_gateway = downloadGatewayInput.value;
}
</script>

<template>
    <div class="settingsContainer">
        <!-- Access Token -->
        <div class="settingItem">
            <label for="accessTokenInput" class="settingLabel">Access Token:</label>
            <input v-model="accessTokenInput" id="accessTokenInput" type="text" placeholder="请输入 Access Token"
                class="settingInput" />
            <button @click="setAccessToken" class="settingButton">确定</button>
        </div>
        <!-- Seeds -->
        <div class="settingItem">
            <label for="seedsInput" class="settingLabel">Seeds:</label>
            <input v-model="seedsInput" id="seedsInput" type="text" placeholder="请输入 Seeds 值" class="settingInput" />
            <button @click="setSeeds" class="settingButton">确定</button>
        </div>
        <div class="settingItem">
            <label for="uploadGatewaySelect" class="settingLabel">Upload Gateway:</label>
            <select v-model="userStore.upload_gateway" id="uploadGatewaySelect" class="settingInput">
                <option v-for="item in userStore.upload_gateway_list" :value="item">{{ item }}</option>
            </select>
            <input v-model="uploadGatewayInput" type="text" placeholder="请输入自定义 Upload Gateway 值"
                class="settingInput" />
            <button @click="useUploadGateway" class="settingButton">使用</button>
        </div>
        <div class="settingItem">
            <label for="downloadGatewaySelect" class="settingLabel">Download Gateway:</label>
            <select v-model="userStore.download_gateway" id="downloadGatewaySelect" class="settingInput">
                <option v-for="item in userStore.download_gateway_list" :value="item">{{ item }}</option>
            </select>
            <input v-model="downloadGatewayInput" type="text" placeholder="请输入自定义 Download Gateway 值"
                class="settingInput" />
            <button @click="useDownloadGateway" class="settingButton">使用</button>
        </div>
    </div>
</template>

<style scoped>
/* 整体容器样式 */
.settingsContainer {
    /* max-width: 600px; */
    margin: 10px 10px;
    padding: 0px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
}

/* 单个表单项容器 */
.settingItem {
    display: flex;
    align-items: center;
    /* 垂直居中对齐 */
    margin: 10px 10px;
    gap: 10px;
    /* 添加标签、输入框和按钮之间的间距 */
}

/* 标签样式 */
.settingLabel {
    flex: 0 0 100px;
    /* 固定宽度，保持整齐 */
    font-size: 14px;
    font-weight: 600;
    text-align: right;
    /* 标签内容右对齐 */
    /* padding-right: 10px; */
    color: #555;
}

/* 输入框样式 */
.settingInput {
    flex: 1;
    /* 输入框占用剩余空间 */
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
    outline: none;
    height: 38px;
    /* 确保输入框高度一致 */
}

.settingInput:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
}

/* 按钮样式 */
.settingButton {
    flex: 0 0 100px;
    /* 按钮固定宽度，和输入框比例一致 */
    padding: 8px;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background-color: #007bff;
    color: white;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
    height: 38px;
    /* 确保按钮和输入框高度一致 */
    text-align: center;
}

.settingButton:hover {
    background-color: #0056b3;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>