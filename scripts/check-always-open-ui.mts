import { chromium, expect } from "@playwright/test";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 900 },
    reducedMotion: "reduce",
  });
  page.on("response", async response => {
    if (response.url().includes("mainnet.base.org")) {
      const body = await response.json().catch(() => null);
      if (!response.ok() || body?.error) console.log("RPC",response.status(),body?.error?.message);
    }
  });
  await page.addInitScript(`
  localStorage.setItem('kora-onboarded-v3','1');
  window.ethereum={isMetaMask:true,on:()=>{},removeListener:()=>{},request:async({method,params=[]})=>{
   if(method==='eth_accounts'||method==='eth_requestAccounts')return ['0xDd6d37E29294A985E49fF301Acc80877fC24997F'];
   if(method==='eth_chainId')return '0x2105';
   if(method==='wallet_requestPermissions')return [{parentCapability:'eth_accounts'}];
   if(method==='wallet_getCapabilities')return {};
   if(!['eth_call','eth_getBalance','eth_blockNumber','eth_getBlockByNumber','eth_getLogs','eth_getTransactionReceipt'].includes(method))throw Error('Read-only verification provider');
   const res=await fetch('https://mainnet.base.org',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});const body=await res.json();if(body.error)throw Error(body.error.message);return body.result;
  }};
 `);
  await page.goto("http://localhost:3012");
  await expect(
    page.getByText("24/7 pilot · Market available", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  if (
    await page.getByRole("button", { name: "Connect", exact: true }).isVisible()
  ) {
    await page.getByRole("button", { name: "Connect", exact: true }).click();
    await page.getByRole("button", { name: "Injected", exact: true }).click();
  }
  if (
    await page
      .getByRole("button", { name: "Open app", exact: true })
      .isVisible()
  )
    await page.getByRole("button", { name: "Open app", exact: true }).click();
  await expect(
    page.getByText("Base mainnet · NVDAc pilot · Real funds"),
  ).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Add Collateral", exact: true })
    .click();
  await expect(page.getByText("Coming soon", { exact: true })).toHaveCount(3);
  await expect(
    page.getByRole("link", { name: "Buy NVDAc on Uniswap", exact: false }),
  ).toHaveAttribute("href", /outputCurrency=0xb200/);
  await expect(
    page.getByText("24/7 pilot · Market available", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Your old NVDAc market position", { exact: true }),
  ).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".page")).toHaveCSS("opacity", "1");
  await expect(page.getByText(/Wallet balance:/)).not.toContainText("Unavailable", {timeout:45000});
  await page.screenshot({
    path: "/tmp/stockline-24h-pilot.png",
    fullPage: true,
    animations: "disabled",
  });
  console.log(
    "Mainnet UI passed: 24/7 oracle, legacy position, NVDAc purchase link, three Coming soon badges. No signed transactions.",
  );
} finally {
  await browser.close();
}
