// apps/web/lib/api.ts
// Centralized API helper for all frontend-to-backend calls

async function parseJsonSafe(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { error: text };
  }
}

async function apiFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });

  const data = await parseJsonSafe(res);
  if (!res.ok) throw new Error(data?.error || `Request failed with status ${res.status}`);
  return data as T;
}

// =================== ATM ===================

export interface AtmData {
  _id: string;
  atmId: string;
  location: { lat: number; lng: number };
  branch: string;
  capacity: number;
  currentCash: number;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface AtmListResponse {
  data: AtmData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchAtmList(page = 1, limit = 200): Promise<AtmListResponse> {
  return apiFetch<AtmListResponse>(`/api/atm/list?page=${page}&limit=${limit}`);
}

export async function fetchAtmById(id: string) {
  return apiFetch<{ data: AtmData }>(`/api/atm/${id}`);
}

export async function syncAtms() {
  return apiFetch('/api/atm/sync', { method: 'POST' });
}

export async function importAtmsJson(data: { atms?: any[]; transactions?: any[] }) {
  return apiFetch<{ success: boolean; message: string; details?: { atmsUpdated?: number; transactionsUpdated?: number } }>('/api/atm/import', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function syncAtmsFromSheets(spreadsheetId: string) {
  return apiFetch<{ success: boolean; message: string }>('/api/atm/sync', {
    method: 'POST',
    body: JSON.stringify({ spreadsheetId }),
  });
}

export async function deleteAllAtms() {
  return apiFetch<{ success: boolean; message: string; details?: { atmsDeleted?: number; transactionsDeleted?: number } }>('/api/atm/clear', {
    method: 'DELETE',
  });
}

// =================== ANALYTICS ===================

export interface AnalyticsReport {
  // Latest AI Structure (V2)
  networkSize?: number;
  executiveSummary?: string;
  overallRecommendations?: string[];
  highPriorityActions?: {
    criticalUnderstocking: {
      atmId: string;
      issue: string;
      action: string;
    }[];
    severeOverstockingAndAnomalies: {
      atmId: string;
      issue: string;
      action: string;
    }[];
  };
  cashOptimizationOpportunities?: {
    category: string;
    description: string;
    atms: string[];
    action: string;
  }[];

  // Previous AI Structure (V1)
  network_summary?: {
    total_atms_in_network: number;
    analysis_period_days: number;
    general_observation: string;
    key_focus_areas: string[];
  };
  high_performance_atms_analysis?: {
    description: string;
    atms_with_immediate_attention: {
      id: string;
      issue: string;
      details: string;
      actionable_recommendation: string;
    }[];
    atms_with_overstocking_potential: {
      id: string;
      issue: string;
      details: string;
      actionable_recommendation: string;
    }[];
    general_recommendations: string;
  };
  low_performance_atms_analysis?: {
    description: string;
    atms_requiring_urgent_action: {
      id: string;
      issue: string;
      details: string;
      actionable_recommendation: string;
    }[];
    atms_with_cash_out_risk_despite_lower_volume: {
      id: string;
      issue: string;
      details: string;
      actionable_recommendation: string;
    }[];
    atms_with_overstocking_potential: {
      id: string;
      issue: string;
      details: string;
      actionable_recommendation: string;
    }[];
  };
  overall_optimization_opportunities?: {
    opportunity: string;
    details: string;
    impact: string;
  }[];

  // Legacy Structure
  daily_analysis?: {
    top_high_usage_atms: any[];
    cash_out_risk: any[];
    underperforming_atms: any[];
    anomalies: any[];
  };
  weekly_analysis?: {
    top_atms: any[];
    low_performing_atms: any[];
    trend_summary: string;
  };
  monthly_analysis?: {
    growth_zones: any[];
    declining_zones: any[];
    expansion_opportunities: any[];
  };
  location_intelligence?: {
    atm_id: string;
    status: string;
    reason: string;
    confidence: number;
  }[];
  event_analysis?: {
    high_impact_events: any[];
    holiday_effect: string;
    salary_day_effect: string;
  };
  optimization_recommendations?: {
    refill_strategy: string;
    cash_distribution_plan: string;
    logistics_cost_reduction: string;
  };
  risk_analysis?: {
    critical_atms: any[];
    warning_atms: any[];
  };
  final_summary?: string;
}

export async function fetchAnalytics(): Promise<{ data: AnalyticsReport }> {
  return apiFetch<{ data: AnalyticsReport }>('/api/analytics');
}

export async function sendAnalyticsChat(message: string): Promise<{ reply: string }> {
  return apiFetch<{ reply: string }>('/api/analytics/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// =================== ALERTS ===================

export interface AlertData {
  _id: string;
  atmId: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  triggeredAt: string;
  resolved: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchAlerts(resolved?: boolean): Promise<{ data: AlertData[] }> {
  const params = resolved !== undefined ? `?resolved=${resolved}` : '';
  return apiFetch<{ data: AlertData[] }>(`/api/alerts${params}`);
}

export async function createAlert(alert: { atmId: string; severity: string; message: string }) {
  return apiFetch('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  });
}

export async function resolveAlert(alertId: string) {
  return apiFetch(`/api/alerts/${alertId}/resolve`, {
    method: 'PATCH',
  });
}

// =================== PREDICTIONS ===================

export interface PredictionData {
  _id: string;
  atmId: string;
  predictedCashDemand: number;
  riskScore: number;
  confidence: number;
  predictedTimeToCashout: number;
  modelVersion: string;
  timestamp: string;
}

export async function fetchPrediction(atmId: string): Promise<{ data: PredictionData }> {
  return apiFetch<{ data: PredictionData }>('/api/predict', {
    method: 'POST',
    body: JSON.stringify({ atmId }),
  });
}

export async function fetchAllPredictions(): Promise<{ data: PredictionData[] }> {
  return apiFetch<{ data: PredictionData[] }>('/api/predict/all');
}

// =================== OPTIMIZATION (ROUTES) ===================

export interface OptimizedRoute {
  route: string[];
  totalDistance: number;
  priorityScore: number;
}

export async function fetchOptimizedRoutes(): Promise<{ data: OptimizedRoute[] }> {
  return apiFetch<{ data: OptimizedRoute[] }>('/api/optimize', {
    method: 'POST',
  });
}

// =================== ADMIN ===================

export interface UserData {
  _id: string;
  name: string;
  email: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchAdminUsers(): Promise<{ data: UserData[] }> {
  return apiFetch<{ data: UserData[] }>('/api/admin/users');
}

export async function updateUserRole(userId: string, role: string) {
  return apiFetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
}

export async function generateTestData() {
  return apiFetch('/api/admin/generate-data');
}

// =================== LOGS ===================

export interface LogData {
  _id: string;
  level: string;
  message: string;
  source?: string;
  metadata?: any;
  timestamp: string;
}

export async function fetchLogs(limit = 100, level?: string): Promise<{ data: LogData[] }> {
  const params = new URLSearchParams();
  params.set('limit', limit.toString());
  if (level) params.set('level', level);
  return apiFetch<{ data: LogData[] }>(`/api/logs?${params.toString()}`);
}

export async function createLog(log: { level: string; message: string; source?: string; metadata?: any }) {
  return apiFetch('/api/logs', {
    method: 'POST',
    body: JSON.stringify(log),
  });
}

// =================== SETTINGS ===================

export async function updateProfile(data: { name?: string; email?: string }) {
  return apiFetch('/api/auth/update-profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  return apiFetch('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
