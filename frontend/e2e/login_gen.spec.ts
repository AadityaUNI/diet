// login + edit profile macros + generate an AI plan, save it, set it active, then delete it

import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('generate, save, activate and delete an AI plan', async ({ page }) => {
  // AI plan generation alone can take most of the default 30s test budget
  test.setTimeout(120_000);
  await login(page);

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByRole('button', { name: 'Body' }).click();
  await page.getByRole('button', { name: 'Goal' }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Maintain', exact: true }).click();
  await page.getByRole('button', { name: 'Macros' }).click();
  await page.getByLabel('Fiber (g)').fill('39');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Save Changes' }).click();

  const profile = page.locator('section');
  await expect(profile).toContainText('Fibre · 39g');
  await expect(profile).toContainText('2,680kcal');
  await expect(profile).toContainText('vegetarian');
  await expect(profile).toContainText('cheese');

  await page.getByRole('button', { name: 'AI plan' }).click();
  await page.getByRole('button', { name: 'Generate My Plans' }).click();
  await expect(page.getByRole('main')).toContainText('Plan 1', { timeout: 60_000 });
  await page.getByText(/^Plan 1 - /).click();
  await page.getByRole('button', { name: 'Show ingredients for Breakfast' }).click();
  await expect(page.getByRole('button', { name: 'Show ingredients for Lunch' })).toBeVisible();
  await page.getByRole('button', { name: 'Save this Plan' }).click();
  await expect(page.getByRole('main')).toContainText('Saved');

  await page.getByRole('button', { name: 'Home' }).click();
  await page.getByRole('tab', { name: 'Saved' }).click();
  await expect(page.getByText('1 plans')).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: 'Use this Plan' }).click();

  await page.getByRole('tab', { name: 'Active' }).click();
  await expect(page.getByRole('button', { name: 'Make changes' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Edit plan' })).toBeVisible();

  await page.getByRole('tab', { name: 'Saved' }).click();
  await page.getByRole('button', { name: 'Delete plan' }).click();
  await expect(page.getByText('No saved plans yet')).toBeVisible();
});
