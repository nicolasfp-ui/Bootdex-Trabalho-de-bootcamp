// A API REST do Supabase grava em PostgreSQL; não há fallback para localStorage.
(function () {
    "use strict";

    window.criarRepositorioFavoritos = function (config) {
        if (!config?.url || !config?.chavePublica) {
            throw new Error("Configure a URL e a chave pública do Supabase em config.js para usar os favoritos.");
        }
        const base = new URL(config.url);
        if (base.protocol !== "https:" || !base.hostname.endsWith(".supabase.co")) {
            throw new Error("Confira a URL HTTPS do projeto Supabase em config.js.");
        }
        if (config.chavePublica.startsWith("sb_secret_")) {
            throw new Error("Use somente a chave pública em config.js, nunca uma chave secret.");
        }
        const headers = { apikey: config.chavePublica, "Content-Type": "application/json" };
        // Chaves anon legadas são JWT; publishable usa somente apikey, não Bearer.
        if (config.chavePublica.startsWith("eyJ")) {
            try {
                const payload = JSON.parse(atob(config.chavePublica.split(".")[1]));
                if (payload.role !== "anon") throw new Error("role");
            } catch {
                throw new Error("Use a chave anon pública em config.js, nunca service_role.");
            }
            headers.Authorization = `Bearer ${config.chavePublica}`;
        }

        async function requisitar(query, method = "GET", body) {
            let response;
            try {
                response = await fetch(`${base.origin}/rest/v1/favoritos?${query}`, {
                    method,
                    headers: { ...headers, Prefer: "return=representation" },
                    body: body === undefined ? undefined : JSON.stringify(body),
                    signal: AbortSignal.timeout(15000)
                });
            } catch {
                throw new Error("Falha de conexão com o banco. Confira a internet e tente novamente.");
            }
            const data = await response.json().catch(() => null);
            if (!response.ok) {
                if (data?.code === "23505") throw new Error("Este Pokémon já está nos favoritos compartilhados.");
                if (response.status === 401) throw new Error("Confira a chave pública e a URL do Supabase em config.js.");
                if (response.status === 403) throw new Error("Acesso negado. Confira os grants e as políticas RLS do Supabase.");
                if (response.status === 404) throw new Error("Tabela não encontrada. Execute supabase/schema.sql e habilite a Data API.");
                throw new Error("O banco não concluiu a operação. Confira a tabela, a Data API e as políticas RLS.");
            }
            if (!Array.isArray(data)) throw new Error("Resposta inesperada do banco. Tente novamente.");
            return data;
        }

        return {
            listar: () => requisitar("select=id,pokemon_id,nome,criado_em&order=criado_em.desc,id.desc"),
            salvar: pokemon => requisitar("", "POST", { pokemon_id: pokemon.id, nome: pokemon.name }),
            excluir: async id => {
                const removed = await requisitar(`id=eq.${encodeURIComponent(id)}`, "DELETE");
                if (removed.length === 0) throw new Error("O favorito não foi encontrado ou a exclusão foi bloqueada pela RLS. Atualize a lista.");
            }
        };
    };
})();
