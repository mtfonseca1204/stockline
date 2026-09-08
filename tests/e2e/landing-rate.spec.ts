import { test, expect } from "@playwright/test";

test("landing does not display a made-up rate when the RPC fails", async ({ page }) => {
  await page.route("https://mainnet.base.org/**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32602, message: "Test RPC failure" } }),
  }));
  await page.goto("/");
  const rate = page.getByLabel("NVDAc borrowing interest rate");
  await expect(rate.locator("strong")).toHaveText("Unavailable", { timeout: 30000 });
  await expect(rate).not.toContainText(/\d+\.\d+%/);
  await expect(rate).not.toContainText("As of");
});
