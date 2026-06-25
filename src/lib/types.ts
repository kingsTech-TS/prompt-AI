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

interface UserResponse extends UserBase {
  id: string;
  role: "user" | "admin";
  subscription: "free" | "pro";
  max_prompts: number;
  prompts_used: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUpdateUserRequest {
  role?: "user" | "admin";
  subscription?: "free" | "pro";
  max_prompts?: number;
}

export interface BulkEmailRequest {
  subject: string;
  body: string;
  target: "all" | "free" | "pro";
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
  content: string;
}

export interface IdeaGenerateRequest {
  idea: string;
  collection_id?: string;
  output_mode: "full" | "phased";
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

  created_at: string;
  updated_at: string;
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
