import { useState } from "react";
import { Toolbar } from "./components/Toolbar";
import { InputPanel } from "./components/InputPanel";
import { OutputPanel } from "./components/OutputPanel";
import { SettingsPage } from "./components/SettingsPage";
import "./App.css";

type Page = "translate" | "settings";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("translate");
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [theme, setTheme] = useState<"system" | "light" | "dark">("system");

  // 清空输入
  const handleClearInput = () => {
    setInputText("");
    setOutputText("");
  };

  // 清空输出
  const handleClearOutput = () => {
    setOutputText("");
  };

  // 复制输出
  const handleCopyOutput = async () => {
    if (outputText) {
      await navigator.clipboard.writeText(outputText);
    }
  };

  // 导出文件
  const handleExport = () => {
    if (outputText) {
      // TODO: 实现导出功能
      console.log("Export:", outputText);
    }
  };

  return (
    <div className="app-container" data-theme={theme === "system" ? undefined : theme}>
      <Toolbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onClear={handleClearInput}
        onExport={handleExport}
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
              isLoading={false}
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
