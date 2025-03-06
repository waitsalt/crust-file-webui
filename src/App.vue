<script setup lang="ts">
import SideNavComp from './component/SideNavComp.vue';
</script>

<template>
    <div class="container">
        <!-- 侧边栏 -->
        <div class="sideNav">
            <SideNavComp />
        </div>

        <!-- 主要内容 -->
        <div class="mainContent">
            <RouterView />
        </div>
    </div>
</template>

<style scoped>
.container {
    display: flex;
    height: 100vh;
}

.mainContent {
    flex: 1;
    padding: 0;
    margin: 0;
    background-color: #fff;
    height: 100%;
}
</style>
