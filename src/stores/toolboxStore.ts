import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export interface ToolSchema {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  returns: string;
  is_native: boolean;
}

export interface ToolParameter {
  name: string;
  param_type: string;
  description: string;
  required: boolean;
  default_value: string | null;
}

export interface ToolExecution {
  id: string;
  tool_id: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: unknown;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  invoked_by: string;
}

export interface SystemScan {
  os_name: string;
  os_version: string;
  hostname: string;
  cpu_brand: string;
  cpu_cores: number;
  total_memory_gb: number;
  used_memory_gb: number;
  disks: DiskInfo[];
  scanned_at: string;
}

export interface DiskInfo {
  name: string;
  mount_point: string;
  total_gb: number;
  available_gb: number;
  fs_type: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu_usage: number;
  memory_mb: number;
}

export interface DepInfo {
  name: string;
  installed: boolean;
  version: string | null;
  category: string;
}

interface ToolboxStore {
  // Tools
  tools: ToolSchema[];
  loadingTools: boolean;
  fetchTools: () => Promise<void>;

  // Executions
  executions: ToolExecution[];
  fetchExecutions: () => Promise<void>;

  // System
  systemScan: SystemScan | null;
  scanningSystem: boolean;
  scanSystem: () => Promise<void>;

  // Processes
  processes: ProcessInfo[];
  loadingProcesses: boolean;
  fetchProcesses: (sortBy?: string, limit?: number) => Promise<void>;

  // Dependencies
  dependencies: DepInfo[];
  scanningDeps: boolean;
  scanDependencies: () => Promise<void>;
}

export const useToolboxStore = create<ToolboxStore>((set) => ({
  // Tools
  tools: [],
  loadingTools: false,
  fetchTools: async () => {
    set({ loadingTools: true });
    try {
      const tools = await invoke<ToolSchema[]>('list_tools');
      set({ tools, loadingTools: false });
    } catch (err) {
      console.error('Failed to fetch tools:', err);
      set({ loadingTools: false });
    }
  },

  // Executions
  executions: [],
  fetchExecutions: async () => {
    try {
      const executions = await invoke<ToolExecution[]>('list_executions');
      set({ executions });
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    }
  },

  // System
  systemScan: null,
  scanningSystem: false,
  scanSystem: async () => {
    set({ scanningSystem: true });
    try {
      const scan = await invoke<SystemScan>('scan_system');
      set({ systemScan: scan, scanningSystem: false });
    } catch (err) {
      console.error('Failed to scan system:', err);
      set({ scanningSystem: false });
    }
  },

  // Processes
  processes: [],
  loadingProcesses: false,
  fetchProcesses: async (sortBy = 'memory', limit = 20) => {
    set({ loadingProcesses: true });
    try {
      const processes = await invoke<ProcessInfo[]>('list_processes', {
        sortBy,
        limit,
      });
      set({ processes, loadingProcesses: false });
    } catch (err) {
      console.error('Failed to fetch processes:', err);
      set({ loadingProcesses: false });
    }
  },

  // Dependencies
  dependencies: [],
  scanningDeps: false,
  scanDependencies: async () => {
    set({ scanningDeps: true });
    try {
      const deps = await invoke<DepInfo[]>('scan_dependencies');
      set({ dependencies: deps, scanningDeps: false });
    } catch (err) {
      console.error('Failed to scan dependencies:', err);
      set({ scanningDeps: false });
    }
  },
}));
