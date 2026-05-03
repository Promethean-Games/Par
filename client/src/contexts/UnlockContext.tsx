import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { isRunningInTwa, initiatePlayBillingCheckout, checkPendingPurchases } from "@/lib/play-billing";

interface UnlockContextValue {
  isUnlocked: boolean;
  isPurchasing: boolean;
  triggerPurchase: () => Promise<void>;
}

const STORAGE_KEY = "pftc_unlocked";

const UnlockContext = createContext<UnlockContextValue | null>(null);

export function useUnlock() {
  const context = useContext(UnlockContext);
  if (!context) throw new Error("useUnlock must be used within UnlockProvider");
  return context;
}

export function UnlockProvider({ children }: { children: ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [isPurchasing, setIsPurchasing] = useState(false);

  const markUnlocked = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {}
    setIsUnlocked(true);
  }, []);

  // After Stripe redirect: ?unlock=success&session_id=cs_...
  useEffect(() => {
    if (isUnlocked) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("unlock") !== "success") return;
    const sessionId = params.get("session_id") ?? "";
    if (!sessionId) return;

    window.history.replaceState({}, "", window.location.pathname);

    fetch(`/api/check-unlock-status?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((data) => { if (data.unlocked) markUnlocked(); })
      .catch(() => {});
  }, []);

  // Check any pending Play Billing purchases on TWA startup
  useEffect(() => {
    if (isUnlocked || !isRunningInTwa()) return;
    checkPendingPurchases()
      .then((purchase) => {
        if (!purchase) return;
        return fetch("/api/verify-play-purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(purchase),
        })
          .then((r) => r.json())
          .then((data) => { if (data.unlocked) markUnlocked(); });
      })
      .catch(() => {});
  }, []);

  const triggerPurchase = useCallback(async () => {
    if (isUnlocked || isPurchasing) return;
    setIsPurchasing(true);
    try {
      if (isRunningInTwa()) {
        const purchase = await initiatePlayBillingCheckout();
        if (!purchase) return;
        const res = await fetch("/api/verify-play-purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(purchase),
        });
        const data = await res.json();
        if (data.unlocked) markUnlocked();
      } else {
        const res = await fetch("/api/create-checkout-session", { method: "POST" });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      }
    } catch (err) {
      console.error("[UnlockContext] purchase error:", err);
    } finally {
      setIsPurchasing(false);
    }
  }, [isUnlocked, isPurchasing, markUnlocked]);

  return (
    <UnlockContext.Provider value={{ isUnlocked, isPurchasing, triggerPurchase }}>
      {children}
    </UnlockContext.Provider>
  );
}
