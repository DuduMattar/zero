import { expect, test, type Page } from '@playwright/test';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function localInput(msAgo: number) {
  const d = new Date(Date.now() - msAgo);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

async function onboard(page: Page, quitDaysAgo = 3) {
  await page.goto('/');
  await expect(page).toHaveURL(/onboarding/);
  await page.getByTestId('onb-next').click(); // 0 → 1 produtos
  await page.getByRole('button', { name: 'Vape / pod' }).click();
  await page.getByTestId('onb-next').click(); // 2 consumo (chips)
  await page.getByRole('button', { name: '20 (1 maço)' }).click();
  await page.getByTestId('cons-price').fill('12');
  await expect(page.getByText('por mês')).toBeVisible();
  await page.getByTestId('onb-next').click(); // 3 história
  await page.getByTestId('onb-next').click(); // 4 gatilhos
  await page.getByRole('button', { name: 'Café' }).click();
  await page.getByTestId('onb-next').click(); // 5 motivos
  await page.getByRole('button', { name: 'Dormir melhor' }).click();
  await page.getByTestId('onb-next').click(); // 6 data
  await page.locator('input[type=datetime-local]').fill(localInput(quitDaysAgo * 86_400_000));
  await page.getByTestId('onb-next').click(); // 7 NRT
  await page.getByTestId('onb-next').click(); // 8 metas
  await page.getByTestId('onb-next').click(); // 9 resumo
  await page.getByTestId('onb-next').click(); // concluir
  await expect(page.getByTestId('sos')).toBeVisible();
}

async function readEvents(page: Page): Promise<Array<Record<string, unknown>>> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('zero');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('events', 'readonly');
          const all = tx.objectStore('events').getAll();
          all.onsuccess = () => resolve(all.result as Array<Record<string, unknown>>);
          all.onerror = () => reject(all.error);
        };
      }),
  );
}

