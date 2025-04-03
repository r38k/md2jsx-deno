import deno from "@deno/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import honox from "honox/vite";
import { defineConfig } from "vite";

export default defineConfig({
  cacheDir: "node_modules/.vite",
  ssr: { external: ["react", "react-dom"] },
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  plugins: [
    deno(),
    honox({
      client: { input: ["/app/style.css"] },
    }),
    tailwindcss(),
  ],
});
