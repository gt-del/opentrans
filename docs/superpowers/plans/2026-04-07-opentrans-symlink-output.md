# OpenTrans Symlink And Output Plan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复软链接目录初始化不稳定问题，改为显式翻译，并支持新的输出目录策略。

**Architecture:** 在主进程新增输出目录解析函数并统一 `cloneProject` 的初始化入口，文件扫描基于真实路径工作。渲染层把“打开文件”和“翻译文件”动作分离，并通过设置持久化输出目录模式与自定义目录。

**Tech Stack:** Electron, React, Zustand, Node.js test runner

---

### Task 1: 后端路径规则

**Files:**
- Modify: `src/main/fileManager.js`
- Test: `test/fileManager.symlink.test.mjs`

- [ ] 写失败测试，覆盖默认输出目录、自定义输出目录、项目内隐藏目录跳过规则。
- [ ] 运行测试确认失败。
- [ ] 实现最小代码使测试通过。
- [ ] 运行相关测试确认通过。

### Task 2: 显式翻译交互

**Files:**
- Modify: `src/renderer/components/FileTree.jsx`
- Modify: `src/renderer/components/Toolbar.jsx`
- Modify: `src/renderer/stores/useStore.js`

- [ ] 调整文件树点击行为为仅打开文件。
- [ ] 保留单文件重翻译按钮和全量翻译按钮。
- [ ] 让状态文案与当前行为一致。

### Task 3: 设置与 IPC

**Files:**
- Modify: `src/main/ipc.js`
- Modify: `src/preload/index.js`
- Modify: `src/renderer/components/SettingsModal.jsx`
- Modify: `src/renderer/stores/useStore.js`

- [ ] 增加输出目录模式和自定义目录选择。
- [ ] 让初始化与批量翻译都使用同一套设置。
- [ ] 处理空值回退和目录选择器。

### Task 4: 验证

**Files:**
- Modify: `README.md`（如有必要）

- [ ] 运行 `npm test`
- [ ] 运行 `npm run build`
- [ ] 如需要，再运行 `npm run build:mac`
