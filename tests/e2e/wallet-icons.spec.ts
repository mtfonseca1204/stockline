import { test, expect } from "@playwright/test";

test("wallet rows use each announced icon and a neutral fallback", async ({ page }) => {
  const icons = [
    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="orange"/></svg>'),
    'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><circle cx="16" cy="16" r="16" fill="purple"/></svg>'),
  ];
  await page.addInitScript(({ icons }) => {
    const announce = () => {
      ["MetaMask", "Phantom", "Broken icon wallet"].forEach((name, index) => {
        window.dispatchEvent(new CustomEvent("eip6963:announceProvider", {
          detail: {
            info: {
              uuid: `350670db-19fa-4704-a166-e52e178b59d${index}`,
              name,
              icon: icons[index] ?? "data:image/png;base64,broken",
              rdns: `test.wallet${index}`,
            },
            provider: { on() {}, removeListener() {}, async request() { return []; } },
          },
        }));
      });
    };
    window.addEventListener("eip6963:requestProvider", announce);
    announce();
  }, { icons });
  await page.goto("/");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  for (const [index, name] of ["MetaMask", "Phantom"].entries()) {
    const row = page.getByRole("button", { name, exact: true });
    const image = row.locator("img");
    await expect(image).toHaveAttribute("src", icons[index]);
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
  const fallback = page.getByRole("button", { name: "Broken icon wallet", exact: true });
  await expect(fallback).toBeVisible();
  await expect(fallback.locator("img")).toHaveCount(0);
  await expect(fallback.locator("svg.lucide-wallet")).toBeVisible();
});
