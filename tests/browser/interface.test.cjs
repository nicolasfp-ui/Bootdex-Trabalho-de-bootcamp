const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

async function setup(t, configured = true) {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || undefined });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const records = [];
  let failure = false;
  let readFailure = false;
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'bootdex.test') {
      if (url.pathname === '/config.js' && configured) {
        return route.fulfill({ contentType: 'application/javascript', body: 'window.BOOTDEX_CONFIG={url:"https://teste.supabase.co",chavePublica:"sb_publishable_teste"}' });
      }
      const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const contentType = name.endsWith('.js') ? 'application/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html';
      return route.fulfill({ contentType, body: await fs.readFile(path.join(__dirname, '../..', name)) });
    }
    if (url.hostname === 'teste.supabase.co') {
      const method = route.request().method();
      if (failure) return route.fulfill({ status: 403, json: { code: '42501' } });
      if (readFailure && method === 'GET') return route.fulfill({ status: 503, json: {} });
      if (method === 'POST') {
        if (records.length) return route.fulfill({ status: 409, json: { code: '23505' } });
        records.push({ id: 'abc', ...route.request().postDataJSON(), criado_em: '2026-10-16' });
        return route.fulfill({ status: 201, json: records });
      }
      if (method === 'DELETE') return route.fulfill({ json: records.splice(0) });
      return route.fulfill({ json: records });
    }
    if (url.hostname === 'pokeapi.co') {
      let data = { results: [] };
      if (url.pathname.endsWith('/pokemon/pikachu')) data = {
        id: 25, name: 'pikachu', species: { url: 'https://pokeapi.co/api/v2/pokemon-species/25' },
        sprites: { other: { 'official-artwork': { front_default: 'https://images.test/normal.png', front_shiny: 'https://images.test/shiny.png' } } },
        types: [{ type: { name: 'electric' } }], height: 4, weight: 60, base_experience: 112, abilities: [{ ability: { name: 'static' } }]
      };
      else if (url.pathname.includes('pokemon-species')) data = { flavor_text_entries: [{ language: { name: 'en' }, flavor_text: 'Electric mouse.' }] };
      else if (url.pathname.endsWith('/pokemon')) data = { count: 1, results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }] };
      return route.fulfill({ json: data });
    }
    return route.fulfill({ status: 204, body: '' });
  });
  await page.goto('https://bootdex.test/');
  return { page, records, fail: () => { failure = true; }, failReads: () => { readFailure = true; } };
}

test('salvar, recarregar e excluir pela interface; busca e shiny preservados', async t => {
  const { page, records } = await setup(t);
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.locator('#botao-shiny').click();
  assert.equal(await page.locator('#imagem-pokemon').getAttribute('src'), 'https://images.test/shiny.png');
  await page.getByRole('button', { name: 'Salvar favorito', exact: true }).click();
  await page.locator('#lista-favoritos li').waitFor();
  assert.equal(records[0].pokemon_id, 25);
  await page.reload();
  await page.locator('#lista-favoritos li').waitFor();
  assert.match(await page.locator('#lista-favoritos').innerText(), /Pikachu/);
  await page.getByRole('button', { name: 'Excluir Pikachu' }).click();
  await page.getByText('Nenhum favorito salvo.').waitFor();
  assert.equal(records.length, 0);
});

test('sem configuração explica a pendência e permite pesquisar', async t => {
  const { page } = await setup(t, false);
  await page.getByText(/Configure a URL e a chave pública/).waitFor();
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.locator('#botao-shiny').waitFor();
  assert.equal(await page.getByRole('button', { name: 'Salvar favorito', exact: true }).isDisabled(), true);
});

test('falha RLS aparece e não remove favorito da interface', async t => {
  const { page, fail } = await setup(t);
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.getByRole('button', { name: 'Salvar favorito', exact: true }).click();
  await page.locator('#lista-favoritos li').waitFor();
  fail();
  await page.getByRole('button', { name: 'Excluir Pikachu' }).click();
  await page.getByText(/Acesso negado/).waitFor();
  assert.equal(await page.locator('#lista-favoritos li').count(), 1);
});

test('gravação bem-sucedida seguida de falha de leitura explica que o registro foi salvo', async t => {
  const { page, records, failReads } = await setup(t);
  await page.getByText('Nenhum favorito salvo.').waitFor();
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  failReads();
  await page.getByRole('button', { name: 'Salvar favorito', exact: true }).click();
  await page.getByText(/Favorito salvo, mas não foi possível atualizar a lista/).waitFor();
  assert.equal(records.length, 1);
});
