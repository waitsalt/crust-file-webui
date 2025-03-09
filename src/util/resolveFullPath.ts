import type { StorageItem } from "@/type/storage";
import { useSettingStore } from "./pinia";

const resolveFullPath = (path: string): { type: 'file' | 'folder' | 'error'; content: StorageItem | StorageItem[] } => {
    const settingStore = useSettingStore();
    const content = settingStore.content;
    if (path === '/') return { type: 'folder', content };
    const segments = path.split('/').filter(Boolean);

    let currentChildren: StorageItem[] = content;
    let targetItem: StorageItem | undefined;

    for (let i = 0; i < segments.length; i++) {
        targetItem = currentChildren.find(item => item.name === segments[i]);
        if (!targetItem) break;

        if (i === segments.length - 1) break; // 到达目标层级

        if (targetItem.type === 'folder') {
            currentChildren = targetItem.children || [];
        } else {
            throw new Error('路径包含文件类型');
        }
    }

    if (!targetItem) return { type: 'error', content: [] };

    return targetItem.type === 'folder'
        ? { type: 'folder', content: targetItem.children || [] }
        : { type: 'file', content: targetItem };
};

export {
    resolveFullPath,
}