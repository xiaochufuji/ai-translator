import { useState, useRef } from "react";
import "./InputPanel.css";

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function InputPanel({ value, onChange, onClear }: InputPanelProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 处理拖拽进入
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  // 处理拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  // 处理拖拽经过
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 必须设置 dropEffect 才能显示允许拖拽的图标
    e.dataTransfer.dropEffect = "copy";
  };

  // 处理文件拖拽
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  // 处理文件
  const handleFile = async (file: File) => {
    // 只处理文本文件
    if (!file.type.startsWith("text/") && !file.name.endsWith(".txt")) {
      alert("请选择文本文件");
      return;
    }

    setSelectedFile(file);
    const text = await file.text();
    onChange(text);
  };

  // 移除文件
  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 点击拖拽区域
  const handleClickDropZone = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`input-panel ${isDragOver ? "drag-over" : ""}`}>
      <div className="panel-header">
        <span className="panel-title">输入</span>
        <div className="panel-actions">
          <button className="btn-icon" onClick={onClear} title="清空">
            ✕
          </button>
        </div>
      </div>
      <div
        className="panel-content"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* 文件信息显示 */}
        {selectedFile && (
          <div className="file-info">
            <span className="file-name">{selectedFile.name}</span>
            <span className="file-remove" onClick={handleRemoveFile}>
              ✕
            </span>
          </div>
        )}

        {/* 拖拽区域 */}
        {!selectedFile && (
          <div
            className={`drop-zone ${isDragOver ? "drag-over" : ""}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClickDropZone}
          >
            <div className="drop-zone-text">拖拽文件到此处</div>
            <div className="drop-zone-hint">支持 .txt 等文本文件</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>
        )}

        {/* 文本输入区域 */}
        <textarea
          className="textarea"
          placeholder="请输入要翻译的文本..."
          value={value}
          onChange={handleTextChange}
        />
      </div>
    </div>
  );
}
