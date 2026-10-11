// login + create a custom plan + analyze it with AI and accept the changes, then delete it

import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('create a custom plan, analyze it and accept the changes', async ({ page }) => {
  // the analyze step waits on an AI call
  test.setTimeout(60_000);
  await login(page);

  await page.getByRole('button', { name: 'Custom plan' }).click();
  await page.getByRole('textbox', { name: 'Plan name' }).fill('Tester plan');
  await page.getByRole('textbox', { name: 'Meal' }).fill('Snack');

  await page.getByRole('combobox', { name: 'Choose ingredient' }).click();
  await page.getByPlaceholder('Search by ingredient name...').fill('apple');
  await page.getByRole('option', { name: /Granny Smith Apple/i }).first().click();
  await page.getByRole('button', { name: 'Serving unit' }).click();
  await page.getByRole('button', { name: /^Pieces/ }).click();
  await page.getByRole('spinbutton', { name: 'Amount' }).fill('10');
  await page.getByRole('button', { name: 'Create plan' }).click();

  await page.getByRole('tab', { name: 'Saved' }).click();
await page.getByText('Tester plan', { exact: true }).click();
  await page.getByRole('button', { name: 'Make changes' }).click();
  await expect(page.getByRole('heading', { name: 'Tester plan' })).toBeVisible();
  await page.getByRole('textbox', { name: 'What would you like to change?' }).fill('Suggest something to go with my apples.');
  await page.getByRole('button', { name: 'Review and make changes' }).click();
  await expect(page.getByText('A clearer path for Tester plan' )).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Accept changes' }).click();

  await page.getByRole('tab', { name: 'Saved' }).click();
  await page.getByText('Tester plan', { exact: true }).click();
  await page.getByRole('button', { name: 'Delete plan' }).click();
  await expect(page.getByText('No saved plans yet')).toBeVisible();
});
