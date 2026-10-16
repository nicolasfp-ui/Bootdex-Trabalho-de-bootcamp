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
        for (const favorito of registros) {
            const item = document.createElement("li");
            const nome = String(favorito.nome);
            const titulo = nome.charAt(0).toUpperCase() + nome.slice(1);
            const texto = document.createElement("span");
            texto.textContent = `#${favorito.pokemon_id} — ${titulo}`;
            const excluir = document.createElement("button");
            excluir.type = "button";
            excluir.textContent = "Excluir";
            excluir.setAttribute("aria-label", `Excluir ${titulo}`);
            excluir.addEventListener("click", () => executar(async () => {
                await repositorio.excluir(favorito.id);
                await atualizarAposMutacao("Favorito excluído");
            }));
            item.append(texto, excluir);
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
