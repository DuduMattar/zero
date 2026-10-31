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

async function readSettings(page: Page): Promise<Record<string, unknown>> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open('zero');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('settings', 'readonly');
          const get = tx.objectStore('settings').get('singleton');
          get.onsuccess = () => resolve((get.result ?? {}) as Record<string, unknown>);
          get.onerror = () => reject(get.error);
        };
      }),
  );
}

/** Liga a reposição de nicotina direto no banco (o onboarding dos testes não passa por esse passo). */
async function enableNrt(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const req = indexedDB.open('zero');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction('profile', 'readwrite');
          const store = tx.objectStore('profile');
          const get = store.get('singleton');
          get.onsuccess = () => {
            const p = get.result as Record<string, unknown>;
            store.put({ ...p, nrt: { uses: true, kind: 'gum', plannedEndAt: null }, nicotineFreeAt: null, updatedAt: Date.now() });
          };
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
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

  test('SOS: primeira avaliação, "continua" com troca, saída com registro, fechar com descarte', async ({ page }) => {
    await onboard(page);
    // botão principal com a cor do componente (regressão do reset de CSS fora das camadas)
    const sosBtn = page.getByTestId('sos');
    const style = await sosBtn.evaluate((el) => { const cs = getComputedStyle(el); return { color: cs.color, weight: cs.fontWeight }; });
    expect(style.color).toBe('rgb(255, 255, 255)');
    expect(style.weight).toBe('600');
    await sosBtn.click();
    await expect(page.getByTestId('sos-timer')).toHaveText(/0[23]:\d\d/);
    await expect(page.locator('[aria-live=polite]')).toContainText(/Inspire|Segure|Solte/);
    await page.getByRole('button', { name: /Como está a vontade/ }).click();
    await page.getByRole('radiogroup', { name: 'Intensidade agora' }).getByRole('radio', { name: '7' }).click();
    await expect(page.getByText(/Registrado: 7 aos \d+ s/)).toBeVisible();
    // a vontade continua → outra estratégia, mesmo episódio
    await page.getByTestId('sos-continue').click();
    await expect(page.getByText('O que ajudaria agora?')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Definir uma pessoa de apoio' })).toBeVisible();
    await page.getByTestId('sos-continue-switch').click();
    await page.getByTestId('strategy-water').click();
    await expect(page.getByRole('heading', { name: 'Beber água' })).toBeVisible();
    await expect(page.getByText(/Registrado: 7 aos \d+ s/)).toBeVisible();
    // diminuiu → salvar, com contexto recolhido
    await page.getByTestId('sos-passed').click();
    await page.getByRole('radiogroup', { name: 'Intensidade final' }).getByRole('radio', { name: '2' }).click();
    await expect(page.getByRole('button', { name: 'Café' })).toHaveCount(0);
    await page.getByTestId('sos-context').click();
    await page.getByRole('button', { name: 'Café' }).click();
    await page.getByTestId('sos-save-resisted').click();
    await expect(page.getByTestId('sos')).toBeVisible();
    let ev = await readEvents(page);
    const c = ev.find((e) => e.type === 'craving') as Record<string, unknown>;
    expect(c.outcome).toBe('resisted');
    expect(c.strategies).toEqual(['breathing', 'water']);
    expect(c.intensityBefore).toBe(7);
    expect(c.intensityAfter).toBe(2);
    expect(c.trigger).toBe('coffee');
    // segunda sessão: sai com a vontade presente
    await page.getByTestId('sos').click();
    await page.getByTestId('sos-continue').click();
    await page.getByTestId('sos-save-continued').click();
    await expect(page.getByTestId('sos')).toBeVisible();
    // terceira: abriu sem querer → descartar, nada gravado
    await page.getByTestId('sos').click();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await page.getByTestId('sos-close-discard').click();
    await expect(page.getByTestId('sos')).toHaveText('Estou com vontade de fumar');
    ev = await readEvents(page);
    const cs = ev.filter((e) => e.type === 'craving') as Record<string, unknown>[];
    expect(cs.length).toBe(2);
    expect(cs.some((e) => e.outcome === 'continued' && e.intensityBefore === null)).toBe(true);
    await page.getByRole('link', { name: 'Histórico' }).click();
    await expect(page.getByText('Vontade diminuiu')).toBeVisible();
    await expect(page.getByText('Vontade continuava ao sair')).toBeVisible();
  });

  test('SOS: rascunho sobrevive a recarregar o app (não testa a suspensão real do iOS); link do WhatsApp preparado, não enviado; fechar salva como encerrada', async ({ page }) => {
    await onboard(page);
    await page.goto('/#/ajustes/perfil');
    await page.getByTestId('support-name').fill('Pedro');
    await page.getByTestId('support-phone').fill('11 99999-0000');
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    await expect(page).not.toHaveURL(/perfil/);
    await page.goto('/#/');
    await page.getByTestId('sos').click();
    await page.getByRole('button', { name: /Como está a vontade/ }).click();
    await page.getByRole('radiogroup', { name: 'Intensidade agora' }).getByRole('radio', { name: '6' }).click();
    await expect(page.getByText(/Registrado: 6 aos/)).toBeVisible();
    await expect.poll(async () => ((await readSettings(page)) as { sosDraft?: { state?: { intensityBefore?: number } } | null }).sosDraft?.state?.intensityBefore).toBe(6);
    // sai do SOS pelo painel e recarrega o app inteiro (como voltar de outro app)
    await page.goto('/#/');
    await expect(page.getByTestId('sos')).toHaveText('Voltar à vontade em andamento');
    await page.reload();
    await expect(page.getByTestId('sos')).toHaveText('Voltar à vontade em andamento');
    await expect(page.getByTestId('sos-draft-hint')).toBeVisible();
    await page.getByTestId('sos').click();
    await expect(page.getByText(/Registrado: 6 aos/)).toBeVisible(); // exatamente o mesmo episódio
    await page.getByTestId('sos-continue').click();
    const wa = page.getByTestId('sos-support');
    await expect(wa).toHaveText('Falar com Pedro');
    await expect(wa).toHaveAttribute('href', /^https:\/\/wa\.me\/5511999990000\?text=/);
    await expect(wa).toHaveAttribute('target', '_blank');
    await page.getByRole('button', { name: 'Tentar outra estratégia' }).click();
    await page.getByTestId('strategy-walk').click();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await page.getByTestId('sos-close-save').click();
    await expect(page.getByTestId('sos')).toHaveText('Estou com vontade de fumar');
    const ev = await readEvents(page);
    const cs = ev.filter((e) => e.type === 'craving') as Record<string, unknown>[];
    expect(cs.length).toBe(1); // sem duplicação
    expect(cs[0].outcome).toBe('abandoned');
    expect(cs[0].intensityBefore).toBe(6);
    expect(cs[0].strategies).toEqual(['breathing', 'walk']);
    expect(ev.some((e) => e.type === 'nrt_dose')).toBe(false); // sem dose inventada
  });

  test('SOS com reposição: escolher a estratégia não registra dose; confirmar registra uma, mesmo após trocar e sair por "Continua"', async ({ page }) => {
    await onboard(page);
    await enableNrt(page);
    await page.goto('/#/');
    await page.reload(); // a consulta ao vivo só vê gravações feitas pelo próprio Dexie
    await expect(page.getByText('em reposição de nicotina')).toBeVisible();
    await page.getByTestId('sos').click();
    await page.getByTestId('sos-switch').click();
    await page.getByTestId('strategy-nrt_fast').click();
    await expect(page.getByRole('heading', { name: 'Goma ou pastilha de reposição' })).toBeVisible();
    await page.getByTestId('sos-switch').click();
    await page.getByTestId('strategy-water').click();
    await page.getByTestId('sos-continue').click();
    // a pergunta aparece na saída "Continua" porque a reposição esteve na sessão
    await expect(page.getByTestId('sos-nrt-confirm')).toBeVisible();
    await page.getByTestId('sos-save-continued').click(); // sem responder: nada de dose
    await expect(page.getByTestId('sos')).toBeVisible();
    let ev = await readEvents(page);
    expect(ev.filter((e) => e.type === 'nrt_dose').length).toBe(0);
    expect((ev.find((e) => e.type === 'craving') as Record<string, unknown>).strategies).toEqual(['breathing', 'nrt_fast', 'water']);
    // segunda sessão: confirma a goma e fecha pelo "Fechar"
    await page.getByTestId('sos').click();
    await page.getByTestId('sos-switch').click();
    await page.getByTestId('strategy-nrt_fast').click();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await page.getByTestId('sos-nrt-confirm').getByRole('button', { name: 'Goma' }).click();
    await expect(page.getByText(/Dose às \d\d:\d\d/)).toBeVisible();
    await page.getByTestId('sos-close-save').click();
    await expect(page.getByTestId('sos')).toBeVisible();
    ev = await readEvents(page);
    const doses = ev.filter((e) => e.type === 'nrt_dose') as Record<string, unknown>[];
    expect(doses.length).toBe(1);
    expect(doses[0].kind).toBe('gum');
    const cs = ev.filter((e) => e.type === 'craving') as Record<string, unknown>[];
    expect(cs.length).toBe(2);
    expect(doses[0].id).toBe(`${cs.find((c) => c.outcome === 'abandoned')!.id}-nrt`); // id derivado do episódio
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

  test('uso registrado pelo SOS: fluxo protetor, histórico preservado, dias somados não zeram', async ({ page }) => {
    await onboard(page, 5);
    await expect(page.getByTestId('total-days')).toHaveText('5');
    await expect(page.getByRole('link', { name: /Registrar um uso/ })).toBeVisible();
    await page.getByTestId('sos').click();
    await expect(page.getByTestId('sos-smoked')).toHaveText(/Fumei|Usei/);
    await page.getByTestId('sos-smoked').click();
    await expect(page).toHaveURL(/lapso/);
    await page.getByTestId('slip-units').fill('2');
    await page.getByRole('button', { name: /Adicionar detalhes/ }).click();
    await page.getByRole('button', { name: 'Estresse' }).click();
    await page.getByTestId('slip-save').click();
    await expect(page.getByText('Uso registrado. O histórico permanece.')).toBeVisible();
    await expect(page.getByText(/Dias somados: 5/)).toBeVisible();
    await page.getByRole('button', { name: 'Voltar ao painel' }).click();
    await expect(page.getByTestId('total-days')).toHaveText('5');
    await expect(page.getByText(/há 0 min desde o último uso/)).toBeVisible();
    await expect(page.getByText('Maior período contínuo')).toBeVisible();
    await page.getByRole('link', { name: 'Histórico' }).click();
    await expect(page.getByTestId('ev-craving')).toContainText('Vontade → uso');
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
    await expect(page.getByText('prazo passado').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'NHS · INCA' }).first()).toHaveAttribute('href', /nhs\.uk|gov\.br/);
    // card do dia no painel
    await page.getByRole('link', { name: 'Agora' }).click();
    await expect(page.getByText('Referência de recuperação')).toBeVisible();
    await expect(page.getByText('Mensagem do dia')).toBeVisible();
    await expect(page.getByText('Olfato e paladar melhoram')).toBeVisible();
  });

  test('V2 entrega 2: plano do dia, objetivo, revisão, motivos no SOS, discreto, perfil, CSV, compartilhar', async ({ page }) => {
    // Chrome headless expõe navigator.share mas nunca resolve; sem ele o app cai no download, que é o que testamos.
    await page.addInitScript(() => { Object.defineProperty(navigator, 'share', { value: undefined }); Object.defineProperty(navigator, 'canShare', { value: undefined }); });
    await onboard(page, 2);
    // plano do dia
    await expect(page.getByTestId('plan-card')).toBeVisible();
    await page.getByTestId('plan-done').click();
    await expect(page.getByTestId('plan-card')).toContainText('Feito hoje');
    await page.getByTestId('plan-undo').click();
    await expect(page.getByTestId('plan-done')).toBeVisible();
    await page.getByTestId('plan-done').click();
    await expect(page.getByTestId('plan-card')).toContainText('Feito hoje');
    // compartilhar (sem Web Share no Chrome headless → download)
    const dl = page.waitForEvent('download');
    await page.getByTestId('share').click();
    expect((await dl).suggestedFilename()).toMatch(/zero-2-dias\.png/);
    // modo discreto
    await page.getByTestId('discreet').click();
    await expect(page.locator('html')).toHaveClass(/discreet/);
    await page.getByTestId('discreet').click();
    await expect(page.locator('html')).not.toHaveClass(/discreet/);
    // motivos no SOS
    await page.getByTestId('sos').click();
    await page.getByTestId('sos-toggle-reasons').click();
    await expect(page.getByTestId('sos-reasons')).toContainText('Dormir melhor');
    await page.getByRole('button', { name: 'Fechar' }).click();
    await page.getByTestId('sos-close-discard').click();
    // objetivo de dinheiro
    await page.getByRole('link', { name: 'Tendências' }).click();
    await page.getByTestId('goal-title').fill('Tênis novo');
    await page.getByTestId('goal-amount').fill('20');
    await page.getByTestId('goal-add').click();
    await expect(page.getByText('✓ Tênis novo')).toBeVisible(); // R$24 economizados em 2 dias ≥ R$20
    await expect(page.getByTestId('review-card')).toContainText('Revisão da semana');
    // perfil editável
    await page.goto('/#/ajustes/perfil');
    await page.getByRole('button', { name: 'Tabaco aquecido' }).click();
    await page.getByRole('button', { name: 'Salvar perfil' }).click();
    await expect(page).not.toHaveURL(/perfil/);
    await page.goto('/#/');
    await expect(page.getByText('Sem cigarro')).toBeVisible();
    // CSV
    await page.getByRole('link', { name: 'Histórico' }).click();
    const csv = page.waitForEvent('download');
    await page.getByTestId('csv').click();
    expect((await csv).suggestedFilename()).toBe('zero-historico.csv');
    await expect(page.getByTestId('ev-activity_done')).toBeVisible();
  });
});
