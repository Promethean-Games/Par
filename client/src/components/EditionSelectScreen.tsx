import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Loader2 } from "lucide-react";
import type { Edition } from "@/lib/card-deck";
import { useBackHandler } from "@/hooks/useBackHandler";
import { useUnlock } from "@/contexts/UnlockContext";

interface EditionDef {
  id: Edition | "teed-off" | "quantum" | "orbital";
  name: string;
  tagline: string;
  available: boolean;
  requiresPurchase?: boolean;
}

const EDITIONS: EditionDef[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "The original 18-hole course. Draw cards to set par.",
    available: true,
  },
  {
    id: "reracked",
    name: "Reracked",
    tagline: "A fresh layout with a new set of courses and higher pars.",
    available: true,
    requiresPurchase: true,
  },
  {
    id: "sequential",
    name: "Sequential",
    tagline: "Balls are played in sequential order — like 9-ball. Cards are still drawn randomly.",
    available: true,
    requiresPurchase: true,
  },
  {
    id: "teed-off",
    name: "Tee'd Off",
    tagline: "Wild new challenges from the tee box.",
    available: false,
  },
  {
    id: "quantum",
    name: "Quantum",
    tagline: "Superposition rules — every shot has two outcomes.",
    available: false,
  },
  {
    id: "orbital",
    name: "Orbital",
    tagline: "18 holes around the cosmos.",
    available: false,
  },
];

interface EditionSelectScreenProps {
  onSelectEdition: (edition: Edition) => void;
  onBack: () => void;
}

export function EditionSelectScreen({ onSelectEdition, onBack }: EditionSelectScreenProps) {
  useBackHandler(onBack);
  const { isUnlocked, isPurchasing, triggerPurchase } = useUnlock();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
          data-testid="button-edition-back"
        >
          ←
        </Button>

        <h1 className="text-2xl font-bold mb-1">Choose Edition</h1>
        <p className="text-muted-foreground mb-8 text-sm">Select which course set you want to play.</p>

        <div className="space-y-3">
          {EDITIONS.map((edition) => {
            const isComingSoon = !edition.available;
            const isLocked = !!edition.requiresPurchase && !isUnlocked;
            const isClickable = !isComingSoon;

            return (
              <button
                key={edition.id}
                className={[
                  "w-full text-left rounded-md",
                  isComingSoon
                    ? "opacity-50 cursor-not-allowed"
                    : "hover-elevate active-elevate-2",
                ].join(" ")}
                onClick={() => {
                  if (isComingSoon) return;
                  if (isLocked) { triggerPurchase(); return; }
                  onSelectEdition(edition.id as Edition);
                }}
                disabled={isComingSoon || (isLocked && isPurchasing)}
                data-testid={`button-edition-${edition.id}`}
              >
                <div className="rounded-md px-5 py-4 flex items-center gap-4 border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-base leading-tight">{edition.name}</p>
                      {isComingSoon && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Coming Soon
                        </Badge>
                      )}
                      {isLocked && !isComingSoon && (
                        <Badge variant="secondary" className="text-xs gap-1">
                          {isPurchasing ? (
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                          ) : (
                            <Lock className="w-2.5 h-2.5" />
                          )}
                          Unlock
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                      {edition.tagline}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!isUnlocked && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Tap an edition marked <Lock className="inline w-3 h-3 mb-0.5" /> Unlock to purchase full access.
          </p>
        )}
      </div>
    </div>
  );
}
