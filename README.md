# Bootdex-Trabalho-de-bootcamp

## Descrição

A BootDex é uma aplicação web frontend que permite pesquisar Pokémon pelo nome ou número e visualizar informações úteis de forma organizada.

Além da busca principal, a aplicação possui pesquisa avançada por geração e tipo, sugestões de Pokémon durante a digitação e visualização da versão shiny quando disponível.

Na Etapa 02, o projeto recebeu uma lista de favoritos compartilhados, com armazenamento em banco de dados PostgreSQL por meio do Supabase. É possível salvar, listar e excluir Pokémon favoritos e montar um time com até seis integrantes, mantendo os dados no banco após fechar o navegador. Pokémon repetidos são permitidos no time.

## API utilizada

- **PokéAPI:** https://pokeapi.co/
- **Documentação:** https://pokeapi.co/docs/v2
- **Supabase:** https://supabase.com/
- **Documentação:** https://supabase.com/docs

### Endpoints consumidos

- `https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`
- `https://pokeapi.co/api/v2/pokemon`
- `https://pokeapi.co/api/v2/type/{tipo}`
- `https://pokeapi.co/api/v2/generation`
- `https://pokeapi.co/api/v2/generation/{id}`
- Endpoint de espécie disponibilizado pela própria resposta da PokéAPI
- `https://jdcmjcrcrmiopbfpopvu.supabase.co/rest/v1/favoritos`

## Funcionalidades

- Buscar Pokémon pelo nome ou número
- Exibir nome e número do Pokémon
- Exibir imagem oficial do Pokémon
- Exibir tipo(s) do Pokémon
- Exibir altura e peso
- Exibir experiência base
- Exibir quantidade de habilidades
- Exibir descrição do Pokémon
- Layout responsivo para diferentes tamanhos de tela
- Mostrar sugestões durante a digitação
- Pesquisar Pokémon por geração
- Pesquisar Pokémon por tipo
- Exibir avisos para buscas inválidas ou falhas na API
- Combinar filtros de geração e tipo
- Alternar entre imagem normal e versão shiny
- Salvar Pokémon favoritos no Supabase
- Carregar os favoritos ao abrir a aplicação
- Atualizar a lista de favoritos
- Excluir favoritos do banco de dados
- Abrir os detalhes de um Pokémon salvo
- Exibir a quantidade de favoritos carregados
- Impedir favoritos duplicados (no time, Pokémon repetidos são permitidos)
- Exibir avisos de erro na conexão ou nas permissões do banco

- Adicionar Pokémon ao time pelo resultado da busca
- Montar um time com até seis integrantes, inclusive repetidos
- Exibir as seis vagas, imagens e contador do time
- Abrir os detalhes e remover um integrante pela sua vaga
- Recuperar o time salvo ao abrir a aplicação
- Atualizar o time compartilhado com outros visitantes

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Fetch API
- PokéAPI
- Supabase
- PostgreSQL
- Docker e Nginx
- Git e GitHub
- GitHub Pages

## Como executar localmente

1. Clone o repositório:

   `git clone https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp.git`

2. Entre na pasta do projeto:

   `cd Bootdex-Trabalho-de-bootcamp`

3. Abra a pasta no Visual Studio Code e execute o arquivo `index.html` com a extensão Live Server.

Também é possível iniciar um servidor local com Python instalado:

```sh
python -m http.server 8000
```

Depois, acesse http://localhost:8000.

Na versão de quatro arquivos, a configuração pública do Supabase e a integração dos favoritos estão reunidas no início de `script.js`. Mantenha `index.html`, `script.js` e `style.css` na mesma pasta. É necessário acesso à internet para consultar a PokéAPI e o Supabase.

## Persistência de dados

O banco escolhido foi o PostgreSQL, disponibilizado pelo Supabase. Os favoritos são armazenados na tabela `favoritos`.

### Estrutura da tabela

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador único do favorito |
| `pokemon_id` | Integer | Número do Pokémon, sem duplicatas |
| `nome` | Text | Nome do Pokémon |
| `criado_em` | Timestamptz | Data e hora de criação do registro |

### Operações realizadas

- **Criar:** salvar um Pokémon pesquisado na lista de favoritos.
- **Listar:** consultar os registros ao abrir a página ou atualizar a lista.
- **Excluir:** remover um favorito pelo seu identificador.

Os dados ficam no banco, sem utilização de localStorage como persistência. A URL do projeto e a chave pública publishable já estão configuradas no `script.js` fornecido. A senha do banco e as chaves secretas não devem ser incluídas no frontend.

### Políticas de acesso

A tabela utiliza Row Level Security (RLS), com políticas que permitem leitura, criação e exclusão para visitantes anônimos.

