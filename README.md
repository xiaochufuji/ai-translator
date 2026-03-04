# AI Translator 启动说明

## 开发模式

### 方法 1: 使用启动脚本（推荐）

**Windows:**
```bash
run.bat
```

**Linux/macOS:**
```bash
chmod +x run.sh
./run.sh
```

### 方法 2: 手动启动

**步骤 1: 启动前端**
```bash
cd translator-app
npm run dev
```

**步骤 2: 启动 Tauri**
```bash
cd translator-app/src-tauri
cargo run
```

### 方法 3: 使用 npm

```bash
cd translator-app
npm run tauri dev
```

---

## 生产构建

```bash
cd translator-app
npm run build
npm run tauri build
```

构建产物位于：`translator-app/src-tauri/target/release/bundle/`

---

## 系统要求

- Rust >= 1.75
- Node.js >= 20
- 支持 Windows 10/11, macOS 10.15+, Linux
