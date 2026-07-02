import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, UserMinus, Home, Share2, Copy, Check } from "lucide-react";
import type { Settings, Player } from "@shared/schema";
import { getAnalyticsOptOut, setAnalyticsOptOut } from "@/lib/analytics";
import { APP_SHARE_URL } from "@/lib/constants";
import OneSignal from "react-onesignal";
import { useUnlock } from "@/contexts/UnlockContext";
import { ReviewerCodeDialog } from "./ReviewerCodeDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SettingsPanelProps {
  settings: Settings;
  players: Player[];
  onUpdateSettings: (settings: Partial<Settings>) => void;
  onAddPlayer: (name: string, position?: number) => void;
  onDropPlayer: (id: string) => void;
  onEndGame: () => void;
  onHome?: () => void;
  onLogout?: () => void;
  viewOnly?: boolean;
  isGameOver?: boolean;
}

export function SettingsPanel({ settings, players, onUpdateSettings, onAddPlayer, onDropPlayer, onEndGame, onHome, onLogout, viewOnly = false, isGameOver = false }: SettingsPanelProps) {
  const { refreshReviewerStatus } = useUnlock();
  const [newPlayerName, setNewPlayerName] = useState("");
  const [insertPosition, setInsertPosition] = useState<string>("end");
  const [analyticsOptOut, setAnalyticsOptOutState] = useState(() => getAnalyticsOptOut());
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>("default");
  const [dropTarget, setDropTarget] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("input");
      el.value = APP_SHARE_URL;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    if ("Notification" in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const handleAnalyticsToggle = (enabled: boolean) => {
    setAnalyticsOptOut(!enabled);
    setAnalyticsOptOutState(!enabled);
  };

  const handleNotifToggle = async (enabled: boolean) => {
    if (enabled) {
      try {
        await OneSignal.Slidedown.promptPush();
        if ("Notification" in window) setNotifPermission(Notification.permission);
      } catch {
        // User dismissed or browser blocked
      }
    } else {
      try {
        await OneSignal.User.PushSubscription.optOut();
        setNotifPermission("denied");
      } catch {
        // Silently ignore
      }
    }
  };

  const handleAddPlayer = () => {
    const name = newPlayerName.trim() || `Player ${players.length + 1}`;
    const pos = insertPosition === "end" ? undefined : parseInt(insertPosition, 10);
    onAddPlayer(name, pos);
    setNewPlayerName("");
  };

  return (
    <div className="space-y-4">
      {/* Reviewer Code Dialog - For Google Play reviewers */}
      <div>
        <ReviewerCodeDialog onUnlock={refreshReviewerStatus} />
      </div>

      {/* Player Management */}
      {!viewOnly && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Add Player</h3>
          <div className="space-y-2">
            <Input
              placeholder="Player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
            />
            <div className="flex gap-2">
              <Select value={insertPosition} onValueChange={setInsertPosition}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="end">End of list</SelectItem>
                  {players.map((p, i) => (
                    <SelectItem key={p.id} value={i.toString()}>
                      Before {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Drop Player */}
      {!viewOnly && players.length > 0 && (
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Remove Player</h3>
          <div className="flex gap-2">
            <Select value={dropTarget} onValueChange={setDropTarget}>
              <SelectTrigger>
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {players.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (dropTarget) onDropPlayer(dropTarget);
                setDropTarget("");
              }}
              disabled={!dropTarget}
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Analytics */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Analytics</Label>
            <p className="text-xs text-muted-foreground mt-1">Help us improve by sharing anonymous usage data</p>
          </div>
          <Switch
            checked={!analyticsOptOut}
            onCheckedChange={handleAnalyticsToggle}
          />
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Notifications</Label>
            <p className="text-xs text-muted-foreground mt-1">
              {notifPermission === "denied"
                ? "Notifications are blocked"
                : notifPermission === "granted"
                  ? "Enabled"
                  : "Ask when needed"}
            </p>
          </div>
          <Switch
            checked={notifPermission === "granted"}
            onCheckedChange={handleNotifToggle}
          />
        </div>
      </Card>

      {/* Share */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Share</h3>
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={handleCopyLink}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Link copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy app link
            </>
          )}
        </Button>
      </Card>

      {/* Game Actions */}
      {!viewOnly && (
        <>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onHome}
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </>
      )}

      {!viewOnly && !isGameOver && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              End Game
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>End Game?</AlertDialogTitle>
              <AlertDialogDescription>
                This will move to the summary view. You can still edit scores afterwards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onEndGame}>End Game</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {viewOnly && onLogout && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Start New Game
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Start New Game?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear the current game. Your game is already saved.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onLogout}>Start New Game</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
