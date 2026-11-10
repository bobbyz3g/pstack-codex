import fs from "node:fs";
import { killGroup } from "./run.ts";

// The parent owns both temporary directories. EOF also arrives if it is forcibly closed.
const [pid, stage, tmp] = process.argv.slice(2);
process.stdin.resume();
process.stdin.on("end", async () => {
  await killGroup(Number(pid));
  for (const dir of [stage, tmp]) {
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }); }
    catch { /* Another owner may still be closing a file; do not affect unrelated paths. */ }
  }
});
