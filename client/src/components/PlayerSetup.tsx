import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlayerColorPicker } from "./PlayerColorPicker";
import { GripVertical, X, ArrowLeft, ArrowUpDown } from "lucide-react";
import type { Player } from "@shared/schema";
import { LOGO_URL, MAX_PLAYERS } from "@/lib/constants";

interface PlayerSetupProps {
  players: Player[];
  onAddPlayer: (name: string, position?: number) => void;
  onRemovePlayer: (id: string) => void;
  onUpdatePlayerName: (id: string, name: string) => void;
  onUpdatePlayerColor: (id: string, color: string) => void;
  onMovePlayer: (id: string, direction: "up" | "down") => void;
  onStartGame: () => void;
  onBack?: () => void;
}

export function PlayerSetup({
  players,
  onAddPlayer,
  onRemovePlayer,
  onUpdatePlayerName,
  onUpdatePlayerColor,
  onMovePlayer,
  onStartGame,
  onBack,
}: PlayerSetupProps) {
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [insertPosition, setInsertPosition] = useState<string>("end");
  const [showConfirm, setShowConfirm] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleAddPlayer = () => {
    const name = newPlayerName.trim() || `Player ${players.length + 1}`;
    const position = insertPosition === "end" ? undefined : parseInt(insertPosition);
    onAddPlayer(name, position);
    setNewPlayerName("");
    setInsertPosition("end");
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAddPlayer();
  };

  // Drag-and-drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id !== draggedId) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const fromIndex = players.findIndex((p) => p.id === draggedId);
    const toIndex = players.findIndex((p) => p.id === targetId);
    if (fromIndex === -1 || toIndex === -1) return;
    const steps = toIndex - fromIndex;
    const direction = steps > 0 ? "down" : "up";
    const count = Math.abs(steps);
    for (let i = 0; i < count; i++) {
      onMovePlayer(draggedId, direction);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const namedPlayers = players.filter((p) => p.name.trim().length > 0);
  const canStart = players.length > 0 && namedPlayers.length === players.length;

  return (
    <div className="flex flex-col min-h-screen p-4 pb-8">
      {onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="self-start mb-2 text-muted-foreground"
          data-testid="button-back-to-splash"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      )}

      <div className="flex flex-col items-center mb-5">
        <img src={LOGO_URL} alt="PftC logo" className="w-16 h-auto mb-3" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-md bg-muted w-full max-w-md justify-center">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm font-semibold text-center text-foreground">
            List players <span className="text-primary">tallest to shortest</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Drag <GripVertical className="inline w-3 h-3" /> to reorder · Players: {players.length}
        </p>
      </div>

      <div className="space-y-3 mb-4">
        {players.map((player, index) => (
          <Card
            key={player.id}
            className="p-3 transition-opacity"
            style={{
              opacity: draggedId === player.id ? 0.4 : 1,
              outline: dragOverId === player.id ? "2px solid hsl(var(--primary))" : undefined,
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, player.id)}
            onDragOver={(e) => handleDragOver(e, player.id)}
            onDrop={(e) => handleDrop(e, player.id)}
            onDragEnd={handleDragEnd}
            data-testid={`player-card-${player.id}`}
          >
            <div className="flex items-center gap-2">
              {/* Drag handle */}
              <div
                className="cursor-grab active:cursor-grabbing text-muted-foreground shrink-0 px-0.5 touch-none"
                data-testid={`drag-handle-${player.id}`}
                aria-label="Drag to reorder"
              >
                <GripVertical className="w-5 h-5" />
              </div>

              <button
                type="button"
                onClick={() => setShowColorPicker(showColorPicker === player.id ? null : player.id)}
                className="w-8 h-8 rounded-full border-2 flex-shrink-0 hover-elevate active-elevate-2"
                style={{
                  backgroundColor: player.color,
                  borderColor: showColorPicker === player.id ? "hsl(var(--foreground))" : "hsl(var(--border))",
                }}
                data-testid={`button-color-${player.id}`}
                aria-label="Change color"
              />

              <Input
                value={player.name}
                onChange={(e) => onUpdatePlayerName(player.id, e.target.value)}
                placeholder="Player name"
                className="flex-1"
                data-testid={`input-name-${player.id}`}
              />

              <Button
                size="icon"
                variant="ghost"
                onClick={() => onRemovePlayer(player.id)}
                data-testid={`button-remove-${player.id}`}
                aria-label="Remove player"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {showColorPicker === player.id && (
              <div className="mt-3 pt-3 border-t">
                <PlayerColorPicker
                  selectedColor={player.color}
                  onColorSelect={(color) => {
                    onUpdatePlayerColor(player.id, color);
                    setShowColorPicker(null);
                  }}
                />
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-3">
        <Button
          ref={addButtonRef}
          onClick={handleAddPlayer}
          disabled={players.length >= MAX_PLAYERS}
          variant="outline"
          className="flex-1 h-12 text-base"
          data-testid="button-add-player"
        >
          Add Player
        </Button>
        <Button
          onClick={() => setShowConfirm(true)}
          disabled={!canStart}
          className="flex-1 h-12 text-base font-semibold"
          data-testid="button-start-game"
        >
          Start Game
        </Button>
      </div>

      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Player name"
          className="flex-1"
          data-testid="input-new-player"
        />
        <Select value={insertPosition} onValueChange={setInsertPosition}>
          <SelectTrigger className="w-28" data-testid="select-position">
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="end">At End</SelectItem>
            {players.map((player, index) => (
              <SelectItem key={player.id} value={index.toString()}>
                Before {player.name.trim() || `Player ${index + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Roster confirmation dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Roster</DialogTitle>
            <DialogDescription className="pt-1">
              Players are listed <span className="font-semibold text-foreground">tallest to shortest</span>. Is this order correct?
            </DialogDescription>
          </DialogHeader>

          <ol className="space-y-2 my-1">
            {players.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center gap-3"
                data-testid={`confirm-player-${player.id}`}
              >
                <span className="text-sm text-muted-foreground w-4 text-right shrink-0">{index + 1}.</span>
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: player.color }}
                />
                <span className="text-sm font-medium">{player.name}</span>
              </li>
            ))}
          </ol>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              data-testid="button-confirm-back"
            >
              Go Back
            </Button>
            <Button
              onClick={() => { setShowConfirm(false); onStartGame(); }}
              data-testid="button-confirm-start"
            >
              Looks Good — Start!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
