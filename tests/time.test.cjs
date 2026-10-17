const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup() {
  const records = [];
  let counter = 0;
  let forbidden = false;
  const context = { window: {}, URL, AbortSignal, atob, fetch: async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.pathname, '/rest/v1/time_pokemon');
    if (forbidden) return new Response('{"code":"42501"}', { status: 403 });
    if (options.method === 'POST') {
      const body = JSON.parse(options.body);
      assert.ok(body.posicao >= 1 && body.posicao <= 6);
      if (records.some(r => r.posicao === body.posicao)) {
        return new Response('{"code":"23505"}', { status: 409 });
      }
      const row = { id: String(++counter), ...body, criado_em: '2026-10-17' };
      records.push(row);
      return new Response(JSON.stringify([row]), { status: 201 });
    }
    if (options.method === 'DELETE') {
      const id = parsed.searchParams.get('id').slice(3);
      const found = records.findIndex(r => r.id === id);
      return new Response(JSON.stringify(found < 0 ? [] : records.splice(found, 1)));
    }
    assert.equal(parsed.searchParams.get('select'), 'id,posicao,pokemon_id,nome,criado_em');
    assert.equal(parsed.searchParams.get('order'), 'posicao.asc');
    return new Response(JSON.stringify([...records].sort((a,b) => a.posicao-b.posicao)));
  } };
  vm.runInNewContext(fs.readFileSync('favoritos-api.js', 'utf8'), context);
  assert.equal(typeof context.window.criarRepositorioTime, 'function', 'repositório do time deve existir');
  const create = () => context.window.criarRepositorioTime({ url: 'https://teste.supabase.co', chavePublica: 'sb_publishable_teste' });
  return { create, records, forbid: () => { forbidden = true; } };
}

test('time aceita seis integrantes, persiste ao reabrir e rejeita o sétimo', async () => {
  const { create, records } = setup();
  const repo = create();
  for (const id of [1, 4, 7, 25, 133, 150]) await repo.adicionar({ id, name: `pokemon-${id}` });
  assert.deepEqual(records.map(x => x.posicao), [1,2,3,4,5,6]);
  assert.equal((await create().listar()).length, 6);
  await assert.rejects(repo.adicionar({ id: 6, name: 'charizard' }), /completo|seis|6/);
  assert.equal(records.length, 6);
});

test('permite Pokémon repetidos e reutiliza somente a vaga removida', async () => {
  const { create } = setup();
  const repo = create();
  await repo.adicionar({ id: 25, name: 'pikachu' });
  await repo.adicionar({ id: 133, name: 'eevee' });
  await repo.adicionar({ id: 25, name: 'pikachu' });
  const first = (await repo.listar())[0];
  await repo.excluir(first.id);
  await repo.adicionar({ id: 1, name: 'bulbasaur' });
  const rows = await create().listar();
  assert.deepEqual(rows.map(r => [r.posicao, r.pokemon_id]), [[1,1],[2,133],[3,25]]);
});

test('erros de RLS não são apresentados como inclusão concluída', async () => {
  const { create, forbid } = setup();
  const repo = create();
  forbid();
  await assert.rejects(repo.adicionar({ id: 25, name: 'pikachu' }), /RLS/);
});
