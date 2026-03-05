# OpenTrans v1.2.0 Release Notes

## 🎉 重大改进：全面优化权限处理和 macOS 安装体验

本次更新彻底解决了用户反馈的两大核心问题，大幅提升安装和使用体验！

---

## ✨ 主要改进

### 1. ✅ 解决文件权限错误 (EACCES)

**问题：** 部分用户初始化项目时遇到 `EACCES: permission denied, copyfile...` 错误

**解决方案：**
- 增强文件复制错误处理机制
- 在操作前自动检测目录写入权限
- 提供清晰的中文错误提示和解决建议
- 区分不同类型错误（权限、文件不存在等）

**用户体验提升：**
```
❌ 旧版: EACCES: permission denied, copyfile...
✅ 新版: 权限不足：无法复制文件 /path/to/file
        提示：请确保源文件和目标目录都有读写权限
```

---

### 2. ✅ 优化 macOS 安装流程

**问题：** macOS 用户需要手动在终端输入命令解除 Gatekeeper 限制

**解决方案：**
- 🔧 智能修复脚本 v2.0 - 自动检测应用路径，支持多个安装位置
- 📖 详细安装文档 - DMG 内置完整安装指南
- 🎯 一键修复 - 用户只需双击运行，无需记忆命令
- ✨ 优化 DMG 布局 - 醒目图标和清晰说明

**macOS 安装现在只需 3 步：**
1. 拖入应用到 Applications 文件夹
2. 双击 "🔧 macOS 修复工具.command"
3. 输入密码 → 完成！

---

## 📦 新增内容

### 新增文件

- **`build/INSTALL_MACOS.md`** - macOS 安装详细指南
- **`build/test-installation.sh`** - 自动化安装测试工具
- **`docs/IMPROVEMENTS_v1.1.7.md`** - 完整技术文档
- **`FIXES_COMPLETE.md`** - 改进总结文档

### 改进文件

- **`src/main/fileManager.js`** - 增强错误处理和权限检查
- **`build/fix-macos.command`** - 智能修复脚本升级
- **`README.md`** - 新增安装步骤和 FAQ 章节
- **`.electron-builder.json`** - 优化 DMG 内容布局

---

## 📊 变更统计

- **新增代码：** 732 行
- **新增文件：** 4 个
- **改进文件：** 5 个
- **文档更新：** 完整的中文安装指南和 FAQ

---

## 🧪 测试覆盖

✅ macOS (Apple Silicon & Intel)
✅ 文件权限检测
✅ Gatekeeper 修复流程
✅ 错误提示准确性
✅ 自动化测试工具

---

## 📚 文档更新

### 用户文档
- [README.md](https://github.com/CoderXiaopang/opentrans#readme) - 完整使用指南
- [macOS 安装指南](https://github.com/CoderXiaopang/opentrans/blob/main/build/INSTALL_MACOS.md) - macOS 专用安装文档

### 开发者文档
- [改进详情](https://github.com/CoderXiaopang/opentrans/blob/main/docs/IMPROVEMENTS_v1.1.7.md) - 技术实现文档
- [修复总结](https://github.com/CoderXiaopang/opentrans/blob/main/FIXES_COMPLETE.md) - 完整改进清单

---

## 💡 常见问题解答

### macOS 相关

**Q: 提示"OpenTrans 已损坏，无法打开"怎么办？**

A: 这是正常的 macOS 安全提示。只需双击 DMG 中的 "🔧 macOS 修复工具.command"，输入密码即可解决。

**Q: 修复脚本找不到应用怎么办？**

A: 新版脚本会自动搜索常见位置（`/Applications`、`~/Applications` 等）。如仍有问题，请查看 DMG 中的安装说明文档。

### 权限相关

**Q: 提示权限错误怎么办？**

A: 选择项目时，请使用个人文件夹（如"文稿"、"桌面"），避免选择系统保护目录。应用会自动检测并提示。

更多问题请查看 [README - 常见问题](https://github.com/CoderXiaopang/opentrans#%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98) 章节。

---

## 🔗 下载

### macOS
- `OpenTrans-1.2.0.dmg` - 通用版本（支持 Apple Silicon 和 Intel）

### Windows
- `OpenTrans-Setup-1.2.0.exe` - Windows 安装程序

### Linux
- `OpenTrans-1.2.0.AppImage` - AppImage 格式
- `OpenTrans-1.2.0.deb` - Debian/Ubuntu 包

---

## 🙏 感谢

感谢所有提供反馈的用户！你们的意见帮助我们持续改进 OpenTrans。

如有问题或建议，欢迎在 [Issues](https://github.com/CoderXiaopang/opentrans/issues) 中反馈。

---

## 📝 完整变更日志

查看 [提交历史](https://github.com/CoderXiaopang/opentrans/commit/2ba4149) 了解所有技术细节。

---

**项目地址：** https://github.com/CoderXiaopang/opentrans
**许可证：** MIT
**作者：** CoderXiaopang
