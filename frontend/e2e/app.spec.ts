import { test, expect } from '@playwright/test';
import { installWailsMock } from './wailsMock';

test.beforeEach(async ({ page }) => {
  await installWailsMock(page);
});

test('carga la lista de clientes', async ({ page }) => {
  await page.goto('/clientes');
  await expect(page.getByText('Gestión de Clientes')).toBeVisible();
  await expect(page.getByText('Juan')).toBeVisible();
});

test('crea un cliente y aparece en la lista', async ({ page }) => {
  await page.goto('/clientes/nuevo');
  await page.getByRole('textbox', { name: 'Nombre' }).fill('María');
  await page.getByRole('textbox', { name: 'Apellido' }).fill('Lopez');
  await page.getByRole('button', { name: 'Guardar Cliente' }).click();

  await expect(page).toHaveURL(/\/clientes/);
  await expect(page.getByText('María')).toBeVisible();
});
