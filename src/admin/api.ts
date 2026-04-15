interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiErrorEnvelope {
  success: false;
  error?: {
    code?: string;
    message?: string;
  };
}

export class APIClientError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "APIClientError";
    this.statusCode = statusCode;
  }
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export interface Transcript {
  id: string;
  title: string;
  conference?: string;
  loc?: string;
  channel_name?: string;
  speakers?: string[];
  event_date?: string;
  status?: "pending" | "processing" | "done" | "unknown";
  created_at?: string;
  raw_text?: string;
  corrected_text?: string;
  summary?: string;
  tags?: string[];
  categories?: string[];
  media_url?: string;
  duration_seconds?: number;
}

export interface HealthResponse {
  status: string;
  uptime: number;
  timestamp?: string;
  database?: {
    status?: string;
    latency?: number;
  };
  services?: {
    database?: {
      status?: string;
      message?: string;
      latency?: number;
    };
    gemini?: {
      status?: string;
      message?: string;
    };
  };
  memory?: {
    rss?: number;
    heapUsed?: number;
    heapTotal?: number;
    used?: number;
    total?: number;
    unit?: string;
  };
}

interface PaginatedTranscripts {
  transcripts: Transcript[];
  total: number;
  pages: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("admin_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;

    try {
      const json = (await res.json()) as ApiErrorEnvelope;
      if (json?.error?.message) {
        message = json.error.message;
      }
    } catch {
      // Keep default message when no parseable error body is available.
    }

    throw new APIClientError(message, res.status);
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  return json.data;
}

function normalizeStatus(value?: string): Transcript["status"] {
  if (value === "done" || value === "processing" || value === "pending") return value;
  return "unknown";
}

export const api = {
  async login(password: string): Promise<{ token: string }> {
    const data = await request<{ token: string }>("/api/v1/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ password }),
    });

    return { token: data.token };
  },

  async getTranscripts(
    page = 1,
    limit = 20,
    status?: string,
    search?: string,
  ): Promise<PaginatedTranscripts> {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (status) query.set("status", status);
    if (search) query.set("search", search);

    const data = await request<PaginatedTranscripts>(`/api/v1/admin/transcripts?${query.toString()}`);

    return {
      transcripts: (data.transcripts || []).map((item) => ({
        ...item,
        conference: item.conference || "Unknown conference",
        speakers: Array.isArray(item.speakers) ? item.speakers : [],
        status: normalizeStatus(item.status),
      })),
      total: data.total || 0,
      pages: data.pages || 1,
    };
  },

  async getTranscriptById(id: string): Promise<Transcript> {
    return request<Transcript>(`/api/v1/admin/transcripts/${id}`);
  },

  async updateTranscript(id: string, payload: Partial<Transcript>): Promise<Transcript> {
    return request<Transcript>(`/api/v1/admin/transcripts/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async deleteTranscript(id: string): Promise<void> {
    await request<unknown>(`/api/v1/admin/transcripts/${id}`, {
      method: "DELETE",
    });
  },

  async getHealth(): Promise<HealthResponse> {
    try {
      return await request<HealthResponse>("/api/v1/admin/health/detailed");
    } catch {
      return await request<HealthResponse>("/api/v1/admin/health");
    }
  },
};
