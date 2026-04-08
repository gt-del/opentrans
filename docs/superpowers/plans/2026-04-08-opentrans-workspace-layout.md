# OpenTrans Workspace Restore And Splitter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 自动恢复上次项目，并让原文/译文面板可拖拽调整宽度。

**Architecture:** 使用本地持久化保存最近工作区和分栏比例，应用启动时在渲染层恢复。保持主进程接口不扩张，仍通过现有 `get-file-tree` 校验恢复有效性。

**Tech Stack:** React 18, Zustand, Electron, Node.js test runner

---
