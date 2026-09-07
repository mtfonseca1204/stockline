import { readFileSync } from "node:fs";
import { keccak256 } from "viem";
const proof = JSON.parse(
  readFileSync("contracts/deployments/pilot-credit-evidence.json", "utf8"),
);
const calendar = JSON.parse(
  readFileSync("contracts/config/nasdaq-pilot-calendar.json", "utf8"),
);
const blockers: string[] = [];
for (const check of ["success", "creditCycle", "liquidation", "closedSession"])
  if (proof[check] !== true)
    blockers.push(`Missing native fork evidence: ${check}`);
for (const name of [
  "NasdaqSessionGuard",
  "StocklineOracle",
  "StocklineV3Swap",
  "StocklineRepayAdapter",
  "StocklineLens",
]) {
  const artifact = JSON.parse(
    readFileSync(`contracts/out/${name}.sol/${name}.json`, "utf8"),
  );
  if (proof.artifactHashes?.[name] !== keccak256(artifact.bytecode.object))
    blockers.push(`${name}: bytecode changed since fork test`);
}
if (
  JSON.stringify(proof.calendarSessions) !== JSON.stringify(calendar.sessions)
)
  blockers.push("Calendar changed since fork test");
if (Date.now() / 1000 >= calendar.sessions.at(-1).close)
  blockers.push("Calendar expired");
console.log(
  JSON.stringify(
    {
      pilotDeploymentEligible: blockers.length === 0,
      scope:
        "NVDAc pilot only; not an audit or proof of live oracle availability",
      blockers,
    },
    null,
    2,
  ),
);
if (blockers.length) process.exitCode = 1;
