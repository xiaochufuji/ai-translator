# 自动升级功能配置指南

## 功能说明

AI Translator 现已支持自动升级功能。在设置页面点击「检查更新」按钮，即可检查并安装最新版本。

## 技术实现

- 使用 Tauri 官方 `tauri-plugin-updater` 插件
- 更新信息托管在 GitHub Releases
- 支持自动下载和安装

## 如何发布新版本

### 1. 构建新版本

```bash
cd translator-app
npm run tauri build
```

构建完成后，安装包位于：
- Windows: `src-tauri/target/release/bundle/msi/` 或 `nsis/`

### 2. 创建 GitHub Release

1. 访问 https://github.com/xiaochufuji/ai-translator/releases
2. 点击 "Create a new release"
3. 创建新标签，如 `v0.2.2`
4. 填写发布说明

### 3. 上传安装包

上传构建好的安装包文件（如 `.msi` 或 `.exe`）

### 4. 创建 release.json

创建或更新 `release.json` 文件，内容如下：

```json
{
  "version": "0.2.2",
  "notes": "修复了 XXX 问题，新增了 YYY 功能",
  "pub_date": "2026-03-05T00:00:00Z",
  "platforms": {
    "windows-x86_64": {
      "url": "https://github.com/xiaochufuji/ai-translator/releases/download/v0.2.2/translator-app_0.2.2_x64_en-US.msi",
      "signature": ""
    }
  }
}
```

**注意**：
- `version`: 必须高于当前版本号
- `pub_date`: ISO 8601 格式
- `url`: 必须是 GitHub Releases 的直接下载链接
- `signature`: 测试阶段可留空

### 5. 上传 release.json

将 `release.json` 上传到 GitHub Releases 的资源文件中

## release.json 放置位置

有两种方式：

### 方式 1：放在 Releases（推荐）

URL: `https://github.com/xiaochufuji/ai-translator/releases/latest/download/release.json`

使用 `latest` 链接，始终指向最新版本

### 方式 2：放在 Gist

1. 创建 GitHub Gist: https://gist.github.com/
2. 内容为 `release.json`
3. 使用 Raw 链接

## 测试更新

1. 修改 `tauri.conf.json` 中的 `version` 为较低版本（如 `0.2.0`）
2. 运行应用：`npm run tauri dev`
3. 打开设置页面，点击「检查更新」
4. 应该能检测到更新

## 配置说明

### tauri.conf.json 配置

```json
{
  "plugins": {
    "updater": {
      "enabled": true,
      "endpoints": [
        "https://github.com/xiaochufuji/ai-translator/releases/latest/download/release.json"
      ],
      "pubkey": ""
    }
  }
}
```

- `enabled`: 是否启用更新检查
- `endpoints`: 更新信息 JSON 的地址
- `pubkey`: 签名公钥，测试阶段留空

## 常见问题

### Q: 更新后数据会丢失吗？
A: 不会。用户数据（如设置、历史记录）存储在独立目录，更新不会影响。

### Q: 更新失败怎么办？
A: 可以手动下载安装包覆盖安装。

### Q: 如何禁用自动更新？
A: 在 `tauri.conf.json` 中设置 `"enabled": false`

## 文件结构

```
translator-app/
├── src-tauri/
│   ├── tauri.conf.json       # 更新配置
│   ├── Cargo.toml            # tauri-plugin-updater 依赖
│   └── src/lib.rs            # 插件注册
├── src/
│   └── components/
│       ├── Updater.tsx       # 更新 UI 组件
│       └── Updater.css       # 更新样式
└── release-example.json      # release.json 示例
```
