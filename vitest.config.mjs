import path from "path";

const config = {
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    testTimeout: 60000,
    pool: "forks",
    singleFork: true,
  },
};

export default config;
