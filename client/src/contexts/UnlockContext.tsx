import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { isRunningInTwa, initiatePlayBillingCheckout, checkPendingPurchases } from "@/lib/play-billing";
import { isReviewerUnlocked } from "@/lib/payment";

// Editions that can be individually purchased
const PURCHASABLE_EDITIONS = ["reracked", "sequential"] as const;
type PurchasableEdition = typeof PURCHASABLE_EDITIONS[number];

function storageKey(edition: string) {
  return `pftc_unlocked_${edition}`;
}

function loadUnlocked(): Set<string> {
  const set = new Set<string>();
  try {
    for (const ed of PURCHASABLE_EDITIONS) {
      if (localStorage.getItem(storageKey(ed)) === "true") set.add(ed);
    }
  } catch {}
  return set;
}

interface UnlockContextValue {
  isEditionUnlocked: (edition: string) => boolean;
  isReviewerMode: boolean;
  purchasingEdition: string | null;
  triggerPurchase: (edition: string) => Promise<void>;
  refreshReviewerStatus: () => void;
}

const UnlockContext = createContext<UnlockContextValue | null>(null);

export function useUnlock() {
  const context = useContext(UnlockContext);
  if (!context) throw new Error("useUnlock must be used within UnlockProvider");
  return context;
}

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(loadUnlocked);
  const [isReviewerMode, setIsReviewerMode] = useState(() => isReviewerUnlocked());
  const [purchasingEdition, setPurchasingEdition] = useState<string | null>(null);

  const markEditionUnlocked = useCallback((edition: string) => {
    try { localStorage.setItem(storageKey(edition), "true"); } catch {}
    setUnlocked((prev) => new Set([...prev, edition]));
  }, []);

  const refreshReviewerStatus = useCallback(() => {
    setIsReviewerMode(isReviewerUnlocked());
  }, []);

  // Handle Stripe redirect: ?unlock=success&edition=reracked&session_id=cs_...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") !== "success") return;
    const edition = params.get("edition") ?? "";
    const sessionId = params.get("session_id") ?? "";
    if (!edition || !sessionId) return;

    window.history.replaceState({}, "", window.location.pathname);

    // For standalone app, just mark as unlocked (no server to verify)
    markEditionUnlocked(edition);
  }, [markEditionUnlocked]);

  // Check all pending Play Billing purchases on TWA startup
  useEffect(() => {
    if (!isRunningInTwa()) return;
    checkPendingPurchases()
      .then((purchases) => {
        for (const purchase of purchases) {
          // In standalone mode, verify locally (server calls removed)
          // For now, just mark as unlocked if purchase exists
          if (purchase.edition) {
            markEditionUnlocked(purchase.edition);
          }
        }
      })
      .catch(() => {});
  }, [markEditionUnlocked]);

  const isEditionUnlocked = useCallback(
    (edition: string) => {
      // Reviewer mode unlocks all editions
      if (isReviewerMode) return true;
      return unlocked.has(edition);
    },
    [unlocked, isReviewerMode]
  );

  const triggerPurchase = useCallback(async (edition: string) => {
    if (unlocked.has(edition) || purchasingEdition || isReviewerMode) return;
    setPurchasingEdition(edition);
    try {
      if (isRunningInTwa()) {
        const purchase = await initiatePlayBillingCheckout(edition);
        if (!purchase) return;
        // For standalone, just mark as unlocked
        if (purchase.edition) {
          markEditionUnlocked(purchase.edition);
        }
      } else {
        // For web, redirect to Stripe (would need to be set up separately)
        console.warn("Purchase not implemented in standalone mode");
      }
    } catch (err) {
      console.error("[UnlockContext] purchase error:", err);
    } finally {
      setPurchasingEdition(null);
    }
  }, [unlocked, purchasingEdition, isReviewerMode, markEditionUnlocked]);

  return (
    <UnlockContext.Provider value={{ isEditionUnlocked, isReviewerMode, purchasingEdition, triggerPurchase, refreshReviewerStatus }}>
      {children}
    </UnlockContext.Provider>
  );
}
