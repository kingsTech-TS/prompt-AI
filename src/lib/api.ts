import {
  UserCreate,
  UserLogin,
  UserResponse,
  UserWithToken,
  Token,
  PromptResponse,
  PaginatedPromptResponse,
  ChatSessionResponse,
  ChatMessage,
  ChatMessageRequest,
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

// Helper for JSON requests
async function fetchJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const authHeaders = getAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (options.headers) {
    const optionsHeaders = new Headers(options.headers);
    optionsHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Helper for FormData requests (for file uploads)
async function fetchFormData<T>(
  url: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers();
  
  const authHeaders = getAuthHeaders();
  Object.entries(authHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });

  if (options.headers) {
    const optionsHeaders = new Headers(options.headers);
    optionsHeaders.forEach((value, key) => {
      headers.set(key, value);
    });
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "POST",
    ...options,
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(errorData.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  register: (data: UserCreate) =>
    fetchJson<UserWithToken>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: UserLogin) =>
    fetchJson<Token>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMe: () => fetchJson<UserResponse>("/api/v1/auth/me"),
};

// Prompts API
export const promptsApi = {
  generate: (formData: FormData) =>
    fetchFormData<PromptResponse>("/api/v1/prompts/generate", formData),

  getAll: (page = 1, limit = 10) =>
    fetchJson<PaginatedPromptResponse>(
      `/api/v1/prompts?page=${page}&limit=${limit}`
    ),

  getById: (promptId: string) =>
    fetchJson<PromptResponse>(`/api/v1/prompts/${promptId}`),

  delete: (promptId: string) =>
    fetchJson<{ message: string }>(`/api/v1/prompts/${promptId}`, {
      method: "DELETE",
    }),
};

// Chat API
export const chatApi = {
  getSession: (promptId: string) =>
    fetchJson<ChatSessionResponse>(`/api/v1/chat/${promptId}`),

  sendMessage: (promptId: string, data: ChatMessageRequest) =>
    fetchJson<ChatMessage>(`/api/v1/chat/${promptId}/message`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  clearHistory: (promptId: string) =>
    fetchJson<ChatSessionResponse>(`/api/v1/chat/${promptId}/history`, {
      method: "DELETE",
    }),
};
