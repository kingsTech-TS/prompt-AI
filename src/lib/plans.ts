import { Plan, UserResponse } from "@/lib/types";

/** Monthly prompt allowance per plan. Keep in sync with PLAN_LIMITS in the backend (utils/quota.py). */
export const PLANS: { id: Plan; label: string; limit: number }[] = [
  { id: "free", label: "Free", limit: 3 },
  { id: "pro", label: "Pro", limit: 5 },
  { id: "super", label: "Super", limit: 10 },
];

export const planById = (id: Plan) => PLANS.find((p) => p.id === id) ?? PLANS[0];

/** Everything the UI needs to show a user's monthly usage, including unlimited accounts. */
export function promptUsage(user: UserResponse) {
  const unlimited = user.unlimited_prompts;
  const remaining = unlimited ? Infinity : Math.max(0, user.max_prompts - user.prompts_used);
  const resetsOn = user.usage_resets_at
    ? new Date(user.usage_resets_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;
  return {
    unlimited,
    remaining,
    limitReached: !unlimited && user.prompts_used >= user.max_prompts,
    percent: unlimited || user.max_prompts <= 0 ? 0 : Math.min(100, (user.prompts_used / user.max_prompts) * 100),
    /** "2 / 5" or "2 / ∞" */
    usedLabel: `${user.prompts_used} / ${unlimited ? "∞" : user.max_prompts}`,
    remainingLabel: unlimited ? "Unlimited prompts" : `${remaining} ${remaining === 1 ? "prompt" : "prompts"} left this month`,
    resetsOn,
  };
}

/** Preview generations share the prompt limit: a plan with N prompts gets N previews a month. */
export function previewUsage(user: UserResponse) {
  const unlimited = user.unlimited_prompts;
  const used = user.previews_used ?? 0;
  const remaining = unlimited ? Infinity : Math.max(0, user.max_prompts - used);
  return {
    unlimited,
    remaining,
    limitReached: !unlimited && remaining <= 0,
    usedLabel: `${used} / ${unlimited ? "∞" : user.max_prompts}`,
    remainingLabel: unlimited
      ? "Unlimited previews"
      : `${remaining} ${remaining === 1 ? "preview" : "previews"} left this month`,
  };
}
