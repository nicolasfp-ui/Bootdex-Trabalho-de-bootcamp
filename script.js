// =======================================================//
// TRADUÇÃO DOS TIPOS                                     //
// =======================================================//

const tiposTraduzidos = {

    normal: "Normal",
    fire: "Fogo",
    water: "Água",
    electric: "Elétrico",
    grass: "Planta",
    ice: "Gelo",
    fighting: "Lutador",
    poison: "Veneno",
    ground: "Terra",
    flying: "Voador",
    psychic: "Psíquico",
    bug: "Inseto",
    rock: "Pedra",
    ghost: "Fantasma",
    dragon: "Dragão",
    dark: "Sombrio",
    steel: "Aço",
    fairy: "Fada"

};


// =======================================================//
// CORES DOS TIPOS                                        //
// =======================================================//

const coresTipos = {

    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD"

};


// =======================================================//
// CORES DAS GERAÇÕES                                     //
// =======================================================//

const coresGeracoes = {

    1: "#E63946",
    2: "#F4A261",
    3: "#2A9D8F",
    4: "#457B9D",
    5: "#6D597A",
    6: "#E56B6F",
    7: "#F6BD60",
    8: "#84A59D",
    9: "#9B5DE5"

};


// ========================================//
// ELEMENTOS DO HTML                       //
// ========================================//

const campoBusca =
    document.getElementById("campo-busca");

const areaSugestoes =
    document.getElementById("sugestoes");

const resultado =
    document.getElementById("resultado");

const botaoBuscar =
    document.getElementById("botao-buscar");


const botaoAbrirAvancada =
    document.getElementById(
        "botao-abrir-avancada"
    );

const areaPesquisaAvancada =
    document.getElementById(
        "pesquisa-avancada"
    );

const filtroGeracao =
    document.getElementById(
        "filtro-geracao"
    );

const filtroTipo =
    document.getElementById(
        "filtro-tipo"
    );

const botaoFiltrar =
    document.getElementById(
        "botao-filtrar"
    );


// ========================================//
// LISTA DE POKÉMON                         //
// ========================================//

let listaPokemon = [];


// ========================================//
// PRIMEIRA LETRA MAIÚSCULA                 //
// ========================================//

function primeiraMaiuscula(texto) {

    return (
        texto.charAt(0).toUpperCase()
        + texto.slice(1)
    );

}


// ========================================//
// BUSCA UM POKÉMON                         //
// ========================================//

