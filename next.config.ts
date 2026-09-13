import type { NextConfig } from "next";

const isLocal = process.env.IS_LOCAL_DEV === "yes";

if (!isLocal) {
  throw new Error("Fail this build");
}

const nextConfig: NextConfig = {
  ...(!isLocal ? { output: "export" } : {}),
  logging: {
    browserToTerminal: false,
  },
};

export default nextConfig;
