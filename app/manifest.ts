import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlayMini - Free Browser Games",
    short_name: "PlayMini",
    description: "Free online mini games. 2048, Snake, and more classics.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#6366f1",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
