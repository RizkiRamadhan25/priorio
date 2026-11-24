import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const [command] = process.argv.slice(2);
if (!["dev", "start", "build", "typegen"].includes(command)) throw new Error("Unsupported Next command.");

const args = [require.resolve("next/dist/bin/next"), command];
if (command === "dev" || command === "build") args.push("--webpack");
if (command === "dev" || command === "start") args.push("--hostname", "127.0.0.1", "--port", "3000");
const child = spawn(process.execPath, args, {
  stdio: "inherit",
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", CHECKPOINT_DISABLE: "1" },
});
child.on("exit", (code, signal) => { process.exitCode = code ?? (signal ? 1 : 0); });
