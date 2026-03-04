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
  const dragCounter = useRef(0); // 用于追踪拖拽事件计数

  // 处理文本变化
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // 处理拖拽进入 - 使用 dragCounter 追踪
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    console.log('🟢 [DragEnter]', 'counter:', dragCounter.current, 'files:', e.dataTransfer.files.length, 'types:', e.dataTransfer.types);
    console.log('🟢 [DragEnter] target:', e.target);

    if (dragCounter.current === 1) {
      setIsDragOver(true);
      console.log('✅ Set isDragOver = true');
    }
  };

  // 处理拖拽离开
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    console.log('🔴 [DragLeave]', 'counter:', dragCounter.current, 'target:', e.target);

    if (dragCounter.current === 0) {
      setIsDragOver(false);
      console.log('❌ Set isDragOver = false');
    }
  };

  // 处理拖拽经过 - 必须阻止默认行为
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    // console.log('🟡 [DragOver]');
  };

  // 处理文件拖拽
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    console.log('🔵 [Drop]', files.length, 'files');
    console.log('🔵 [Drop] File info:', files[0]?.name, files[0]?.type, files[0]?.size);

    if (files && files.length > 0) {
      console.log('📦 Processing file:', files[0]);
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

        {/* 拖拽覆盖层 - 当拖拽时覆盖整个面板，防止 textarea 拦截事件 */}
        {isDragOver && (
          <div
            className="drag-overlay"
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="drag-overlay-text">释放以导入文件</div>
          </div>
        )}
      </div>
    </div>
  );
}
