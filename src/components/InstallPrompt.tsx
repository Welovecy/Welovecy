"use client";
import { useEffect, useState } from "react";
import { track } from "@vercel/analytics";

/**
 * "Add to Home Screen" nudge. Android and desktop Chrome get a one-tap install button (beforeinstallprompt);
 * iPhone Safari gets the three steps, because Apple doesn't allow a button. Shown from the second visit,
 * only after the cookie choice, never once installed or dismissed.
 */
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
const KEY = "wlc-install", VISITS = "wlc-visits", SEEN = "wlc-visit-counted";
const get = (k: string, s: Storage = localStorage) => { try { return s.getItem(k); } catch { return null; } };
const set = (k: string, v: string, s: Storage = localStorage) => { try { s.setItem(k, v); } catch {} };
const ev = (n: string, os: string) => { try { track(n, { os, page: location.pathname.slice(0, 100) }); } catch {} };

export function InstallPrompt() {
  const [mode, setMode] = useState<"android" | "ios" | null>(null);
  const [bip, setBip] = useState<BIP | null>(null);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    if (standalone || get(KEY)) return;
    if (!get(SEEN, sessionStorage)) { set(VISITS, String(Number(get(VISITS) || 0) + 1)); set(SEEN, "1", sessionStorage); }
    const second = Number(get(VISITS) || 0) >= 2;
    const ua = navigator.userAgent;
    const iosSafari = /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|edgios|opios/i.test(ua);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const ready = (m: "android" | "ios") => {
      timer = setTimeout(function wait() {
        if (!get("wlc-consent")) { timer = setTimeout(wait, 3000); return; } // let the cookie choice go first
        setMode(m); ev("Install shown", m);
      }, 4000);
    };
    const onBip = (e: Event) => { e.preventDefault(); setBip(e as BIP); if (second) ready("android"); };
    const onInstalled = () => { set(KEY, "done"); setMode(null); ev("Installed", "android"); };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    if (iosSafari && second) ready("ios");
    return () => { window.removeEventListener("beforeinstallprompt", onBip); window.removeEventListener("appinstalled", onInstalled); if (timer) clearTimeout(timer); };
  }, []);

  if (!mode) return null;
  const close = () => { set(KEY, "no"); setMode(null); ev("Install dismissed", mode); };
  const install = async () => {
    if (!bip) return;
    await bip.prompt();
    const { outcome } = await bip.userChoice;
    set(KEY, outcome === "accepted" ? "done" : "no");
    ev(outcome === "accepted" ? "Install accepted" : "Install dismissed", "android");
    setMode(null);
  };

  return (
    <div className="install" role="dialog" aria-live="polite" aria-label="Add We Love Cyprus to your home screen">
      <div className="install-top">
        <img src="/icons/icon-192.png" alt="" width={44} height={44} />
        <div>
          <p className="install-h">Keep Cyprus one tap away.</p>
          <p className="install-p">Add We Love Cyprus to your home screen. It opens full screen like an app, no App Store needed.</p>
        </div>
        <button className="install-x" onClick={close} aria-label="Not now">×</button>
      </div>
      {mode === "ios" ? (
        <ol className="install-steps">
          <li>Tap <b>•••</b> at the bottom, then <b>Share</b></li>
          <li>Tap <b>View More</b>, then <b>Add to Home Screen</b></li>
          <li>Keep <b>Open as Web App</b> on and tap <b>Add</b></li>
        </ol>
      ) : (
        <div className="install-btns">
          <button className="btn btn-ghost" onClick={close}>Not now</button>
          <button className="btn btn-primary" onClick={install}>Add to home</button>
        </div>
      )}
    </div>
  );
}
