import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("kora-onboarded-v3", "1");
    const listeners: Record<string, ((...a: unknown[]) => void)[]> = {};
    let accounts = ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8"];
    let chain = "0x7a69";
    const control = {
      rejectNext: false,
      changeAccount: (value: string) => {
        accounts = [value];
        listeners.accountsChanged?.forEach((f) => f(accounts));
      },
      changeChain: (value: string) => {
        chain = value;
        listeners.chainChanged?.forEach((f) => f(chain));
      },
    };
    Object.assign(window, {
      walletTest: control,
      ethereum: {
        isMetaMask: true,
        on: (event: string, fn: (...a: unknown[]) => void) => {
          (listeners[event] ??= []).push(fn);
        },
        removeListener: (event: string, fn: (...a: unknown[]) => void) => {
          listeners[event] = (listeners[event] ?? []).filter((f) => f !== fn);
        },
        request: async ({
          method,
          params = [],
        }: {
          method: string;
          params: unknown[];
        }) => {
          if (method === "eth_accounts" || method === "eth_requestAccounts")
            return accounts;
          if (method === "eth_chainId") return chain;
          if (method === "wallet_requestPermissions")
            return [{ parentCapability: "eth_accounts" }];
          if (method === "wallet_getCapabilities") return {};
          if (method === "wallet_switchEthereumChain") {
            chain = (params[0] as { chainId: string }).chainId;
            listeners.chainChanged?.forEach((f) => f(chain));
            return null;
          }
          if (method === "eth_sendTransaction" && control.rejectNext) {
            control.rejectNext = false;
            throw Object.assign(new Error("User rejected request"), {
              code: 4001,
            });
          }
          const response = await fetch("http://127.0.0.1:8545", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
          });
          const body = await response.json();
          if (body.error)
            throw Object.assign(new Error(body.error.message), body.error);
          return body.result;
        },
      },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Connect", exact: true }).click();
  await page.getByRole("button", { name: "Injected", exact: true }).click();
  await expect(page.getByText("Your Portfolio", { exact: true })).toBeVisible();
});
for (const ticker of ["NVDAc"]) {
  test(`${ticker} deposit, borrow, sell, repay all, withdraw`, async ({
    page,
  }) => {
    await page
      .getByRole("button", { name: "Add Collateral", exact: true })
      .click();
    await page
      .getByRole("button", { name: `Select ${ticker} market`, exact: true })
      .click();
    await page.getByLabel("Amount").fill("10");
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm transaction" }).click();
    await expect(
      page.getByRole("heading", { name: "Transaction confirmed" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await page
      .getByRole("button", { name: "Borrow", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: `Select ${ticker} market`, exact: true })
      .click();
    await page.getByLabel("Amount").fill("100");
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm transaction" }).click();
    await expect(
      page.getByRole("heading", { name: "Transaction confirmed" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await page.getByRole("button", { name: "Repay", exact: true }).click();
    await page
      .getByRole("button", { name: `Select ${ticker} market`, exact: true })
      .click();
    await page.getByLabel("Sell collateral to repay").check();
    await page
      .getByRole("button", { name: "Authorize adapter", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Authorize adapter", exact: true }),
    ).toBeEnabled();
    await page.getByLabel("Amount").fill("0.5");
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm transaction" }).click();
    await expect(
      page.getByRole("heading", { name: "Transaction confirmed" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await page.getByRole("button", { name: "Repay", exact: true }).click();
    await page
      .getByRole("button", { name: `Select ${ticker} market`, exact: true })
      .click();
    await page.getByLabel("Repay all debt").check();
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm transaction" }).click();
    await expect(
      page.getByRole("heading", { name: "Transaction confirmed" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await page.getByRole("button", { name: "Withdraw", exact: true }).click();
    await page
      .getByRole("button", { name: `Select ${ticker} market`, exact: true })
      .click();
    await page.getByRole("button", { name: "MAX", exact: true }).click();
    await page.getByRole("button", { name: "Review", exact: true }).click();
    await page.getByRole("button", { name: "Confirm transaction" }).click();
    await expect(
      page.getByRole("heading", { name: "Transaction confirmed" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Back to portfolio" }).click();
    await page.reload();
    await page.getByRole("button", { name: "Open app", exact: true }).click();
    await page.getByRole("button", { name: "Activity", exact: true }).click();
    await expect(
      page.getByText(`RepayWithCollateral`, { exact: true }).first(),
    ).toBeVisible();
  });
}
test("rejected signature and context changes cannot confirm", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "Add Collateral", exact: true })
    .click();
  await page.getByLabel("Amount").fill("1");
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await page.evaluate(() => {
    (
      window as unknown as { walletTest: { rejectNext: boolean } }
    ).walletTest.rejectNext = true;
  });
  await page.getByRole("button", { name: "Confirm transaction" }).click();
  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Transaction confirmed" }),
  ).toHaveCount(0);
  await page.evaluate(() => {
    (
      window as unknown as {
        walletTest: { changeAccount: (s: string) => void };
      }
    ).walletTest.changeAccount("0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  });
  await expect(
    page.getByRole("button", { name: "Confirm transaction" }),
  ).toHaveCount(0);
  await page.evaluate(() => {
    (
      window as unknown as { walletTest: { changeChain: (s: string) => void } }
    ).walletTest.changeChain("0x2105");
  });
  await expect(
    page.getByRole("button", { name: "Switch to Anvil" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Review", exact: true }),
  ).toBeDisabled();
});

test("original portfolio layout and stock selection at mobile and desktop widths", async ({
  page,
}) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByText("Your Portfolio", { exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".page")).toHaveCSS("opacity", "1");
    await page.screenshot({
      animations: "disabled",
      path: `/tmp/stockline-home-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Add Collateral", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Select NVDAc market", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator(".page")).toHaveCSS("opacity", "1");
    await page.screenshot({
      animations: "disabled",
      path: `/tmp/stockline-deposit-${width}.png`,
      fullPage: true,
    });
    await expect(page.getByText(/Wallet balance:/)).toBeVisible();
    for (const label of ["25%", "50%", "75%", "MAX"]) {
      await page.getByRole("button", { name: label, exact: true }).click();
      await expect(page.getByLabel("Amount")).toHaveValue(/^\d+(\.\d+)?$/);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Home", exact: true })
      .first()
      .click();
  }
});

test("only NVDAc is selectable for the initial market", async ({ page }) => {
  await page
    .getByRole("button", { name: "Add Collateral", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Select NVDAc market", exact: true }),
  ).toBeEnabled();
  for (const ticker of ["AAPLc", "MSFTc", "METAc"]) {
    const option = page.getByRole("button", {
      name: `Select ${ticker} market`,
      exact: true,
    });
    await expect(option).toBeDisabled();
    await expect(option).toContainText("Coming soon");
  }
  await expect(
    page.getByRole("link", { name: "Buy NVDAc on Uniswap", exact: false }),
  ).toBeVisible();
});
