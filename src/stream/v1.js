const fs = require('fs')
const path = require('path')
const { printMemoryUsage } = require('../utils')

printMemoryUsage()
fs.readFile(resolveFile('../test.txt'), (err, data) => {
    if (err) throw err
    printMemoryUsage()
    fs.writeFile(resolveFile('../test2.txt'), data, err => {
        if (err) throw err
        console.log('done')
    })
})

function resolveFile(filepath) {
    return path.resolve(__dirname, filepath)
}