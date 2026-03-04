import { useState } from "react";
import "./CloseDialog.css";

interface CloseDialogProps {
  onClose: (choice: "exit" | "hide", dontShowAgain: boolean) => void;
}

export function CloseDialog({ onClose }: CloseDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleExit = () => {
    onClose("exit", dontShowAgain);
  };

  const handleHide = () => {
    onClose("hide", dontShowAgain);
  };

  return (
    <div className="close-dialog-overlay">
      <div className="close-dialog">
        <div className="close-dialog-title">关闭应用</div>
        <div className="close-dialog-message">
          您想要直接关闭应用，还是让应用在后台运行？
          <br />
          <span style={{ fontSize: "12px", opacity: 0.8 }}>
            后台运行时，应用会继续在系统托盘中运行，双击托盘图标可恢复窗口。
          </span>
        </div>
        <div className="close-dialog-actions">
          <button
            className="close-dialog-button secondary"
            onClick={handleExit}
          >
            直接关闭
          </button>
          <button
            className="close-dialog-button primary"
            onClick={handleHide}
          >
            后台运行
          </button>
        </div>
        <div className="close-dialog-checkbox">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <label htmlFor="dontShowAgain">不再提示</label>
        </div>
      </div>
    </div>
  );
}
