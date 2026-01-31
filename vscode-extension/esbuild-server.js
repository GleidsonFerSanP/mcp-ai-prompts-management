const esbuild = require("esbuild");

// Bundle the MCP server with all dependencies
esbuild
  .build({
    entryPoints: ["server-src/index.js"],
    bundle: true,
    format: "cjs",
    platform: "node",
    target: "node18",
    outfile: "server/index.js",
    external: [],
    logLevel: "info",
    banner: {
      js: "#!/usr/bin/env node\n",
    },
  })
  .then(() => {
    console.log("Server bundled successfully!");
  })
  .catch((e) => {
    console.error("Server bundle failed:", e);
    process.exit(1);
  });
