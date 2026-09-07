import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
for (const dep of JSON.parse(
  readFileSync("contracts/dependencies.lock.json"),
)) {
  execFileSync(
    "forge",
    [
      "install",
      `${dep.name}=${dep.repository}@${dep.commit}`,
      "--root",
      resolve("contracts"),
      "--no-git",
    ],
    { stdio: "inherit" },
  );
}
