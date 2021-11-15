# v8 调试环境配置
下载 depot_tools：
```
git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git
```
将 depot_tools 目录路径添加到环境变量：
```
export gclient=/Users/ptmind/Documents/github/depot_tools
export PATH=$PATH:$gclient
```
同步代码：
```
gclient sync
```
拉取 v8 代码：
```
git fetch v8
```
切换到 v8 目录并安装依赖：
```
cd v8
git pull && gclient sync
```
编译：
```
tools/dev/gm.py x64.release
```
或者编译并立即执行测试：
```
tools/dev/gm.py x64.release.check
```
编译报错：`/usr/bin/env: python2: No such file or directory` 解决方案，添加 python2 链接：
```
sudo ln -s /usr/bin/python2.7 /usr/local/bin/python2
```

## 参考资料
* [v8引擎：编译(一)](https://segmentfault.com/a/1190000023231568)
* [v8引擎：编译（二）](https://segmentfault.com/a/1190000023265684)
* [mac下添加环境变量](https://juejin.cn/post/6844903885727858701)
* [mac快速设置终端代理](https://www.jianshu.com/p/db3964292b1c)