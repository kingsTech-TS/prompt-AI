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
  created_at: string;
  updated_at: string;
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

type SourceType = "url" | "image" | "both";

interface PromptResponse {
  id: string;
  user_id: string;
  title: string;
  source_type: SourceType;
  source_url?: string;
  cloudinary_images: ImageData[];
  generated_prompt: string;
  chat_session_id: string;
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
