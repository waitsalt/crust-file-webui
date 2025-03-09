function getFullPath(base: string, path: string) {
    return `/${base}/${path}`.replace(/\/+/g, '/');
}

export {
    getFullPath,
}