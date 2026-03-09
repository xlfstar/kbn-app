# Electron + Vue + Naive UI 项目开发规则

## 📦 技术栈规范

- 框架：Vue 3 (使用 Composition API 和 `<script setup>` 语法)
- 桌面端：Electron
- UI 组件库：Naive UI
- 构建工具：Vite (推荐) 或 Vue CLI

## 💻 代码风格

### 命名规范

- **组件文件**：PascalCase (如 `UserProfile.vue`)
- **组件名称**：多单词，避免与 HTML 元素冲突 (如 `UserAvatar` 而非 `Avatar`)
- **变量/函数**：camelCase (如 `getUserData`, `isLoading`)
- **常量**：UPPER_SNAKE_CASE (如 `MAX_RETRY_COUNT`)
- **事件处理**：以 `handle` 开头 (如 `handleClick`, `handleSubmit`)
- **Props 事件**：以 `on` 开头 (如 `onClose`, `onConfirm`)

### Vue 组件规范

- **必须使用 `<script setup>` + Composition API**
- **组件选项顺序**：`<script setup>` → `<template>` → `<style>`
- **Props 定义**：使用 `defineProps` 并声明类型/默认值

### 注释规范

- **函数注释**：使用 JSDoc 格式
- **复杂逻辑注释**：说明"为什么这么做"，而非"做了什么"

## 依赖管理

- **使用 pnpm 作为包管理器** (如果项目使用 npm，可删除此条)

- **锁定版本**：重要依赖锁定版本号

- **定期更新**：安全更新及时升级
