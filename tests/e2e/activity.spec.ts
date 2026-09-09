import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { encodeEventTopics, encodeAbiParameters, parseAbi, toHex } from "viem";
import deployment from "../../src/lib/chain/generated/base.json";
const owner = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
const abi = parseAbi([
  "event SupplyCollateral(bytes32 indexed id, address indexed caller, address indexed onBehalf, uint256 assets)",
  "event Borrow(bytes32 indexed id, address caller, address indexed onBehalf, address indexed receiver, uint256 assets, uint256 shares)",
]);
for (const width of [390, 1280]) {
  test(`Activity assets and explorer details at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript((address) => {
      localStorage.setItem("kora-onboarded-v3", "1");
      Object.assign(window, { ethereum: { isMetaMask: true, on() {}, removeListener() {}, async request({ method }: { method: string }) {
        if (method === "eth_chainId") return "0x2105";
        if (["eth_accounts", "eth_requestAccounts"].includes(method)) return [address];
        if (method === "wallet_requestPermissions") return [{ parentCapability: "eth_accounts" }];
        throw new Error(`No signing allowed: ${method}`);
      } } });
    }, owner);
    const block = deployment.indexFromBlock + 1;
    await page.route("https://mainnet.base.org/**", async route => {
      const requests = route.request().postDataJSON();
      if (Array.isArray(requests)) return route.continue();
      const { method, id } = requests;
      let result: unknown;
      if (method === "eth_blockNumber") result = toHex(block);
      else if (method === "eth_getBlockByNumber") result = { number: toHex(block), timestamp: "0x6a000000", transactions: [], hash: `0x${"b".repeat(64)}` };
      else if (method === "eth_getLogs") result = ["SupplyCollateral", "Borrow"].map((eventName, i) => ({
        address: deployment.morpho, blockNumber: toHex(block), blockHash: `0x${"b".repeat(64)}`, logIndex: toHex(i), transactionIndex: "0x0", removed: false,
        transactionHash: `0x${String(i + 1).repeat(64)}`,
        topics: encodeEventTopics({ abi, eventName, args: { id: deployment.markets[0].marketId as `0x${string}`, caller: owner, onBehalf: owner, receiver: owner } }),
        data: eventName === "Borrow" ? encodeAbiParameters([{type:"address"},{type:"uint256"},{type:"uint256"}], [owner, 1250000n, 1n]) : encodeAbiParameters([{type:"uint256"}], [3218561n]),
      }));
      else return route.continue();
      await route.fulfill({ json: { jsonrpc: "2.0", id, result } });
    });
    await page.goto("/app");
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await page.getByRole("button", { name: "Injected", exact: true }).click();
    await page.getByRole("button", { name: "Activity", exact: true }).click();
    for (const [label, asset, amount, hash] of [
      ["Collateral added", "NVDAc", "0.032 NVDAc", "1"],
      ["USDC borrowed", "USDC", "1.25 USDC", "2"],
    ]) {
      const row = page.getByRole("button", { name: new RegExp(label) });
      await expect(row.getByRole("img", { name: asset, exact: true })).toBeVisible();
      await expect(row).toContainText(amount);
      await row.click();
      const sheet = page.getByRole("dialog", { name: "Activity details" });
      await expect(sheet).toContainText(label);
      await expect(sheet).toContainText(asset === "NVDAc" ? "0.03218561 NVDAc" : amount);
      await expect(sheet.getByRole("link", { name: "View on Explorer" })).toHaveAttribute("href", `https://basescan.org/tx/0x${hash.repeat(64)}`);
      await expect(sheet.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
      await expect(sheet).not.toContainText("Confirmed at block");
      await expect(sheet).not.toContainText("0x");
      await expect(sheet).not.toContainText("$0");
      await expect(page.locator("body")).not.toContainText(/(?:last|latest) published (?:stock |equity )?price/i);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `/tmp/kora-activity-${asset}-${width}.png` });
      await sheet.getByRole("button", { name: "Close action" }).click();
    }
  });
}

// Guard every UI component, including help and title attributes on hidden routes.
test("Kora UI does not reintroduce published-price source labels", () => {
  const forbidden = /(?:last|latest)\s+published\s+(?:(?:stock|equity)\s+)?price|reference\s+price\s+published/i;
  for (const root of ["src/components", "src/app"]) {
    for (const file of readdirSync(root, { recursive: true }).map(String).filter(file => /\.[jt]sx?$/.test(file))) {
      expect(readFileSync(join(root, file), "utf8"), join(root, file)).not.toMatch(forbidden);
    }
  }
});
