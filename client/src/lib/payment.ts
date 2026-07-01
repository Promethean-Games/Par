const UNLOCK_STATUS_KEY = "par_unlock_status";
const UNLOCK_EDITION_KEY = "par_unlock_edition";

export interface UnlockStatus {
  unlocked: boolean;
  edition?: "reracked" | "sequential";
  timestamp?: number;
}

export function getUnlockStatus(): UnlockStatus {
  try {
    const stored = localStorage.getItem(UNLOCK_STATUS_KEY);
    if (!stored) return { unlocked: false };
    return JSON.parse(stored);
  } catch {
    return { unlocked: false };
  }
}

export function setUnlockStatus(edition: "reracked" | "sequential") {
  const status: UnlockStatus = {
    unlocked: true,
    edition,
    timestamp: Date.now(),
  };
  localStorage.setItem(UNLOCK_STATUS_KEY, JSON.stringify(status));
}

export function clearUnlockStatus() {
  localStorage.removeItem(UNLOCK_STATUS_KEY);
}

/**
 * Check URL params for Stripe checkout success callback
 * Stripe redirects to ?unlock=success&edition=X&session_id=Y on payment
 */
export function checkStripeCallbackParams(): UnlockStatus | null {
  const params = new URLSearchParams(window.location.search);
  const unlock = params.get("unlock");
  const edition = params.get("edition") as "reracked" | "sequential" | null;

  if (unlock === "success" && edition) {
    setUnlockStatus(edition);
    // Clean up URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return getUnlockStatus();
  }

  return null;
}
