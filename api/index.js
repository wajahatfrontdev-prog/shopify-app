// Vercel API Route for Shopify App
import { createRequestHandler } from "@react-router/vercel";

export default createRequestHandler({
  build: () => import("../build/server/index.js"),
  getLoadContext: () => ({
    env: process.env,
  }),
});
