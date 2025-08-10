import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

/**
 * CreditsBar
 *
 * Renders a small footer-like bar with author credits and a GitHub "Star It" button.
 * Uses the shared Button component for consistent styling and accessibility.
 */
export function CreditsBar() {
  // GitHub repository URL (used for the Star button)
  const repoUrl: string =
    "https://github.com/C-W-D-Harshit/better-chrome-dino-runner";
  // Author profile URL (X/Twitter)
  const authorUrl: string = "https://x.com/cwd_harshit";

  return (
    <div
      className="fixed bottom-3 right-3 z-50 pointer-events-none md:bottom-4 md:right-4"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-center gap-3 rounded-md border border-border bg-popover/80 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur">
        {/* Author credit with a heart (hide on very small screens to avoid overlap) */}
        <p className="m-0 hidden select-none sm:block">
          Made with <span aria-hidden>💖</span> by{" "}
          <a
            href={authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-4 hover:underline"
            aria-label="Visit Harshit's profile on X"
          >
            Harshit (@cwd_harshit)
          </a>
        </p>

        {/* Star button linking to GitHub repo */}
        <Button
          variant="outline"
          size="sm"
          asChild
          aria-label="Star this project on GitHub"
          className="transition-colors hover:text-yellow-400 hover:border-yellow-400 dark:hover:text-yellow-500 dark:hover:border-yellow-500"
        >
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Star it on GitHub"
          >
            <Star className="size-3.5" aria-hidden />
            <span className="sr-only">Star it on GitHub</span>
            <span className="hidden sm:inline">Star It</span>
          </a>
        </Button>
      </div>
    </div>
  );
}

export default CreditsBar;
