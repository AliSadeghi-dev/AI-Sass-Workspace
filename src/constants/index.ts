export const PROJECT_NAME = "AI Saas Workspace";

export const AVATAR_BUCKET = "saas-workspace-avatars";
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PROMPT_CATEGORIES = [
  "GENERAL",
  "Coding",
  "Writing",
  "Marketing",
  "Productivity",
] as const;

export const PLAN_TIER_ORDER: Record<string, number> = {
  free: 0,
  pro: 1,
  pro_plus: 2,
  enterprise: 3,
};

export const CREDITS_CONSUMED_EVENT = "credits:consumed";
