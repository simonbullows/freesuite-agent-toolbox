use serde::{Deserialize, Serialize};
use sysinfo::System;
use std::sync::Mutex;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::fs;
use std::io::Write;
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
                ToolParameter { name: "command".into(), param_type: "string".into(), description: "The command to execute".into(), required: true, default_value: None },
                ToolParameter { name: "cwd".into(), param_type: "string".into(), description: "Working directory for the command".into(), required: false, default_value: None },
            ],
            returns: "ShellResult with exit_code, stdout, stderr".into(),
            is_native: true,
        });

        // ── File System Tools ──
        tools.push(ToolSchema {
            id: "fs.read".into(), name: "Read File".into(),
            description: "Read file contents as text".into(), category: "filesystem".into(),
            parameters: vec![
                ToolParameter { name: "path".into(), param_type: "string".into(), description: "Absolute file path".into(), required: true, default_value: None },
            ],
            returns: "File contents as string".into(), is_native: true,
        });
        tools.push(ToolSchema {
            id: "fs.write".into(), name: "Write File".into(),
            description: "Write text content to a file (creates parent dirs)".into(), category: "filesystem".into(),
            parameters: vec![
                ToolParameter { name: "path".into(), param_type: "string".into(), description: "Absolute file path".into(), required: true, default_value: None },
                ToolParameter { name: "content".into(), param_type: "string".into(), description: "Content to write".into(), required: true, default_value: None },
                ToolParameter { name: "append".into(), param_type: "boolean".into(), description: "Append instead of overwrite".into(), required: false, default_value: Some("false".into()) },
            ],
            returns: "{ path, bytes_written }".into(), is_native: true,
        });
        tools.push(ToolSchema {
            id: "fs.list".into(), name: "List Directory".into(),
            description: "List files and folders in a directory".into(), category: "filesystem".into(),
            parameters: vec![
                ToolParameter { name: "path".into(), param_type: "string".into(), description: "Directory path".into(), required: true, default_value: None },
                ToolParameter { name: "recursive".into(), param_type: "boolean".into(), description: "Include subdirectories".into(), required: false, default_value: Some("false".into()) },
            ],
            returns: "Array of FileEntry objects".into(), is_native: true,
        });
        tools.push(ToolSchema {
            id: "fs.search".into(), name: "Search Files".into(),
            description: "Search file contents for a pattern (grep-like)".into(), category: "filesystem".into(),
            parameters: vec![
                ToolParameter { name: "path".into(), param_type: "string".into(), description: "Directory to search".into(), required: true, default_value: None },
                ToolParameter { name: "pattern".into(), param_type: "string".into(), description: "Text pattern to find".into(), required: true, default_value: None },
                ToolParameter { name: "extension".into(), param_type: "string".into(), description: "Filter by file extension (e.g. 'txt')".into(), required: false, default_value: None },
            ],
            returns: "Array of { file, line_number, line_content }".into(), is_native: true,
        });
        tools.push(ToolSchema {
            id: "fs.delete".into(), name: "Delete File/Folder".into(),
            description: "Delete a file or empty directory".into(), category: "filesystem".into(),
            parameters: vec![
                ToolParameter { name: "path".into(), param_type: "string".into(), description: "Path to delete".into(), required: true, default_value: None },
            ],
            returns: "{ deleted: true }".into(), is_native: true,
        });
        tools.push(ToolSchema {
            id: "fs.metadata".into(), name: "File Metadata".into(),
            description: "Get file size, dates, and type info".into(), category: "filesystem".into(),
            parameters: vec![
                ToolParameter { name: "path".into(), param_type: "string".into(), description: "File or directory path".into(), required: true, default_value: None },
            ],
            returns: "FileMetadata with size, created, modified, is_dir".into(), is_native: true,
        });

        // ── Web Tools ──
        tools.push(ToolSchema {
            id: "web.fetch".into(), name: "HTTP Fetch".into(),
            description: "Make an HTTP request and return the response body".into(), category: "web".into(),
            parameters: vec![
                ToolParameter { name: "url".into(), param_type: "string".into(), description: "URL to fetch".into(), required: true, default_value: None },
                ToolParameter { name: "method".into(), param_type: "string".into(), description: "HTTP method".into(), required: false, default_value: Some("GET".into()) },
            ],
            returns: "{ status, body, headers }".into(), is_native: true,
        });

        // ── Dependency Detection ──
        tools.push(ToolSchema {
            id: "deps.scan".into(), name: "Dependency Scanner".into(),
            description: "Detect which external tools are installed (FFmpeg, Git, Ollama, etc.)".into(), category: "system".into(),
            parameters: vec![],
            returns: "Array of { name, installed, version, path }".into(), is_native: true,
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
// FILE SYSTEM TOOLS — Read, write, list, search, delete, metadata
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size_bytes: u64,
    pub extension: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileMetadata {
    pub path: String,
    pub size_bytes: u64,
    pub is_dir: bool,
    pub is_file: bool,
    pub created: Option<String>,
    pub modified: Option<String>,
    pub extension: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchMatch {
    pub file: String,
    pub line_number: usize,
    pub line_content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WriteResult {
    pub path: String,
    pub bytes_written: usize,
}

#[tauri::command]
fn fs_read(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
fn fs_write(path: String, content: String, append: Option<bool>) -> Result<WriteResult, String> {
    let p = Path::new(&path);
    if let Some(parent) = p.parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create dirs: {}", e))?;
    }

    let bytes = content.as_bytes();
    if append.unwrap_or(false) {
        let mut file = fs::OpenOptions::new()
            .create(true).append(true).open(&path)
            .map_err(|e| format!("Failed to open for append: {}", e))?;
        file.write_all(bytes).map_err(|e| format!("Failed to append: {}", e))?;
    } else {
        fs::write(&path, bytes).map_err(|e| format!("Failed to write: {}", e))?;
    }

    Ok(WriteResult { path, bytes_written: bytes.len() })
}

#[tauri::command]
fn fs_list(path: String, recursive: Option<bool>) -> Result<Vec<FileEntry>, String> {
    let recurse = recursive.unwrap_or(false);
    let mut entries = Vec::new();
    collect_entries(Path::new(&path), recurse, &mut entries)?;
    Ok(entries)
}

fn collect_entries(dir: &Path, recursive: bool, entries: &mut Vec<FileEntry>) -> Result<(), String> {
    let read = fs::read_dir(dir).map_err(|e| format!("Failed to read dir {:?}: {}", dir, e))?;
    for entry in read.flatten() {
        let meta = entry.metadata().unwrap_or_else(|_| std::fs::metadata(entry.path()).unwrap());
        let path_str = entry.path().to_string_lossy().to_string();
        let name = entry.file_name().to_string_lossy().to_string();
        let ext = entry.path().extension()
            .map(|e| e.to_string_lossy().to_string())
            .unwrap_or_default();

        entries.push(FileEntry {
            name,
            path: path_str,
            is_dir: meta.is_dir(),
            size_bytes: meta.len(),
            extension: ext,
        });

        if recursive && meta.is_dir() {
            let _ = collect_entries(&entry.path(), true, entries);
        }
    }
    Ok(())
}

#[tauri::command]
fn fs_search(path: String, pattern: String, extension: Option<String>) -> Result<Vec<SearchMatch>, String> {
    let mut results = Vec::new();
    search_recursive(Path::new(&path), &pattern, &extension, &mut results, 0);
    Ok(results)
}

fn search_recursive(dir: &Path, pattern: &str, ext: &Option<String>, results: &mut Vec<SearchMatch>, depth: usize) {
    if depth > 10 || results.len() >= 200 { return; }
    let Ok(read) = fs::read_dir(dir) else { return; };

    let pat_lower = pattern.to_lowercase();
    for entry in read.flatten() {
        let path = entry.path();
        if path.is_dir() {
            search_recursive(&path, pattern, ext, results, depth + 1);
        } else if path.is_file() {
            if let Some(filter_ext) = ext {
                let file_ext = path.extension()
                    .map(|e| e.to_string_lossy().to_string())
                    .unwrap_or_default();
                if file_ext != *filter_ext { continue; }
            }
            if let Ok(content) = fs::read_to_string(&path) {
                for (i, line) in content.lines().enumerate() {
                    if line.to_lowercase().contains(&pat_lower) {
                        results.push(SearchMatch {
                            file: path.to_string_lossy().to_string(),
                            line_number: i + 1,
                            line_content: line.to_string(),
                        });
                        if results.len() >= 200 { return; }
                    }
                }
            }
        }
    }
}

#[tauri::command]
fn fs_delete(path: String) -> Result<serde_json::Value, String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir(&path).map_err(|e| format!("Failed to delete dir: {}", e))?;
    } else {
        fs::remove_file(&path).map_err(|e| format!("Failed to delete file: {}", e))?;
    }
    Ok(serde_json::json!({ "deleted": true, "path": path }))
}

#[tauri::command]
fn fs_metadata(path: String) -> Result<FileMetadata, String> {
    let meta = fs::metadata(&path).map_err(|e| format!("Failed to get metadata: {}", e))?;
    let ext = Path::new(&path).extension()
        .map(|e| e.to_string_lossy().to_string())
        .unwrap_or_default();

    Ok(FileMetadata {
        path,
        size_bytes: meta.len(),
        is_dir: meta.is_dir(),
        is_file: meta.is_file(),
        created: meta.created().ok().map(|t| {
            chrono::DateTime::<Utc>::from(t).to_rfc3339()
        }),
        modified: meta.modified().ok().map(|t| {
            chrono::DateTime::<Utc>::from(t).to_rfc3339()
        }),
        extension: ext,
    })
}

// ═══════════════════════════════════════════════════════════════════
// WEB TOOLS — HTTP fetch
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FetchResult {
    pub status: u16,
    pub body: String,
    pub content_type: String,
    pub duration_ms: u64,
}

#[tauri::command]
async fn web_fetch(url: String, method: Option<String>) -> Result<FetchResult, String> {
    let start = std::time::Instant::now();
    let client = reqwest::Client::new();
    let m = method.unwrap_or_else(|| "GET".into());

    let req = match m.to_uppercase().as_str() {
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "HEAD" => client.head(&url),
        _ => client.get(&url),
    };

    let resp = req.send().await.map_err(|e| format!("Fetch failed: {}", e))?;
    let status = resp.status().as_u16();
    let ct = resp.headers().get("content-type")
        .map(|v| v.to_str().unwrap_or("unknown").to_string())
        .unwrap_or_else(|| "unknown".into());
    let body = resp.text().await.map_err(|e| format!("Failed to read body: {}", e))?;

    Ok(FetchResult {
        status,
        body: if body.len() > 100_000 { body[..100_000].to_string() } else { body },
        content_type: ct,
        duration_ms: start.elapsed().as_millis() as u64,
    })
}

// ═══════════════════════════════════════════════════════════════════
// DEPENDENCY SCANNER — Detect installed external tools
// ═══════════════════════════════════════════════════════════════════

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DepInfo {
    pub name: String,
    pub installed: bool,
    pub version: Option<String>,
    pub category: String,
}

#[tauri::command]
fn scan_dependencies() -> Vec<DepInfo> {
    let checks = vec![
        ("FFmpeg",  "ffmpeg",      "-version", "media"),
        ("Git",     "git",         "--version", "development"),
        ("Ollama",  "ollama",      "--version", "ai"),
        ("Node.js", "node",        "--version", "development"),
        ("npm",     "npm",         "--version", "development"),
        ("Python",  "python",      "--version", "development"),
        ("Cargo",   "cargo",       "--version", "development"),
        ("Tesseract","tesseract",  "--version", "media"),
        ("ripgrep", "rg",          "--version", "filesystem"),
        ("ImageMagick","magick",   "--version", "media"),
    ];

    checks.iter().map(|(name, cmd, arg, cat)| {
        let result = std::process::Command::new(cmd)
            .arg(arg)
            .output();

        match result {
            Ok(out) if out.status.success() => {
                let ver_raw = String::from_utf8_lossy(&out.stdout).to_string();
                let version = ver_raw.lines().next()
                    .unwrap_or("unknown").trim().to_string();
                DepInfo {
                    name: name.to_string(),
                    installed: true,
                    version: Some(version),
                    category: cat.to_string(),
                }
            },
            _ => DepInfo {
                name: name.to_string(),
                installed: false,
                version: None,
                category: cat.to_string(),
            },
        }
    }).collect()
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
            // File system
            fs_read,
            fs_write,
            fs_list,
            fs_search,
            fs_delete,
            fs_metadata,
            // Web
            web_fetch,
            // Dependencies
            scan_dependencies,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
