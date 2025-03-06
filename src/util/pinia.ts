import { createPinia, defineStore } from "pinia";
import type { StorageItem } from "@/type/storage";

const pinia = createPinia()

type Setting = {
    user: {
        seed: string | null,
        token: string | null,
    },
    server: {
        upload: {
            default: string,
            list: string[],
        },
        download: {
            default: string,
            list: string[],
        },
        pin: {
            default: string,
            list: string[],
        }
    },
    content: StorageItem[],
}

const useSettingStore = defineStore('setting', {
    state: (): Setting => ({
        user: {
            seed: null,
            token: null,
        },
        server: {
            upload: {
                default: 'https://gw.crustfiles.net',
                list: [
                    'https://gw.crustfiles.net',
                    'https://crustipfs.xyz',
                    'https://ipfs-gw.decloud.foundation',
                    'https://gw.w3ipfs.cn:10443',
                    'https://gw.smallwolf.me',
                    'https://gw.w3ipfs.com:7443',
                ],
            },
            download: {
                default: "https://ipfs.io",
                list: [
                    'https://ipfs.io',
                    'https://gw.w3ipfs.org.cn',
                    'https://crustgateway.online',
                    "https://dweb.link"
                ],
            },
            pin: {
                default: 'https://pin.crustcode.com',
                list: [
                    'https://pin.crustcode.com'
                ],
            }
        },
        content: []
    }),
})

export {
    pinia,
    useSettingStore,
}