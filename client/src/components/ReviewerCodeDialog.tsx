import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { unlockReviewerMode, clearReviewerUnlock, isReviewerUnlocked } from "@/lib/payment";
import { ShieldCheck, X } from "lucide-react";

interface ReviewerCodeDialogProps {
  onUnlock?: () => void;
}

export function ReviewerCodeDialog({ onUnlock }: ReviewerCodeDialogProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(() => isReviewerUnlocked());

  const handleSubmit = () => {
    const success = unlockReviewerMode(code);
    if (success) {
      setIsUnlocked(true);
      setCode("");
      setError("");
      onUnlock?.();
    } else {
      setError("Invalid code");
    }
  };

  const handleClear = () => {
    clearReviewerUnlock();
    setIsUnlocked(false);
    setCode("");
    setError("");
  };

  if (isUnlocked) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <span className="text-green-600 font-semibold">Reviewer Mode Active</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reviewer Mode</AlertDialogTitle>
            <AlertDialogDescription>
              You have full access to all features for testing purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-green-50 dark:bg-green-950 p-3 rounded text-sm text-green-700 dark:text-green-300">
            ✓ All editions and features unlocked for review
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive hover:bg-destructive/90">
              Disable Reviewer Mode
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <ShieldCheck className="w-4 h-4" />
          Reviewer Access
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Reviewer Code</AlertDialogTitle>
          <AlertDialogDescription>
            Google Play reviewers can enter the code to unlock all features for testing.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3">
          <Input
            type="password"
            placeholder="Enter code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError("");
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit} disabled={!code.trim()}>
            Unlock
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
