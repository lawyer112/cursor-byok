# Cursor BYOK 自用修复版（macOS）

基于上游 0.1.7，包含启动时序、Grok 工具参数、显式 BYOK 模型映射及 CLI 兼容修复。源码提交见包内 SOURCE-COMMIT.txt。来自 lawyer112/cursor-byok，非上游正式发行版。

1. 苹果 M 系列芯片选择 Apple-Silicon；Intel Mac 选择 Intel。
2. 退出已有 Cursor BYOK。若已安装，先保留原应用和 `~/.cursor-byok-v3` 数据目录的备份。
3. 打开 DMG，把 Cursor BYOK.app 拖到 Applications（应用程序）。
4. 启动助手，配置自己的供应商地址、密钥和模型，按助手提示启用 Cursor 接管。本包不含任何个人配置、密钥或会话数据。
5. 在 Cursor 或 CLI 新会话中测试模型回复和文件读取。Windows 已实测；Mac 构建检查不等同于目标机器上的真实供应商验证。

此包使用临时本地签名，没有 Apple Developer 公证。首次打开可能被 macOS 拦截；确认来源和 SHA256 后，在“系统设置 → 隐私与安全性”中对这个应用选择“仍要打开”。不要关闭整个系统的安全检查。

本测试版关闭了上游自动更新入口。后续更新请从我们的仓库下载新包，避免覆盖回未含修复的旧版。

## 可选：Cursor CLI 接管

先按 https://cursor.com/docs/cli/installation 安装官方 macOS Cursor CLI。其官方安装器会设置 `agent` 和 `cursor-agent` 命令，已有同名工具时请先保留原入口。

把包内 Cursor-CLI 文件夹复制到你打算长期保存的位置，不要从即将弹出的 DMG 里长期运行。保持助手运行，在终端使用该文件夹中的入口：

```bash
bash /你保存的位置/Cursor-CLI/cursor-byok --list-models
bash /你保存的位置/Cursor-CLI/cursor-byok --model 模型列表中的编号
```

CLI 从本机助手取得模型列表，供应商配置只需在助手中保存一次。不会把 Windows 那台机器的配置自动同步过来。首次创建独立 CLI 设置，保留工具审批以及 Mac 默认沙箱。详细说明见 Cursor-CLI/README.md。
