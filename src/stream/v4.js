const fs = require('fs')
const path = require('path')
const { printMemoryUsage } = require('../utils')
const readStream = fs.createReadStream(resolveFile('../test.txt'));
const writeStream = fs.createWriteStream(resolveFile('../test2.txt'));

function resolveFile(filepath) {
    return path.resolve(__dirname, filepath)
}

readStream.on('data', () => {
    printMemoryUsage()
});

readStream.on('end', () => {
    console.log('done')
});

readStream.pipe(writeStream)