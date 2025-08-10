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
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "/relay-AXDe/",
        ui_host: "https://us.posthog.com",
        capture_pageview: false, // We'll handle this manually in analytics
        persistence: "localStorage+cookie",
        autocapture: false, // We want to track only specific game events
        session_recording: {
          maskAllInputs: false,
          maskTextSelectors: [],
        },
      }}
    >
      <App />
    </PostHogProvider>
  </StrictMode>
);
