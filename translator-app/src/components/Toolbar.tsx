import "./Toolbar.css";

interface ToolbarProps {
  currentPage: "translate" | "settings";
  onNavigate: (page: "translate" | "settings") => void;
  onTranslate: () => void;
  onClear: () => void;
  onExport: () => void;
  isTranslating: boolean;
}

export function Toolbar({
  currentPage,
  onNavigate,
  onTranslate,
  onClear,
  onExport,
  isTranslating,
}: ToolbarProps) {
  return (
    <header className="toolbar">
      <div className="toolbar-left">
        <h1>AI Translator</h1>
        <button
          className={`btn ${currentPage === "translate" ? "btn-primary" : ""}`}
          onClick={() => onNavigate("translate")}
          title="翻译页面 (Ctrl+L 清空)"
        >
          翻译
        </button>
      </div>
      <div className="toolbar-right">
        <button
          className="btn btn-primary"
          onClick={onTranslate}
          disabled={isTranslating || currentPage !== "translate"}
          title="翻译 (Ctrl+Enter)"
        >
          {isTranslating ? "翻译中..." : "翻译"}
        </button>
        <button
          className="btn"
          onClick={onClear}
          disabled={currentPage !== "translate"}
          title="清空输入 (Ctrl+L)"
        >
          清空
        </button>
        <button
          className="btn"
          onClick={onExport}
          disabled={currentPage !== "translate"}
          title="导出文件 (Ctrl+S)"
        >
          导出
        </button>
        <button
          className={`btn ${currentPage === "settings" ? "btn-primary" : ""}`}
          onClick={() => onNavigate("settings")}
          title="设置 (Ctrl+,)"
        >
          设置
        </button>
      </div>
    </header>
  );
}
