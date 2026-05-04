import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Loader2, Mail, X } from "lucide-react";
import type { Edition } from "@/lib/card-deck";
import { useBackHandler } from "@/hooks/useBackHandler";
import { useUnlock } from "@/contexts/UnlockContext";

type CardMode = "digital" | "physical";

interface EditionDef {
  id: Edition | "teed-off" | "quantum" | "orbital" | "tournament";
  name: string;
  tagline: string;
  available: boolean;
  requiresPurchase?: boolean;
  contactForDigital?: boolean;
  gradient: string;
}

const EDITIONS: EditionDef[] = [
  {
    id: "classic",
    name: "Classic",
    tagline: "The original 18-hole course. Draw cards to set par.",
    available: true,
    gradient: "bg-gradient-to-br from-green-800 via-green-600 to-green-400",
  },
  {
    id: "reracked",
    name: "Reracked",
    tagline: "A fresh layout with a new set of courses and higher pars.",
    available: true,
    requiresPurchase: true,
    gradient: "bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400",
  },
  {
    id: "sequential",
    name: "Sequential",
    tagline: "Balls are played in sequential order — like 9-ball. Cards are still drawn randomly.",
    available: true,
    requiresPurchase: true,
    gradient: "bg-gradient-to-br from-yellow-700 via-yellow-500 to-yellow-300",
  },
  {
    id: "tournament",
    name: "Tournament",
    tagline: "Organized bracket play for leagues and local events.",
    available: false,
    contactForDigital: true,
    gradient: "bg-gradient-to-br from-red-900 via-red-600 to-red-400",
  },
  {
    id: "teed-off",
    name: "Tee'd Off",
    tagline: "Wild new challenges from the tee box.",
    available: false,
    gradient: "bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-600",
  },
  {
    id: "quantum",
    name: "Quantum",
    tagline: "Superposition rules — every shot has two outcomes.",
    available: false,
    gradient: "bg-gradient-to-br from-purple-950 via-purple-700 to-purple-400",
  },
  {
    id: "orbital",
    name: "Orbital",
    tagline: "18 holes around the cosmos.",
    available: false,
    gradient: "bg-gradient-to-br from-teal-900 via-teal-600 to-teal-400",
  },
];

interface EditionSelectScreenProps {
  cardMode: CardMode;
  onSelectEdition: (edition: Edition) => void;
  onBack: () => void;
}

export function EditionSelectScreen({ cardMode, onSelectEdition, onBack }: EditionSelectScreenProps) {
  useBackHandler(onBack);
  const { isEditionUnlocked, purchasingEdition, triggerPurchase } = useUnlock();
  const [showTournamentInfo, setShowTournamentInfo] = useState(false);

  const isPhysical = cardMode === "physical";

  const anyLocked = !isPhysical && EDITIONS.some(
    (e) => e.available && e.requiresPurchase && !isEditionUnlocked(e.id)
  );

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
            const isLocked = !isPhysical && !!edition.requiresPurchase && !isEditionUnlocked(edition.id);
            const isPurchasing = purchasingEdition === edition.id;
            const isDigitalTournament = !isPhysical && !!edition.contactForDigital;
            const isInteractive = !isComingSoon || isDigitalTournament;

            return (
              <div key={edition.id}>
                <button
                  className={[
                    "w-full text-left rounded-md",
                    isInteractive
                      ? "hover-elevate active-elevate-2"
                      : "opacity-40 cursor-not-allowed",
                  ].join(" ")}
                  onClick={() => {
                    if (isDigitalTournament) {
                      setShowTournamentInfo((v) => !v);
                      return;
                    }
                    if (!isInteractive) return;
                    if (isLocked) { triggerPurchase(edition.id); return; }
                    onSelectEdition(edition.id as Edition);
                  }}
                  disabled={!isInteractive && !isDigitalTournament || isPurchasing}
                  data-testid={`button-edition-${edition.id}`}
                >
                  <div className={`rounded-md px-5 py-4 flex items-center gap-4 ${edition.gradient}`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-base leading-tight text-white drop-shadow-sm">
                          {edition.name}
                        </p>
                        {isComingSoon && !isDigitalTournament && (
                          <Badge className="text-xs gap-1 bg-black/30 text-white border-white/20 no-default-active-elevate">
                            <Lock className="w-2.5 h-2.5" />
                            Coming Soon
                          </Badge>
                        )}
                        {isComingSoon && isDigitalTournament && (
                          <Badge className="text-xs gap-1 bg-black/30 text-white border-white/20 no-default-active-elevate">
                            <Mail className="w-2.5 h-2.5" />
                            Get Info
                          </Badge>
                        )}
                        {isLocked && !isComingSoon && (
                          <Badge className="text-xs gap-1 bg-black/30 text-white border-white/20 no-default-active-elevate">
                            {isPurchasing ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Lock className="w-2.5 h-2.5" />
                            )}
                            {isPurchasing ? "Processing…" : "Unlock $4.99"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/75 mt-0.5 leading-snug drop-shadow-sm">
                        {edition.tagline}
                      </p>
                    </div>
                  </div>
                </button>

                {isDigitalTournament && showTournamentInfo && (
                  <div className="mt-1 rounded-md border px-5 py-4 bg-card">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm mb-1">Running a local tournament?</p>
                        <p className="text-sm text-muted-foreground leading-snug">
                          We'd love to help you set up a Par for the Course tournament at your venue. Reach out and we'll walk you through everything.
                        </p>
                        <a
                          href="mailto:info@promethean-games.com"
                          className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium underline underline-offset-2"
                          data-testid="link-tournament-email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          info@promethean-games.com
                        </a>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setShowTournamentInfo(false)}
                        className="-mt-1 -mr-2 shrink-0"
                        data-testid="button-tournament-info-close"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {anyLocked && (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Each locked edition is $4.99 — purchased separately and unlocked forever.
          </p>
        )}
      </div>
    </div>
  );
}
