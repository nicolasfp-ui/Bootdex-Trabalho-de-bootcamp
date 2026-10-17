const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');

async function setup(t, configured = true, missingIntegration = false, missingTeam = false) {
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || undefined });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const records = [];
  const team = [];
  let teamId = 0;
  let failure = false;
  let readFailure = false;
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === 'bootdex.test') {
      if (missingIntegration && ['/config.js', '/favoritos-api.js', '/favoritos-ui.js', '/time-ui.js'].includes(url.pathname)) {
        return route.fulfill({ status: 404, body: '' });
      }
      if (url.pathname === '/config.js') {
        return route.fulfill({ contentType: 'application/javascript', body: configured
          ? 'window.BOOTDEX_CONFIG={url:"https://teste.supabase.co",chavePublica:"sb_publishable_teste"}'
          : 'window.BOOTDEX_CONFIG={url:"",chavePublica:""}' });
      }
      const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
      const contentType = name.endsWith('.js') ? 'application/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html';
      const root = process.env.BOOTDEX_TEST_ROOT || path.join(__dirname, '../..');
      let body = await fs.readFile(path.join(root, name), 'utf8');
      if (process.env.BOOTDEX_TEST_ROOT && name === 'script.js') {
        // Preenche somente os campos públicos da configuração da exportação.
        body = body.replace(/url: "[^"]*"/, `url: "${configured ? 'https://teste.supabase.co' : ''}"`)
          .replace(/chavePublica: "[^"]*"/, `chavePublica: "${configured ? 'sb_publishable_teste' : ''}"`);
      }
      return route.fulfill({ contentType, body });
    }
    if (url.hostname === 'teste.supabase.co') {
      const method = route.request().method();
      if (failure) return route.fulfill({ status: 403, json: { code: '42501' } });
      if (url.pathname.endsWith('/time_pokemon')) {
        if (missingTeam) return route.fulfill({ status: 404, json: { code: 'PGRST205' } });
        if (method === 'POST') {
          const row = route.request().postDataJSON();
          if (team.some(p => p.posicao === row.posicao)) return route.fulfill({ status: 409, json: { code: '23505' } });
          team.push({ id: `time-${++teamId}`, ...row, criado_em: '2026-10-17' });
          return route.fulfill({ status: 201, json: [team.at(-1)] });
        }
        if (method === 'DELETE') {
          const i = team.findIndex(p => `eq.${p.id}` === url.searchParams.get('id'));
          return route.fulfill({ json: i < 0 ? [] : team.splice(i, 1) });
        }
        return route.fulfill({ json: team });
      }
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
      if (url.pathname.endsWith('/pokemon/pikachu') || url.pathname.endsWith('/pokemon/25')) data = {
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
  return { page, records, team, fail: () => { failure = true; }, failReads: () => { readFailure = true; } };
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
  await page.setViewportSize({ width: 375, height: 800 });
  assert.equal(await page.locator('#lista-favoritos li').evaluate(el => getComputedStyle(el).alignItems), 'flex-start');
  await page.getByRole('button', { name: 'Abrir Pikachu' }).click();
  await page.locator('#botao-shiny').waitFor();
  assert.equal(await page.locator('#campo-busca').inputValue(), '25');
  assert.equal(await page.locator('#quantidade-favoritos').innerText(), '1');
  await page.getByRole('button', { name: 'Excluir Pikachu' }).click();
  await page.getByText('Nenhum favorito salvo.').waitFor();
  assert.equal(records.length, 0);
});

test('sem configuração explica a pendência e permite pesquisar', async t => {
  const { page } = await setup(t, false);
  await page.locator('#status-favoritos').filter({ hasText: /Configure a URL e a chave pública/ }).waitFor();
  await page.locator('#status-time').filter({ hasText: /Configure a URL e a chave pública/ }).waitFor();
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

test('a busca não acusa falha de API quando faltam os arquivos dos favoritos', async t => {
  const { page } = await setup(t, false, true);
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.waitForFunction(() => document.querySelector('#resultado').textContent.includes('Electric mouse.') || document.querySelector('#resultado').textContent.includes('Não foi possível conectar'));
  assert.match(await page.locator('#resultado').innerText(), /Electric mouse/);
  await page.locator('#botao-shiny').click();
  assert.equal(await page.locator('#imagem-pokemon').getAttribute('src'), 'https://images.test/shiny.png');
});

test('time permite Pikachu repetido, reabre e remove só a vaga escolhida', async t => {
  const { page, team, records } = await setup(t);
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.locator('#botao-shiny').waitFor();
  assert.equal(await page.locator('#adicionar-time').count(), 1, 'deve haver botão de adicionar ao time');
  await page.locator('#adicionar-time').click();
  await page.getByRole('button', { name: 'Remover Pikachu da vaga 1' }).waitFor();
  assert.equal(team.length, 1);
  assert.equal(records.length, 0);
  assert.equal(await page.locator('#adicionar-time').isDisabled(), false);
  await page.locator('#adicionar-time').click();
  await page.getByRole('button', { name: 'Remover Pikachu da vaga 2' }).waitFor();
  assert.equal(team.length, 2);
  await page.reload();
  await page.getByRole('button', { name: 'Remover Pikachu da vaga 1' }).click();
  await page.waitForFunction(() => document.querySelector('#quantidade-time').textContent === '1');
  assert.equal(team.length, 1);
  assert.equal(team[0].posicao, 2);
  await page.getByRole('button', { name: 'Remover Pikachu da vaga 2' }).click();
  await page.getByText('Seu time está vazio. Pesquise um Pokémon para começar.').waitFor();
});

test('time mostra seis vagas, bloqueia o sétimo e libera a vaga removida', async t => {
  const { page, team } = await setup(t);
  team.push(...[1,4,7,25,133,150].map((id,i) => ({ id: `seed-${id}`, posicao: i+1, pokemon_id: id, nome: `pokemon-${id}`, criado_em: '2026-10-17' })));
  await page.reload();
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.locator('#botao-shiny').waitFor();
  assert.equal(await page.locator('#adicionar-time').count(), 1, 'deve haver botão do time');
  assert.equal(await page.locator('#quantidade-time').innerText(), '6');
  assert.equal(await page.locator('#lista-time li').count(), 6);
  assert.equal(await page.locator('#adicionar-time').isDisabled(), true);
  await page.getByRole('button', { name: 'Remover Pokemon-25 da vaga 4' }).click();
  await page.waitForFunction(() => document.querySelector('#quantidade-time').textContent === '5');
  assert.equal(await page.locator('#adicionar-time').isDisabled(), false);
  await page.locator('#adicionar-time').click();
  await page.getByRole('button', { name: 'Remover Pikachu da vaga 4' }).waitFor();
  assert.equal(team.length, 6);
  assert.equal(team.find(p => p.pokemon_id === 25).posicao, 4);
});

test('tabela do time ausente explica o SQL sem impedir busca e favoritos', async t => {
  const { page } = await setup(t, true, false, true);
  assert.equal(await page.locator('#status-time').count(), 1, 'seção de status do time deve existir');
  await page.locator('#status-time').getByText(/supabase-time.sql/).waitFor();
  await page.locator('#campo-busca').fill('pikachu');
  await page.locator('#botao-buscar').click();
  await page.getByRole('button', { name: 'Salvar favorito', exact: true }).click();
  await page.locator('#lista-favoritos li').waitFor();
  assert.equal(await page.locator('#adicionar-time').isDisabled(), true);
});
