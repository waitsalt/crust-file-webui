<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const activeMenuItem = ref('');

// 监听路由变化，更新选中的菜单项
watch(() => route.path, (path) => {
    if (path === '/storage') {
        activeMenuItem.value = 'file';
    } else if (path === '/transfer') {
        activeMenuItem.value = 'transfer';
    } else if (path === '/settings') {
        activeMenuItem.value = 'settings';
    } else if (path === '/pin') {
        activeMenuItem.value = 'pin';
    } else {
        activeMenuItem.value = '';
    }
}, { immediate: true });
</script>

<template>
    <div class="sideContainer">
        <!-- 上部分 -->
        <div class="topSection">
            <router-link to="/storage" class="menuItem" :class="{ active: activeMenuItem === 'file' }">
                <span class="text">存储</span>
            </router-link>
            <router-link to="/transfer" class="menuItem" :class="{ active: activeMenuItem === 'transfer' }">
                <span class="text">传输</span>
            </router-link>
            <router-link to="/pin" class="menuItem" :class="{ active: activeMenuItem === 'pin' }">
                <span class="text">固定</span>
            </router-link>
            <router-link to="/settings" class="menuItem" :class="{ active: activeMenuItem === 'settings' }">
                <span class="text">设置</span>
            </router-link>
        </div>
    </div>
</template>

<style scoped>
.sideContainer {
    width: 80px;
    height: 100vh;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0px;
    box-sizing: border-box;
}

.topSection {
    display: flex;
    flex-direction: column;
    gap: 0px;
}

.menuItem {
    display: flex;
    align-items: center;
    justify-content: center;
    /* 文字居中 */
    gap: 0px;
    padding: 10px;
    cursor: pointer;
    transition: background-color 0.3s;
    text-decoration: none;
    color: inherit;
}

.menuItem:hover {
    background-color: #e0e0e0;
}

.menuItem.active {
    background-color: #d0d0d0;
    /* 选中状态背景色 */
    font-weight: bold;
    /* 选中状态加粗 */
}

.icon {
    font-size: 20px;
}

.text {
    font-size: 16px;
}

.bottomSection {
    display: flex;
    justify-content: center;
}
</style>