async function buscarPokemon() {

    const pokemon =
        campoBusca.value
            .toLowerCase()
            .trim();


    if (pokemon === "") {

        resultado.innerHTML = `
            <p class="erro">
                Digite o nome ou número
                de um Pokémon.
            </p>
        `;

        return;

    }


    areaSugestoes.innerHTML = "";


    resultado.innerHTML = `
        <p class="carregando">
            Carregando Pokémon...
        </p>
    `;


    try {

        const resposta =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon/${pokemon}`
            );


        if (!resposta.ok) {

            resultado.innerHTML = `
                <p class="erro">
                    Pokémon não encontrado.
                    Verifique o nome ou número
                    e tente novamente.
                </p>
            `;

            return;

        }


        const dados =
            await resposta.json();


        // ========================================//
        // DESCRIÇÃO                               //
        // ========================================//

        const respostaEspecie =
            await fetch(
                dados.species.url
            );


        let descricaoTexto =
            "Descrição não disponível.";


        if (respostaEspecie.ok) {

            const dadosEspecie =
                await respostaEspecie.json();


            const descricaoPortugues =
                dadosEspecie
                    .flavor_text_entries
                    .find(item => {

                        return (
                            item.language.name
                            === "pt"
                        );

                    });


            const descricaoIngles =
                dadosEspecie
                    .flavor_text_entries
                    .find(item => {

                        return (
                            item.language.name
                            === "en"
                        );

                    });


            const descricao =
                descricaoPortugues
                || descricaoIngles;


            if (descricao) {

                descricaoTexto =
                    descricao.flavor_text
                        .replace(/\n/g, " ")
                        .replace(/\f/g, " ");

            }

        }


        // ========================================//
        // TIPOS                                   //
        // ========================================//

        const tipos =
            dados.types.map(item => {

                const tipoIngles =
                    item.type.name;


                return {

                    nome:
                        tiposTraduzidos[
                            tipoIngles
                        ]
                        || tipoIngles,

                    nomeOriginal:
                        tipoIngles

                };

            });


        // ========================================//
        // IMAGENS                                 //
        // ========================================//

        const imagemNormal =
            dados.sprites
                .other[
                    "official-artwork"
                ]
                .front_default
            || dados.sprites.front_default;


        const imagemShiny =
            dados.sprites
                .other[
                    "official-artwork"
                ]
                .front_shiny
            || dados.sprites.front_shiny;


        const altura =
            dados.height / 10;

        const peso =
            dados.weight / 10;


        // ========================================//
        // EXIBE O POKÉMON                         //
        // ========================================//

        resultado.innerHTML = `

            <article class="card-pokemon">

                <h2>
                    ${primeiraMaiuscula(
                        dados.name
                    )}
                </h2>


                <p class="numero-pokemon">
                    #${dados.id}
                </p>


                <div class="area-imagem">

                    <img
                        id="imagem-pokemon"
                        class="imagem-pokemon"
                        src="${imagemNormal}"
                        alt="Imagem do Pokémon ${dados.name}"
                    >


                    <button
                        id="botao-shiny"
                        class="botao-shiny"
                        type="button"
                    >
                        ☆ Shiny
                    </button>

                </div>


                <div class="tipos">

                    ${tipos.map(tipo => `

                        <span
                            class="tipo"
                            style="
                                background-color:
                                ${coresTipos[
                                    tipo.nomeOriginal
                                ]};
                            "
                        >
                            ${tipo.nome}
                        </span>

                    `).join("")}

                </div>


                <div class="informacoes">

                    <div class="informacao">

                        <strong>
                            Altura
                        </strong>

                        ${altura} m

                    </div>


                    <div class="informacao">

                        <strong>
                            Peso
                        </strong>

                        ${peso} kg

                    </div>


                    <div class="informacao">

                        <strong>
                            Experiência base
                        </strong>

                        ${
                            dados.base_experience
                            ?? "Não disponível"
                        }

                    </div>


                    <div class="informacao">

                        <strong>
                            Quantidade de habilidades
                        </strong>

                        ${dados.abilities.length}

                    </div>

                </div>


                <div class="descricao">

                    <strong>
                        Descrição
                    </strong>

                    <p>
                        ${descricaoTexto}
                    </p>

                </div>

            </article>

        `;


        // ========================================//
        // BOTÃO SHINY                             //
        // ========================================//

        const imagemPokemon =
            document.getElementById(
                "imagem-pokemon"
            );


        const botaoShiny =
            document.getElementById(
                "botao-shiny"
            );


        let shinyAtivo = false;


        botaoShiny.addEventListener(
            "click",
            () => {

                shinyAtivo =
                    !shinyAtivo;


                if (shinyAtivo) {

                    imagemPokemon.src =
                        imagemShiny;


                    botaoShiny.innerHTML =
                        "★ Shiny";


                    botaoShiny.classList.add(
                        "ativo"
                    );

                } else {

                    imagemPokemon.src =
                        imagemNormal;


                    botaoShiny.innerHTML =
                        "☆ Shiny";


                    botaoShiny.classList.remove(
                        "ativo"
                    );

                }

            }
        );


    } catch (erro) {

        console.error(erro);


        resultado.innerHTML = `
            <p class="erro">
                Não foi possível conectar
                à PokéAPI.
                Verifique sua internet
                e tente novamente mais tarde.
            </p>
        `;

    }

}


// ========================================//
// CARREGA LISTA DE POKÉMON                 //
// ========================================//

async function carregarListaPokemon() {

    try {

        const respostaQuantidade =
            await fetch(
                "https://pokeapi.co/api/v2/pokemon"
            );


        if (!respostaQuantidade.ok) {

            throw new Error(
                "Erro ao consultar quantidade"
            );

        }


        const dadosQuantidade =
            await respostaQuantidade.json();


        const quantidadePokemon =
            dadosQuantidade.count;


        const resposta =
            await fetch(
                `https://pokeapi.co/api/v2/pokemon?limit=${quantidadePokemon}`
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar Pokémon"
            );

        }


        const dados =
            await resposta.json();


        listaPokemon =
            dados.results;


    } catch (erro) {

        console.error(
            "Não foi possível carregar as sugestões:",
            erro
        );

    }

}


// ========================================//
// SUGESTÕES DA BUSCA                       //
// ========================================//

function mostrarSugestoes(lista) {

    areaSugestoes.innerHTML = "";


    const primeirasSugestoes =
        lista.slice(0, 8);


    primeirasSugestoes.forEach(
        item => {

            const numeroPokemon =
                item.url
                    .split("/")
                    .filter(Boolean)
                    .pop();


            const sugestao =
                document.createElement(
                    "div"
                );


            sugestao.classList.add(
                "sugestao-pokemon"
            );


            sugestao.innerHTML = `

                <img
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${numeroPokemon}.png"
                    alt="${item.name}"
                >

                <span>
                    ${primeiraMaiuscula(
                        item.name
                    )}
                </span>

            `;


            sugestao.addEventListener(
                "click",
                () => {

                    campoBusca.value =
                        item.name;


                    areaSugestoes.innerHTML =
                        "";


                    buscarPokemon();

                }
            );


            areaSugestoes.appendChild(
                sugestao
            );

        }
    );

}


