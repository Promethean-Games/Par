declare global {
  interface Window {
    getDigitalGoodsService?: (
      serviceProvider: string
    ) => Promise<DigitalGoodsService>;
  }
}

interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<ItemDetails[]>;
  listPurchases(): Promise<PurchaseDetails[]>;
}

interface ItemDetails {
  itemId: string;
  title: string;
  description: string;
  price: { currency: string; value: string };
  type: "product" | "subscription";
}

interface PurchaseDetails {
  itemId: string;
  purchaseToken: string;
}

const PLAY_BILLING_METHOD = "https://play.google.com/billing";

// Maps edition name → Play Store product ID
export const EDITION_PRODUCT_IDS: Record<string, string> = {
  reracked: "reracked_unlock",
  sequential: "sequential_unlock",
};

// Android TWA sets document.referrer to "android-app://<package>/" on the initial
// page load. We cache this in sessionStorage so it survives in-app navigation.
function detectTwaContext(): boolean {
  try {
    if (sessionStorage.getItem("pftc_is_twa") === "true") return true;

    // Signal 1: Android TWA sets referrer to android-app://<package>/ on initial load
    if (document.referrer.startsWith("android-app://")) {
      sessionStorage.setItem("pftc_is_twa", "true");
      return true;
    }

    // Signal 2: TWA runs as standalone + Chrome WebView UA ("wv" flag)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isWebView = /\bwv\b/.test(navigator.userAgent);
    if (isStandalone && isWebView) {
      sessionStorage.setItem("pftc_is_twa", "true");
      return true;
    }
  } catch {
    // sessionStorage blocked (private browsing, etc.)
  }
  return false;
}

export function getTwaDebugInfo(): string {
  const hasDgs = typeof window.getDigitalGoodsService === "function";
  const referrer = document.referrer || "(empty)";
  const session = (() => { try { return sessionStorage.getItem("pftc_is_twa"); } catch { return "unavailable"; } })();
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const ua = navigator.userAgent;
  const isWv = /\bwv\b/.test(ua);
  return `DGS:${hasDgs} referrer:${referrer} session:${session} standalone:${isStandalone} wv:${isWv} isTwa:${isRunningInTwa()}`;
}

export function isRunningInTwa(): boolean {
  return (
    typeof window.getDigitalGoodsService === "function" && detectTwaContext()
  );
}

export async function initiatePlayBillingCheckout(edition: string): Promise<{
  purchaseToken: string;
  productId: string;
} | null> {
  if (!isRunningInTwa()) return null;

  const productId = EDITION_PRODUCT_IDS[edition];
  if (!productId) throw new Error(`No Play product ID mapped for edition: ${edition}`);

  const service = await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
  const details = await service.getDetails([productId]);

  if (!details || details.length === 0) {
    throw new Error(`Product "${productId}" not found in Play Store`);
  }

  const methodData: PaymentMethodData = {
    supportedMethods: PLAY_BILLING_METHOD,
    data: { sku: productId },
  };

  const paymentDetails: PaymentDetailsInit = {
    total: {
      label: details[0].title || `Unlock ${edition}`,
      amount: { currency: "USD", value: "0" },
    },
  };

  const request = new PaymentRequest([methodData], paymentDetails);
  const response = await request.show();

  const responseData = response.details as {
    purchaseToken?: string;
    token?: string;
  };
  const purchaseToken = responseData.purchaseToken || responseData.token;

  await response.complete("success");

  if (!purchaseToken) {
    throw new Error("No purchase token received from Play Billing");
  }

  return { purchaseToken, productId };
}

// Returns all pending/owned Play purchases as an array so every edition can be checked.
export async function checkPendingPurchases(): Promise<Array<{
  purchaseToken: string;
  productId: string;
}>> {
  if (!isRunningInTwa()) return [];

  try {
    const service = await window.getDigitalGoodsService!(PLAY_BILLING_METHOD);
    const purchases = await service.listPurchases();
    const knownIds = new Set(Object.values(EDITION_PRODUCT_IDS));
    return purchases
      .filter((p) => knownIds.has(p.itemId))
      .map((p) => ({ purchaseToken: p.purchaseToken, productId: p.itemId }));
  } catch {
    // Silently ignore — pending purchase check is best-effort
  }

  return [];
}
