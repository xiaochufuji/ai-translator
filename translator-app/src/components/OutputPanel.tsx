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
  const getErrorMessage = (errorMsg: string) => {
    // API Key 错误
    if (errorMsg.includes("API Key") || errorMsg.includes("配置")) {
      return {
        title: "缺少 API 配置",
        message: "请先在设置页面配置 API Key。支持 OpenAI 及兼容 API。",
        hint: "设置 → LLM API 配置 → API Key"
      };
    }
    // 空输入
    if (errorMsg.includes("请输入")) {
      return {
        title: "输入为空",
        message: "请在左侧输入要翻译的文本，或拖拽文件到输入区域。",
        hint: "支持拖拽 .txt 文件"
      };
    }
    // 超时错误
    if (errorMsg.includes("timeout") || errorMsg.includes("超时")) {
      return {
        title: "请求超时",
        message: "翻译请求超时，可能是文本过长或网络连接不稳定。",
        hint: "建议：1. 增加超时时间 2. 分段翻译 3. 检查网络连接"
      };
    }
    // 网络错误
    if (errorMsg.includes("网络") || errorMsg.includes("request") || errorMsg.includes("connection")) {
      return {
        title: "网络请求失败",
        message: "无法连接到翻译服务，请检查网络连接。",
        hint: errorMsg
      };
    }
    // API 错误（认证失败）
    if (errorMsg.includes("401") || errorMsg.includes("Unauthorized")) {
      return {
        title: "API 认证失败",
        message: "API Key 无效或已过期，请检查设置。",
        hint: "设置 → LLM API 配置 → API Key"
      };
    }
    // API 错误（配额不足）
    if (errorMsg.includes("429") || errorMsg.includes("quota") || errorMsg.includes("rate limit")) {
      return {
        title: "API 请求受限",
        message: "请求频率过高或配额已用完，请稍后重试。",
        hint: errorMsg
      };
    }
    // API 错误
    if (errorMsg.includes("API")) {
      return {
        title: "API 调用失败",
        message: errorMsg,
        hint: "请检查 API Key 和 Base URL 配置是否正确"
      };
    }
    // JSON 解析错误
    if (errorMsg.includes("JSON") || errorMsg.includes("parse")) {
      return {
        title: "响应解析失败",
        message: "无法解析 API 返回的数据，请稍后重试。",
        hint: errorMsg
      };
    }
    // 默认错误
    return {
      title: "翻译失败",
      message: errorMsg,
      hint: "请稍后重试，或检查网络和 API 配置"
    };
  };

  const errorInfo = error ? getErrorMessage(error) : null;

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
        ) : errorInfo ? (
          <div className="error-message">
            <strong>{errorInfo.title}</strong>
            {errorInfo.message}
            {errorInfo.hint && (
              <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.8 }}>
                💡 {errorInfo.hint}
              </div>
            )}
          </div>
        ) : value ? (
          <div className="output-content">{value}</div>
        ) : (
          <div className="output-placeholder">翻译结果将显示在这里</div>
        )}
      </div>
    </div>
  );
}
