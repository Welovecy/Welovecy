import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "We Love Cyprus",
    short_name: "We Love Cyprus",
    description: "Beaches, must-see places and what's around your hotel in the Republic of Cyprus.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#0A64A6",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Around you", url: "/around" },
      { name: "Beaches", url: "/beaches" },
      { name: "Saved", url: "/saved" },
    ],
  };
}
