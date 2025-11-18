import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_FRONTEND_BASE_URI: process.env.NEXT_PUBLIC_FRONTENT_BASE_URI ?? "https://192.168.8.211:3001",  
    NEXT_PUBLIC_BACKEND_BASE_URI: process.env.NEXT_PUBLIC_BACKEND_BASE_URI ?? "https://192.168.8.211:8001",
    // NEXT_PUBLIC_FRONTEND_BASE_URI: process.env.NEXT_PUBLIC_FRONTENT_BASE_URI ?? "https://localhost:3001",  
    // NEXT_PUBLIC_BACKEND_BASE_URI: process.env.NEXT_PUBLIC_BACKEND_BASE_URI ?? "https://localhost:8001",
  },
  allowedDevOrigins: ["192.168.211"]
};

export default nextConfig;
