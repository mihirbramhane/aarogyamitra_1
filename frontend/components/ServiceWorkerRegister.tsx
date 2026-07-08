"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      // Next dev mode reuses the same chunk URLs across every recompile (no
      // content hashing), so a caching service worker here would keep
      // serving stale JS forever. Actively unregister + clear any cache a
      // previous version of this code may have installed in dev.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability is a nice-to-have — never block the app on this.
    });
  }, []);
  return null;
}
