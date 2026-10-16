# BootDex

Pokédex web com busca por nome/número, sugestões, filtros por geração/tipo e shiny. Os favoritos compartilhados são criados, listados e excluídos em PostgreSQL no Supabase. O frontend é servido por Nginx.

## Executar

Após publicar a imagem com configuração pública do Supabase e substituir `SEU_DOCKER_ID`:

```sh
docker run -d -p 8080:80 SEU_DOCKER_ID/bootdex:1.1
```

Acesse http://localhost:8080. Internet é necessária para a PokéAPI e o Supabase. Os favoritos são públicos: qualquer visitante pode adicionar e excluir. Não salve dados pessoais.

Versões previstas: `1.0` (CRUD e Docker), `1.1` (abrir favoritos e contador), `latest` (1.1).

Código e documentação: https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp

Demonstração: https://nicolasfp-ui.github.io/Bootdex-Trabalho-de-bootcamp/
