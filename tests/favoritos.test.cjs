const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function api(fetch) {
  const context = { fetch, URL, AbortSignal, window: {} };
  const source = fs.existsSync('favoritos-api.js') ? fs.readFileSync('favoritos-api.js', 'utf8') : '';
  vm.runInNewContext(source, context);
  assert.equal(typeof context.window.criarRepositorioFavoritos, 'function', 'repositório deve existir');
  return context.window.criarRepositorioFavoritos;
}

test('configuração ausente impede requisições e explica como configurar', async () => {
  const create = api(() => { throw new Error('Não deveria acessar rede'); });
  assert.throws(() => create({}), /config.js/);
});

test('criar, reabrir e excluir usa a API do banco com os campos e filtros corretos', async () => {
  const records = [];
  const create = api(async (url, options) => {
    assert.equal(new URL(url).pathname, '/rest/v1/favoritos');
    assert.equal(options.headers.apikey, 'sb_publishable_teste');
    assert.equal(options.headers.Authorization, undefined);
    const query = new URL(url).searchParams;
    if (options.method === 'POST') {
      assert.deepEqual(JSON.parse(options.body), { pokemon_id: 25, nome: 'pikachu' });
      records.push({ id: 'abc', pokemon_id: 25, nome: 'pikachu', criado_em: '2026-10-16' });
      return new Response(JSON.stringify(records), { status: 201 });
    }
    if (options.method === 'DELETE') {
      assert.equal(query.get('id'), 'eq.abc');
      return new Response(JSON.stringify(records.splice(0)), { status: 200 });
    }
    assert.equal(query.get('select'), 'id,pokemon_id,nome,criado_em');
    assert.equal(query.get('order'), 'criado_em.desc,id.desc');
    return new Response(JSON.stringify(records));
  });
  const config = { url: 'https://teste.supabase.co/', chavePublica: 'sb_publishable_teste' };
  await create(config).salvar({ id: 25, name: 'pikachu' });
  const reopened = create(config);
  assert.equal((await reopened.listar())[0].nome, 'pikachu');
  await reopened.excluir('abc');
  assert.equal((await reopened.listar()).length, 0);
});

test('erros de duplicata, permissão e rede não viram sucesso', async () => {
  const config = { url: 'https://teste.supabase.co', chavePublica: 'anon-teste' };
  for (const [status, body, expected] of [
    [409, { code: '23505' }, /já está/],
    [403, { code: '42501' }, /RLS/],
    [401, {}, /chave pública/],
    [404, {}, /schema.sql/],
    [500, {}, /banco/],
  ]) {
    const repo = api(async () => new Response(JSON.stringify(body), { status }))(config);
    await assert.rejects(repo.salvar({ id: 25, name: 'pikachu' }), expected);
  }
  const offline = api(async () => { throw new TypeError('offline'); })(config);
  await assert.rejects(offline.listar(), /conexão/);
  const absent = api(async () => new Response('[]'))(config);
  await assert.rejects(absent.excluir('abc'), /não foi encontrado/);
});
