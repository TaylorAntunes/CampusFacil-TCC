import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "next-themes";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="campusfacil-theme" disableTransitionOnChange>
    <App />
  </ThemeProvider>
);
