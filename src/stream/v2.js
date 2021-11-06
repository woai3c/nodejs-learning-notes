const fs = require('fs')
const path = require('path')
const { printMemoryUsage } = require('../utils')
const readStream = fs.createReadStream(resolveFile('../test.txt'));
const writeStream = fs.createWriteStream(resolveFile('../test2.txt'));

function resolveFile(filepath) {
    return path.resolve(__dirname, filepath)
}

// 每读取到一块数据，就会触发 data 事件
readStream.on('data', data => {
    printMemoryUsage()
    writeStream.write(data)
});

readStream.on('end', () => {
    console.log('done')
});