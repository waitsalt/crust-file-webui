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
    downloadFile,
}