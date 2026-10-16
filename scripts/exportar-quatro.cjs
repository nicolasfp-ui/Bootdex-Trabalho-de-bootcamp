// Exportação sem dependências extras: node scripts/exportar-quatro.cjs PASTA_DESTINO
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const destination = process.argv[2];
if (!destination) throw new Error('Informe a pasta de destino.');
fs.mkdirSync(destination, { recursive: true });
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const html = read('index.html').replace(/^\s*<script src="(?:config|favoritos-api|favoritos-ui)\.js"><\/script>\s*$/gm, '');
const script = ['config.js', 'favoritos-api.js', 'favoritos-ui.js', 'script.js']
  .map(name => `// ===== Origem: ${name} =====\n${read(name)}`)
  .join('\n;\n');
fs.writeFileSync(path.join(destination, 'index.html'), html);
fs.writeFileSync(path.join(destination, 'script.js'), script.replaceAll('em config.js', 'no início de script.js'));
fs.copyFileSync(path.join(root, 'style.css'), path.join(destination, 'style.css'));
const original = read('README.md');
const etapa01 = original.slice(original.indexOf('# Etapa 01 — documentação preservada'));
const sql = read('supabase/schema.sql');
const readme = `# BootDex — versão com quatro arquivos

Esta exportação reúne configuração e integração dos favoritos em script.js. Mantenha index.html, script.js e style.css na mesma pasta. Não depende de config.js, favoritos-api.js nem favoritos-ui.js separados.

## Links

- [GitHub](https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp)
- [GitHub Pages](https://nicolasfp-ui.github.io/Bootdex-Trabalho-de-bootcamp/)
- Docker Hub: pendente de confirmação do Docker ID e publicação. O nome informado, nicolasfp-ui, contém hífen; confirme o Docker ID no perfil antes de usar nos comandos.

As alterações exportadas precisam ser publicadas no GitHub para aparecer no Pages. O banco ainda não foi configurado, as imagens não foram publicadas e as evidências ainda precisam ser capturadas.

## Correção da busca

A entrega anterior com quatro arquivos referenciava três arquivos adicionais ausentes. A busca recebia o Pokémon, mas uma falha na integração de favoritos era apresentada como erro de conexão com a PokéAPI. Esta versão incorpora as dependências no script.js e mantém a busca funcionando quando a integração não está disponível.

## Configurar o Supabase

No início de script.js, preencha BOOTDEX_CONFIG com a URL HTTPS do projeto e a chave pública anon ou publishable. Não use senha, service_role ou chave secret. A configuração pública ficará visível no navegador. Sem configuração, a busca funciona, mas os favoritos ficam desabilitados com uma explicação.

Crie um projeto Supabase e execute este SQL no SQL Editor. Habilite a Data API e exponha o schema public:

\`\`\`sql
${sql}
\`\`\`

O PostgreSQL armazena UUID, número único do Pokémon, nome e data. A aplicação cria, lista e exclui pela API REST do Supabase, sem localStorage. A lista é pública e compartilhada; todos podem salvar e excluir, conforme a simplificação acadêmica de RLS aberta aceita no enunciado. Não armazene dados pessoais. Uso privado exige autenticação, user_id e RLS por usuário. A lista respeita o limite de linhas da Data API; não há paginação ou atualização em tempo real.

Teste salvar Pikachu, conferir a linha no Table Editor, fechar e reabrir o navegador e excluir. Tentar salvar novamente deve avisar sobre duplicata. Use Atualizar lista para alterações feitas em outro navegador. A validação com banco real ainda depende da sua configuração.

## Executar localmente

Use Live Server no VS Code ou Python instalado:

\`\`\`sh
python -m http.server 8000
\`\`\`

Abra http://localhost:8000. PokéAPI, imagens e Supabase precisam de internet.

## Docker e SQ1

O pacote original do projeto contém Dockerfile e .dockerignore. Para esta exportação de quatro arquivos, crie um Dockerfile com:

\`\`\`dockerfile
FROM nginx:stable-alpine
COPY index.html style.css script.js /usr/share/nginx/html/
EXPOSE 80
\`\`\`

Crie .dockerignore excluindo .git, README.md, node_modules, testes, rascunhos e arquivos .env. Isso reduz o contexto enviado e o trabalho do build. O COPY explícito evita incluir arquivos desnecessários na imagem final.

Inicie Docker Desktop em modo Linux containers e preencha a configuração pública no script.js antes do build:

\`\`\`sh
docker build -t bootdex:1.1 .
docker run -d -p 8080:80 --name bootdex-8080 bootdex:1.1
docker logs bootdex-8080
\`\`\`

Abra http://localhost:8080. O banco continua no Supabase. Docker run -e não altera a configuração do site estático. O build e os containers ainda dependem de Docker Desktop ativo e não foram validados neste ambiente.

## SQ2 — tags 1.0, 1.1 e latest

No histórico original, o commit 570a177 é a base funcional 1.0; fbf0d52 acrescenta Abrir nos favoritos e contador (1.1). Construa e teste a imagem 1.0 a partir do código daquele commit, usando o Dockerfile correspondente. Construa a versão corrigida atual como 1.1. Não gere as duas versões apenas renomeando a mesma imagem.

Após confirmar seu Docker ID e criar o repositório público bootdex, substitua SEU_DOCKER_ID:

\`\`\`sh
docker login
docker tag bootdex:1.0 SEU_DOCKER_ID/bootdex:1.0
docker push SEU_DOCKER_ID/bootdex:1.0
docker tag bootdex:1.1 SEU_DOCKER_ID/bootdex:1.1
docker push SEU_DOCKER_ID/bootdex:1.1
docker tag bootdex:1.1 SEU_DOCKER_ID/bootdex:latest
docker push SEU_DOCKER_ID/bootdex:latest
\`\`\`

As imagens bootdex:1.0 e bootdex:1.1 precisam existir e estar testadas antes de executar esses comandos. Capture as três tags no Hub e faça commit da evidência.

## SQ3 — overview do Hub

Publique no Overview, após substituir o Docker ID:

BootDex: Pokédex com busca, filtros por geração/tipo, shiny e favoritos compartilhados em PostgreSQL no Supabase. Execute: docker run -d -p 8080:80 SEU_DOCKER_ID/bootdex:1.1. Acesse http://localhost:8080. Código: https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp

## SQ4 — dois containers

Com bootdex-8080 em execução e a porta 8081 livre:

\`\`\`sh
docker run -d -p 8081:80 --name bootdex-8081 bootdex:1.1
docker ps
\`\`\`

Abra as portas 8080 e 8081 e capture o terminal real mostrando os dois containers em execução. Salve o print no repositório e insira a imagem neste README usando uma URL absoluta do GitHub/raw. Não há captura pronta nesta exportação.

Se eu tivesse 100 containers, usaria Kubernetes: um cluster reúne máquinas; cada Pod agrupa um ou mais containers; um Deployment mantém a quantidade desejada de réplicas dos Pods e substitui os que falham. Um Service oferece acesso estável e distribui o tráfego. As réplicas usariam o mesmo banco Supabase. Não é preciso implantar Kubernetes para cumprir esta pesquisa.

## Entrega e comando do avaliador

Após publicar uma imagem pública com o Supabase configurado, preencha o link real do Hub acima e substitua o Docker ID neste comando:

\`\`\`sh
docker run -d -p 8080:80 SEU_DOCKER_ID/bootdex:1.1
\`\`\`

O comando ainda é um modelo, não uma imagem confirmada. Valide-o em máquina limpa. Antes do Moodle: configurar/testar o banco, publicar a Etapa 02 no Pages, construir/testar/publicar as tags, publicar overview, commitar as evidências e preencher todos os links. Então envie somente o README.md final.

O pacote original inclui um bundle com o histórico e os seis commits iniciais da Etapa 02. Copiar os quatro arquivos pelo site do GitHub não importa esse histórico; preserve os commits usando o bundle e integração sem squash. A correção da busca acrescenta uma revisão posterior. O acesso GitHub disponível aqui é somente leitura; os commits não foram enviados ao remoto.

## Referências

- [Supabase: API REST](https://supabase.com/docs/guides/api/quickstart)
- [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Docker: build e publicação](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/)
- [Kubernetes: Pods](https://kubernetes.io/docs/concepts/workloads/pods/)

---

${etapa01}
`;
fs.writeFileSync(path.join(destination, 'README.md'), readme);
console.log('Exportados index.html, script.js, style.css e README.md.');
