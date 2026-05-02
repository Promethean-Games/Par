import { Button } from "@/components/ui/button";
import { Smartphone, BookOpen } from "lucide-react";
import { useBackHandler } from "@/hooks/useBackHandler";

interface ModeSelectScreenProps {
  onSelectDigital: () => void;
  onSelectPhysical: () => void;
  onBack: () => void;
}

export function ModeSelectScreen({ onSelectDigital, onSelectPhysical, onBack }: ModeSelectScreenProps) {
  useBackHandler(onBack);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md">
        <Button
          size="icon"
          variant="ghost"
          onClick={onBack}
          className="mb-6 -ml-2"
          data-testid="button-mode-back"
        >
          ←
        </Button>

        <h1 className="text-2xl font-bold mb-2">New Game</h1>
        <p className="text-muted-foreground mb-8">How will you be setting par for each hole?</p>

        <div className="space-y-4">
          <button
            className="w-full text-left rounded-md overflow-hidden hover-elevate active-elevate-2"
            onClick={onSelectDigital}
            data-testid="button-mode-digital"
          >
            <div
              className="rounded-md px-5 py-5 flex items-center gap-4 border"
            >
              <div className="shrink-0 p-2 rounded-md bg-primary/10">
                <Smartphone className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="font-bold text-base leading-tight">Use digital cards</p>
                <p className="text-sm text-muted-foreground mt-0.5">Draw cards from the app to set par for each hole</p>
              </div>
            </div>
          </button>

          <button
            className="w-full text-left rounded-md overflow-hidden hover-elevate active-elevate-2"
            onClick={onSelectPhysical}
            data-testid="button-mode-physical"
          >
            <div
              className="rounded-md px-5 py-5 flex items-center gap-4 border"
            >
              <div className="shrink-0 p-2 rounded-md bg-muted">
                <BookOpen className="w-7 h-7 text-foreground" />
              </div>
              <div>
                <p className="font-bold text-base leading-tight">I have physical cards</p>
                <p className="text-sm text-muted-foreground mt-0.5">You'll enter par manually — no digital cards will be drawn</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
