import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Toolbar } from "./components/Toolbar";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { SettingsPage } from "./components/SettingsPage";
import { CloseDialog } from "./components/CloseDialog";
import "./App.css";

type Page = "translate" | "settings";

interface LLMSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
  targetLanguage?: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("translate");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");
  const [targetLanguage, setTargetLanguage] = useState("中文");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // 关闭对话框状态
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // 显示 toast 提示
  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // 加载 LLM 设置
  const loadLLMSettings = (): LLMSettings => {
    const saved = localStorage.getItem("llmSettings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse LLM settings:", e);
      }
    }
    return {
      apiKey: "",
      baseUrl: "",
      model: "gpt-4o-mini",
      timeout: 30,
      targetLanguage: "中文",
    };
  };

  // 保存目标语言到 localStorage
  const saveTargetLanguage = (lang: string) => {
    const saved = localStorage.getItem("llmSettings");
    let settings: LLMSettings = {
      apiKey: "",
      baseUrl: "",
      model: "gpt-4o-mini",
      timeout: 30,
      targetLanguage: "中文",
    };
    if (saved) {
      try {
        settings = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse LLM settings:", e);
      }
    }
    settings.targetLanguage = lang;
    localStorage.setItem("llmSettings", JSON.stringify(settings));
    setTargetLanguage(lang);
  };

  // 处理翻译
  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) {
      setError("请输入要翻译的文本");
      return;
    }

    const settings = loadLLMSettings();
    if (!settings.apiKey) {
      setError("请先在设置中配置 API Key");
      setCurrentPage("settings");
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const targetLang = targetLanguage || "中文";
      const result = await invoke("translate", {
        text: inputText,
        targetLanguage: targetLang,
        apiKey: settings.apiKey,
        baseUrl: settings.baseUrl || null,
        model: settings.model,
        timeout: settings.timeout,
      });
      setOutputText(result as string);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "翻译失败";
      setError(errorMessage);
      console.error("Translation error:", err);
    } finally {
      setIsTranslating(false);
    }
  }, [inputText, targetLanguage]);

  // 清空输入
  const handleClearInput = () => {
    setInputText("");
    setOutputText("");
    setError(null);
  };

  // 清空输出
  const handleClearOutput = () => {
    setOutputText("");
    setError(null);
  };

  // 复制输出
  const handleCopyOutput = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
      showToastMessage("已复制到剪贴板");
    }
  };

  // 导出文件
  const handleExport = async () => {
    if (!outputText) return;

    try {
      // 使用 Tauri dialog API 保存文件
      const { save } = await import("@tauri-apps/plugin-dialog");
      const { writeTextFile } = await import("@tauri-apps/plugin-fs");

      const filePath = await save({
        title: "保存翻译结果",
        defaultPath: "translated.txt",
        filters: [{
          name: "Text Files",
          extensions: ["txt"],
        }],
      });

      if (filePath) {
        await writeTextFile(filePath, outputText);
      }
    } catch (err) {
      console.error("Export failed:", err);
      // 降级方案：使用 blob 下载
      const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "translated.txt";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // 主题同步到 documentElement
  useEffect(() => {
    if (theme === "system") {
      // 跟随系统时，根据系统主题设置 data-theme
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const isDark = mediaQuery.matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // 监听窗口关闭事件
  useEffect(() => {
    const unlisten = listen("tauri://close-requested", () => {
      console.log("[App] Close requested");
      const saved = localStorage.getItem("closePreference");
      let preference: { action: "exit" | "hide"; dontShowAgain: boolean } | null = null;
      if (saved) {
        try {
          preference = JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse close preference:", e);
        }
      }

      if (preference?.dontShowAgain) {
        // 直接执行用户偏好的操作
        if (preference.action === "exit") {
          invoke("exit_app");
        } else {
          invoke("hide_window");
        }
      } else {
        // 显示关闭对话框
        setShowCloseDialog(true);
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // 处理关闭对话框
  const handleCloseDialogClose = async (choice: "exit" | "hide", dontShowAgain: boolean) => {
    setShowCloseDialog(false);

    if (dontShowAgain) {
      localStorage.setItem("closePreference", JSON.stringify({ action: choice, dontShowAgain: true }));
    }

    if (choice === "exit") {
      await invoke("exit_app");
    } else {
      await invoke("hide_window");
    }
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter: 翻译
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (currentPage === "translate") {
          handleTranslate();
        }
      }
      // Ctrl/Cmd + S: 导出
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (currentPage === "translate" && outputText) {
          handleExport();
        }
      }
      // Ctrl/Cmd + L: 清空
      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        if (currentPage === "translate") {
          handleClearInput();
        }
      }
      // Ctrl/Cmd + ,: 打开设置
      if ((e.ctrlKey || e.metaKey) && e.key === ",") {
        e.preventDefault();
        setCurrentPage("settings");
      }
      // Escape: 返回翻译页面
      if (e.key === "Escape" && currentPage === "settings") {
        setCurrentPage("translate");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, outputText, handleTranslate]);

  return (
    <div className="app-container">
      <Toolbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onTranslate={handleTranslate}
        onClear={handleClearInput}
        onExport={handleExport}
        isTranslating={isTranslating}
      />

      <main className="main-content">
        {currentPage === "translate" ? (
          <div className="translate-panel">
            <InputPanel
              value={inputText}
              onChange={setInputText}
              onClear={handleClearInput}
            />
            <OutputPanel
              value={outputText}
              onClear={handleClearOutput}
              onCopy={handleCopyOutput}
              onExport={handleExport}
              isLoading={isTranslating}
              error={error}
              targetLanguage={targetLanguage}
              onTargetLanguageChange={saveTargetLanguage}
              showCopiedToast={() => showToastMessage("已复制到剪贴板")}
            />
          </div>
        ) : (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
      </main>

      {/* Toast 提示 */}
      {showToast && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

      {/* 关闭确认对话框 */}
      {showCloseDialog && (
        <CloseDialog
          onClose={handleCloseDialogClose}
        />
      )}
    </div>
  );
}

export default App;
