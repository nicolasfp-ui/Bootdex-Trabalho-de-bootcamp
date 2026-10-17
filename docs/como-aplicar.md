# Aplicar a Etapa 02 preservando o histórico

O pacote contém o código-fonte e `Bootdex-etapa-02.bundle`, um arquivo Git com o histórico original, os seis commits iniciais, a correção da exportação em quatro arquivos a montagem do time de até seis integrantes, inclusive repetidos, e a revisão do README com as três evidências. A conexão GitHub disponível na preparação tinha apenas leitura; os commits não foram enviados ao repositório remoto.

## Opção recomendada: trazer os commits para o mesmo repositório

Extraia o pacote. No PowerShell, dentro de uma cópia limpa do repositório original, substitua o caminho pelo local onde extraiu o bundle:

```powershell
git status
git fetch "C:\caminho\Bootdex-etapa-02.bundle" etapa-02
git switch -c etapa-02 FETCH_HEAD
git log --oneline -9
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

1. Entrar no Git com a conta `nicolasfp-ui` ou conceder permissão de escrita à conta `nickcryptye`, que está conectada atualmente. O envio foi recusado por falta de permissão.
2. Enviar a branch com o histórico, integrar sem squash e confirmar que o README, o Dockerfile, o `.dockerignore` e as três imagens de `docs/evidencias/` aparecem no mesmo repositório.
3. Conferir a versão atualizada no GitHub Pages, a persistência ao reabrir o navegador e as imagens do README.
4. Conferir a execução da imagem em máquina sem cópia local e enviar somente o README final ao Moodle.

O Supabase já foi configurado. As imagens 1.0, 1.1 e latest foram publicadas em `nickfpceub/bootdex`, e as três capturas reais foram recebidas. A data dos dois relatos de teste foi alterada para 15/10/2026 a pedido do autor.

Não envie senhas, tokens ou chaves secretas nesta conversa. A configuração do frontend usa somente URL e chave pública do Supabase.