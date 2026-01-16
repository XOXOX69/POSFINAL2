import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/",
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": path.resolve(__dirname, "./src/"),
    },
  },
  // Performance optimizations
  server: {
    host: '127.0.0.1',
    port: 3000,
    hmr: {
      overlay: false, // Disable error overlay for faster updates
    },
    watch: {
      usePolling: false,
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-redux",
      "@reduxjs/toolkit",
      "antd",
      "@ant-design/icons",
      "axios",
      "react-router-dom",
    ],
    exclude: [],
  },
  build: {
    // Enable minification
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Code splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Redux
          "redux-vendor": ["react-redux", "@reduxjs/toolkit"],
          // Ant Design (large library)
          "antd-vendor": ["antd", "@ant-design/icons", "@ant-design/pro-layout"],
          // Charts
          "chart-vendor": ["@ant-design/charts", "chart.js", "react-chartjs-2"],
          // Utils
          "utils-vendor": ["axios", "dayjs", "moment"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable source maps for debugging (disable in production)
    sourcemap: false,
  },
  // CSS optimization
  css: {
    devSourcemap: false,
  },
});
