// 打印内存占用情况
function printMemoryUsage() {
    const info = process.memoryUsage();
    // heapTotal：对应v8的堆内存信息，是堆中总共申请的内存量。
    // heapUsed：表示堆中使用的内存量。
    // rss:是resident set size的缩写，即常驻内存的部分。
    console.log('rss=%s, heapTotal=%s, heapUsed=%s', formatMemory(info.rss), formatMemory(info.heapTotal), formatMemory(info.heapUsed));
}

function formatMemory(size) {
    return (size / 1024 / 1024).toFixed(2) + 'MB';
}

module.exports = {
    printMemoryUsage
}