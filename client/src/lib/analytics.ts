import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;

export function initAnalytics() {
  if (!POSTHOG_KEY) {
    console.warn("PostHog key not configured");
    return;
  }

  posthog.init(POSTHOG_KEY, {
    api_host: "https://us.i.posthog.com",
    loaded: (ph) => {
      // PostHog loaded successfully
      console.log("Analytics initialized");
    },
  });
}

export function trackEvent(
  event: string,
  properties?: Record<string, any>
) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties || {});
}

export function getAnalyticsOptOut(): boolean {
  try {
    return localStorage.getItem("par_analytics_optout") === "true";
  } catch {
    return false;
  }
}

export function setAnalyticsOptOut(optOut: boolean) {
  try {
    localStorage.setItem("par_analytics_optout", optOut ? "true" : "false");
  } catch {}
}

export const ALLOWED_EVENTS = {
  APP_OPENED: "app_opened",
  GAME_STARTED: "game_started",
  GAME_COMPLETED: "game_completed",
  PAYWALL_ENCOUNTERED: "paywall_encountered",
  PURCHASE_INITIATED: "purchase_initiated",
  PURCHASE_COMPLETED: "purchase_completed",
  TOOL_OPENED: "tool_opened",
  TUTORIAL_VIEWED: "tutorial_viewed",
  SETUP_TIME_RECORDED: "setup_time_recorded",
} as const;

export const initAnalytics_DEPRECATED = initAnalytics;
