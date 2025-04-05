import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";

export default defineConfig({
  root: ".", // لأنك داخل مجلد client
  plugins: [react(), themePlugin()],
  build: {
    outDir: "../dist/public", // بيبني خارج client
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // صح كذا لأن src داخل client
      "@shared": path.resolve(__dirname, "../shared"), // shared فوق
      "@assets": path.resolve(__dirname, "../attached_assets"), // assets فوق
    },
  },
});
