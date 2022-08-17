# Stream 流
流是用来比喻数据传输的一种形式，数据传输的起点就是流的源头，数据传输的终点就是流的终点。例如在网页发起一个 HTTP 请求，浏览器就是流的源头，服务器就是流的终点。等服务器处理完请求，返回响应时，服务器就变成了流的源头，浏览器变成了流的终点。

数据从一端连续不断地传输到另一端，就像水一样从一端流到另一端，所以用流来比喻数据的传输形式。只不过计算机中的流传输的是数据（字节），而不是水。

在 Node.js 中，stream 模块提供了用于实现流接口的 API。但是很多内置模块都提供了关于流的 API，所以通常不需要显式的调用 stream 模块来使用流。

## 为什么要使用流
### v1 版本示例程序
下面看一个简单的示例：
```js
const path = require('path')

printMemoryUsage()
fs.readFile(resolveFile('./test.txt'), (err, data) => {
    if (err) throw err
    printMemoryUsage()
    fs.writeFile(resolveFile('./test2.txt'), data, err => {
        if (err) throw err
        console.log('done')
    })
})

function resolveFile(filepath) {
    return path.resolve(__dirname, filepath)
}

// 打印内存占用情况
function printMemoryUsage() {
    const info = process.memoryUsage();
    // heapTotal：对应v8的堆内存信息，是堆中总共申请的内存量。
    // heapUsed：表示堆中使用的内存量。
    // rss:是resident set size的缩写，即常驻内存的部分。
    console.log('rss=%s, heapTotal=%s, heapUsed=%s', formatMemory(info.rss), formatMemory(info.heapTotal), formatMemory(info.heapUsed));
}
```
v1 版本的程序每次执行时都得把整个 `./test.txt` 文件读取到内存，然后再把内容写入到 `./test2.txt` 文件。这个 `./test.txt` 文件大小为 1.04 GB，下面的信息就是在拷贝过程中打印的内存占用信息。
```
rss=18.09MB, heapTotal=4.68MB, heapUsed=2.64MB
rss=1011.52MB, heapTotal=7.18MB, heapUsed=2.36MB
done
```
从这个信息可以看出，当程序读取的文件越大，内存占用就越大（1011.52MB），因此会导致其他进程处理变慢以及过多的垃圾回收，甚至内存耗尽，导致程序崩溃。

### v2 版本示例程序
如果用流来重写 v1 程序，我们就可以避免内存占用过大的问题。因为流是可以一边读取数据一边消费数据的，它不需要等到所有的数据都准备好。
```js
// 可读流
const readStream = fs.createReadStream(resolveFile('./test.txt'));
// 可写流
const writeStream = fs.createWriteStream(resolveFile('./test2.txt'));

// 每读取到一块数据，就会触发 data 事件
readStream.on('data', data => {
    printMemoryUsage()
    writeStream.write(data)
});

readStream.on('end', () => {
    console.log('done')
});
```
```
...
rss=100.89MB, heapTotal=7.98MB, heapUsed=4.18MB
rss=100.89MB, heapTotal=7.98MB, heapUsed=4.18MB
rss=100.89MB, heapTotal=7.98MB, heapUsed=4.19MB
done
```
从控制台打印的信息来看，内存占用一直稳定为 100.89 MB，没有给系统造成太大的负担。因此，在需要处理一些尺寸较大的文件时，使用流是最好的选择。

### v3 版本示例程序
但是 v2 程序也不完美，因为可读流和可写流的速率不一定相等。而 v2 程序在每次触发可读流的 `data` 事件时就向可写流写入数据，这时可写流的缓冲区有可能已经满了。如果继续写入更多的数据，会导致内存占用越来越大，甚至内存耗尽，丢失数据。这个现象又叫**背压（Back pressure）**。
>在数据流从上游生产者向下游消费者传输的过程中，上游生产速度大于下游消费速度，导致下游的 Buffer 溢出，这种现象就叫做 Backpressure。这句话的重点不在于「上游生产速度大于下游消费速度」，而在于「Buffer 溢出」。

如果出现这个现象，解决方案是什么呢？我们可以在写入流缓冲区已经满载的情况下，暂停可读流读取数据的行为。这可以通过 `write()` 的返回值来判断。

每个流在创建时都可以设置 `highWaterMark` 属性的值（默认为16384，即 16 KB），这个值就是缓冲区阈值的大小。可写流的缓冲区如果超过了阈值，再调用 `write()` 写入数据时，会返回 false；如果缓冲区未超过阈值，则返回 true。

因此我们可以把 v2 版本的程序改写一下：
```js
const readStream = fs.createReadStream(resolveFile('./test.txt'));
const writeStream = fs.createWriteStream(resolveFile('./test2.txt'));

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
```
然后看一下内存占用的信息：
```
...
rss=84.20MB, heapTotal=7.98MB, heapUsed=4.75MB
rss=84.20MB, heapTotal=7.98MB, heapUsed=4.76MB
done
```
从上面的信息可以看出，v3 程序最大内存占用为 84.20 MB，比起上一版的内存占用更小，这就是优化后的效果。

