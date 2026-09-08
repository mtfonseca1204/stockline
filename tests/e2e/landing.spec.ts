import {test,expect} from '@playwright/test';
test('new visitors see the landing, can read the FAQ and enter the app',async({page})=>{
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Your stocks as collateral. USDC to do more.'})).toBeVisible();
  await page.getByText('Can my collateral be liquidated?',{exact:true}).click();
  await expect(page.getByText(/A falling stock price or accumulating interest/)).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Borrow USDC',exact:true}).first().click();
  await expect(page.getByText('Your Portfolio',{exact:true})).toBeVisible();
  await expect(page).toHaveURL(/\/app$/);
  await page.reload();
  await expect(page.getByText('Your Portfolio',{exact:true})).toBeVisible();
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Your stocks as collateral. USDC to do more.'})).toBeVisible();
  await expect(page.getByText('Your Portfolio',{exact:true})).not.toBeVisible();
 }
});
