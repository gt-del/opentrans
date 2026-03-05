# 特殊文件处理改进说明

## 问题

用户在使用 OpenTrans 时遇到错误：

```
初始化失败: 复制文件失败 ... ENOTSUP: operation not supported on socket, copyfile
```

**原因：** 项目中包含特殊文件（符号链接、socket、FIFO 等），`copyFileSync` 无法直接复制这些文件。

## 解决方案

实现了智能的特殊文件处理机制，让用户自主选择如何处理这些文件。

### 功能特性

1. **自动检测特殊文件**
   - 符号链接 (symlink)
   - Socket 文件
   - FIFO 文件（命名管道）
   - 其他不支持的文件类型

2. **用户友好的选择对话框**
   - 列出所有检测到的特殊文件
   - 显示文件类型（符号链接、Socket 等）
   - 提供两种处理方式

3. **两种处理模式**
   - **跳过**：不复制这些特殊文件（默认，推荐）
   - **深度复制**：跟随符号链接，复制实际内容

### 使用流程

1. 用户选择包含特殊文件的项目
2. 系统自动检测并跳过特殊文件
3. 如果检测到特殊文件，弹出对话框：
   ```
   检测到特殊文件

   项目中包含 X 个特殊文件无法直接复制

   以下文件已被跳过：
     • /path/to/file (符号链接)
     • /path/to/socket (Socket)

   请选择如何处理：
   [跳过这些文件] [深度复制（复制实际内容）] [取消]
   ```

4. 用户选择处理方式：
   - 点击"跳过"：继续初始化，跳过特殊文件
   - 点击"深度复制"：重新复制，跟随符号链接复制实际内容
   - 点击"取消"：取消初始化

### 技术实现

#### 1. 后端改进 (`src/main/fileManager.js`)

```javascript
function copyDirSync(src, dest, options = {}) {
  const { skipSpecialFiles = false, followSymlinks = false } = options

  // 检测文件类型
  const stats = lstatSync(srcPath)

  if (stats.isSymbolicLink()) {
    if (skipSpecialFiles) {
      // 跳过符号链接
      skippedFiles.push({ path: srcPath, type: 'symlink' })
    } else if (followSymlinks) {
      // 深度复制：复制实际内容
      const realPath = realpathSync(srcPath)
      copyFileSync(realPath, destPath)
    }
  }

  if (stats.isSocket() || stats.isFIFO()) {
    // Socket 和 FIFO 总是跳过
    skippedFiles.push({ path: srcPath, type: 'socket' })
  }
}
```

#### 2. IPC 处理器 (`src/main/ipc.js`)

新增对话框处理器：

```javascript
ipcMain.handle('show-special-files-dialog', async (_e, skippedFiles) => {
  const result = await dialog.showMessageBox(getWin(), {
    type: 'warning',
    title: '检测到特殊文件',
    message: `项目中包含 ${skippedFiles.length} 个特殊文件无法直接复制`,
    buttons: ['跳过这些文件', '深度复制（复制实际内容）', '取消']
  })

  return {
    cancelled: result.response === 2,
    followSymlinks: result.response === 1
  }
})
```

#### 3. 前端交互 (`src/renderer/components/Toolbar.jsx`)

```javascript
async function handleSelectProject() {
  // 1. 首次尝试（默认跳过特殊文件）
  let result = await window.electronAPI.cloneProject(dir, {
    skipSpecialFiles: true
  })

  // 2. 如果有特殊文件，询问用户
  if (result.hasSkippedFiles && result.skippedFiles.length > 0) {
    const choice = await window.electronAPI.showSpecialFilesDialog(
      result.skippedFiles
    )

    // 3. 根据用户选择重新复制
    if (choice.followSymlinks) {
      result = await window.electronAPI.cloneProject(dir, {
        followSymlinks: true
      })
    }
  }
}
```

### 修改的文件

1. **`src/main/fileManager.js`**
   - 添加特殊文件检测逻辑
   - 支持 `skipSpecialFiles` 和 `followSymlinks` 选项
   - 返回跳过的文件列表

2. **`src/main/ipc.js`**
   - 修改 `clone-project` 处理器支持选项参数
   - 新增 `show-special-files-dialog` 处理器

3. **`src/preload/index.js`**
   - 更新 `cloneProject` API 支持选项参数
   - 添加 `showSpecialFilesDialog` API

4. **`src/renderer/components/Toolbar.jsx`**
   - 实现特殊文件处理流程
   - 显示跳过文件数量

### 优势

1. **不会崩溃** - 遇到特殊文件不再报错
2. **用户友好** - 清晰说明问题，让用户选择
3. **灵活处理** - 支持跳过或深度复制
4. **信息透明** - 显示具体的特殊文件列表和类型

### 测试场景

#### 场景 1：包含符号链接的项目

```bash
project/
  ├── README.md
  ├── plugin/
  │   ├── agents -> ../v2/.claude/agents  # 符号链接
  │   ├── commands -> ../.claude/commands # 符号链接
  │   └── skills -> ../.claude/skills     # 符号链接
```

**结果：**
- 检测到 3 个符号链接
- 弹出对话框让用户选择
- 用户可选择跳过或深度复制

#### 场景 2：普通项目（无特殊文件）

```bash
project/
  ├── README.md
  ├── docs/
  │   └── guide.md
```

**结果：**
- 正常复制，无提示
- 直接显示"项目已初始化"

### 向后兼容

- 不影响现有项目的使用
- 已初始化的项目不会重新提示
- 只在首次初始化时检测特殊文件

### 版本

- 实现版本：v1.2.0+
- 状态：✅ 已实现并测试通过

---

**作者：** CoderXiaopang
**日期：** 2026-03-05
