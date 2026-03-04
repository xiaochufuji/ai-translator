import { useState, useEffect } from "react";
import "./SettingsPage.css";

interface SettingsPageProps {
  theme: "system" | "light" | "dark";
  onThemeChange: (theme: "system" | "light" | "dark") => void;
}

interface LLMSettings {
  apiKey: string;
  baseUrl: string;
  model: string;
  timeout: number;
  targetLanguage?: string;
}

// 可选的目标语言列表
const targetLanguages = [
  { value: "中文", label: "中文" },
  { value: "英文", label: "English (英文)" },
  { value: "日文", label: "日本語 (日文)" },
  { value: "韩文", label: "한국어 (韩文)" },
  { value: "法文", label: "Français (法文)" },
  { value: "德文", label: "Deutsch (德文)" },
  { value: "西班牙文", label: "Español (西班牙文)" },
  { value: "意大利文", label: "Italiano (意大利文)" },
  { value: "葡萄牙文", label: "Português (葡萄牙文)" },
  { value: "俄文", label: "Русский (俄文)" },
];

export function SettingsPage({ theme, onThemeChange }: SettingsPageProps) {
  const [llmSettings, setLlmSettings] = useState<LLMSettings>({
    apiKey: "",
    baseUrl: "",
    model: "gpt-4o-mini",
    timeout: 30,
    targetLanguage: "中文",
  });

  // 加载设置
  useEffect(() => {
    const saved = localStorage.getItem("llmSettings");
    if (saved) {
      try {
        setLlmSettings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load LLM settings:", e);
      }
    }
  }, []);

  // 保存设置
  const handleSaveSettings = () => {
    localStorage.setItem("llmSettings", JSON.stringify(llmSettings));
    alert("设置已保存");
  };

  // 更新 LLM 设置
  const updateSetting = (key: keyof LLMSettings, value: string | number) => {
    setLlmSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">设置</h2>

      {/* 主题设置 */}
      <div className="settings-section">
        <h3 className="settings-section-title">主题</h3>
        <div className="theme-options">
          <button
            className={`theme-option ${theme === "system" ? "active" : ""}`}
            onClick={() => onThemeChange("system")}
          >
            跟随系统
          </button>
          <button
            className={`theme-option ${theme === "light" ? "active" : ""}`}
            onClick={() => onThemeChange("light")}
          >
            浅色
          </button>
          <button
            className={`theme-option ${theme === "dark" ? "active" : ""}`}
            onClick={() => onThemeChange("dark")}
          >
            深色
          </button>
        </div>
      </div>

      {/* LLM API 设置 */}
      <div className="settings-section">
        <h3 className="settings-section-title">LLM API 配置</h3>

        <div className="form-group">
          <label className="form-label">翻译目标语言</label>
          <select
            className="form-select"
            value={llmSettings.targetLanguage}
            onChange={(e) => updateSetting("targetLanguage", e.target.value)}
          >
            {targetLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
          <p className="form-help">选择译文的目标语言，默认为中文</p>
        </div>

        <div className="form-group">
          <label className="form-label">API Key</label>
          <input
            type="password"
            className="form-input"
            placeholder="sk-..."
            value={llmSettings.apiKey}
            onChange={(e) => updateSetting("apiKey", e.target.value)}
          />
          <p className="form-help">您的 API 密钥将存储在本地</p>
        </div>

        <div className="form-group">
          <label className="form-label">Base URL</label>
          <input
            type="url"
            className="form-input"
            placeholder="https://api.openai.com/v1"
            value={llmSettings.baseUrl}
            onChange={(e) => updateSetting("baseUrl", e.target.value)}
          />
          <p className="form-help">可选，留空使用默认值</p>
        </div>

        <div className="form-group">
          <label className="form-label">模型</label>
          <input
            type="text"
            className="form-input"
            placeholder="gpt-4o-mini"
            value={llmSettings.model}
            onChange={(e) => updateSetting("model", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">超时时间（秒）</label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="300"
            value={llmSettings.timeout}
            onChange={(e) => updateSetting("timeout", parseInt(e.target.value) || 30)}
          />
        </div>

        <button className="btn btn-primary" onClick={handleSaveSettings}>
          保存设置
        </button>
      </div>
    </div>
  );
}