### v4 版本示例程序
v3 版本的程序效果很好，但是要写的代码稍微有点多。还好流模块提供了 `pipe()` 来帮我们做这件事：
```js
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
```
```
...
rss=94.80MB, heapTotal=7.98MB, heapUsed=4.89MB
rss=94.80MB, heapTotal=7.98MB, heapUsed=4.90MB
rss=94.80MB, heapTotal=7.98MB, heapUsed=4.90MB
done
```
`pipe()` 将可写流绑定到可读流，使其自动切换到流动模式并将其所有数据推送到绑定的可写流。 数据流将被自动管理，以便目标可写流不会被更快的可读流漫过。也就是说，`pipe()` 将数据缓冲限制在可接受的水平，以便不同速度的来源和目标不会压倒可用内存。

## 流的类型
Node.js 中有四种基本的流类型：
* Readable: 可读流，可以从中读取数据的流（例如，fs.createReadStream()）。
* Writable: 可写流，可以写入数据的流（例如，fs.createWriteStream()）。
* Duplex: 双工流，Readable 和 Writable 的流（例如，net.Socket）。
* Transform: 可以在写入和读取数据时修改或转换数据的 Duplex 流（例如，zlib.createDeflate()）。

### 缓冲
Writable 和 Readable 流都将数据存储在内部缓冲区中。

允许缓冲的数据量取决于传给流的构造函数的 highWaterMark 选项。 对于普通的流，highWaterMark 选项指定字节的总数。

当实现调用 `stream.push(chunk)` 时，数据缓存在 Readable 流中。 如果流的消费者没有调用 `stream.read()`，则数据会一直驻留在内部队列中，直到被消费。

一旦内部读取缓冲区的总大小达到 highWaterMark 指定的阈值，则流将暂时停止从底层资源读取数据，直到可以消费当前缓冲的数据（也就是，流将停止调用内部的用于填充读取缓冲区 `readable._read()` 方法）。

当重复调用 `writable.write(chunk)` 方法时，数据会缓存在 Writable 流中。 虽然内部的写入缓冲区的总大小低于 highWaterMark 设置的阈值，但对 `writable.write()` 的调用将返回 true。 一旦内部缓冲区的大小达到或超过 highWaterMark，则将返回 false。

stream API 的一个关键目标，尤其是 `stream.pipe()` 方法，是将数据缓冲限制在可接受的水平，以便不同速度的来源和目标不会压倒可用内存。

highWaterMark 选项是阈值，而不是限制：它规定了流在停止请求更多数据之前缓冲的数据量。 它通常不强制执行严格的内存限制。 特定的流实现可能会选择实施更严格的限制，但这样做是可选的。

由于 Duplex 和 Transform 流都是 Readable 和 Writable，因此每个流都维护两个独立的内部缓冲区，用于读取和写入，允许每一端独立操作，同时保持适当且高效的数据流。 例如，net.Socket 实例是 Duplex 流，其 Readable 端允许消费从套接字接收的数据，其 Writable 端允许将数据写入套接字。 因为数据可能以比接收数据更快或更慢的速度写入套接字，所以每一端都应该独立于另一端进行操作（和缓冲）。
### Readable
可读流是对被消费的数据的来源的抽象。

Readable 流的示例包括：
* 客户端上的 HTTP 响应
* 服务器上的 HTTP 请求
* 文件系统读取流
* 压缩流
* 加密流
* TCP 套接字
* 子进程的标准输出和标准错误
* process.stdin

所有的 Readable 流都实现了 stream.Readable 类定义的接口。

Readable 流以两种模式之一有效地运行：流动和暂停。在流动模式下，数据会自动从底层系统读取，并通过 EventEmitter 接口使用事件尽快提供给应用程序。在暂停模式下，必须显式调用 `stream.read()` 方法以从流中读取数据块。

所有的 Readable 流都以暂停模式开始，但可以通过以下方式之一切换到流动模式：
* 添加 `data` 事件句柄。
* 调用 `stream.resume()` 方法。
* 调用 `stream.pipe()` 方法将数据发送到 Writable。

Readable 可以使用以下方法之一切换回暂停模式：
* 如果没有管道目标，则通过调用 `stream.pause()` 方法。
* 如果有管道目标，则删除所有管道目标。 可以通过调用 `stream.unpipe()` 方法删除多个管道目标。
### Writable
可写流是数据写入目标的抽象。

Writable 流的示例包括：
* 客户端上的 HTTP 请求
* 服务器上的 HTTP 响应
* 文件系统写入流
* 压缩流
* 加密流
* TCP 套接字
* 子进程标准输入
* process.stdout、process.stderr

其中一些示例实际上是实现 Writable 接口的 Duplex 流。

所有的 Writable 流都实现了 stream.Writable 类定义的接口。

虽然 Writable 流的特定实例可能以各种方式不同，但所有的 Writable 流都遵循相同的基本使用模式，如下例所示：
```js
const myStream = getWritableStreamSomehow();
myStream.write('some data');
myStream.write('some more data');
myStream.end('done writing data');
```
#### `drain` 事件
如果对 `stream.write(chunk)` 的调用返回 false，则 `drain` 事件将在可以继续将数据写入流时触发。
### Duplex 与 Transform
双工流是同时实现 Readable 和 Writable 接口的流。

Duplex 流的示例包括：
* TCP 套接字
* 压缩流
* 加密流

转换流是可以在写入和读取数据时修改或转换数据的双工流。

Transform 流的示例包括：
* 压缩流
* 加密流

## 参考资料
* [stream_buffering](http://nodejs.cn/api/stream.html#stream_buffering)
* [数据流中的积压问题](https://nodejs.org/zh-cn/docs/guides/backpressuring-in-streams/)
* [如何形象的描述反应式编程中的背压(Backpressure)机制？](https://www.zhihu.com/question/49618581)
