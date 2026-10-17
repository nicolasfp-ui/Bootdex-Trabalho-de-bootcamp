# BootDex

Pokédex web com busca por nome/número, sugestões, filtros por geração/tipo e shiny. Os favoritos e o time compartilhado são armazenados em PostgreSQL no Supabase. O time permite até seis integrantes, inclusive Pokémon repetidos, com inclusão, abertura e remoção por vaga. O frontend é servido por Nginx.

## Executar

Execute a imagem pública, com a configuração do Supabase incorporada:

```sh
docker run -d -p 8080:80 nickfpceub/bootdex:1.1
```

Acesse http://localhost:8080. Internet é necessária para a PokéAPI e o Supabase. Os favoritos são públicos: qualquer visitante pode adicionar e excluir. Não salve dados pessoais.

Versões publicadas: `1.0` (CRUD e Docker), `1.1` (abrir favoritos e contador), `latest` (1.1).

Código e documentação: https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp

Demonstração: https://nicolasfp-ui.github.io/Bootdex-Trabalho-de-bootcamp/
