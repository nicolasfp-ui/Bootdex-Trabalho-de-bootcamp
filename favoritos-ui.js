(function () {
    "use strict";
    const lista = document.getElementById("lista-favoritos");
    const status = document.getElementById("status-favoritos");
    const atualizar = document.getElementById("atualizar-favoritos");
    let repositorio;
    let ocupado = false;

    function mensagem(texto, erro = false) {
        status.textContent = texto;
        status.className = erro ? "erro" : "";
    }

    function bloquear(valor) {
        ocupado = valor;
        document.querySelectorAll(".favoritos button, #salvar-favorito").forEach(botao => {
            botao.disabled = valor || !repositorio;
        });
        lista.setAttribute("aria-busy", String(valor));
    }

    function renderizar(registros) {
        lista.replaceChildren();
        document.getElementById("quantidade-favoritos").textContent = String(registros.length);
        for (const favorito of registros) {
            const item = document.createElement("li");
            const nome = String(favorito.nome);
            const titulo = nome.charAt(0).toUpperCase() + nome.slice(1);
            const texto = document.createElement("span");
            texto.textContent = `#${favorito.pokemon_id} — ${titulo}`;
            const abrir = document.createElement("button");
            abrir.type = "button";
            abrir.textContent = "Abrir";
            abrir.setAttribute("aria-label", `Abrir ${titulo}`);
            abrir.addEventListener("click", () => {
                const campo = document.getElementById("campo-busca");
                campo.value = String(favorito.pokemon_id);
                document.getElementById("botao-buscar").click();
                campo.focus();
            });
            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.textContent = "Excluir";
            excluir.setAttribute("aria-label", `Excluir ${titulo}`);
            excluir.addEventListener("click", () => executar(async () => {
                await repositorio.excluir(favorito.id);
                await atualizarAposMutacao("Favorito excluído");
            }));
            const acoes = document.createElement("div");
            acoes.className = "acoes-favorito";
            acoes.append(abrir, excluir);
            item.append(texto, acoes);
            lista.append(item);
        }
    }

    async function recarregar(sucesso = "Lista atualizada.") {
        const registros = await repositorio.listar();
        renderizar(registros);
        mensagem(registros.length ? sucesso : "Nenhum favorito salvo.");
    }

    async function executar(acao) {
        if (ocupado || !repositorio) return;
        bloquear(true);
        mensagem("Consultando o banco...");
        try {
            await acao();
        } catch (erro) {
            mensagem(erro.message, true);
        } finally {
            bloquear(false);
        }
    }

    async function atualizarAposMutacao(sucesso) {
        try {
            await recarregar(`${sucesso} no banco.`);
        } catch (erro) {
            mensagem(`${sucesso}, mas não foi possível atualizar a lista. Clique em Atualizar lista. ${erro.message}`, true);
        }
    }

    window.bootdexFavoritos = {
        mostrarBotao(pokemon) {
            const botao = document.createElement("button");
            botao.id = "salvar-favorito";
            botao.type = "button";
            botao.textContent = "Salvar favorito";
            botao.disabled = !repositorio || ocupado;
            botao.addEventListener("click", () => executar(async () => {
                await repositorio.salvar(pokemon);
                await atualizarAposMutacao("Favorito salvo");
            }));
            document.querySelector("#resultado .card-pokemon").append(botao);
        }
    };

    atualizar.addEventListener("click", () => executar(() => recarregar()));
    try {
        repositorio = window.criarRepositorioFavoritos(window.BOOTDEX_CONFIG);
        executar(() => recarregar());
    } catch (erro) {
        mensagem(erro.message, true);
        bloquear(false);
    }
})();
