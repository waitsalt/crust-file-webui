function getFullPath(base: string, path: string) {
    return `/${base}/${path}`.replace(/\/+/g, '/');
}

function uuid() {
    var uuidValue = "", k, randomValue;
    for (k = 0; k < 32; k++) {
        randomValue = Math.random() * 16 | 0;
        if (k == 8 || k == 12 || k == 16 || k == 20) {
            uuidValue += "-"
        }
        uuidValue += (k == 12 ? 4 : (k == 16 ? (randomValue & 3 | 8) : randomValue)).toString(16);
    }
    return uuidValue;
}

function downloadFile(url: string, filename: string) {
    // fetch(url).then((res) => {
    //     res.blob().then((blob) => {
    //         const blobUrl = window.URL.createObjectURL(blob);
    //         // 这里的文件名根据实际情况从响应头或者url里获取
    //         const a = document.createElement('a');
    //         a.href = blobUrl;
    //         a.download = filename;
    //         a.click();
    //         window.URL.revokeObjectURL(blobUrl);
    //     });
    // });
    window.open(url)
}

export {
    uuid,
    downloadFile,
    getFullPath,
}