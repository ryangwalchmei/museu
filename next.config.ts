import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/v1/migrations": ["./infra/migrations/**/*"],
  },
};

export default nextConfig;
