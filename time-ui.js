(function () {
    "use strict";
    const secao = document.querySelector(".time-pokemon");
    if (!secao) return;
    const lista = document.getElementById("lista-time");
    const status = document.getElementById("status-time");
    const atualizar = document.getElementById("atualizar-time");
    const quantidade = document.getElementById("quantidade-time");
    let repositorio;
    let integrantes = [];
    let carregado = false;
    let ocupado = false;

    function mensagem(texto, erro = false) {
        status.textContent = texto;
        status.className = erro ? "erro" : "";
    }

    function atualizarBotoes() {
        secao.querySelectorAll("button").forEach(botao => {
            botao.disabled = ocupado || !repositorio;
        });
        const adicionar = document.getElementById("adicionar-time");
        if (adicionar) {
            const completo = carregado && integrantes.length >= 6;
            adicionar.disabled = !repositorio || !carregado || ocupado || completo;
            adicionar.textContent = completo ? "Time completo (6/6)" : "Adicionar ao time";
        }
        lista.setAttribute("aria-busy", String(ocupado));
    }

    function renderizar() {
        lista.replaceChildren();
        for (let posicao = 1; posicao <= 6; posicao++) {
            const item = document.createElement("li");
            item.className = "vaga-time";
            const numero = document.createElement("span");
            numero.className = "numero-vaga";
            numero.textContent = `Vaga ${posicao}`;
            item.append(numero);
            const integrante = integrantes.find(p => p.posicao === posicao);
            if (!integrante) {
                item.classList.add("vaga-vazia");
                const vazio = document.createElement("p");
                vazio.textContent = carregado ? "Vaga disponível" : "Aguardando o banco";
                item.append(vazio);
            } else {
                const nome = String(integrante.nome);
                const titulo = nome.charAt(0).toUpperCase() + nome.slice(1);
                const imagem = document.createElement("img");
                imagem.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${integrante.pokemon_id}.png`;
                imagem.alt = titulo;
                imagem.width = 96;
                imagem.height = 96;
                imagem.addEventListener("error", () => { imagem.hidden = true; });
                const texto = document.createElement("strong");
                texto.textContent = `${titulo} #${integrante.pokemon_id}`;
                const acoes = document.createElement("div");
                acoes.className = "acoes-time";
                const abrir = document.createElement("button");
                abrir.type = "button";
                abrir.textContent = "Abrir";
                abrir.setAttribute("aria-label", `Abrir ${titulo} da vaga ${posicao}`);
                abrir.addEventListener("click", () => {
                    const campo = document.getElementById("campo-busca");
                    campo.value = String(integrante.pokemon_id);
                    document.getElementById("botao-buscar").click();
                    campo.focus();
                });
                const remover = document.createElement("button");
                remover.type = "button";
                remover.textContent = "Remover";
                remover.setAttribute("aria-label", `Remover ${titulo} da vaga ${posicao}`);
                remover.addEventListener("click", () => executar(async () => {
                    await repositorio.excluir(integrante.id);
                    await atualizarAposMutacao("Integrante removido");
                }));
                acoes.append(abrir, remover);
                item.append(imagem, texto, acoes);
            }
            lista.append(item);
        }
        quantidade.textContent = carregado ? String(integrantes.length) : "—";
    }

    async function carregar(sucesso = "Time atualizado.") {
        integrantes = await repositorio.listar();
        carregado = true;
        renderizar();
        mensagem(integrantes.length ? sucesso : "Seu time está vazio. Pesquise um Pokémon para começar.");
    }

    async function atualizarAposMutacao(sucesso) {
        try {
            await carregar(`${sucesso} no banco.`);
        } catch (erro) {
            // Não apresentar uma gravação já concluída como falha de inclusão.
            carregado = false;
            mensagem(`${sucesso}, mas não foi possível atualizar o time. Clique em Atualizar time. ${erro.message}`, true);
        }
    }

    async function executar(acao) {
        if (ocupado || !repositorio) return;
        ocupado = true;
        atualizarBotoes();
        mensagem("Consultando o time no banco...");
        try {
            await acao();
        } catch (erro) {
            mensagem(erro.message, true);
        } finally {
            ocupado = false;
            atualizarBotoes();
        }
    }

    window.bootdexTime = {
        mostrarBotao(pokemon) {
            const botao = document.createElement("button");
            botao.id = "adicionar-time";
            botao.type = "button";
            botao.addEventListener("click", () => executar(async () => {
                await repositorio.adicionar(pokemon);
                await atualizarAposMutacao("Integrante adicionado");
            }));
            document.querySelector("#resultado .card-pokemon").append(botao);
            atualizarBotoes();
        }
    };

    atualizar.addEventListener("click", () => executar(() => carregar()));
    renderizar();
    try {
        repositorio = window.criarRepositorioTime(window.BOOTDEX_CONFIG);
        executar(() => carregar());
    } catch (erro) {
        mensagem(erro.message.replace("usar os favoritos", "montar o time"), true);
        atualizarBotoes();
    }
})();
