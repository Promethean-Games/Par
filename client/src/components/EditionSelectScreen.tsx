import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import type { Edition } from "@/lib/card-deck";
import { useBackHandler } from "@/hooks/useBackHandler";

interface EditionDef {
  id: Edition | "sequential" | "teed-off" | "quantum" | "orbital";
  name: string;
  tagline: string;
  available: boolean;
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
  },
  {
    id: "sequential",
    name: "Sequential",
    tagline: "Holes play in a fixed order — no shuffling.",
    available: false,
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
          {EDITIONS.map((edition) => (
            <button
              key={edition.id}
              className={[
                "w-full text-left rounded-md",
                edition.available
                  ? "hover-elevate active-elevate-2"
                  : "opacity-50 cursor-not-allowed",
              ].join(" ")}
              onClick={() => {
                if (edition.available) onSelectEdition(edition.id as Edition);
              }}
              disabled={!edition.available}
              data-testid={`button-edition-${edition.id}`}
            >
              <div className="rounded-md px-5 py-4 flex items-center gap-4 border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-base leading-tight">{edition.name}</p>
                    {!edition.available && (
                      <Badge variant="secondary" className="text-xs gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                    {edition.tagline}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
