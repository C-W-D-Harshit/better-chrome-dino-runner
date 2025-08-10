import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { PostHogProvider } from "posthog-js/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_KEY}
      options={{
        api_host: "/relay-AXDe/",
        ui_host: "https://us.posthog.com",
        capture_pageview: false, // Prevent duplicate pageviews since we call trackGameView manually
        // Removed 'defaults' property as it is not compatible with PostHogConfig type
      }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);
