import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, Wrench, Shield, MessageSquare, Settings, X } from "lucide-react";
import { LOGO_URL, APP_VERSION } from "@/lib/constants";
import { TutorialCarousel } from "./TutorialCarousel";
import { TableLeveler } from "./TableLeveler";
import { CueingEmulator } from "./CueingEmulator";
import { CoinFlip } from "./CoinFlip";
import { CueMasterTools } from "./CueMasterTools";
import { PrivacyPolicy } from "./PrivacyPolicy";
import { trackEvent } from "@/lib/analytics";
import { useBackHandler } from "@/hooks/useBackHandler";

interface SplashScreenProps {
  onNewGame: () => void;
  onLoadGame: () => void;
}

export function SplashScreen({ onNewGame, onLoadGame }: SplashScreenProps) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeveler, setShowLeveler] = useState(false);
  const [showEmulator, setShowEmulator] = useState(false);
  const [showCoinFlip, setShowCoinFlip] = useState(false);
  const [showCueMasterTools, setShowCueMasterTools] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const subToolOpen = showCoinFlip || showEmulator || showLeveler;
  useBackHandler(subToolOpen ? () => {
    setShowCoinFlip(false);
    setShowEmulator(false);
    setShowLeveler(false);
    setShowCueMasterTools(true);
  } : null);

  useBackHandler(showCueMasterTools ? () => setShowCueMasterTools(false) : null);
  useBackHandler(showTutorial ? () => setShowTutorial(false) : null);
  useBackHandler(showPrivacy ? () => setShowPrivacy(false) : null);
  useBackHandler(showSettings ? () => setShowSettings(false) : null);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative">
      <div className="mb-6 flex justify-center">
        <img
          src={LOGO_URL}
          alt="Par for the Course"
          className="w-auto max-w-full"
          style={{ maxHeight: "36vh" }}
        />
      </div>

      <div className="w-full max-w-md space-y-4">
        <p className="text-xs text-red-500 text-center">*Pool table not included.</p>
        <Button
          size="lg"
          className="w-full text-lg h-14"
          onClick={onNewGame}
          data-testid="button-new-game"
        >
          New Game
        </Button>
        <Button
          size="lg"
          className="w-full text-lg h-14 text-white font-bold border-0"
          style={{ background: "#15803d" }}
          onClick={() => { setShowCueMasterTools(true); trackEvent("tool_opened", { tool_name: "cuemaster_tools" }); }}
          data-testid="button-cuemaster-tools"
        >
          <Wrench className="w-5 h-5 mr-2" />
          CueMaster Tools
        </Button>
        <Button
          size="lg"
          variant="ghost"
          className="w-full text-lg h-14 text-muted-foreground"
          onClick={() => setShowSettings(true)}
          data-testid="button-settings"
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full text-lg h-14"
          onClick={onLoadGame}
          data-testid="button-load-game"
        >
          Load Game
        </Button>
      </div>

      <p className="mt-6 text-xs text-muted-foreground" data-testid="text-app-version">
        {APP_VERSION}
      </p>

      {showSettings && (
        <div className="fixed inset-0 bg-background z-50 flex flex-col" data-testid="settings-overlay">
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h2 className="text-lg font-bold tracking-tight">Settings</h2>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowSettings(false)}
              data-testid="button-close-settings"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
            <Button
              size="lg"
              variant="ghost"
              className="w-full text-lg h-14 justify-start text-foreground"
              onClick={() => { setShowSettings(false); setShowTutorial(true); trackEvent("tutorial_viewed"); }}
              data-testid="button-how-to-play"
            >
              <BookOpen className="w-5 h-5 mr-3" />
              How to Play
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full text-lg h-14 justify-start text-foreground"
              onClick={() => { setShowSettings(false); window.open("https://forms.gle/TgT8YWzdbk7gvJXq6", "_blank"); }}
              data-testid="button-feedback"
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              Send Feedback
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="w-full text-lg h-14 justify-start text-foreground"
              onClick={() => { setShowSettings(false); setShowPrivacy(true); }}
              data-testid="button-privacy-policy"
            >
              <Shield className="w-5 h-5 mr-3" />
              Privacy Policy &amp; Terms
            </Button>
          </div>
        </div>
      )}

      {showTutorial && (
        <TutorialCarousel onClose={() => setShowTutorial(false)} />
      )}
      {showLeveler && (
        <TableLeveler onClose={() => { setShowLeveler(false); setShowCueMasterTools(true); }} />
      )}
      {showEmulator && (
        <CueingEmulator onClose={() => { setShowEmulator(false); setShowCueMasterTools(true); }} />
      )}
      {showCoinFlip && (
        <CoinFlip onClose={() => { setShowCoinFlip(false); setShowCueMasterTools(true); }} />
      )}
      {showCueMasterTools && (
        <CueMasterTools
          onClose={() => setShowCueMasterTools(false)}
          onOpenCoinFlip={() => { setShowCueMasterTools(false); setShowCoinFlip(true); trackEvent("tool_opened", { tool_name: "coin_flip" }); }}
          onOpenEmulator={() => { setShowCueMasterTools(false); setShowEmulator(true); trackEvent("tool_opened", { tool_name: "cueing_emulator" }); }}
          onOpenLeveler={() => { setShowCueMasterTools(false); setShowLeveler(true); trackEvent("tool_opened", { tool_name: "table_leveler" }); }}
        />
      )}
      {showPrivacy && (
        <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
      )}
    </div>
  );
}
