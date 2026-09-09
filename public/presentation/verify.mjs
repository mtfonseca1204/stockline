import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const url = 'http://localhost:3005/presentation/index.html';
  for (const viewport of [{ width:1600,height:900 }, { width:1280,height:720 }, { width:390,height:844 }]) {
    const page = await browser.newPage({ viewport, reducedMotion:'reduce' });
    const errors=[];page.on('pageerror', e=>errors.push(e.message));
    await page.goto(url);await page.evaluate(()=>document.fonts.ready);
    for(let n=1;n<=6;n++) {
      await page.goto(url+'#'+n);
      await expect(page.locator('.slide.active')).toHaveCount(1);
      await expect(page.locator('#count')).toHaveText(`0${n} / 06`);
      const overflow=await page.evaluate(()=>{
        const stage=document.querySelector('#deck').getBoundingClientRect();
        const walker=document.createTreeWalker(document.querySelector('.slide.active'),NodeFilter.SHOW_TEXT);
        const bad=[];let node;
        while((node=walker.nextNode())){if(!node.textContent.trim())continue;const r=document.createRange();r.selectNodeContents(node);const b=r.getBoundingClientRect();if(b.width&&(b.left<stage.left-2||b.right>stage.right+2||b.top<stage.top-2||b.bottom>stage.bottom+2))bad.push(node.textContent.trim())}
        return {bad,horizontal:document.documentElement.scrollWidth>innerWidth+1};
      });
      assert.deepEqual(overflow,{bad:[],horizontal:false});
      await page.screenshot({path:`/tmp/kora-deck-${viewport.width}-${n}.png`,fullPage:true});
    }
    await page.keyboard.press('Home');await expect(page).toHaveURL(/#1$/);
    await page.keyboard.press('ArrowRight');await expect(page).toHaveURL(/#2$/);
    await page.keyboard.press('Space');await expect(page).toHaveURL(/#3$/);
    await page.keyboard.press('ArrowLeft');await expect(page).toHaveURL(/#2$/);
    await page.getByRole('button',{name:'Next slide',exact:true}).click();await expect(page).toHaveURL(/#3$/);
    await page.reload();await expect(page.locator('#count')).toHaveText('03 / 06');
    await page.getByRole('button',{name:'Previous slide',exact:true}).focus();await page.keyboard.press('Space');await expect(page).toHaveURL(/#2$/);
    await page.keyboard.press('End');await expect(page).toHaveURL(/#6$/);
    await expect(page.getByRole('link',{name:/Explore the live pilot/})).toHaveAttribute('rel','noopener noreferrer');
    await page.evaluate(()=>{const field=document.createElement('input');field.id='keyboard-test';document.body.appendChild(field);field.focus()});
    await page.keyboard.press('ArrowLeft');await expect(page).toHaveURL(/#6$/);
    await page.keyboard.press('Home');await expect(page).toHaveURL(/#6$/);
    assert.equal(errors.length,0);console.log(`PASS ${viewport.width}px: six slides, bounds, keyboard, buttons, deep link, input guard`);
    await page.close();
  }
  const page=await browser.newPage({viewport:{width:1600,height:900}});
  await page.goto(url+'#2');await page.evaluate(()=>Promise.all(document.getAnimations().map(a=>a.finished)));
  assert.equal(await page.evaluate(()=>document.getAnimations().some(a=>a.playState==='running')),false);
  console.log('PASS finite motion settles for recording');
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
