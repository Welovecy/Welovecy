"use client";
import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [msg, setMsg] = useState("");
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url);
      setMsg("Link copied");
    } catch {
      setMsg("");
    }
    setTimeout(() => setMsg(""), 1800);
  };
  return (
    <button className="save" type="button" onClick={share}>
      {msg || "Share"}
    </button>
  );
}
