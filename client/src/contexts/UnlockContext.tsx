import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { isRunningInTwa, initiatePlayBillingCheckout, checkPendingPurchases } from "@/lib/play-billing";

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
  purchasingEdition: string | null;
  triggerPurchase: (edition: string) => Promise<void>;
}

const UnlockContext = createContext<UnlockContextValue | null>(null);

export function useUnlock() {
  const context = useContext(UnlockContext);
  if (!context) throw new Error("useUnlock must be used within UnlockProvider");
  return context;
}

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(loadUnlocked);
  const [purchasingEdition, setPurchasingEdition] = useState<string | null>(null);

  const markEditionUnlocked = useCallback((edition: string) => {
    try { localStorage.setItem(storageKey(edition), "true"); } catch {}
    setUnlocked((prev) => new Set([...prev, edition]));
  }, []);

  // Handle Stripe redirect: ?unlock=success&edition=reracked&session_id=cs_...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") !== "success") return;
    const edition = params.get("edition") ?? "";
    const sessionId = params.get("session_id") ?? "";
    if (!edition || !sessionId) return;

    window.history.replaceState({}, "", window.location.pathname);

    fetch(`/api/check-unlock-status?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => { if (data.unlocked) markEditionUnlocked(edition); })
      .catch(() => {});
  }, []);

  // Check all pending Play Billing purchases on TWA startup
  useEffect(() => {
    if (!isRunningInTwa()) return;
    checkPendingPurchases()
      .then((purchases) => {
        for (const purchase of purchases) {
          fetch("/api/verify-play-purchase", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(purchase),
          })
            .then((r) => r.json())
            .then((data) => { if (data.unlocked && data.edition) markEditionUnlocked(data.edition); })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const isEditionUnlocked = useCallback(
    (edition: string) => unlocked.has(edition),
    [unlocked]
  );

  const triggerPurchase = useCallback(async (edition: string) => {
    if (unlocked.has(edition) || purchasingEdition) return;
    setPurchasingEdition(edition);
    try {
      if (isRunningInTwa()) {
        const purchase = await initiatePlayBillingCheckout(edition);
        if (!purchase) return;
        const res = await fetch("/api/verify-play-purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(purchase),
        });
        const data = await res.json();
        if (data.unlocked) markEditionUnlocked(edition);
      } else {
        const res = await fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ edition }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch (err) {
      console.error("[UnlockContext] purchase error:", err);
    } finally {
      setPurchasingEdition(null);
    }
  }, [unlocked, purchasingEdition, markEditionUnlocked]);

  return (
    <UnlockContext.Provider value={{ isEditionUnlocked, purchasingEdition, triggerPurchase }}>
      {children}
    </UnlockContext.Provider>
  );
}