test.describe('ZERO V1', () => {
  test('onboarding → painel persiste após recarregar', async ({ page }) => {
    await onboard(page, 3);
    await expect(page.getByTestId('total-days')).toHaveText('3');
    await page.reload();
    await expect(page.getByTestId('sos')).toBeVisible();
    await expect(page.getByTestId('total-days')).toHaveText('3');
    await expect(page.getByText('Sem vape')).toBeVisible();
    await expect(page.getByText('Sem cigarro')).toBeVisible();
  });

  test('SOS abre direto no cronômetro, aceita avaliação intermediária e grava evento', async ({ page }) => {
    await onboard(page);
    await page.getByTestId('sos').click();
    await expect(page.getByTestId('sos-timer')).toHaveText(/0[23]:\d\d/);
    await expect(page.locator('[aria-live=polite]')).toContainText(/Inspire|Segure|Solte/);
    await page.getByRole('button', { name: 'Como está agora?' }).click();
    await page.getByRole('radio', { name: '7' }).click();
    await expect(page.getByText('Registrado: 7')).toBeVisible();
    await page.getByTestId('sos-passed').click();
    await page.getByRole('radio', { name: '2' }).click();
    await page.getByRole('button', { name: 'Café' }).click();
    await page.getByTestId('sos-save-resisted').click();
    await expect(page.getByTestId('sos')).toBeVisible();
    const ev = await readEvents(page);
    const c = ev.find((e) => e.type === 'craving') as Record<string, unknown>;
    expect(c).toBeTruthy();
    expect(c.outcome).toBe('resisted');
    expect(c.intensityAfter).toBe(2);
    expect(c.trigger).toBe('coffee');
    expect((c.ratings as unknown[]).length).toBe(1);
    await page.getByRole('link', { name: 'Histórico' }).click();
    await expect(page.getByTestId('ev-craving')).toContainText('Vontade superada');
  });

  test('diário em menos de 60 s e visível no painel', async ({ page }) => {
    await onboard(page);
    const t0 = Date.now();
    await page.getByRole('button', { name: 'Humor bem' }).click();
    await expect(page.getByRole('radiogroup', { name: 'Humor' }).getByRole('radio', { name: '4' })).toHaveAttribute('aria-checked', 'true');
    await page.getByRole('radiogroup', { name: 'Sono (noite passada)' }).getByRole('radio', { name: '5' }).click();
    await page.getByRole('button', { name: 'Insônia' }).click();
    await page.getByTestId('diary-text').fill('Dia tranquilo.');
    await page.getByTestId('diary-save').click();
    await expect(page.getByTestId('sos')).toBeVisible();
    expect(Date.now() - t0).toBeLessThan(60_000);
    await expect(page.getByText('Registrado: humor 4/5 · sono 5/5')).toBeVisible();
  });

  test('lapso: fluxo protetor, histórico preservado, dias acumulados não zeram', async ({ page }) => {
    await onboard(page, 5);
    await expect(page.getByTestId('total-days')).toHaveText('5');
    await page.getByRole('link', { name: /Registrar lapso/ }).click();
    await page.getByTestId('slip-units').fill('2');
    await page.getByRole('button', { name: 'Estresse' }).click();
    await page.getByTestId('slip-save').click();
    await expect(page.getByText('Um lapso não apaga o caminho.')).toBeVisible();
    await expect(page.getByText(/dias livres acumulados: 5/)).toBeVisible();
    await page.getByRole('button', { name: 'Voltar ao painel' }).click();
    await expect(page.getByTestId('total-days')).toHaveText('5');
    await expect(page.getByText(/Sequência atual:/)).toContainText('0 min');
    await page.getByRole('link', { name: 'Histórico' }).click();
    await expect(page.getByTestId('ev-slip')).toContainText('Lapso: 2 cigarros');
    await expect(page.getByText('· lapso')).toBeVisible();
  });

  test('backup: exportar, testar restauração e mesclar', async ({ page }) => {
    await onboard(page);
    await page.getByRole('link', { name: 'Ajustes' }).click();
    await page.getByRole('button', { name: 'Backups e restauração' }).click();
    const dl = page.waitForEvent('download');
    await page.getByTestId('backup-export').click();
    const file = await dl;
    const dir = mkdtempSync(join(tmpdir(), 'zero-'));
    const path = join(dir, 'b.json');
    await file.saveAs(path);
    await expect(page.getByText(/Último backup externo:|Último:/)).not.toContainText('nunca');

    // arquivo corrompido é recusado
    const bad = join(dir, 'bad.json');
    writeFileSync(bad, JSON.stringify({ app: 'zero', schemaVersion: 1, exportedAt: 1, checksum: 'x'.repeat(64), payload: { profile: null, events: [], goals: [], settings: null } }));
    await page.getByTestId('backup-test-file').setInputFiles(bad);
    await expect(page.getByText(/Checksum não confere/)).toBeVisible();

    // testar restauração não altera nada
    await page.getByTestId('backup-test-file').setInputFiles(path);
    await expect(page.getByTestId('import-preview')).toContainText('Arquivo válido');
    await page.getByRole('button', { name: 'Fechar' }).click();

    // mesclar o próprio backup: 0 novos
    await page.getByTestId('backup-file').setInputFiles(path);
    await expect(page.getByTestId('import-preview')).toContainText('0 novos');
    await page.getByTestId('import-merge').click();
    await expect(page.getByTestId('sos')).toBeVisible();
  });

  test('tema escuro e movimento reduzido', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await onboard(page);
    await expect(page.locator('html')).toHaveClass(/dark/);
    await page.getByTestId('sos').click();
    const anim = await page.locator('.breathe').evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe('none');
    await expect(page.locator('[aria-live=polite]')).toContainText(/Inspire|Segure|Solte/);
  });

  test('V2: consumo fácil, linha do tempo com fontes e tendências', async ({ page }) => {
    await onboard(page, 2);
    // estimativa de dinheiro: 20 cigarros/dia a R$12 o maço = R$12/dia
    await page.getByRole('link', { name: 'Tendências' }).click();
    await expect(page.getByText('R$ 12,00/dia')).toBeVisible();
    await expect(page.getByText('Conquistas')).toBeVisible();
    await expect(page.getByText('✓ 24 horas')).toBeVisible();
    // linha do tempo
    await page.getByRole('link', { name: 'Histórico' }).click();
    await page.getByRole('link', { name: /Linha do tempo da recuperação/ }).click();
    await expect(page.getByText('✓ alcançado').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'NHS · INCA' }).first()).toHaveAttribute('href', /nhs\.uk|gov\.br/);
    // card do dia no painel
    await page.getByRole('link', { name: 'Agora' }).click();
    await expect(page.getByText('Seu corpo agora')).toBeVisible();
    await expect(page.getByText('Mensagem do dia')).toBeVisible();
    await expect(page.getByText('Olfato e paladar melhoram')).toBeVisible();
  });
});
