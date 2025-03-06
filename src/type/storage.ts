type StorageItem = {
    type: "file" | "floder",
    name: string,
    size: number,
    created: string,
    cid?: string,
    request_id?: string,
    children?: StorageItem[],
}

export type {
    StorageItem,
}