A lista é pública e compartilhada: todos os visitantes podem adicionar e excluir favoritos. Essa é uma simplificação para o trabalho acadêmico. Uma lista privada por usuário exigiria autenticação e políticas específicas. A listagem respeita o limite de linhas da API e não possui paginação ou sincronização em tempo real.

### Verificação

Em 15/10/2026, as operações de criar, listar e excluir foram confirmadas no Supabase real. O registro temporário utilizado no teste foi removido ao final. A verificação pela interface publicada e após fechar e reabrir o navegador ainda deve ser realizada.

## Montar um time de Pokémon

Pesquise um Pokémon e clique em **Adicionar ao time**. A seção **Meu time** mostra seis vagas, com imagem, nome e número de cada integrante. O mesmo Pokémon pode ocupar mais de uma vaga.

- **Adicionar:** ocupa a primeira vaga livre e salva o integrante no Supabase.
- **Abrir:** consulta os detalhes do Pokémon daquela vaga.
- **Remover:** exclui somente o integrante da vaga escolhida, mesmo que haja outro igual no time.
- **Atualizar time:** carrega as mudanças feitas por outros visitantes.

Ao atingir seis integrantes, o botão de adicionar fica desabilitado. Remover um integrante libera a vaga. O banco também protege o limite por meio de seis posições únicas, numeradas de 1 a 6, inclusive com acessos simultâneos.

### Tabela do time

O time é independente dos favoritos e utiliza a tabela `time_pokemon`:

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | UUID | Identificador de cada integrante |
| `posicao` | Integer | Vaga única entre 1 e 6 |
| `pokemon_id` | Integer | Número do Pokémon; repetições são permitidas |
| `nome` | Text | Nome do Pokémon |
| `criado_em` | Timestamptz | Data e hora da inclusão |

O time é público e compartilhado, sem login, assim como os favoritos. Visitantes podem adicionar e remover integrantes. Não há sincronização em tempo real; utilize **Atualizar time** para conferir alterações feitas em outro navegador.

A tabela e suas políticas foram configuradas com o SQL do time, sem alterar os favoritos. Em outro projeto Supabase, execute esse SQL antes de utilizar a funcionalidade. Na versão de quatro arquivos, toda a integração já está incorporada ao `script.js`.

### Testes do time

Em 15/10/2026, foram confirmadas no Supabase real a inclusão de seis Pikachu repetidos, a recuperação dos registros, o bloqueio de um sétimo integrante, a rejeição de posição fora do intervalo e a exclusão dos registros temporários. O teste deixou o time vazio ao terminar.

Testes de interface com respostas controladas também cobrem repetidos, recarregamento, remoção de uma vaga específica, liberação da vaga e funcionamento dos favoritos. A versão publicada no GitHub Pages ainda precisa receber os arquivos atualizados e ser conferida no navegador.

## Como executar com Docker

Para a versão de quatro arquivos, utilize um `Dockerfile` na raiz com o seguinte conteúdo:

```dockerfile
FROM nginx:stable-alpine
COPY index.html style.css script.js /usr/share/nginx/html/
EXPOSE 80
```

Com o Docker Desktop iniciado em modo Linux containers, execute:

```sh
docker build -t bootdex:1.1 .
docker run -d -p 8080:80 --name bootdex-8080 bootdex:1.1
```

Acesse http://localhost:8080.

### Comandos úteis

```sh
docker ps
docker logs bootdex-8080
docker stop bootdex-8080
docker rm bootdex-8080
```

A aplicação é servida pelo Nginx e os favoritos continuam no Supabase, independentemente do container. As versões 1.0 e 1.1 foram construídas e executadas localmente com Docker Desktop em Linux containers. A versão 1.0 foi conferida na porta 8082; dois containers da versão 1.1 foram executados nas portas 8080 e 8081.

## Sidequests da Etapa 02

### SQ1 — .dockerignore

O arquivo `.dockerignore` exclui arquivos desnecessários do contexto enviado ao Docker, como histórico Git, documentação, dependências e rascunhos. Isso reduz a transferência de arquivos e o trabalho do build. O `COPY` explícito também evita incluir conteúdo desnecessário na imagem final.

Para a versão de quatro arquivos, crie o arquivo na raiz com, por exemplo:

```text
.git
README.md
node_modules
.env
.env.*
*.log
tests
docs
rascunhos
```

O pacote completo preparado anteriormente contém um `.dockerignore`; o pacote com somente os quatro arquivos exige adicionar esse arquivo separadamente.

### SQ2 — Versionamento da imagem

As versões publicadas no repositório público `nickfpceub/bootdex` são:

