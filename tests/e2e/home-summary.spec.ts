import { test, expect } from "@playwright/test";

for (const mobile of [false, true]) {
  test.describe(mobile ? "mobile summary" : "desktop summary", () => {
    test.use({ viewport: { width: mobile ? 390 : 1280, height: 844 }, isMobile: mobile, hasTouch: mobile });
    test("metric hints open and dismiss without changing the page", async ({ page }) => {
      await page.addInitScript(() => localStorage.setItem("kora-onboarded-v3", "1"));
      await page.goto("/app");
      await expect(page.getByText("Your Portfolio", { exact: true })).toBeVisible();
      await expect(page.getByText("Base mainnet · NVDAc pilot · Real funds", { exact: true })).toHaveCount(0);
      for (const label of ["Collateral", "Borrowed", "Available"]) {
        const button = page.getByRole("button", { name: `About ${label}`, exact: true });
        if (mobile) await button.tap();
        else await button.hover();
        const hint = page.getByRole("tooltip");
        await expect(hint).toBeVisible();
        await expect(button).toHaveAttribute("aria-expanded", "true");
        if (label === "Available") await expect(hint).toContainText("not cash in your wallet");
        if (mobile) {
          await button.tap();
          await expect(hint).toHaveCount(0);
          await button.tap();
          await page.getByText("Your Portfolio", { exact: true }).tap();
        } else {
          await button.click();
          await expect(hint).toBeVisible();
          await page.mouse.move(0, 0);
          await expect(hint).toHaveCount(0);
          await button.focus();
          await page.keyboard.press("Tab");
          await page.keyboard.press("Shift+Tab");
          await expect(hint).toBeVisible();
          await page.keyboard.press("Escape");
        }
        await expect(hint).toHaveCount(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `/tmp/kora-home-summary-${mobile ? "mobile" : "desktop"}.png` });
      await page.getByRole("button", { name: "Add Collateral", exact: true }).click();
      await expect(page.getByText("Base mainnet · NVDAc pilot · Real funds", { exact: true })).toBeVisible();
    });
  });
}
