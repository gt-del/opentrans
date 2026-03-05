# macOS 安装说明

## 🚀 快速安装（3 步）

1. **拖入应用** - 将 `OpenTrans.app` 拖入 `Applications` 文件夹
2. **运行修复** - 双击 `fix-macos.command` 并输入密码
3. **启动应用** - 前往"应用程序"文件夹，打开 OpenTrans

---

## ⚠️ 遇到问题？

### 问题 1：提示"OpenTrans 已损坏"

**原因：** macOS Gatekeeper 安全机制将未签名应用标记为不可信

**解决：**

**方法 A**（推荐）：双击 DMG 中的 `fix-macos.command`

**方法 B**：打开终端，粘贴以下命令：
```bash
sudo xattr -r -d com.apple.quarantine /Applications/OpenTrans.app
```

### 问题 2：修复脚本无法运行

**解决：**
1. 右键点击 `fix-macos.command`
2. 选择"打开"
3. 在弹窗中点击"打开"确认
4. 输入密码后回车

### 问题 3：初始化失败（权限错误）

**解决：**
- 选择项目时，使用个人文件夹（如"文稿"、"桌面"）
- 避免选择系统目录（如 `/System`、`/Library`）
- 确保目录有读写权限

---

## 💡 为什么需要修复？

OpenTrans 是开源免费软件，暂未购买 Apple Developer 账号进行代码签名（$99/年）。

使用上述修复方法是**安全**的，只是告诉 macOS 信任这个应用，不会对系统或应用造成任何影响。

---

## 📧 仍有问题？

请访问：https://github.com/CoderXiaopang/opentrans/issues
