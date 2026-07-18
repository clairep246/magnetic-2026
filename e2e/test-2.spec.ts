import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://magnetic-orbital.vercel.app/pages/Login/login.html');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('e123@u.nus.edu');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByRole('link', { name: 'Browse Activities' }).click();
  await page.locator('#filter').selectOption('Joined activities');
});