import "./OutputPanel.css";

interface OutputPanelProps {
  value: string;
  onClear: () => void;
  onCopy: () => void;
  onExport: () => void;
  isLoading: boolean;
  error?: string | null;
}

export function OutputPanel({ value, onClear, onCopy, onExport, isLoading, error }: OutputPanelProps) {
  return (
    <div className="output-panel">
      <div className="panel-header">
        <span className="panel-title">译文</span>
        <div className="panel-actions">
          <button className="btn-icon" onClick={onExport} title="导出" disabled={!value}>
            💾
          </button>
          <button className="btn-icon" onClick={onCopy} title="复制" disabled={!value}>
            📋
          </button>
          <button className="btn-icon" onClick={onClear} title="清空" disabled={!value}>
            ✕
          </button>
        </div>
      </div>
      <div className="panel-content">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : value ? (
          <div className="output-content">{value}</div>
        ) : (
          <div className="output-placeholder">翻译结果将显示在这里</div>
        )}
      </div>
    </div>
  );
}
