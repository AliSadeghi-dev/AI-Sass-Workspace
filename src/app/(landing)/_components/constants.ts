import {
  BookMarked,
  Bot,
  FolderKanban,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Sparkles,
  Zap,
} from "lucide-react";

export const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#mvp", label: "MVP" },
] as const;

export const features = [
  {
    icon: Lock,
    title: "Authentication",
    description:
      "Signup, login, sessions, and protected routes so every workspace stays private.",
    status: "MVP",
  },
  {
    icon: LayoutDashboard,
    title: "User Dashboard",
    description:
      "Your central hub — recent chats, saved prompts, and quick actions in one place.",
    status: "MVP",
  },
  {
    icon: FolderKanban,
    title: "Workspaces",
    description:
      "Create, switch, and isolate contexts — startup ideas, coding help, design, and more.",
    status: "MVP",
  },
  {
    icon: MessageSquare,
    title: "AI Chat",
    description:
      "Streaming conversations with markdown and code blocks, scoped to each workspace.",
    status: "MVP",
  },
  {
    icon: Bot,
    title: "Message Persistence",
    description:
      "Save user and AI messages, load history, and pick up exactly where you left off.",
    status: "MVP",
  },
  {
    icon: BookMarked,
    title: "Prompt Library",
    description:
      "Create, categorize, favorite, and reuse prompts directly inside chat.",
    status: "Soon",
  },
  {
    icon: Sparkles,
    title: "Settings",
    description: "Theme, profile, and personalization — dark mode included.",
    status: "Soon",
  },
  {
    icon: Zap,
    title: "SaaS & Billing",
    description:
      "Subscriptions, Stripe checkout, and usage limits when you're ready to monetize.",
    status: "Phase 2",
  },
] as const;

export const phases = [
  {
    step: "01",
    title: "Foundation",
    items: "Auth · Database · Protected routes",
  },
  {
    step: "02",
    title: "Core Product",
    items: "Dashboard · Workspaces · Navigation",
  },
  {
    step: "03",
    title: "AI Chat Engine",
    items: "Streaming · History · Markdown",
  },
  {
    step: "04",
    title: "Productivity",
    items: "Prompt library · Search & filter",
  },
  { step: "05", title: "Polish", items: "Settings · Loading · Mobile UX" },
  { step: "06", title: "SaaS Layer", items: "Stripe · Plans · Usage limits" },
] as const;

export const mvpItems = [
  "Login system",
  "Workspace system",
  "AI chat with streaming",
  "Save & load conversations",
  "Basic dashboard",
] as const;

export const keyPrinciples = [
  "Build core first — chat and workspace.",
  "Everything else is secondary.",
  "Avoid overengineering early.",
  "Focus on a working product, not perfect architecture.",
] as const;
