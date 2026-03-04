# 桌面翻译软件（Tauri + Rust + LLM）

# AI Agent 友好开发规范（完整版）

版本：v1.0\
更新时间：2026-03-04

------------------------------------------------------------------------

# 1 项目背景

本项目目标是开发一个 **跨平台桌面翻译软件**。

技术栈：

-   **Tauri + Rust**：桌面应用
-   **React + Vite**：前端 UI
-   **LLM API**：翻译能力

应用支持：

-   文本翻译
-   文件翻译
-   翻译结果导出
-   主题设置
-   LLM API 自定义配置

项目设计为 **AI Agent 可持续开发项目**，因此包含：

-   Git 规范
-   进度管理
-   Agent 交接机制
-   任务拆分规范
-   可恢复开发流程

------------------------------------------------------------------------

# 2 产品目标

核心目标：

1.  构建跨平台桌面翻译软件
2.  支持文本输入翻译
3.  支持拖拽文件翻译
4.  支持翻译结果导出
5.  支持配置大语言模型 API
6.  UI 支持 Light / Dark / Follow System

------------------------------------------------------------------------

# 3 功能需求

## 3.1 主界面

界面分为 **左右两栏**

### 输入区

支持：

-   文本输入
-   拖拽文件
-   清空文本

组件：

    InputPanel

功能：

-   textarea
-   drag drop area
-   clear button

------------------------------------------------------------------------

### 输出区

组件：

    OutputPanel

功能：

-   显示翻译结果
-   支持复制
-   支持导出文件

------------------------------------------------------------------------

### 工具栏

顶部工具栏：

    Translate Button
    Clear Button
    Export Button
    Settings Button

------------------------------------------------------------------------

# 4 设置页面

点击右上角 **Settings 按钮** 打开。

组件：

    SettingsPage

## 4.1 主题设置

支持三种模式：

    Follow System
    Light
    Dark

默认：

    Follow System

------------------------------------------------------------------------

## 4.2 LLM 设置

用户可以配置：

    API Key
    Base URL (optional)
    Model
    Timeout

示例：

    API KEY: sk-xxxx
    Base URL: https://api.openai.com/v1
    Model: gpt-4o-mini

配置必须持久化存储。

------------------------------------------------------------------------

# 5 技术架构

整体架构：

    Frontend (React)
            ↓
    Tauri Bridge
            ↓
    Rust Backend
            ↓
    LLM API

------------------------------------------------------------------------

# 6 项目目录结构

    translator-app
    src/
    src-tauri/
    docs/
    README.md

------------------------------------------------------------------------

# 7 Git 管理规范

## 分支策略

    main
    dev
    feature/*
    fix/*

## Commit 规范

    type(scope): description

示例：

    feat(ui): add input panel
    feat(settings): add theme switch
    feat(llm): implement translate api
    fix(file): fix encoding issue
    docs(progress): update milestone

------------------------------------------------------------------------

# 8 项目进度管理

文件：

    docs/progress.md

示例：

    Current Milestone: UI Framework
    Completed:
    - scaffold
    - layout
    Next Task:
    settings storage

------------------------------------------------------------------------

# 9 AI Agent 开发规则

AI Agent 必须遵守：

1.  不允许一次实现整个项目
2.  每个任务必须独立运行
3.  完成任务必须更新 progress.md
4.  每次任务必须 git commit
5.  所有代码必须编译成功

------------------------------------------------------------------------

# 10 任务拆分标准

    一个任务 <= 300 行代码

示例任务：

    Task 1 初始化 Tauri 项目
    Task 2 创建主界面布局
    Task 3 InputPanel 组件
    Task 4 OutputPanel 组件
    Task 5 Settings 页面
    Task 6 设置存储
    Task 7 LLM API 调用
    Task 8 文件拖拽导入
    Task 9 文件导出
    Task 10 长文本分段翻译

------------------------------------------------------------------------

# 11 翻译引擎设计

System Prompt：

    你是一个专业翻译引擎。
    保持原文格式。
    不要添加解释。
    只输出译文。

User Prompt 示例：

    源语言: Auto
    目标语言: 中文

    原文:
    <text>

------------------------------------------------------------------------

# 12 长文本翻译策略

    1 识别段落
    2 按字符长度切分
    3 每段调用 LLM
    4 拼接结果

重试策略：

    最大重试次数: 2
    指数退避

------------------------------------------------------------------------

# 13 日志系统

    logs/dev.log

Rust 推荐：

    tracing

------------------------------------------------------------------------

# 14 开发环境

    Rust >= 1.75
    Node >= 20
    Tauri CLI

安装：

    cargo install tauri-cli

运行：

    npm install
    npm run tauri dev

------------------------------------------------------------------------

# 15 Agent 交接机制

更新：

    docs/agent_log.md

示例：

    Completed
    - Main UI layout

    Next Task
    Settings Page

------------------------------------------------------------------------

# 16 最终交付物

    src
    src-tauri
    docs
    README.md

docs 必须包含：

    PRD.md
    progress.md
    setup.md
    agent_rules.md
    agent_log.md
