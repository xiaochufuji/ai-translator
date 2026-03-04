use reqwest::Client;
use serde::{Deserialize, Serialize};

// LLM 配置结构
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LLMConfig {
    pub api_key: String,
    pub base_url: Option<String>,
    pub model: String,
    pub timeout: u64,
}

// 翻译错误类型
#[derive(Debug, Serialize)]
pub struct TranslationError {
    pub message: String,
}

/// 调用 LLM API 进行翻译
#[tauri::command]
async fn translate(
    text: String,
    target_language: String,
    api_key: String,
    base_url: Option<String>,
    model: String,
    timeout: u64,
) -> Result<String, TranslationError> {
    // 记录输入文本长度
    let text_length = text.len();
    eprintln!("[DEBUG] Input text length: {}", text_length);

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(timeout))
        .build()
        .map_err(|e| TranslationError {
            message: format!("创建 HTTP 客户端失败：{}", e),
        })?;

    let base_url = base_url.unwrap_or_else(|| "https://api.openai.com/v1".to_string());

    let system_prompt = "你是一个专业翻译引擎。保持原文格式，不要添加解释，只输出译文。".to_string();
    let user_prompt = format!(
        "请将以下文本翻译成{}。\n\n原文:\n{}",
        target_language, text
    );

    let request_body = serde_json::json!({
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            }
        ],
        "stream": false
    });

    let url = format!("{}/chat/completions", base_url);

    eprintln!("[DEBUG] Request URL: {}", url);
    eprintln!("[DEBUG] Model: {}", model);
    eprintln!("[DEBUG] Target: {}", target_language);
    eprintln!("[DEBUG] Timeout: {}s", timeout);

    let response = client
        .post(&url)
        .header("Content-Type", "application/json")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| {
            let error_msg = e.to_string();
            // 区分超时和其他错误
            if error_msg.contains("timeout") || error_msg.contains("timed out") {
                TranslationError {
                    message: format!("请求超时（{}s）：文本长度 {} 字符，请增加超时时间或分段翻译", timeout, text_length),
                }
            } else {
                TranslationError {
                    message: format!("API 请求失败：{}", e),
                }
            }
        })?;

    let status = response.status();
    eprintln!("[DEBUG] Response status: {}", status);

    if !status.is_success() {
        let error_text = response.text().await.unwrap_or_default();
        eprintln!("[DEBUG] Error body: {}", error_text);

        // 根据状态码提供更友好的错误信息
        let error_message = match status.as_u16() {
            401 => "API Key 无效或已过期".to_string(),
            429 => "请求频率受限或配额已用完".to_string(),
            400 => format!("请求参数错误：{}", error_text),
            500 => "API 服务器内部错误".to_string(),
            503 => "API 服务暂时不可用".to_string(),
            _ => format!("HTTP {}", status),
        };

        return Err(TranslationError {
            message: format!("{}: {}", error_message, error_text),
        });
    }

    let result: serde_json::Value = response.json().await.map_err(|e| TranslationError {
        message: format!("解析响应失败：{}", e),
    })?;

    eprintln!("[DEBUG] Response parsed successfully");

    result
        .pointer("/choices/0/message/content")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| TranslationError {
            message: format!("API 返回格式异常：{}", result),
        })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![translate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
