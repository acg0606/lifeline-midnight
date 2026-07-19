import { Buffer } from "buffer";

(globalThis as typeof globalThis & { Buffer: typeof Buffer }).Buffer = Buffer;

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { LifelineApp } from "@/components/lifeline-app";
import { LocaleProvider } from "@/lib/i18n";
import "@/src/vite.css";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LocaleProvider>
      <LifelineApp />
      <Toaster position="top-center" richColors />
    </LocaleProvider>
  </StrictMode>,
);
