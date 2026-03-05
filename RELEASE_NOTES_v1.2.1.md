# OpenTrans v1.2.1 Release Notes

## 🎉 新功能：智能处理特殊文件

本次更新解决了项目包含符号链接、Socket 等特殊文件时的初始化错误！

---

## 🐛 修复的问题

### 问题：初始化崩溃
**错误信息：**
```
初始化失败: ENOTSUP: operation not supported on socket, copyfile
```

**原因：** 当项目包含符号链接（symlink）、Socket、FIFO 等特殊文件时，`copyFileSync` 无法直接复制，导致初始化失败。

**影响场景：**
- 包含 Node.js 项目配置的符号链接
- 使用符号链接管理共享配置的项目
- 包含开发工具生成的特殊文件

---

## ✨ 解决方案

### 智能特殊文件处理

当检测到无法复制的特殊文件时，OpenTrans 会：

1. **自动检测**
   - 符号链接 (symlink)
   - Socket 文件
   - FIFO 文件（命名管道）
   - 其他不支持的文件类型

2. **友好提示**
   ```
   ┌─────────────────────────────────────────┐
   │ 检测到特殊文件                           │
   ├─────────────────────────────────────────┤
   │ 项目中包含 3 个特殊文件无法直接复制      │
   │                                         │
   │ 以下文件已被跳过：                       │
   │   • plugin/agents (符号链接)            │
   │   • plugin/commands (符号链接)          │
   │   • plugin/skills (符号链接)            │
   │                                         │
   │ 请选择如何处理：                         │
   │ [跳过这些文件] [深度复制] [取消]         │
   └─────────────────────────────────────────┘
   ```

3. **灵活处理**
   - **跳过**（推荐）：不复制特殊文件，适用于这些文件不影响文档翻译的场景
   - **深度复制**：跟随符号链接，复制实际内容到目标目录
   - **取消**：取消本次初始化

---

## 🔧 技术改进

### 文件检测增强
- 使用 `lstatSync` 准确识别文件类型
- 区分普通文件、目录、符号链接、Socket、FIFO
- 捕获 `ENOTSUP` 错误并优雅处理

### 用户交互优化
- 清晰列出所有特殊文件的路径和类型
- 提供两种处理模式供用户选择
- 显示跳过文件的数量统计
- 保留用户的选择偏好

### 向后兼容
- 不影响普通项目的使用流程
- 已初始化的项目无需重新处理
- 默认跳过特殊文件，确保初始化成功

---

## 📊 改进对比

| 场景 | v1.2.0 | v1.2.1 |
|------|--------|--------|
| 遇到符号链接 | ❌ 崩溃报错 | ✅ 自动检测 + 用户选择 |
| 错误提示 | 晦涩的系统错误 | 清晰的中文说明 |
| 用户操作 | 无法继续 | 灵活选择处理方式 |
| 特殊文件处理 | 不支持 | 支持跳过或深度复制 |

---

## 📁 修改的文件

- `src/main/fileManager.js` - 增强特殊文件检测逻辑
- `src/main/ipc.js` - 添加特殊文件对话框处理器
- `src/preload/index.js` - 暴露新的 IPC API
- `src/renderer/components/Toolbar.jsx` - 优化前端交互流程
- `docs/SPECIAL_FILES_HANDLING.md` - 新增技术文档

---

## 🚀 使用示例

### 示例 1：包含符号链接的项目
```
my-project/
  ├── README.md
  ├── docs/
  │   └── guide.md
  └── config/
      └── shared -> ../shared-config  # 符号链接
```

**v1.2.0：** ❌ 初始化失败
**v1.2.1：** ✅ 检测到符号链接 → 用户选择 → 初始化成功

### 示例 2：普通项目
```
my-project/
  ├── README.md
  └── docs/
      └── guide.md
```

**行为：** ✅ 正常初始化，无额外提示（保持原有体验）

---

## 🔗 下载

### macOS
- `OpenTrans-1.2.1.dmg` - 通用版本（Apple Silicon + Intel）

### Windows
- `OpenTrans-Setup-1.2.1.exe` - Windows 安装程序

### Linux
- `OpenTrans-1.2.1.AppImage` - AppImage 格式
- `OpenTrans-1.2.1.deb` - Debian/Ubuntu 包

---

## 📚 相关文档

- [特殊文件处理说明](https://github.com/CoderXiaopang/opentrans/blob/main/docs/SPECIAL_FILES_HANDLING.md)
- [完整更新日志](https://github.com/CoderXiaopang/opentrans/commits/main)

---

## 🙏 感谢

感谢所有提供反馈的用户！你们的问题帮助我们不断改进 OpenTrans。

如有问题或建议，欢迎在 [Issues](https://github.com/CoderXiaopang/opentrans/issues) 中反馈。

---

## 📝 完整变更

- ✅ 新增特殊文件自动检测
- ✅ 新增用户选择对话框
- ✅ 支持跳过特殊文件模式
- ✅ 支持深度复制模式
- ✅ 优化错误提示信息
- ✅ 显示跳过文件统计
- ✅ 完善技术文档

---

**项目地址：** https://github.com/CoderXiaopang/opentrans
**许可证：** MIT
**作者：** CoderXiaopang
