#!/bin/bash
# AI Translator - 开发模式启动脚本

echo "========================================"
echo "   AI Translator - 开发模式启动"
echo "========================================"
echo ""

cd "$(dirname "$0")/translator-app"

# 启动前端
echo "[1/2] 启动前端开发服务器..."
npm run dev &
FRONTEND_PID=$!

# 等待前端启动
sleep 3

# 启动 Tauri
echo "[2/2] 启动 Tauri 桌面应用..."
cargo run --manifest-path src-tauri/Cargo.toml

# 清理
kill $FRONTEND_PID 2>/dev/null

echo ""
echo "========================================"
echo "   应用已关闭"
echo "========================================"
