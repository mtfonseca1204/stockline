import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
mkdirSync("src/lib/chain/generated", { recursive: true });
for (const name of [
  "Morpho",
  "StocklineLens",
  "StocklineRepayAdapter",
  "TestSwap",
  "StocklineV3Swap",
]) {
  const artifact = JSON.parse(
    readFileSync(
      `contracts/out/${name === "TestSwap" ? "Mocks" : name}.sol/${name}.json`,
    ),
  );
  writeFileSync(
    `src/lib/chain/generated/${name}.json`,
    JSON.stringify(artifact.abi, null, 2) + "\n",
  );
}
const filename = "contracts/deployments/31337.json";
if (existsSync(filename)) {
  const manifest = JSON.parse(readFileSync(filename));
  delete manifest.marketsPlaceholder;
  manifest.repositoryCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  manifest.contractsUncommitted = true;
  manifest.sourceSha256 = Object.fromEntries(
    ["StocklineOracle", "StocklineLens", "StocklineRepayAdapter"].map(
      (name) => [
        name,
        createHash("sha256")
          .update(readFileSync(`contracts/src/${name}.sol`))
          .digest("hex"),
      ],
    ),
  );
  manifest.oraclePolicy = {
    collateralMaxAgeSeconds: 172800,
    loanMaxAgeSeconds: 172800,
    sequencerGraceSeconds: 3600,
    sessionSource: "LOCAL MOCK ONLY",
  };
  manifest.swapType = "LOCAL FUNDED MOCK";
  const broadcast =
    "contracts/broadcast/DeployLocal.s.sol/31337/run-latest.json";
  if (existsSync(broadcast)) {
    const run = JSON.parse(readFileSync(broadcast));
    manifest.transactions = run.receipts.map((r) => ({
      hash: r.transactionHash,
      blockNumber: r.blockNumber,
      status: r.status,
    }));
  }
  writeFileSync(filename, JSON.stringify(manifest, null, 2) + "\n");
  writeFileSync(
    "src/lib/chain/generated/local.json",
    JSON.stringify(manifest, null, 2) + "\n",
  );
}
