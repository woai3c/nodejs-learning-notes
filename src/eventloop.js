// setTimeout、setImmediate 两者间的执行先后顺序不定
setTimeout(() => console.log('Timeout1'))
setImmediate(() => console.log('Immediate1'));
setTimeout(() => console.log('Timeout2'))
setImmediate(() => console.log('Immediate2'));
setTimeout(() => console.log('Timeout3'))
setImmediate(() => console.log('Immediate3'));
setTimeout(() => console.log('Timeout4'))
setImmediate(() => console.log('Immediate4'));

// 如果是在 I/O 事件回调里调用 setTimeout、setImmediate，则 setImmediate 优先执行
const fs = require('fs')
fs.readFile('xxx', err => {
    setTimeout(() => console.log('setTimeout ' + err))
    setTimeout(() => console.log('setTimeout ' + err))
    setImmediate(() => console.log('setImmediate ' + err))
    setImmediate(() => console.log('setImmediate ' + err))
})

// nextTick、Promise 都属于微任务。事件循环的每个阶段执行完毕后，如果有微任务，则把所有的微任务执行完毕后，事件循环才会进入下一个阶段。
Promise.resolve().then(console.log('p1'))
process.nextTick(() => console.log('tick1'))
process.nextTick(() => console.log('tick2'))
Promise.resolve().then(console.log('p2'))

setTimeout(() => {
    console.log('Timeout5')
    Promise.resolve().then(console.log('p3'))
})
setImmediate(() => {
    console.log('Immediate5')
    process.nextTick(() => console.log('tick3'))
});

setTimeout(() => console.log('Timeout6'))
setImmediate(() => console.log('Immediate6'));