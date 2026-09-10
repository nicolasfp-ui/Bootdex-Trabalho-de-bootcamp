# Bootdex-Trabalho-de-bootcamp

## Descrição

A BootDex é uma aplicação web frontend que permite pesquisar Pokémon pelo nome ou número e visualizar informações úteis de forma organizada.

Além da busca principal, a aplicação possui pesquisa avançada por geração e tipo, sugestões de Pokémon durante a digitação e visualização da versão shiny quando disponível.

## API utilizada

- **PokéAPI:** https://pokeapi.co/
- **Documentação:** https://pokeapi.co/docs/v2

### Endpoints consumidos

- `https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`
- `https://pokeapi.co/api/v2/pokemon`
- `https://pokeapi.co/api/v2/type/{tipo}`
- `https://pokeapi.co/api/v2/generation`
- `https://pokeapi.co/api/v2/generation/{id}`
- Endpoint de espécie disponibilizado pela própria resposta da PokéAPI

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

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Fetch API
- PokéAPI
- Git e GitHub
- GitHub Pages

## Como executar localmente

1. Clone o repositório:

   `git clone https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp.git`

2. Entre na pasta do projeto:

   `cd Bootdex-Trabalho-de-bootcamp`

3. Abra o arquivo `index.html` no navegador.

Também é possível executar o projeto usando a extensão Live Server no Visual Studio Code.

## Links

- **Aplicação no ar (GitHub Pages):** https://nicolasfp-ui.github.io/Bootdex-Trabalho-de-bootcamp/
- **Repositório:** https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp
