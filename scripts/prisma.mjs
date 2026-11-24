import { spawn } from "node:child_process";
import { resolve } from "node:path";

const child = spawn(process.execPath, [resolve("node_modules/prisma/build/index.js"), ...process.argv.slice(2)], {
  stdio: "inherit", env: { ...process.env, CHECKPOINT_DISABLE: "1", ...(process.platform === "win32" ? { RUST_LOG: "info" } : {}) },
});
child.on("exit", (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
