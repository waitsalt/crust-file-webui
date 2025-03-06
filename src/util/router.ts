import { createWebHistory, createRouter } from "vue-router";

import AboutView from "@/view/AboutView.vue";
import StorageView from "@/view/StorageView.vue";
import TransferView from "@/view/TransferView.vue";
import SettingsView from "@/view/SettingsView.vue";
import PinView from "@/view/PinView.vue";

const routes = [
    { path: "/", redirect: '/storage' },
    { path: '/storage', component: StorageView },
    { path: '/transfer', component: TransferView },
    { path: '/pin', component: PinView },
    { path: '/settings', component: SettingsView },
    { path: "/about", component: AboutView },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export { router }