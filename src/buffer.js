const buf = Buffer.from('abcdefghijklmnopqrstuvwxyz')
const n = buf[1]
// buffer 中的每个数字代表一个字节，Unicode 编码。
// 16 进制的数字
console.log(typeof buf, buf) // object <Buffer 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70 71 72 73 74 75 76 77 78 79 7a>

// 单个读取会用十进制数字表示
console.log(typeof buf[0], buf[0]) // number 97
console.log(typeof n, n) // number 98

// 转成数组会变成十进制数字
console.log(Array.from(buf))
/*
[
    97,  98,  99, 100, 101, 102,
   103, 104, 105, 106, 107, 108,
   109, 110, 111, 112, 113, 114,
   115, 116, 117, 118, 119, 120,
   121, 122
]
*/

console.log(buf.toString('ascii')) // abcdefghijklmnopqrstuvwxyz
console.log(buf.toString('utf8')) // abcdefghijklmnopqrstuvwxyz
console.log(buf.toString('utf16le')) // 扡摣晥桧橩汫湭灯牱瑳癵硷穹
console.log(buf.toString('ucs2')) // 扡摣晥桧橩汫湭灯牱瑳癵硷穹
console.log(buf.toString('base64')) // YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=
console.log(buf.toString('latin1')) // abcdefghijklmnopqrstuvwxyz
console.log(buf.toString('binary')) // abcdefghijklmnopqrstuvwxyz
console.log(buf.toString('hex')) // 6162636465666768696a6b6c6d6e6f707172737475767778797a


// 创建长度为 10 的以零填充的缓冲区。
const buf1 = Buffer.alloc(10);

// 创建长度为 10 的缓冲区，
// 使用值为 `1` 的字节填充。
const buf2 = Buffer.alloc(10, 1);

// 创建长度为 10 的未初始化的缓冲区。
// 这比调用 Buffer.alloc() 快，
// 但返回的缓冲区实例可能包含旧数据，
// 需要使用 fill()、write() 、
// 或其他填充缓冲区内容的函数重写。
const buf3 = Buffer.allocUnsafe(10);

// 创建包含字节 [1, 2, 3] 的缓冲区。
const buf4 = Buffer.from([1, 2, 3]);

// 创建包含字节 [1, 1, 1, 1] 的缓冲区，
// 所有条目都使用 `(value & 255)` 截断以符合范围 0–255。
const buf5 = Buffer.from([257, 257.5, -255, '1']);

// 创建包含字符串 'tést' 的 UTF-8 编码字节的缓冲区：
// [0x74, 0xc3, 0xa9, 0x73, 0x74]（十六进制）
// [116, 195, 169, 115, 116]（十进制）
const buf6 = Buffer.from('tést');

// 创建包含 Latin-1 字节 [0x74, 0xe9, 0x73, 0x74] 的缓冲区。
const buf7 = Buffer.from('tést', 'latin1');

// slice
const buf8 = Buffer.from('Hey!')
buf8.slice(0).toString() //Hey!
const slice = buf8.slice(0, 2)
console.log(slice.toString()) //He
buf8[1] = 111 //o
console.log(slice.toString()) //Ho

const stringDecoder = require('string_decoder').StringDecoder
const decoder = new stringDecoder('utf-8')
console.log(decoder.write(Buffer.from(['0xe4', '0xbd', '0xa0', '0xe5', '0xa5']))) // 你
console.log(decoder.write(Buffer.from(['0xbd']))) // 好

console.log(Buffer.__proto__) // [Function: Uint8Array]
console.log(Buffer.__proto__.__proto__) // [Function: TypedArray]
console.log(Buffer.__proto__.__proto__.__proto__) // [Function]

// 创建一个8字节的 ArrayBuffer
const ab = new ArrayBuffer(32);

// 创建一个指向 ab 的 Int32 视图，开始于字节 0，个数为 2（一个 Int32Array 实例，长度为 4 字节，这里占了 8 字节）
const v1 = new Int32Array(ab, 0, 2);
v1[0] = 100 // 一个索引对应一个 32 位的有符号数
v1[1] = 200

// 创建一个指向 ab 的 Int8 视图，开始于字节 4，个数为 1
const v2 = new Int8Array(ab, 8, 1);
const v3 = new Int8Array(ab, 9, 1);
v2[0] = 300 // 一个字节最多只能表示 256，所以赋值 300 溢出了，变成 44
v3[0] = 400 // 同理，这里为 144，但为什么显示为 -112 呢？因为 144 的二进制为 '10010000'，而 Int8Array 是有符号的 8 位数，最高位为 -128，所以 -128 + 16 = -112

// 创建一个指向 ab 的 Int16 视图，开始于字节 10，不带参数，则把剩下的缓冲区全占了
const v4 = new Int16Array(ab, 10);
v4[0] = 32767 // 一个索引对应一个 16 位的有符号数
v4[1] = 32768

console.log(ab)
console.log(v1)
console.log(v2)
console.log(v3)
console.log(v4)