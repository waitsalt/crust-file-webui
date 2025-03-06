<script lang="ts" setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { useSettingStore } from '@/util/pinia';
import type { StorageItem } from '@/type/storage';

const path = ref(useRoute().path);
if (path.value === '/') {
    document.title = 'home | Crust'
    const title = path.value.split("/");
    console.log(title);
} else {
    const title = path.value.split("/");
    console.log(title);

    document.title = `${title[title.length - 1]} | Crust`;
}
const settingStore = useSettingStore();
const getStorageShowItemList = () => {
    const path = useRoute().path;
    const content = settingStore.content;

    // 如果路径是根路径 "/"，直接返回所有顶层内容
    if (path === '/') {
        return content;
    }

    // 将路径拆分为数组，例如 "/folder1/folder2" -> ["folder1", "folder2"]
    const pathSegments = path.split('/').filter(segment => segment.length > 0);

    let currentItems: StorageItem[] = content;

    // 遍历路径的每一段
    for (const segment of pathSegments) {
        const foundItem = currentItems.find(item => item.name === segment && item.type === 'floder');
        if (!foundItem || !foundItem.children) {
            console.log("path in storeage error");

            return []; // 如果路径不存在或不是文件夹，返回空数组
        }
        currentItems = foundItem.children; // 进入下一层
    }

    return currentItems; // 返回当前路径对应的子项
}
</script>

<template>
    <div class="homeContainer">
        <!-- 操作栏 -->
        <div class="topBar">
            <div class="leftPart">
                <img class="logo" src="/src/public/favicon.ico">
                <div class="pathSHow">{{ path }}</div>
            </div>
            <div class="rightPart">
                <div class="searchBox">
                    <input type="text" placeholder="搜索文件">
                </div>
            </div>
        </div>

        <!-- 文件列表 -->
        <div class="storageItemList">
            <table>
                <thead>
                    <tr>
                        <th class="name-col">名称</th>
                        <th class="size-col">大小</th>
                        <th class="modified-col">修改时间</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in getStorageShowItemList()" :key="index">
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- 分页 -->
        <div class="pagination">
            <button class="pageChange">上一页</button>
            <span class="pageNumber">1/5</span>
            <button class="pageChange">下一页</button>
        </div>
    </div>
</template>

<style scoped>
.homeContainer {
    height: 100%;
    width: 100%;
}
</style>