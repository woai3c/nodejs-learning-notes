# libuv 调试环境配置
## 构建项目
### 克隆
```bash
git clone https://github.com/libuv/libuv.git
```
### 构建
```bash
sh autogen.sh
./configure
make -j4
make install
```

## 踩坑
### `Undefined symbols for architecture x86_64` 报错
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
配置完成后，在 libuv 目录下创建个 c 文件测试一下:
```c
#include <stdio.h>
#include <stdlib.h>
#include <uv.h>

int main() {
    uv_loop_t *loop = malloc(sizeof(uv_loop_t));
    uv_loop_init(loop);
    
    printf("suc\n");
    uv_run(loop, UV_RUN_DEFAULT);

    uv_loop_close(loop);
    free(loop);
    return 0;
}
```
然后在该文件按下 F5，即可开始调试。

![image](https://user-images.githubusercontent.com/22117876/141145126-49e51703-0529-452c-adc7-cc37811429b3.png)

对着你想打断点的函数用 `CTRL + 左击或 Command + 左击` 跳转到对应的函数，再加断点。

![image](https://user-images.githubusercontent.com/22117876/141145459-5d700e7e-ac46-4c64-8aba-6f3f0314e07b.png)

## 使用 Code Runner 执行代码
由于执行依赖 libuv 的代码得加上 `-luv` 参数，但 Code Runner 默认参数只有 `-o`，执行时会报错。所以需要在项目的 `.vscode` 文件夹下创建 `settings.json` 文件，添加以下代码：
```json
{
    "code-runner.executorMap": {
        "c": "cd $dir && gcc $fileName -luv -o $fileNameWithoutExt && $dir$fileNameWithoutExt"
    }
}
```
现在就可以点击 VSCode 右上角的 Code Runner 按钮（一个向右的空心三角形）直接执行代码了。
## 参考资料
* [vscode 调试](https://www.jianshu.com/p/4e06d5d3bca3)
