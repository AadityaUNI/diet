import type { Page } from '@playwright/test';

// both specs share this account and assume it starts with no saved plans
export const TEST_EMAIL = 'test@example.com';
export const TEST_PASSWORD = 'tester123';

export async function login(page: Page) {
  await page.goto('/landing');
  await page.locator('#login-email').fill(TEST_EMAIL);
  await page.locator('#login-password').fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();
}
