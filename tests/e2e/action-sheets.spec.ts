import { test, expect } from "@playwright/test";

for (const width of [390, 1280]) {
  test(`collateral sheet opens in view and resets at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => localStorage.setItem("kora-onboarded-v3", "1"));
    await page.goto("/app");
    await expect(page.getByText("24/7 pilot · Market available", { exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Add Collateral", exact: true }).click();
    const asset = page.getByRole("button", { name: "Select NVDAc market", exact: true });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await asset.click();
    const sheet = page.getByRole("dialog", { name: "Add Collateral · NVDAc" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByLabel("Amount")).toBeInViewport();
    await expect(sheet.getByText(/USD value unavailable|last published price|Need more/)).toHaveCount(0);
    await expect(sheet.getByText(/Wallet balance:/)).not.toContainText("USDC");
    await expect(sheet.getByRole("button", { name: "Review", exact: true })).toBeDisabled();
    await sheet.getByLabel("Amount").fill("1.234");
    await page.keyboard.press("Escape");
    await expect(sheet).toHaveCount(0);
    await expect(asset).toBeFocused();
    await asset.click();
    await expect(sheet.getByLabel("Amount")).toHaveValue("");
    await expect(sheet.getByLabel("Amount")).toBeInViewport();
    await page.screenshot({ path: `/tmp/kora-sheet-${width}.png` });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await sheet.getByRole("button", { name: "Close action" }).click();
    await expect(sheet).toHaveCount(0);
    for (const ticker of ["AAPLc", "MSFTc", "METAc"]) {
      const option = page.getByRole("button", { name: `Select ${ticker} market`, exact: true });
      if (await option.count()) await expect(option).toBeDisabled();
      else await expect(page.getByText(ticker, { exact: true })).toBeVisible();
    }
  });
}


test("wallet help opens a nested sheet and Escape preserves the wallet sheet", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kora-onboarded-v3", "1"));
  await page.goto("/app");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  const wallet = page.getByRole("dialog", { name: "Connect your wallet", exact: true });
  await expect(wallet).toBeVisible();
  await wallet.getByRole("button", { name: "Why do I need a wallet?" }).click();
  await expect(page.getByRole("dialog", { name: "Why do I need a wallet?" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(wallet).toBeVisible();
  await expect(wallet.getByRole("button", { name: "Why do I need a wallet?" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Connect", exact: true })).toBeFocused();
});
