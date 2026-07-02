const UNLOCK_STATUS_KEY = "par_unlock_status";
const REVIEWER_UNLOCK_KEY = "par_reviewer_unlock";
const REVIEWER_CODE = "PFTC-REVIEWER-2026";

export interface UnlockStatus {
  unlocked: boolean;
  edition?: "reracked" | "sequential";
  timestamp?: number;
  isReviewerUnlock?: boolean;
}

export function getUnlockStatus(): UnlockStatus {
  try {
    const stored = localStorage.getItem(UNLOCK_STATUS_KEY);
    if (!stored) return { unlocked: false };
    const status = JSON.parse(stored);
    return status;
  } catch {
    return { unlocked: false };
  }
}

/**
 * Get current unlock status, checking both regular unlock and reviewer unlock
 */
export function getEffectiveUnlockStatus(): UnlockStatus {
  const reviewerUnlocked = isReviewerUnlocked();
  if (reviewerUnlocked) {
    return {
      unlocked: true,
      edition: "sequential", // Grant both editions for reviewer
      isReviewerUnlock: true,
    };
  }
  return getUnlockStatus();
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
 * Check if reviewer mode is unlocked
 */
export function isReviewerUnlocked(): boolean {
  try {
    return localStorage.getItem(REVIEWER_UNLOCK_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Unlock reviewer mode with the correct code
 */
export function unlockReviewerMode(code: string): boolean {
  if (code === REVIEWER_CODE) {
    localStorage.setItem(REVIEWER_UNLOCK_KEY, "true");
    return true;
  }
  return false;
}

/**
 * Clear reviewer unlock
 */
export function clearReviewerUnlock() {
  localStorage.removeItem(REVIEWER_UNLOCK_KEY);
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
