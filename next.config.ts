import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const pwaOptions = {
  dest: "public",
  register: true,
  skipWaiting: true,

  // 👇 clave: NO meter workbox-* imports; usa strings
  runtimeCaching: [
    {
      urlPattern: /^\/_next\/static\/.*/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-resources",
      },
    },
    {
      urlPattern: /^\/_next\/image\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: { maxEntries: 50, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    {
      urlPattern: /^\/.*$/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3,
      },
    },
  ],

  // ✅ y además: deshabilitar PWA en dev para evitar dolores
  disable: process.env.NODE_ENV === "development",
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(pwaOptions)(nextConfig);