// ========================================//
// DETECTA O QUE É DIGITADO                 //
// ========================================//

campoBusca.addEventListener(
    "input",
    () => {

        const textoDigitado =
            campoBusca.value
                .toLowerCase()
                .trim();


        if (textoDigitado === "") {

            areaSugestoes.innerHTML =
                "";

            return;

        }


        const encontrados =
            listaPokemon.filter(
                item => {

                    return (
                        item.name.includes(
                            textoDigitado
                        )
                    );

                }
            );


        mostrarSugestoes(
            encontrados
        );

    }
);


// ========================================//
// BUSCA NORMAL                             //
// ========================================//

botaoBuscar.addEventListener(
    "click",
    buscarPokemon
);


campoBusca.addEventListener(
    "keydown",
    evento => {

        if (evento.key === "Enter") {

            buscarPokemon();

        }

    }
);


// ========================================//
// ABRE / FECHA PESQUISA AVANÇADA           //
// ========================================//

botaoAbrirAvancada.addEventListener(
    "click",
    () => {

        areaPesquisaAvancada
            .classList
            .toggle("oculto");

    }
);


// ========================================//
// CARREGA AS GERAÇÕES                      //
// ========================================//

async function carregarGeracoes() {

    try {

        const resposta =
            await fetch(
                "https://pokeapi.co/api/v2/generation?limit=100"
            );


        if (!resposta.ok) {

            throw new Error(
                "Erro ao carregar gerações"
            );

        }


        const dados =
            await resposta.json();


        dados.results.forEach(
            (geracao, indice) => {

                const opcao =
                    document.createElement(
                        "option"
                    );


                opcao.value =
                    indice + 1;


                opcao.textContent =
                    `${indice + 1}ª geração`;


                filtroGeracao.appendChild(
                    opcao
                );

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar gerações:",
            erro
        );

    }

}


// ========================================//
// CARREGA OS TIPOS                         //
// ========================================//

function carregarTiposPesquisa() {

    Object.keys(
        tiposTraduzidos
    ).forEach(tipo => {

        const opcao =
            document.createElement(
                "option"
            );


        opcao.value =
            tipo;


        opcao.textContent =
            tiposTraduzidos[tipo];


        filtroTipo.appendChild(
            opcao
        );

    });

}


// ========================================//
// MUDA COR DO FILTRO DE TIPO               //
// ========================================//

function atualizarCorTipo() {

    const tipoSelecionado =
        filtroTipo.value;


    if (tipoSelecionado === "") {

        filtroTipo.style.backgroundColor =
            "white";

        filtroTipo.style.color =
            "#222";

        return;

    }


    filtroTipo.style.backgroundColor =
        coresTipos[tipoSelecionado];


    filtroTipo.style.color =
        tipoSelecionado === "electric"
        || tipoSelecionado === "ice"
        || tipoSelecionado === "ground"
            ? "#222"
            : "white";

}


// ========================================//
// MUDA COR DO FILTRO DE GERAÇÃO            //
// ========================================//

function atualizarCorGeracao() {

    const geracaoSelecionada =
        filtroGeracao.value;


    if (geracaoSelecionada === "") {

        filtroGeracao.style.backgroundColor =
            "white";

        filtroGeracao.style.color =
            "#222";

        return;

    }


    filtroGeracao.style.backgroundColor =
        coresGeracoes[
            geracaoSelecionada
        ]
        || "#777";


    filtroGeracao.style.color =
        "white";

}


// ========================================//
// EVENTOS DAS CORES DOS FILTROS            //
// ========================================//

filtroTipo.addEventListener(
    "change",
    atualizarCorTipo
);


filtroGeracao.addEventListener(
    "change",
    atualizarCorGeracao
);


// ========================================//
// PESQUISA AVANÇADA                        //
// ========================================//

async function buscarAvancado() {

    const geracao =
        filtroGeracao.value;

    const tipo =
        filtroTipo.value;


    if (
        geracao === ""
        && tipo === ""
    ) {

        resultado.innerHTML = `
            <p class="erro">
                Escolha pelo menos uma
                geração ou um tipo.
            </p>
        `;

        return;

    }


    resultado.innerHTML = `
        <p class="carregando">
            Pesquisando Pokémon...
        </p>
    `;


    try {

        let pokemonGeracao =
            null;

        let pokemonTipo =
            null;


        // ========================================//
        // FILTRO POR GERAÇÃO                     //
        // ========================================//

        if (geracao !== "") {

            const respostaGeracao =
                await fetch(
                    `https://pokeapi.co/api/v2/generation/${geracao}`
                );


            if (!respostaGeracao.ok) {

                throw new Error(
                    "Erro ao pesquisar geração"
                );

            }


            const dadosGeracao =
                await respostaGeracao.json();


            pokemonGeracao =
                dadosGeracao
                    .pokemon_species
                    .map(
                        item =>
                            item.name
                    );

        }


        // ========================================//
        // FILTRO POR TIPO                        //
        // ========================================//

        if (tipo !== "") {

            const respostaTipo =
                await fetch(
                    `https://pokeapi.co/api/v2/type/${tipo}`
                );


            if (!respostaTipo.ok) {

                throw new Error(
                    "Erro ao pesquisar tipo"
                );

            }


            const dadosTipo =
                await respostaTipo.json();


            pokemonTipo =
                dadosTipo
                    .pokemon
                    .map(
                        item =>
                            item
                                .pokemon
                                .name
                    );

        }


        // ========================================//
        // COMBINA OS FILTROS                     //
        // ========================================//

        let encontrados = [];


        if (
            pokemonGeracao
            && pokemonTipo
        ) {

            encontrados =
                pokemonGeracao.filter(
                    nome => {

                        return (
                            pokemonTipo.includes(
                                nome
                            )
                        );

                    }
                );

        }


        else if (pokemonGeracao) {

            encontrados =
                pokemonGeracao;

        }


        else if (pokemonTipo) {

            encontrados =
                pokemonTipo;

        }


        encontrados.sort();


        mostrarResultadosAvancados(
            encontrados,
            tipo,
            geracao
        );


    } catch (erro) {

        console.error(erro);


        resultado.innerHTML = `
            <p class="erro">
                Não foi possível realizar
                a pesquisa avançada.
                Tente novamente mais tarde.
            </p>
        `;

    }

}


// ========================================//
// MOSTRA RESULTADOS AVANÇADOS              //
// ========================================//

function mostrarResultadosAvancados(
    lista,
    tipoSelecionado,
    geracaoSelecionada
) {

    if (lista.length === 0) {

        resultado.innerHTML = `
            <p class="erro">
                Nenhum Pokémon foi encontrado
                com esses filtros.
            </p>
        `;

        return;

    }


    resultado.innerHTML = `

        <div class="resultados-avancados">

            <h2>
                Pokémon encontrados
            </h2>

            <p class="quantidade-resultados">
                ${lista.length}
                resultado(s)
            </p>

            <div
                id="lista-avancada"
                class="lista-avancada"
            >
            </div>

        </div>

    `;


    const areaLista =
        document.getElementById(
            "lista-avancada"
        );


    // ========================================//
    // DEFINE A COR DOS RESULTADOS             //
    // ========================================//

    let corResultado =
        "#e63946";


    // Se existe um tipo selecionado,
    // usa a cor do tipo
    if (tipoSelecionado !== "") {

        corResultado =
            coresTipos[
                tipoSelecionado
            ];

    }

    // Caso só exista geração,
    // usa a cor da geração
    else if (
        geracaoSelecionada !== ""
    ) {

        corResultado =
            coresGeracoes[
                geracaoSelecionada
            ];

    }


    lista.forEach(nome => {

        const botao =
            document.createElement(
                "button"
            );


        botao.classList.add(
            "pokemon-avancado"
        );


        botao.textContent =
            primeiraMaiuscula(
                nome
            );


        // Cor personalizada
        botao.style.borderColor =
            corResultado;


        botao.style.setProperty(
            "--cor-resultado",
            corResultado
        );


        botao.addEventListener(
            "click",
            () => {

                campoBusca.value =
                    nome;


                buscarPokemon();

            }
        );


        areaLista.appendChild(
            botao
        );

    });

}


// ========================================//
// BOTÃO DA PESQUISA AVANÇADA               //
// ========================================//

botaoFiltrar.addEventListener(
    "click",
    buscarAvancado
);


// ========================================//
// INICIALIZAÇÃO                            //
// ========================================//

carregarListaPokemon();

carregarGeracoes();

carregarTiposPesquisa();


// ========================================//
// OBJETIVOS DO PROJETO                     //
// ========================================//

// 1. Busca com sugestões (✓)
// 2. Tipos em português (✓)
// 3. Mostrar descrição (✓)
// 4. Melhorar design (✓)
// 5. Busca com Enter (✓)
// 6. Cores por tipo (✓)
// 7. Versão shiny (✓)
// 8. Pesquisa por geração (✓)
// 9. Pesquisa avançada por geração e tipo (✓)
// 10. Cores personalizadas nos filtros (✓)
// 11. Cores personalizadas nos resultados (✓)
// 12. Organizar formas regionais ()
// 13. Testar GIFs animados (opcional)