- **1.0:** favoritos com criação, listagem e exclusão, junto da preparação Docker.
- **1.1:** abertura dos Pokémon salvos, contador de favoritos e montagem do time de até seis integrantes, inclusive repetidos.
- **latest:** referência à versão 1.1.

No histórico local preparado, a base da versão 1.0 é o commit `570a177`; a melhoria 1.1 começa em `fbf0d52`. Cada imagem deve ser construída a partir da versão correspondente. A imagem atual também inclui a correção da exportação em quatro arquivos.

Para reproduzir a publicação, construa e teste as versões correspondentes e execute os comandos abaixo (a tag local 1.0 foi construída diretamente como `nickfpceub/bootdex:1.0`):

```sh
docker login
docker push nickfpceub/bootdex:1.0
docker tag bootdex:1.1 nickfpceub/bootdex:1.1
docker push nickfpceub/bootdex:1.1
docker tag bootdex:1.1 nickfpceub/bootdex:latest
docker push nickfpceub/bootdex:latest
```

As tags `1.0`, `1.1` e `latest` estão publicadas, conforme a captura da aba Tags abaixo.

![Tags 1.0, 1.1 e latest publicadas no Docker Hub](https://raw.githubusercontent.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp/main/docs/evidencias/dockerhub-tags.png)

- **Tags publicadas:** https://hub.docker.com/r/nickfpceub/bootdex/tags

### SQ3 — Descrição no Docker Hub

O overview foi publicado com a descrição da BootDex, o comando de execução e o link do GitHub, conforme a captura abaixo.

![Overview publicado no Docker Hub](https://raw.githubusercontent.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp/main/docs/evidencias/dockerhub-overview.png)

### SQ4 — Dois containers e orquestração

Com o primeiro container em execução na porta 8080, inicie o segundo:

```sh
docker run -d -p 8081:80 --name bootdex-8081 bootdex:1.1
docker ps
```

Confira a aplicação nas portas 8080 e 8081. A captura real abaixo mostra os dois containers da versão 1.1 em execução: `bootdex-8080` na porta 8080 e `bootdex-8081` na porta 8081.

![Dois containers BootDex em execução](https://raw.githubusercontent.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp/main/docs/evidencias/docker-ps-dois-containers.png)

Se eu tivesse 100 containers, utilizaria Kubernetes para gerenciar a execução em um cluster, que é um conjunto de máquinas. Os containers seriam organizados em Pods. Um Deployment manteria a quantidade desejada de réplicas dos Pods e substituiria os que apresentassem falhas. Um Service ofereceria acesso estável à aplicação e distribuiria o tráfego entre as réplicas. Todas continuariam utilizando o mesmo banco no Supabase.

## Versionamento do projeto

O histórico da Etapa 01 foi preservado na cópia local. Foram preparados seis novos commits para a Etapa 02, além da correção posterior da busca e da implementação do time de até seis integrantes.

Para preservar esse histórico no mesmo repositório, importe o bundle disponibilizado no pacote completo e envie os commits pela sua conta, sem utilizar squash na integração. Enviar apenas os arquivos pelo navegador do GitHub não importa os seis commits preparados. O envio desse histórico ao repositório remoto ainda precisa ser confirmado.

## Comando de execução para o avaliador

Com Docker instalado e a porta 8080 livre, execute a imagem publicada no Docker Hub:

```sh
docker run -d -p 8080:80 nickfpceub/bootdex:1.1
```

Acesse http://localhost:8080. O Docker baixa a imagem quando ela não está disponível localmente. É necessário acesso à internet para consultar a PokéAPI e o Supabase. O teste em uma máquina limpa ainda deve ser conferido antes da entrega.

## Evidências e pendências para a entrega

As capturas das três tags, do overview e dos dois containers já foram recebidas e estão no pacote, em `docs/evidencias/`. Publique essa pasta no mesmo repositório e na branch `main`: as imagens deste README utilizam URLs absolutas para funcionar também quando o arquivo for enviado isoladamente ao Moodle.

- Publicar este README e as três imagens recebidas no GitHub.
- Confirmar a versão atualizada no GitHub Pages e a persistência ao reabrir o navegador.
- Confirmar que o Dockerfile e o `.dockerignore` foram adicionados ao mesmo repositório.
- Enviar o histórico com pelo menos seis novos commits ao mesmo repositório, preservando a Etapa 01.
- Conferir o comando de execução em uma máquina sem a imagem local.

## Links

- **Aplicação no ar (GitHub Pages):** https://nicolasfp-ui.github.io/Bootdex-Trabalho-de-bootcamp/
- **Repositório:** https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp
- **Docker Hub:** https://hub.docker.com/r/nickfpceub/bootdex
- **Tags:** https://hub.docker.com/r/nickfpceub/bootdex/tags
