const fs = require('fs')
const path = require('path')
const { printMemoryUsage } = require('../utils')
const readStream = fs.createReadStream(resolveFile('../test.txt'));
const writeStream = fs.createWriteStream(resolveFile('../test2.txt'));

function resolveFile(filepath) {
    return path.resolve(__dirname, filepath)
}

readStream.on('data', data => {
    printMemoryUsage()
    if (!writeStream.write(data)) {
        // 暂停读取数据
        readStream.pause()
        // 当可写流的缓冲区排空时，会触发 drain 事件
        writeStream.once('drain', () => {
            // 继续读取数据
            readStream.resume()
        });
    }
});

readStream.on('end', () => {
    console.log('done')
});