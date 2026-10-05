# nanhui-no1-media.github.io

上海市南汇第一中学传媒社的 GitHub Pages 站点（旧版介绍页）。

**本仓库现为跳转页**：访问本站任意地址会自动重定向到社团线上平台：

- 线上平台（生产站）：<https://8.153.145.175/>
- 跳转实现：`index.html` / `404.html` 中的 `meta refresh`（`http-equiv="refresh"`，0 秒即时跳转）——GitHub Pages 是纯静态托管，不支持服务端 301/302，客户端即时跳转是标准做法（W3C H76）；页面同时带 `canonical` 声明与手动链接兜底
- 旧版静态介绍页与资源已移除（含课表下载文件——该功能已由线上平台「课表下载」页承接）；完整历史见 git 记录
