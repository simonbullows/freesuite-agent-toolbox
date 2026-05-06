use serde::{Deserialize, Serialize};
use sysinfo::System;
use std::sync::Mutex;
use std::collections::HashMap;
use tauri::State;
use chrono::Utc;
use uuid::Uuid;

// ═══════════════════════════════════════════════════════════════════
// TOOL REGISTRY — The core MCP-compatible tool registration system
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolSchema {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub parameters: Vec<ToolParameter>,
    pub returns: String,
    pub is_native: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolParameter {
    pub name: String,
    pub param_type: String,
    pub description: String,
    pub required: bool,
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolExecution {
    pub id: String,
    pub tool_id: String,
    pub status: String, // "queued" | "running" | "completed" | "failed"
    pub input: serde_json::Value,
    pub output: Option<serde_json::Value>,
    pub error: Option<String>,
    pub started_at: Option<String>,
    pub completed_at: Option<String>,
    pub duration_ms: Option<u64>,
    pub invoked_by: String, // "user" | "agent:hermes" | "agent:antigravity"
}

pub struct ToolRegistryState {
    pub tools: Mutex<Vec<ToolSchema>>,
    pub executions: Mutex<Vec<ToolExecution>>,
}

impl Default for ToolRegistryState {
    fn default() -> Self {
        let mut tools = Vec::new();

        // Register built-in native tools
        tools.push(ToolSchema {
            id: "system.scan".into(),
            name: "System Scanner".into(),
            description: "Scan local hardware: CPU, GPU, RAM, disk, and OS info".into(),
            category: "system".into(),
            parameters: vec![],
            returns: "SystemScan object with hardware details".into(),
            is_native: true,
        });

        tools.push(ToolSchema {
            id: "system.processes".into(),
            name: "Process List".into(),
            description: "List running processes with CPU and memory usage".into(),
            category: "system".into(),
            parameters: vec![
                ToolParameter {
                    name: "sort_by".into(),
                    param_type: "string".into(),
                    description: "Sort by 'cpu', 'memory', or 'name'".into(),
                    required: false,
                    default_value: Some("memory".into()),
                },
                ToolParameter {
                    name: "limit".into(),
                    param_type: "number".into(),
                    description: "Max processes to return".into(),
                    required: false,
                    default_value: Some("20".into()),
                },
            ],
            returns: "Array of ProcessInfo objects".into(),
            is_native: true,
        });

        tools.push(ToolSchema {
            id: "file.download".into(),
            name: "File Downloader".into(),
            description: "Download a file from a URL to local disk with progress tracking".into(),
            category: "file".into(),
            parameters: vec![
                ToolParameter {
                    name: "url".into(),
                    param_type: "string".into(),
                    description: "URL to download from".into(),
                    required: true,
                    default_value: None,
                },
                ToolParameter {
                    name: "destination".into(),
                    param_type: "string".into(),
                    description: "Local file path to save to".into(),
                    required: true,
                    default_value: None,
                },
            ],
            returns: "DownloadResult with file path and size".into(),
            is_native: true,
        });

        tools.push(ToolSchema {
            id: "shell.execute".into(),
            name: "Shell Command".into(),
            description: "Execute a shell command and return stdout/stderr".into(),
            category: "system".into(),
            parameters: vec![
                ToolParameter {
                    name: "command".into(),
                    param_type: "string".into(),
                    description: "The command to execute".into(),
                    required: true,
                    default_value: None,
                },
                ToolParameter {
                    name: "cwd".into(),
                    param_type: "string".into(),
                    description: "Working directory for the command".into(),
                    required: false,
                    default_value: None,
                },
            ],
            returns: "ShellResult with exit_code, stdout, stderr".into(),
            is_native: true,
        });

        Self {
            tools: Mutex::new(tools),
            executions: Mutex::new(Vec::new()),
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// TOOL REGISTRY COMMANDS
// ═══════════════════════════════════════════════════════════════════

#[tauri::command]
fn list_tools(registry: State<ToolRegistryState>) -> Vec<ToolSchema> {
    registry.tools.lock().unwrap().clone()
}

#[tauri::command]
fn get_tool(registry: State<ToolRegistryState>, tool_id: String) -> Option<ToolSchema> {
    registry.tools.lock().unwrap().iter().find(|t| t.id == tool_id).cloned()
}

#[tauri::command]
fn list_executions(registry: State<ToolRegistryState>) -> Vec<ToolExecution> {
    registry.executions.lock().unwrap().clone()
}

#[tauri::command]
fn log_execution(registry: State<ToolRegistryState>, execution: ToolExecution) {
    registry.executions.lock().unwrap().push(execution);
}

// ═══════════════════════════════════════════════════════════════════
// SYSTEM SCANNER — Ported from FreeSuite, battle-tested
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemScan {
    pub os_name: String,
    pub os_version: String,
    pub hostname: String,
    pub cpu_brand: String,
    pub cpu_cores: usize,
    pub total_memory_gb: f64,
    pub used_memory_gb: f64,
    pub disks: Vec<DiskInfo>,
    pub scanned_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub mount_point: String,
    pub total_gb: f64,
    pub available_gb: f64,
    pub fs_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub memory_mb: f64,
}

#[tauri::command]
fn scan_system() -> SystemScan {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_brand = sys.cpus().first()
        .map(|c| c.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());

    let disks: Vec<DiskInfo> = sysinfo::Disks::new_with_refreshed_list()
        .iter()
        .map(|d| DiskInfo {
            name: d.name().to_string_lossy().to_string(),
            mount_point: d.mount_point().to_string_lossy().to_string(),
            total_gb: d.total_space() as f64 / 1_073_741_824.0,
            available_gb: d.available_space() as f64 / 1_073_741_824.0,
            fs_type: String::from_utf8_lossy(d.file_system()).to_string(),
        })
        .collect();

    SystemScan {
        os_name: System::name().unwrap_or_else(|| "Unknown".into()),
        os_version: System::os_version().unwrap_or_else(|| "Unknown".into()),
        hostname: System::host_name().unwrap_or_else(|| "Unknown".into()),
        cpu_brand,
        cpu_cores: sys.cpus().len(),
        total_memory_gb: sys.total_memory() as f64 / 1_073_741_824.0,
        used_memory_gb: sys.used_memory() as f64 / 1_073_741_824.0,
        disks,
        scanned_at: Utc::now().to_rfc3339(),
    }
}

#[tauri::command]
fn list_processes(sort_by: Option<String>, limit: Option<usize>) -> Vec<ProcessInfo> {
    let mut sys = System::new_all();
    sys.refresh_all();
    // Second refresh for accurate CPU readings
    std::thread::sleep(std::time::Duration::from_millis(200));
    sys.refresh_all();

    let sort = sort_by.unwrap_or_else(|| "memory".into());
    let max = limit.unwrap_or(20);

    let mut procs: Vec<ProcessInfo> = sys.processes().values().map(|p| {
        ProcessInfo {
            pid: p.pid().as_u32(),
            name: p.name().to_string_lossy().to_string(),
            cpu_usage: p.cpu_usage(),
            memory_mb: p.memory() as f64 / 1_048_576.0,
        }
    }).collect();

    match sort.as_str() {
        "cpu" => procs.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap_or(std::cmp::Ordering::Equal)),
        "name" => procs.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase())),
        _ => procs.sort_by(|a, b| b.memory_mb.partial_cmp(&a.memory_mb).unwrap_or(std::cmp::Ordering::Equal)),
    }

    procs.truncate(max);
    procs
}

// ═══════════════════════════════════════════════════════════════════
// SHELL EXECUTOR — Run commands and return output
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShellResult {
    pub exit_code: i32,
    pub stdout: String,
    pub stderr: String,
    pub duration_ms: u64,
}

#[tauri::command]
fn execute_shell(command: String, cwd: Option<String>) -> Result<ShellResult, String> {
    let start = std::time::Instant::now();

    let mut cmd = std::process::Command::new(if cfg!(windows) { "powershell" } else { "sh" });

    if cfg!(windows) {
        cmd.args(["-NoProfile", "-Command", &command]);
    } else {
        cmd.args(["-c", &command]);
    }

    if let Some(dir) = cwd {
        cmd.current_dir(dir);
    }

    let output = cmd.output().map_err(|e| format!("Failed to execute: {}", e))?;
    let duration = start.elapsed().as_millis() as u64;

    Ok(ShellResult {
        exit_code: output.status.code().unwrap_or(-1),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        duration_ms: duration,
    })
}

// ═══════════════════════════════════════════════════════════════════
// APP ENTRY
// ═══════════════════════════════════════════════════════════════════

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(ToolRegistryState::default())
        .invoke_handler(tauri::generate_handler![
            // Tool registry
            list_tools,
            get_tool,
            list_executions,
            log_execution,
            // System
            scan_system,
            list_processes,
            // Shell
            execute_shell,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
