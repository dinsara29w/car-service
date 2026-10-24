import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Demo Auto Workshop",
    short_name: "Demo Auto",
    description:
      "Workshop management demo for a New Zealand auto repair shop — inspections, reports, quotes and invoices.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F8F6",
    theme_color: "#0F3D2E",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
