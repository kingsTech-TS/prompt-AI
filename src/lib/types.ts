// User Types
interface UserBase {
  email: string;
  username: string;
  profile_picture_url?: string;
}

interface UserCreate extends UserBase {
  password: string;
}

interface UserLogin {
  email: string;
  password: string;
}

export type Plan = "free" | "pro" | "super";

interface UserResponse extends UserBase {
  id: string;
  role: "user" | "admin";
  subscription: Plan;
  /** Monthly limit (ignored when unlimited_prompts is true). */
  max_prompts: number;
  /** Prompts used in the current month. */
  prompts_used: number;
  /** Preview generations used in the current month (same limit as prompts). */
  previews_used: number;
  unlimited_prompts: boolean;
  /** When the monthly allowance renews. */
  usage_resets_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUpdateUserRequest {
  role?: "user" | "admin";
  subscription?: Plan;
  max_prompts?: number;
  unlimited_prompts?: boolean;
  /** Set this month's usage back to 0. */
  reset_usage?: boolean;
}

export interface BulkEmailRequest {
  subject: string;
  body: string;
  target: "all" | Plan;
}

interface Token {
  access_token: string;
  token_type: string;
}

interface UserWithToken extends UserResponse {
  access_token: string;
}

// Forgot Password Types
interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  message: string;
}

// Reset Password Types
interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

interface ResetPasswordResponse {
  message: string;
}

// Prompt Types
interface ImageData {
  url: string;
  public_id: string;
}

export interface TechItem {
  name: string;
  category: string;
}

export type CollectionType = "frontend" | "backend" | "data" | "custom";

export interface CollectionResponse {
  id: string;
  user_id: string;
  name: string;
  type: CollectionType;
  technologies: TechItem[];
  created_at: string;
  updated_at: string;
}

export interface CollectionCreate {
  name: string;
  type: CollectionType;
  technologies: TechItem[];
}

export interface SubCollectionCreate {
  name: string;
  collection_ids: string[];
}

export interface SubCollectionResponse {
  id: string;
  user_id: string;
  name: string;
  collection_ids: string[];
  collections?: CollectionResponse[];
  created_at: string;
  updated_at: string;
}

export interface EnvVariable {
  key: string;
  description: string;
  example: string;
}

export interface DbSchemaField {
  name: string;
  type: string;
  required: boolean;
}

export interface DbSchema {
  name: string;
  fields: DbSchemaField[];
}

export interface IdeaPhase {
  phase_number: number;
  title: string;
  goal?: string | null;
  content: string;
}

export interface IdeaRole {
  name: string;
  description: string;
  permissions: string[];
}

/** What the AI inferred about the system from the user's idea. */
export interface IdeaAnalysis {
  app_type?: string | null;
  target_users: string[];
  roles: IdeaRole[];
  needs_admin_dashboard?: boolean | null;
  dashboard_reason?: string | null;
  core_features: string[];
  integrations: string[];
}

export type TargetAgent = "general" | "claude_code" | "codex" | "cursor" | "antigravity";

export interface IdeaGenerateRequest {
  idea: string;
  collection_id?: string;
  output_mode: "full" | "phased";
  target_agent: TargetAgent;
}

type SourceType = "url" | "image" | "both" | "idea";

interface PromptResponse {
  id: string;
  user_id: string;
  title: string;
  source_type: SourceType;
  source_url?: string;
  cloudinary_images: ImageData[];
  generated_prompt: string;
  chat_session_id: string;
  
  // Idea-specific fields
  idea_text?: string;
  recommended_stack?: Record<string, string[]>;
  full_prompt?: string;
  phases?: IdeaPhase[];
  env_variables?: EnvVariable[];
  db_schemas?: DbSchema[];
  collection_id?: string;
  summary?: string | null;
  analysis?: IdeaAnalysis | null;
  target_agent?: TargetAgent | null;

  created_at: string;
  updated_at: string;
}

/** A rendered HTML preview of the interface a UI prompt describes. `html` is null until one is generated. */
export interface PreviewResponse {
  html: string | null;
  generated_at: string | null;
}

interface PaginatedPromptResponse {
  prompts: PromptResponse[];
  total: number;
  page: number;
  limit: number;
}

// Chat Types
type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: string;
}

interface ChatSessionResponse {
  id: string;
  prompt_id: string;
  user_id: string;
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

interface ChatMessageRequest {
  message: string;
}

export type {
  UserBase,
  UserCreate,
  UserLogin,
  UserResponse,
  Token,
  UserWithToken,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ImageData,
  SourceType,
  PromptResponse,
  PaginatedPromptResponse,
  ChatRole,
  ChatMessage,
  ChatSessionResponse,
  ChatMessageRequest,
};
