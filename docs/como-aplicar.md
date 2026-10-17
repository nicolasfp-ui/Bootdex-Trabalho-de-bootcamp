# Aplicar a Etapa 02 preservando os seis commits

O pacote contém o código-fonte e `Bootdex-etapa-02.bundle`, um arquivo Git com o histórico original, os seis commits iniciais, a correção da exportação em quatro arquivos e a montagem do time de até seis integrantes, inclusive repetidos. A conexão GitHub disponível na preparação tinha apenas leitura; os commits não foram enviados ao repositório remoto.

## Opção recomendada: trazer os commits para o mesmo repositório

Extraia o pacote. No PowerShell, dentro de uma cópia limpa do repositório original, substitua o caminho pelo local onde extraiu o bundle:

```powershell
git status
git fetch "C:\caminho\Bootdex-etapa-02.bundle" etapa-02
git switch -c etapa-02 FETCH_HEAD
git log --oneline -6
git push -u origin etapa-02
```

Antes de trocar de branch, preserve quaisquer alterações locais que já sejam suas. Se `etapa-02` já existir, use outro nome para a nova branch em vez de sobrescrevê-la.

Abra um pull request para `main` e integre **sem squash**, preservando os seis commits. Depois configure a publicação do GitHub Pages a partir da branch/pasta corretas. O código ainda precisa da configuração pública do Supabase e das validações descritas no README.

## Alternativa: criar uma cópia diretamente do bundle

Em uma pasta onde `Bootdex-Etapa02` ainda não exista:

```powershell
git clone -b etapa-02 "C:\caminho\Bootdex-etapa-02.bundle" Bootdex-Etapa02
cd Bootdex-Etapa02
git remote set-url origin https://github.com/nicolasfp-ui/Bootdex-Trabalho-de-bootcamp.git
git push -u origin etapa-02
```

O push exige que você esteja autenticado em uma conta com permissão de escrita no repositório.

## Código-fonte sem histórico

A pasta `Bootdex` do pacote permite examinar e executar o site sem importar o bundle. **Enviar só esses arquivos pelo navegador do GitHub não transporta os seis commits.** Use o bundle para preservar o critério de evolução no mesmo repositório.

## O que ainda falta para entregar

1. Criar/configurar Supabase, executar `supabase/schema.sql` e preencher `config.js` com URL e chave pública; validar criar/listar/excluir no banco real.
2. Confirmar o Docker ID no Hub. `nicolasfp-ui` foi informado, mas contém hífen, incompatível com as regras atuais de Docker ID individual; não foi substituído por um nome inventado.
3. Iniciar Docker Desktop, construir/testar as duas versões e publicar as tags públicas 1.0, 1.1 e latest.
4. Publicar o overview e commitar as capturas reais das tags e de dois containers simultâneos.
5. Atualizar links, comando e imagens no README final. Só então enviar o README ao Moodle.

Não envie senhas ou chaves `service_role`/secret. A URL e a chave pública do Supabase são os únicos valores destinados ao frontend.
