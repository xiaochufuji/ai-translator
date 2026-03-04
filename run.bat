@echo off
chcp 65001 >nul
echo ========================================
echo    AI Translator - 开发模式启动
echo ========================================
echo.

cd /d "%~dp0translator-app"

echo [1/2] 启动前端开发服务器...
start "AI Translator - Frontend" cmd /k "npm run dev"

echo [2/2] 启动 Tauri 桌面应用...
cargo run --manifest-path src-tauri/Cargo.toml

echo.
echo ========================================
echo    应用已关闭
echo ========================================
pause
