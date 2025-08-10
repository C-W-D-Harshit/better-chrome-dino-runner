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
    <div className="mt-6 w-full max-w-[1100px] px-2 sm:px-0">
      <div className="flex flex-col items-center justify-between gap-2 rounded-md border border-border bg-popover/60 p-2 text-xs text-muted-foreground backdrop-blur sm:flex-row">
        {/* Author credit with a heart */}
        <p className="m-0 select-none">
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
          className="transition-colors hover:text-yellow-400 hover:border-yellow-400 dark:hover:text-yellow-600 dark:hover:border-yellow-600"
        >
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Star it on GitHub"
          >
            <Star className="size-3.5" aria-hidden />
            Star It
          </a>
        </Button>
      </div>
    </div>
  );
}

export default CreditsBar;
