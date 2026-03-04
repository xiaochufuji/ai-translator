import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Toolbar } from "./components/Toolbar";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { SettingsPage } from "./components/SettingsPage";
import "./App.css";

type Page = "translate" | "settings";

interface LLMSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("translate");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

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
    };
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
      const result = await invoke("translate", {
        text: inputText,
        targetLanguage: "中文",
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
  }, [inputText]);

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
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

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
            />
          </div>
        ) : (
          <SettingsPage
            theme={theme}
            onThemeChange={setTheme}
          />
        )}
      </main>
    </div>
  );
}

export default App;
