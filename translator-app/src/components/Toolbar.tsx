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
        >
          翻译
        </button>
      </div>
      <div className="toolbar-right">
        <button
          className="btn btn-primary"
          onClick={onTranslate}
          disabled={isTranslating || currentPage !== "translate"}
        >
          {isTranslating ? "翻译中..." : "翻译"}
        </button>
        <button
          className="btn"
          onClick={onClear}
          disabled={currentPage !== "translate"}
        >
          清空
        </button>
        <button
          className="btn"
          onClick={onExport}
          disabled={currentPage !== "translate"}
        >
          导出
        </button>
        <button
          className={`btn ${currentPage === "settings" ? "btn-primary" : ""}`}
          onClick={() => onNavigate("settings")}
        >
          设置
        </button>
      </div>
    </header>
  );
}
