import { Button } from "@/components/ui/button";
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Pause, 
  Play 
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { TouchInputActions } from "@/hooks/useInput";

interface MobileControlsProps {
  touchActions: TouchInputActions;
  running: boolean;
  gameOver: boolean;
  onStart: () => void;
  onRestart: () => void;
}

function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice && isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

function useSwipeGestures(touchActions: TouchInputActions) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        touchStartRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now()
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !e.changedTouches[0]) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Only consider quick swipes (less than 300ms)
      if (deltaTime > 300) return;

      const minSwipeDistance = 50;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Vertical swipes
      if (absY > absX && absY > minSwipeDistance) {
        if (deltaY < 0) {
          // Swipe up = jump
          touchActions.triggerJump();
        } else {
          // Swipe down = duck (brief)
          touchActions.setDuckHeld(true);
          setTimeout(() => touchActions.setDuckHeld(false), 150);
        }
      }
      
      // Horizontal swipes for movement (brief)
      else if (absX > absY && absX > minSwipeDistance) {
        if (deltaX < 0) {
          // Swipe left
          touchActions.setLeftHeld(true);
          setTimeout(() => touchActions.setLeftHeld(false), 200);
        } else {
          // Swipe right
          touchActions.setRightHeld(true);
          setTimeout(() => touchActions.setRightHeld(false), 200);
        }
      }

      touchStartRef.current = null;
    };

    // Add swipe listeners to the document
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchActions]);
}

export function MobileControls({ 
  touchActions, 
  running, 
  gameOver, 
  onStart, 
  onRestart 
}: MobileControlsProps) {
  const isMobile = useMobileDetection();
  
  // Enable swipe gestures
  useSwipeGestures(touchActions);

  if (!isMobile) return null;

  const handleTouchStart = (action: () => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    action();
  };

  const handleTouchEnd = (action: (held: boolean) => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    action(false);
  };

  const handleTouchStartHold = (action: (held: boolean) => void) => (e: React.TouchEvent) => {
    e.preventDefault();
    action(true);
  };

  return (
    <>
      {/* Swipe gesture overlay */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <div className="w-full h-full relative">
          {/* Tap anywhere to jump hint */}
          {!running && !gameOver && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="rounded-md border border-border bg-popover/80 backdrop-blur px-3 py-2 text-xs text-muted-foreground">
                Tap to jump • Swipe ↑↓←→ • Use buttons below
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile control buttons */}
      <div className="fixed bottom-2 left-2 right-2 z-20 pointer-events-none">
        <div className="flex justify-between items-end pointer-events-auto">
          {/* Left side - Movement controls */}
          <div className="flex flex-col items-center gap-1.5">
            {/* Duck/Down control */}
            <Button
              variant="outline"
              size="icon"
              className="w-11 h-11 bg-background/90 backdrop-blur border-2 border-border shadow-lg active:scale-95 transition-transform touch-manipulation"
              onTouchStart={handleTouchStartHold(touchActions.setDuckHeld)}
              onTouchEnd={handleTouchEnd(touchActions.setDuckHeld)}
              onMouseDown={() => touchActions.setDuckHeld(true)}
              onMouseUp={() => touchActions.setDuckHeld(false)}
              onMouseLeave={() => touchActions.setDuckHeld(false)}
            >
              <ChevronDown className="w-5 h-5" />
            </Button>
            
            {/* Horizontal movement */}
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="w-11 h-11 bg-background/90 backdrop-blur border-2 border-border shadow-lg active:scale-95 transition-transform touch-manipulation"
                onTouchStart={handleTouchStartHold(touchActions.setLeftHeld)}
                onTouchEnd={handleTouchEnd(touchActions.setLeftHeld)}
                onMouseDown={() => touchActions.setLeftHeld(true)}
                onMouseUp={() => touchActions.setLeftHeld(false)}
                onMouseLeave={() => touchActions.setLeftHeld(false)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-11 h-11 bg-background/90 backdrop-blur border-2 border-border shadow-lg active:scale-95 transition-transform touch-manipulation"
                onTouchStart={handleTouchStartHold(touchActions.setRightHeld)}
                onTouchEnd={handleTouchEnd(touchActions.setRightHeld)}
                onMouseDown={() => touchActions.setRightHeld(true)}
                onMouseUp={() => touchActions.setRightHeld(false)}
                onMouseLeave={() => touchActions.setRightHeld(false)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Right side - Action controls */}
          <div className="flex flex-col gap-1.5">
            {/* Jump control */}
            <Button
              variant="default"
              size="icon"
              className="w-12 h-12 bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform touch-manipulation"
              onTouchStart={handleTouchStart(touchActions.triggerJump)}
              onClick={touchActions.triggerJump}
            >
              <ChevronUp className="w-6 h-6" />
            </Button>
            
            {/* Pause/Start/Restart control */}
            <Button
              variant="outline"
              size="icon"
              className="w-11 h-11 bg-background/90 backdrop-blur border-2 border-border shadow-lg active:scale-95 transition-transform touch-manipulation"
              onTouchStart={handleTouchStart(() => {
                if (!running && !gameOver) {
                  onStart();
                } else if (gameOver) {
                  onRestart();
                } else {
                  touchActions.triggerPause();
                }
              })}
              onClick={() => {
                if (!running && !gameOver) {
                  onStart();
                } else if (gameOver) {
                  onRestart();
                } else {
                  touchActions.triggerPause();
                }
              }}
            >
              {!running && !gameOver ? (
                <Play className="w-4 h-4" />
              ) : gameOver ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Mobile controls hint - smaller and more compact */}
        <div className="mt-1 flex justify-center">
          <div className="rounded-md border border-border bg-popover/80 backdrop-blur px-2 py-0.5 text-[9px] text-muted-foreground">
            Swipe or tap: ↑ Jump · ↓ Duck · ←→ Move
          </div>
        </div>
      </div>
    </>
  );
}