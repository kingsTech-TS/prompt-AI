/**
 * Turns raw API failures (status codes, FastAPI `detail` payloads, network errors)
 * into short, plain-English messages that tell the user what happened and what to do.
 */

export class ApiError extends Error {
  status: number;
  /** The raw backend detail, kept for debugging. */
  detail: unknown;

  constructor(message: string, status: number, detail?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

const GENERIC = "Something went wrong on our side. Please try again in a moment.";

// FastAPI validation errors: [{ loc: ["body", "email"], msg: "value is not a valid email address", ... }]
function validationMessage(detail: unknown): string | null {
  if (!Array.isArray(detail) || detail.length === 0) return null;
  const first = detail[0] as { loc?: unknown[]; msg?: string };
  const field = String(first.loc?.[first.loc.length - 1] ?? "");
  const msg = (first.msg ?? "").toLowerCase();

  if (field === "email" || msg.includes("email")) return "Please enter a valid email address.";
  if (field === "password") return "Please enter a valid password.";
  if (field === "username") return "Please enter a valid username.";
  if (field === "idea") return "Please describe your idea before generating.";
  if (field === "url") return "Please enter a valid website address, starting with https://";
  if (msg.includes("required") || msg.includes("missing")) return "Please fill in all the required fields.";
  return "Some of the details you entered aren't valid. Please check them and try again.";
}

/** Map a failed response to a message a non-technical user can act on. */
export function friendlyMessage(status: number, detail: unknown, path: string): string {
  const text = typeof detail === "string" ? detail : "";
  const lower = text.toLowerCase();

  // Specific backend messages first
  if (lower.includes("invalid email or password")) return "That email and password don't match. Please try again.";
  if (lower.includes("email already registered")) return "An account with this email already exists. Try signing in instead.";
  if (lower.includes("invalid or expired token")) return "This reset link is invalid or has expired. Please request a new one.";
  if (lower.includes("reached your limit")) {
    const n = text.match(/limit of (\d+)/)?.[1];
    const renews = text.match(/renew on ([^.]+)/)?.[1];
    const what = lower.includes("preview") ? "previews" : "prompts";
    return `You've used all ${n ? `${n} ` : ""}of this month's ${what}.${renews ? ` They renew on ${renews}.` : ""} Contact an admin to upgrade your plan.`;
  }
  if (lower.includes("admins are not allowed")) return "Admin accounts can't generate prompts. Sign in with a regular account to try it.";
  if (lower.includes("either 'images' or 'url'")) return "Add a website link or at least one screenshot to generate a prompt.";
  if (lower.startsWith("screenshot failed")) {
    return "We couldn't open that website. Check the link is correct and publicly accessible, or upload screenshots instead.";
  }
  if (lower.startsWith("screenshot upload failed") || lower.startsWith("image upload failed")) {
    return "We couldn't upload your images. Please try again, or use smaller PNG/JPG files.";
  }
  if (lower.startsWith("ai generation failed")) {
    return lower.includes("timeout") || lower.includes("timed out")
      ? "The AI took too long to respond. Please try again, or shorten your input."
      : "The AI couldn't generate your prompt this time. Please try again.";
  }
  if (lower.startsWith("preview generation failed")) {
    return lower.includes("timeout") || lower.includes("timed out")
      ? "The preview took too long to build. Please try again."
      : "We couldn't build a preview this time. Please try again.";
  }
  if (lower.includes("failed to send reset email") || lower.includes("smtp")) {
    return "We couldn't send the email right now. Please try again later.";
  }
  if (lower.includes("cannot delete your own account")) return "You can't delete your own admin account.";

  switch (status) {
    case 400:
      return text && text.length < 120 ? `${text.replace(/\.$/, "")}.` : "That request wasn't quite right. Please check your input and try again.";
    case 401:
      return path.includes("/auth/login")
        ? "That email and password don't match. Please try again."
        : "Your session has expired. Please sign in again.";
    case 403:
      return "You don't have permission to do that.";
    case 404:
      if (path.includes("/collections")) return "That collection no longer exists. It may have been deleted.";
      if (path.includes("/prompts") || path.includes("/chat")) return "We couldn't find that prompt. It may have been deleted.";
      if (path.includes("/admin")) return "That user no longer exists.";
      return "We couldn't find what you were looking for.";
    case 408:
    case 504:
      return "This is taking longer than expected. Please try again in a moment.";
    case 413:
      return "That file is too large. Please upload images under 10MB.";
    case 422:
      return validationMessage(detail) ?? "Some of the details you entered aren't valid. Please check them and try again.";
    case 429:
      return "You're going a bit fast. Please wait a moment and try again.";
    case 502:
    case 503:
      return "The service is temporarily unavailable. Please try again in a minute.";
    default:
      return GENERIC;
  }
}

/** Message for when the request never got a response (offline, DNS, CORS, server down). */
export function networkErrorMessage(): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You appear to be offline. Check your internet connection and try again.";
  }
  return "We couldn't reach the server. Check your connection and try again.";
}
