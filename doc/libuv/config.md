## 构建项目
#### 克隆
```bash
git clone https://github.com/libuv/libuv.git
```
#### 构建
```bash
sh autogen.sh
./configure
make -j4
make install
```

## 使用
#### `Undefined symbols for architecture x86_64` 报错
编译的时候带上 `-luv` 参数：
```bash
gcc main.cpp -luv
```
详情请看：https://github.com/libuv/help/issues/61

## Debug
**需要安装 `C/C++` VSCode 插件**

在想要调试的文件上按 F5，再选择 `C++ (GDB/LLDB)` -> `clang++`，如果报错 `Undefined symbols for architecture x86_64`，则需要在自动生成的 vscode 调试文件 `tasks.json` 中，找到 `args` 数组， 然后把 `-luv` 参数加上：
```json
"args": [
    "-fdiagnostics-color=always",
    "-g",
    "${file}",
    "-luv",
    "-o",
    "${fileDirname}/${fileBasenameNoExtension}"
],
```
具体文件内容如下：

launch.json
```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "name": "clang - 生成和调试活动文件",
            "type": "cppdbg",
            "request": "launch",
            "program": "${fileDirname}/${fileBasenameNoExtension}",
            "args": [],
            "stopAtEntry": false,
            "cwd": "${fileDirname}",
            "environment": [],
            "externalConsole": false,
            "MIMode": "lldb",
            "preLaunchTask": "C/C++: clang 生成活动文件"
        }
    ]
}
```
tasks.json
```json
{
    "tasks": [
        {
            "type": "cppbuild",
            "label": "C/C++: clang 生成活动文件",
            "command": "/usr/bin/clang",
            "args": [
                "-fdiagnostics-color=always",
                "-g",
                "${file}",
                "-luv",
                "-o",
                "${fileDirname}/${fileBasenameNoExtension}"
            ],
            "options": {
                "cwd": "${fileDirname}"
            },
            "problemMatcher": [
                "$gcc"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            },
            "detail": "调试器生成的任务。"
        }
    ],
    "version": "2.0.0"
}
```