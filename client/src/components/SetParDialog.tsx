import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PAR_OPTIONS } from "@/lib/constants";

interface SetParDialogProps {
  hole: number;
  onConfirm: (par: number) => void;
  onDismiss: () => void;
}

export function SetParDialog({ hole, onConfirm, onDismiss }: SetParDialogProps) {
  const [selectedPar, setSelectedPar] = useState<number | null>(null);

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-6"
      data-testid="set-par-dialog"
    >
      <div className="bg-background rounded-md w-full max-w-sm p-6 space-y-5 shadow-lg">
        <div>
          <h2 className="text-xl font-bold">Hole {hole}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Check your physical card and set the par for this hole.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Par</label>
          <Select
            value={selectedPar?.toString() ?? ""}
            onValueChange={(v) => setSelectedPar(parseInt(v))}
          >
            <SelectTrigger className="w-full" data-testid="select-set-par-dialog">
              <SelectValue placeholder="Select par…" />
            </SelectTrigger>
            <SelectContent>
              {PAR_OPTIONS.map((p) => (
                <SelectItem key={p} value={p.toString()}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onDismiss}
            data-testid="button-set-par-dismiss"
          >
            Skip
          </Button>
          <Button
            className="flex-1"
            disabled={selectedPar === null}
            onClick={() => selectedPar !== null && onConfirm(selectedPar)}
            data-testid="button-set-par-confirm"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
