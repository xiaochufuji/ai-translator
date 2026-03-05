import { useState } from "react";
import { check } from "@tauri-apps/plugin-updater";
import "./Updater.css";

interface UpdateStatus {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  installing: boolean;
  uptodate: boolean;
  error: string | null;
  version: string | null;
  notes: string | null;
}

export function Updater() {
  const [status, setStatus] = useState<UpdateStatus>({
    checking: false,
    available: false,
    downloading: false,
    installing: false,
    uptodate: false,
    error: null,
    version: null,
    notes: null,
  });

  const checkForUpdates = async () => {
    setStatus((prev) => ({ ...prev, checking: true, error: null }));

    try {
      const update = await check();

      if (update) {
        setStatus({
          checking: false,
          available: true,
          downloading: false,
          installing: false,
          uptodate: false,
          error: null,
          version: update.version,
          notes: update.body ?? null,
        });
      } else {
        setStatus({
          checking: false,
          available: false,
          downloading: false,
          installing: false,
          uptodate: true,
          error: null,
          version: null,
          notes: null,
        });
      }
    } catch (err) {
      console.error("Update check failed:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatus({
        checking: false,
        available: false,
        downloading: false,
        installing: false,
        uptodate: false,
        error: `检查更新失败：${errorMsg}`,
        version: null,
        notes: null,
      });
    }
  };

  const downloadAndInstall = async () => {
    setStatus((prev) => ({ ...prev, downloading: true, error: null }));

    try {
      const update = await check();
      if (update) {
        setStatus((prev) => ({ ...prev, installing: true }));
        await update.downloadAndInstall();
        // 安装成功后会重启应用，不会执行到这里
        setStatus({
          checking: false,
          available: false,
          downloading: false,
          installing: false,
          uptodate: true,
          error: null,
          version: null,
          notes: null,
        });
      }
    } catch (err) {
      console.error("Download and install failed:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setStatus((prev) => ({
        ...prev,
        downloading: false,
        installing: false,
        available: false,
        error: `下载安装失败：${errorMsg}`,
      }));
    }
  };

  return (
    <div className="updater-container">
      <h3 className="updater-title">软件更新</h3>

      <div className="updater-content">
        {!status.checking && !status.available && !status.downloading && !status.installing && !status.uptodate && (
          <div className="updater-info">
            <p>点击按钮检查是否有新版本可用</p>
          </div>
        )}

        {status.checking && (
          <div className="updater-status">
            <div className="spinner"></div>
            <span>正在检查更新...</span>
          </div>
        )}

        {status.uptodate && (
          <div className="updater-status uptodate">
            <span className="success-icon">✓</span>
            <span>已是最新版本</span>
          </div>
        )}

        {status.available && (
          <div className="updater-status available">
            <div className="update-info">
              <p className="version">新版本：v{status.version}</p>
              {status.notes && (
                <div className="release-notes">
                  <p>更新内容：</p>
                  <pre>{status.notes}</pre>
                </div>
              )}
            </div>
            <button className="btn btn-primary update-btn" onClick={downloadAndInstall}>
              下载并安装
            </button>
          </div>
        )}

        {status.downloading && (
          <div className="updater-status">
            <div className="spinner"></div>
            <span>正在下载更新...</span>
          </div>
        )}

        {status.installing && (
          <div className="updater-status">
            <div className="spinner"></div>
            <span>正在安装更新，安装完成后将自动重启...</span>
          </div>
        )}

        {status.error && (
          <div className="updater-status error">
            <span className="error-icon">✕</span>
            <span>{status.error}</span>
          </div>
        )}

        <button
          className="btn btn-secondary check-btn"
          onClick={checkForUpdates}
          disabled={status.checking || status.downloading || status.installing}
        >
          {status.checking ? "检查中..." : "检查更新"}
        </button>
      </div>
    </div>
  );
}
