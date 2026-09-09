import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kora-onboarded-v3", "1");
    Object.assign(window, { ethereum: {
      isMetaMask: true,
      on() {}, removeListener() {},
      async request({ method }: { method: string }) {
        if (method === "eth_chainId") return "0x2105";
        if (method === "eth_accounts" || method === "eth_requestAccounts") return ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];
        if (method === "wallet_requestPermissions") return [{ parentCapability: "eth_accounts" }];
        return null;
      },
    }});
  });
  await page.goto("/app");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Injected", exact: true }).click();
  await page.getByRole("button", { name: "Portfolio", exact: true }).click();
  await expect(page.getByRole("button", { name: /NVDAc.*deposited/ })).toBeVisible();
});

for (const width of [390, 1280]) {
  test(`real reference widget renders at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole("button", { name: /NVDAc.*deposited/ }).click();
    const sheet = page.getByRole("dialog", { name: "Stock details", exact: true });
    await expect(sheet.getByText(/last published price/)).toHaveCount(0);
    await expect(sheet.getByText("1W · market sessions")).toBeVisible();
    const frame = page.frameLocator('iframe[title="symbol overview TradingView widget"]');
    await expect(frame.locator("canvas").first()).toBeVisible({ timeout: 30000 });
    await expect(frame.locator(".tv-spinner--shown")).toHaveCount(0, { timeout: 30000 });
    await expect(sheet.getByRole("button", { name: "Add Collateral", exact: true })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/kora-nvda-chart-${width}.png` });
    await sheet.getByRole("button", { name: "Close action" }).click();
    await expect(page.locator("iframe")).toHaveCount(0);
  });
}

test("blocked chart source shows unavailable without blocking stock actions", async ({ page }) => {
  await page.route("https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js", route => route.abort());
  await page.getByRole("button", { name: /NVDAc.*deposited/ }).click();
  await expect(page.getByText("Price history unavailable.", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog", { name: "Stock details", exact: true }).getByRole("button", { name: "Add Collateral", exact: true })).toBeEnabled();
});


test("deposit shows compact collateral balances and an inline purchase link", async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.getByRole("button", { name: "Add Collateral", exact: true }).click();
    await page.getByRole("button", { name: "Select NVDAc market", exact: true }).click();
    const sheet = page.getByRole("dialog", { name: "Add Collateral · NVDAc" });
    await expect(sheet.getByText(/last published price|USD value unavailable|Need more/)).toHaveCount(0);
    const wallet = sheet.getByText(/Wallet balance:/);
    await expect(wallet).not.toContainText("USDC");
    await expect(wallet).toContainText(/NVDAc.*\(\$/);
    const link = sheet.getByRole("link", { name: /Buy NVDAc on Uniswap/ });
    const input = sheet.getByLabel("Amount");
    expect((await link.boundingBox())!.y).toBeLessThan((await input.boundingBox())!.y);
    await expect(link).toHaveAttribute("target", "_blank");
    await sheet.getByRole("button", { name: "When can I borrow?" }).click();
    const help = page.getByRole("dialog", { name: "When can I borrow?", exact: true });
    await expect(help).toBeVisible();
    await help.getByRole("button", { name: "Close action" }).click();
    await expect(sheet).toBeVisible();
    await page.screenshot({ path: `/tmp/kora-deposit-clean-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await sheet.getByRole("button", { name: "Close action" }).click();
    await page.getByRole("button", { name: "Portfolio", exact: true }).click();
  }
});


test.describe("borrow presentation", () => {
  test.use({ hasTouch: true });
  test("USDC-only entry and header help work at mobile and desktop widths", async ({ page }) => {
    for (const width of [390, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      await page.getByRole("button", { name: "Borrow", exact: true }).click();
      await expect(page.getByText("Base mainnet · NVDAc pilot · Real funds", { exact: true })).toHaveCount(0);
      await expect(page.getByText(/last published price/)).toHaveCount(0);
      await page.getByRole("button", { name: "Select NVDAc market", exact: true }).click();
      const sheet = page.getByRole("dialog", { name: "How much would you like to borrow? · NVDAc" });
      await expect(sheet.getByText(/Wallet balance|Available to borrow|last published price/)).toHaveCount(0);
      await expect(sheet.getByText("Collateral", { exact: true })).toHaveCount(0);
      await expect(sheet.getByText("Borrowed", { exact: true })).toHaveCount(0);
      await expect(sheet.getByText(/Available for this operation:/)).toHaveCount(1);
      await expect(sheet.getByLabel("Amount")).toBeInViewport();
      const help = sheet.getByRole("button", { name: "When can I borrow?" });
      expect((await help.boundingBox())!.y).toBeLessThan((await sheet.getByLabel("Amount").boundingBox())!.y);
      if (width === 390) await help.tap();
      else { await help.focus(); await page.keyboard.press("Enter"); }
      await expect(page.getByRole("dialog", { name: "When can I borrow?", exact: true })).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(help).toBeFocused();
      await sheet.getByLabel("Amount").fill("0.01");
      await sheet.getByRole("button", { name: "Review", exact: true }).click();
      await expect(sheet.getByText(/You are borrowing 0.01 USDC/)).toBeVisible();
      await sheet.getByRole("button", { name: "Edit amount" }).click();
      await expect(sheet.getByLabel("Amount")).toHaveValue("0.01");
      await page.screenshot({ path: `/tmp/kora-borrow-clean-${width}.png` });
      await sheet.getByRole("button", { name: "Close action" }).click();
    }
  });
});
