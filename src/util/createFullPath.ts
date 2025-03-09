import type { StorageItem } from "@/type/storage"
import { useSettingStore } from "./pinia"

/**
 * 在存储结构中创建完整路径
 * @param fullPath 完整路径，如 '/documents/reports/report.pdf'
 * @param fileItem 要添加的文件项
 */
function createFullPath(fullPath: string, fileItem: StorageItem) {
    const settingStore = useSettingStore();
    const root = settingStore.content;

    // 拆分路径并过滤空段
    const pathSegments = fullPath.split('/').filter(p => p.trim() !== '')

    // 处理空路径情况
    if (pathSegments.length === 0) {
        root.push(fileItem)
        return
    }

    let currentLevel = root
    const fileName = pathSegments.pop()! // 最后一个段为文件名

    // 遍历创建文件夹结构
    for (const segment of pathSegments) {
        let folder = currentLevel.find(
            item => item.type === 'folder' && item.name === segment
        )

        if (!folder) {
            // 创建新文件夹
            folder = {
                type: "folder",
                name: segment,
                size: 0,
                created: Date(),
                children: []
            }
            currentLevel.push(folder)
        }

        // 类型安全检查
        if (folder.type !== 'folder') {
            throw new Error(`路径冲突: ${segment} 不是文件夹`)
        }

        // 确保子目录存在
        if (!folder.children) {
            folder.children = []
        }

        currentLevel = folder.children
    }

    // 检查是否已存在同名文件
    const existingFile = currentLevel.find(
        item => item.name === fileName && item.type === 'file'
    )

    if (!existingFile) {
        // 添加文件并更新元数据
        currentLevel.push({
            ...fileItem,
            name: fileName,
            created: fileItem.created || Date()
        })
    }
}

export {
    createFullPath,
}