const express = require("express");
const router = express.Router();
const db = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verificaId = require("../middlewares/verificaid");
const autenticaUsuario = require("../middlewares/autenticaUsuario");
const verificaAdmin = require("../middlewares/verificaAdmin");

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {

        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Apenas arquivos de imagem são permitidos."))
        }

    }

});

// Classe para retornar um erro específico nos lançamentos de exceções (throw)

class ErroHttp extends Error {

    constructor(status, msg) {
        super(msg);
        this.status = status;
    }

}


// Retorna todos os jogos

router.get("/", async (req, res) => {

    try {

        const r = await db.query("SELECT * FROM jogo");

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Nenhum jogo cadastrado." });
        }

        const jogos = r.rows;
        for (let i = 0; i < jogos.length; i++) {

            const p = await db.query(
                "SELECT p.id_plataforma, p.nome FROM plataforma p JOIN jogo_plataforma jp ON p.id_plataforma = jp.id_plataforma WHERE jp.id_jogo = $1",
                [jogos[i].id_jogo]
            );

            jogos[i].plataformas = p.rows;

            const g = await db.query(
                "SELECT g.id_genero, g.nome FROM genero g JOIN jogo_genero jg ON g.id_genero = jg.id_genero WHERE jg.id_jogo = $1",
                [jogos[i].id_jogo]
            );

            jogos[i].generos = g.rows;

            const d = await db.query(
                "SELECT d.id_desenvolvedora, d.nome FROM desenvolvedora d JOIN jogo_desenvolvedora jd ON d.id_desenvolvedora = jd.id_desenvolvedora WHERE jd.id_jogo = $1",
                [jogos[i].id_jogo]
            );

            jogos[i].desenvolvedores = d.rows;

        }

        return res.status(200).json(jogos);

    } catch (error) {
        res.status(500).json({ msg: "Erro geral." })
    }

});



// Retorna um jogo específico

router.get("/:id", verificaId, async (req, res) => {

    try {

        const r = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [req.params.id]);

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Jogo não existente." });
        }

        const jogo = r.rows[0];

        const p = await db.query(
            "SELECT p.id_plataforma, p.nome FROM plataforma p JOIN jogo_plataforma jp ON jp.id_plataforma = p.id_plataforma WHERE jp.id_jogo = $1",
            [jogo.id_jogo]
        );

        jogo.plataformas = p.rows;

        const g = await db.query(
            "SELECT g.id_genero, g.nome FROM genero g JOIN jogo_genero jg ON g.id_genero = jg.id_genero WHERE jg.id_jogo = $1",
            [jogo.id_jogo]
        );

        jogo.generos = g.rows;

        const d = await db.query(
            "SELECT d.id_desenvolvedora, d.nome FROM desenvolvedora d JOIN jogo_desenvolvedora jd ON d.id_desenvolvedora = jd.id_desenvolvedora WHERE jd.id_jogo = $1",
            [jogo.id_jogo]
        );

        jogo.desenvolvedores = d.rows;

        return res.status(200).json(jogo);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Retorna as avaliações de um jogo

router.get("/:id/avaliacoes", verificaId, async (req, res) => {

    try {

        const jogoExiste = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [req.params.id]);
        if (!jogoExiste.rowCount) {
            return res.status(404).json({ msg: "Jogo não cadastrado." });
        }

        const avaliacoesJogo = await db.query(
            `SELECT j.nome jogo, j.descricao, u.username usuario, a.estrelas, a.texto FROM jogo j 
            JOIN avaliacao a ON a.id_jogo = j.id_jogo 
            JOIN usuario u ON a.id_usuario = u.id_usuario
            WHERE j.id_jogo = $1`,
            [req.params.id]
        );

        if (!avaliacoesJogo.rowCount) {
            return res.status(200).json({ msg: "Não há avaliações para esse jogo." })
        }

        let jogo = {
            jogo: avaliacoesJogo.rows[0].jogo,
            descricao: avaliacoesJogo.rows[0].descricao,
            avaliacoes: []
        }
        for (const avaliacao of avaliacoesJogo.rows) {
            jogo.avaliacoes.push(
                {
                    usuario: avaliacao.usuario,
                    estrelas: avaliacao.estrelas,
                    feedback: avaliacao.texto
                }
            )
        }

        return res.status(200).json(jogo)

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

})



// Cadastro de jogo na plataforma (apenas administrador)

router.post("/", upload.single("foto"), autenticaUsuario, verificaAdmin, async (req, res) => {
    const { nome, descricao, data_lancamento } = req.body || {};
    const foto = req.file;

    try {


        let desenvolvedores, generos, plataformas;
        try {
            desenvolvedores = JSON.parse(req.body.desenvolvedores);
            generos = JSON.parse(req.body.generos);
            plataformas = JSON.parse(req.body.plataformas);

            if (!Array.isArray(desenvolvedores) || !Array.isArray(generos) || !Array.isArray(plataformas)) {
                return res.status(400).json({ msg: "Dados inválidos para desenvolvedor, gênero ou plataforma." })
            }

        } catch (error) {
            return res.status(400).json({ msg: "Formato inválido informado para desenvolvedor, gênero ou plataforma." })
        }


        if (typeof nome != 'string' || nome.trim() === "") {
            return res.status(400).json({ msg: "Nome inválido." });
        }

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE nome = $1", [nome.trim()]);
        if (verificaJogo.rowCount != 0) {
            return res.status(409).json({ msg: "Jogo já cadastrado." })
        }

        if (typeof descricao !== 'string' || descricao.trim() === "") {
            return res.status(400).json({ msg: "Descrição inválida." })
        }

        if (data_lancamento) {
            const verificaData = new Date(data_lancamento);
            if (Number.isNaN(verificaData.getTime())) {
                return res.status(400).json({ msg: "Data inválida." });
            }
        }


        let caminhoCompleto = null;

        try {


            const pastaDestino = path.join(__dirname, "../uploads");
            let idFoto = null;

            const jogoAdicionado = await db.transaction(async (client) => {

                if (foto) {

                    if (!fs.existsSync(pastaDestino)) {
                        fs.mkdirSync(pastaDestino);
                    }

                    const insereArquivo = await client.query(
                        "INSERT INTO arquivo (nome_original, extensao) VALUES ($1, $2) RETURNING *",
                        [req.file.originalname, path.extname(req.file.originalname)]
                    );

                    if (!insereArquivo.rowCount) {
                        throw new ErroHttp(400, "Erro na inserção no banco de dados.")
                    }

                    const idGerado = insereArquivo.rows[0].id;
                    const extensao = insereArquivo.rows[0].extensao;


                    const nomeFinalDoArquivo = `${idGerado}${extensao}`;
                    caminhoCompleto = path.join(pastaDestino, nomeFinalDoArquivo);

                    fs.writeFileSync(caminhoCompleto, req.file.buffer);

                    idFoto = insereArquivo.rows[0].id;
                }

                const insertJogo = await client.query(
                    "INSERT INTO jogo (nome, descricao, data_lancamento, id_imagem) VALUES ($1, $2, $3, $4) RETURNING id_jogo",
                    [nome.trim(), descricao.trim(), data_lancamento, idFoto]
                );

                if (!insertJogo.rowCount) {
                    throw new ErroHttp(400, "Erro ao inserir jogo.")
                }

                const idJogo = insertJogo.rows[0].id_jogo;

                for (const desenvolvedor of desenvolvedores) {

                    const verificaDev = await client.query(
                        "SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1",
                        [desenvolvedor]
                    );

                    if (!verificaDev.rowCount) {
                        throw new ErroHttp(404, "Erro em inserir desenvolvedor. Motivo: não foi encontrado algum desenvolvedor informado.");
                    }

                    const adicionaDesenvolvedor = await client.query(
                        "INSERT INTO jogo_desenvolvedora (id_jogo, id_desenvolvedora) VALUES ($1, $2) RETURNING *",
                        [idJogo, desenvolvedor]
                    );

                    if (!adicionaDesenvolvedor.rowCount) {
                        throw new ErroHttp(400, "Erro ao inserir desenvolvedor.")
                    }

                }

                for (const genero of generos) {

                    const verificaGenero = await client.query(
                        "SELECT * FROM genero WHERE id_genero = $1",
                        [genero]
                    );

                    if (!verificaGenero.rowCount) {
                        throw new ErroHttp(404, "Erro em inserir gênero. Motivo: não foi encontrado algum gênero informado.");
                    }

                    const adicionaGenero = await client.query(
                        "INSERT INTO jogo_genero (id_jogo, id_genero) VALUES ($1, $2) RETURNING *",
                        [idJogo, genero]
                    );

                    if (!adicionaGenero.rowCount) {
                        throw new ErroHttp(400, "Erro ao inserir gênero.")
                    }

                }

                for (const plataforma of plataformas) {

                    const verificaPlataforma = await client.query(
                        "SELECT * FROM plataforma WHERE id_plataforma = $1",
                        [plataforma]
                    );

                    if (!verificaPlataforma.rowCount) {
                        throw new ErroHttp(404, "Erro em inserir plataforma. Motivo: não foi encontrada alguma plataforma informada.");
                    }

                    const adicionaPlataforma = await client.query(
                        "INSERT INTO jogo_plataforma (id_jogo, id_plataforma) VALUES ($1, $2) RETURNING *",
                        [idJogo, plataforma]
                    );

                    if (!adicionaPlataforma.rowCount) {
                        throw new ErroHttp(400, "Erro ao inserir plataforma.");
                    }

                }

            });

            return res.status(200).json({ msg: "Jogo adicionado." })

        } catch (error) {
            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: error.message });
        }

    } catch (error) {
        return res.status(500).json({ msg: error.message })
    }
});



// Edita um jogo

router.put("/:id", upload.single("foto"), verificaId, autenticaUsuario, verificaAdmin, async (req, res) => {
    let { nome, descricao, data_lancamento } = req.body || {};
    const foto = req.file;

    const idJogo = req.id;

    try {

        const dadosAntigosJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!dadosAntigosJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        if (nome && typeof nome !== 'string') {
            return res.status(400).json({ msg: "Nome do jogo inválido." })
        } else if (!nome || nome.trim() === "") {
            nome = dadosAntigosJogo.rows[0].nome;
        }

        if (descricao && typeof descricao !== 'string') {
            return res.status(400).json({ msg: "Descrição inválida." })
        } else if (!descricao || descricao.trim() === "") {
            descricao = dadosAntigosJogo.rows[0].descricao;
        }

        const verificaData = new Date(data_lancamento);
        if (!data_lancamento) {
            data_lancamento = dadosAntigosJogo.rows[0].data_lancamento;
        } else if (Number.isNaN(verificaData.getTime())) {
            return res.status(400).json({ msg: "Data inválida." });
        }


        let caminhoCompleto = null;
        let caminhoFotoAntiga = null;
        try {

            let idFoto = dadosAntigosJogo.rows[0].id_imagem;
            const idFotoAntiga = idFoto;
            const pastaDestino = path.join(__dirname, "../uploads");

            const jogoEditado = await db.transaction(async (client) => {

                if (foto) {

                    if (!fs.existsSync(pastaDestino)) {
                        fs.mkdirSync(pastaDestino);
                    }

                    const insereArquivo = await client.query(
                        "INSERT INTO arquivo(nome_original, extensao) VALUES ($1, $2) RETURNING *",
                        [req.file.originalname, path.extname(req.file.originalname)]);

                    if (!insereArquivo.rowCount) {
                        throw new ErroHttp(400, "Erro na inserção no banco de dados.");
                    }

                    idFoto = insereArquivo.rows[0].id;
                    const extensao = insereArquivo.rows[0].extensao;

                    const nomeFinalDoArquivo = `${idFoto}${extensao}`;
                    caminhoCompleto = path.join(pastaDestino, nomeFinalDoArquivo);

                    fs.writeFileSync(caminhoCompleto, req.file.buffer);

                }

                const atualizaJogo = await client.query(
                    "UPDATE jogo SET nome = $1, descricao = $2, data_lancamento = $3, id_imagem = $4 WHERE id_jogo = $5 RETURNING *",
                    [nome, descricao, data_lancamento, idFoto, idJogo]
                );

                if (!atualizaJogo.rowCount) {
                    throw new ErroHttp(400, "Erro ao alterar dados do usuário.");
                }

                if (foto && idFotoAntiga) {

                    const arquivoAntigo = await client.query("SELECT extensao FROM arquivo WHERE id = $1", [idFotoAntiga]);

                    if (arquivoAntigo.rowCount) {

                        const nomeArquivoAntigo = `${idFotoAntiga}${arquivoAntigo.rows[0].extensao}`;
                        caminhoFotoAntiga = path.join(pastaDestino, nomeArquivoAntigo);

                        let apagaFotoAntiga = await client.query("DELETE FROM arquivo WHERE id = $1 RETURNING *", [idFotoAntiga]);
                        if (!apagaFotoAntiga.rowCount) {
                            throw new ErroHttp(400, "Erro ao apagar foto antiga.");
                        }
                    }

                }

                return atualizaJogo.rows[0];

            });

            if (caminhoFotoAntiga) {
                fs.unlinkSync(caminhoFotoAntiga);
            }

            return res.status(200).json({ msg: "Dados alterados com sucesso.", jogo: jogoEditado });

        } catch (error) {
            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: error.message });
        }

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});


// Deleta foto de um jogo

router.delete("/:id/foto", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;

    try {

        let caminhoFoto = null;

        try {

            const deletaFotoJogo = await db.transaction(async (client) => {

                const verificaJogo = await client.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
                if (!verificaJogo.rowCount) {
                    throw new ErroHttp(404, "Jogo não encontrado.");
                }


                const dadosJogo = await client.query("SELECT id_imagem FROM jogo WHERE id_jogo = $1", [idJogo]);
                const idFoto = dadosJogo.rows[0].id_imagem;

                if (!idFoto) {
                    throw new ErroHttp(400, "Jogo não possui foto.");
                }

                const dadosArquivo = await client.query("SELECT extensao FROM arquivo WHERE id = $1", [idFoto]);


                const pastaDestino = path.join(__dirname, "../uploads")
                if (dadosArquivo.rowCount) {
                    const nomeArquivo = `${idFoto}${dadosArquivo.rows[0].extensao}`;
                    caminhoFoto = path.join(pastaDestino, nomeArquivo);
                }

                const deletaArquivo = await client.query("DELETE FROM arquivo WHERE id = $1 RETURNING *", [idFoto]);
                if (!deletaArquivo.rowCount) {
                    throw new ErroHttp(400, "Erro ao apagar foto.");
                }

                return caminhoFoto;

            });

        } catch (error) {
            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao remover foto de jogo." });
        }

        if (caminhoFoto) {
            fs.unlinkSync(caminhoFoto);
        }

        return res.status(200).json({ msg: "Foto removida." });

    } catch (error) {

        return res.status(500).json({ msg: "Erro geral." });
    }

})


// Adiciona desenvolvedora responsável pelo jogo

router.post("/:id/desenvolvedores", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;
    const { desenvolvedora } = req.body || {};

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        if (Number.isNaN(desenvolvedora) || !Number.isInteger(desenvolvedora)) {
            return res.status(400).json({ msg: "Parâmetro inválido." });
        }

        const verificaDesenvolvedor = await db.query("SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1", [desenvolvedora]);
        if (!verificaDesenvolvedor.rowCount) {
            return res.status(404).json({ msg: "Desenvolvedora não encontrada." });
        }

        const verificaDuplicidade = await db.query(
            "SELECT * FROM jogo_desenvolvedora WHERE id_jogo = $1 AND id_desenvolvedora = $2",
            [idJogo, desenvolvedora]
        );
        if (verificaDuplicidade.rowCount != 0) {
            return res.status(409).json({ msg: "Já existe essa desenvolvedora registrada." })
        }

        const adicionaDesenvolvedorJogo = await db.query(
            "INSERT INTO jogo_desenvolvedora (id_jogo, id_desenvolvedora) VALUES ($1, $2) RETURNING *",
            [idJogo, desenvolvedora]);

        if (!adicionaDesenvolvedorJogo.rowCount) {
            return res.status(400).json({ msg: "Erro ao inserir desenvolvedora ao jogo" });
        }


        return res.status(200).json({ msg: "Desenvolvedora adicionada ao jogo." });
    } catch (error) {
        return res.status(500).json({ msg: "Erro geral" });
    }

});


// Remove desenvolvedora responsável pelo jogo

router.delete("/:id/desenvolvedores/:idDev", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;
    const idDev = Number(req.params.idDev);

    if (idDev <= 0 || !Number.isInteger(idDev)) {
        return res.status(400).json({ msg: "Parâmetro inválido." })
    }

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        };

        if (Number.isNaN(idDev) || !Number.isInteger(idDev)) {
            return res.status(400).json({ msg: "Parâmetro inválido." });
        }

        const verificaDesenvolvedora = await db.query("SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1", [idDev]);
        if (!verificaDesenvolvedora.rowCount) {
            return res.status(404).json({ msg: "Desenvolvedora não encontrada." });
        }

        const verificaExiste = await db.query("SELECT * FROM jogo_desenvolvedora WHERE id_jogo = $1 AND id_desenvolvedora = $2", [idJogo, idDev]);
        if (!verificaExiste.rowCount) {
            return res.status(404).json({ msg: "Essa desenvolvedora não está cadastrada a esse jogo." });
        }

        const removeDesenvolvedora = await db.query(
            "DELETE FROM jogo_desenvolvedora WHERE id_desenvolvedora = $1 AND id_jogo = $2 RETURNING *",
            [idDev, idJogo]
        );

        if (!removeDesenvolvedora.rowCount) {
            return res.status(400).json({ msg: "Erro ao apagar desenvolvedora de jogo." });
        }

        return res.status(200).json({ msg: "Desenvolvedora removida do jogo." });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
});



// Adiciona um gênero a um jogo

router.post("/:id/generos", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;
    const { genero } = req.body || {};

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        if (Number.isNaN(genero) || !Number.isInteger(genero)) {
            return res.status(400).json({ msg: "Parâmetro inválido." });
        }

        const verificaGenero = await db.query("SELECT * FROM genero WHERE id_genero = $1", [genero]);
        if (!verificaGenero.rowCount) {
            return res.status(404).json({ msg: "Gênero não encontrado." });
        }

        const verificaDuplicidade = await db.query(
            "SELECT * FROM jogo_genero WHERE id_jogo = $1 AND id_genero = $2",
            [idJogo, genero]
        );
        if (verificaDuplicidade.rowCount != 0) {
            return res.status(409).json({ msg: "Já existe esse gênero registrado." })
        }

        const adicionaGeneroJogo = await db.query(
            "INSERT INTO jogo_genero (id_jogo, id_genero) VALUES ($1, $2) RETURNING *",
            [idJogo, genero]);

        if (!adicionaGeneroJogo.rowCount) {
            return res.status(400).json({ msg: "Erro ao inserir gênero ao jogo" });
        }


        return res.status(200).json({ msg: "Gênero adicionado ao jogo." });
    } catch (error) {
        return res.status(500).json({ msg: "Erro geral" });
    }

});



// Remove gênero de um jogo

router.delete("/:id/generos/:idGenero", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;
    const idGenero = Number(req.params.idGenero);

    if (idGenero <= 0 || !Number.isInteger(idGenero)) {
        return res.status(400).json({ msg: "Parâmetro inválido." })
    }

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        };

        if (Number.isNaN(idGenero) || !Number.isInteger(idGenero)) {
            return res.status(400).json({ msg: "Parâmetro inválido." });
        }

        const verificaGenero = await db.query("SELECT * FROM genero WHERE id_genero = $1", [idGenero]);
        if (!verificaGenero.rowCount) {
            return res.status(404).json({ msg: "Gênero não encontrado." });
        }

        const verificaExiste = await db.query("SELECT * FROM jogo_genero WHERE id_jogo = $1 AND id_genero = $2", [idJogo, idGenero]);
        if (!verificaExiste.rowCount) {
            return res.status(404).json({ msg: "Esse gênero não está cadastrado a esse jogo." });
        }

        const removeGenero = await db.query(
            "DELETE FROM jogo_genero WHERE id_genero = $1 AND id_jogo = $2 RETURNING *",
            [idGenero, idJogo]);
        if (!removeGenero.rowCount) {
            return res.status(400).json({ msg: "Erro ao apagar gênero de jogo." });
        }

        return res.status(200).json({ msg: "Gênero removido do jogo." });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
});



// Adiciona uma plataforma ao jogo.

router.post("/:id/plataformas", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;
    const { plataforma } = req.body || {};

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        if (Number.isNaN(plataforma) || !Number.isInteger(plataforma)) {
            return res.status(400).json({ msg: "Parâmetro inválido." });
        }

        const verificaPlataforma = await db.query("SELECT * FROM plataforma WHERE id_plataforma = $1", [plataforma]);
        if (!verificaPlataforma.rowCount) {
            return res.status(404).json({ msg: "Plataforma não encontrada." });
        }

        const verificaDuplicidade = await db.query(
            "SELECT * FROM jogo_plataforma WHERE id_jogo = $1 AND id_plataforma = $2",
            [idJogo, plataforma]
        );
        if (verificaDuplicidade.rowCount != 0) {
            return res.status(409).json({ msg: "Já existe essa plataforma registrada." })
        }

        const adicionaPlataformaJogo = await db.query(
            "INSERT INTO jogo_plataforma (id_jogo, id_plataforma) VALUES ($1, $2) RETURNING *",
            [idJogo, plataforma]);

        if (!adicionaPlataformaJogo.rowCount) {
            return res.status(400).json({ msg: "Erro ao inserir plataforma ao jogo" });
        }


        return res.status(200).json({ msg: "Plataforma adicionada ao jogo." });
    } catch (error) {
        return res.status(500).json({ msg: "Erro geral" });
    }

});



// Remove uma plataforma de algum jogo

router.delete("/:id/plataformas/:idPlataforma", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idJogo = req.id;
    const idPlataforma = Number(req.params.idPlataforma);

    if (idPlataforma <= 0 || !Number.isInteger(idPlataforma)) {
        return res.status(400).json({ msg: "Parâmetro inválido." })
    }

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        };

        if (Number.isNaN(idPlataforma) || !Number.isInteger(idPlataforma)) {
            return res.status(400).json({ msg: "Parâmetro inválido." });
        }

        const verificaPlataforma = await db.query("SELECT * FROM plataforma WHERE id_plataforma = $1", [idPlataforma]);
        if (!verificaPlataforma.rowCount) {
            return res.status(404).json({ msg: "Plataforma não encontrada." });
        }

        const verificaExiste = await db.query("SELECT * FROM jogo_plataforma WHERE id_jogo = $1 AND id_plataforma = $2", [idJogo, idPlataforma]);
        if (!verificaExiste.rowCount) {
            return res.status(404).json({ msg: "Essa plataforma não está cadastrada a esse jogo." });
        }

        const removePlataforma = await db.query(
            "DELETE FROM jogo_plataforma WHERE id_plataforma = $1 AND id_jogo = $2 RETURNING *",
            [idPlataforma, idJogo]);
        if (!removePlataforma.rowCount) {
            return res.status(400).json({ msg: "Erro ao apagar plataforma de jogo." });
        }

        return res.status(200).json({ msg: "Plataforma removida do jogo." });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
});



// Apagar jogo da plataforma

router.delete("/:id", verificaId, autenticaUsuario, verificaAdmin, async (req, res) => {

    const idJogo = req.id;

    try {

        const existeJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);
        if (!existeJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." })
        }

        try {

            let caminhoFoto = null;
            const jogoApagado = await db.transaction(async (client) => {

                const apagaJogo = await client.query("DELETE FROM jogo WHERE id_jogo = $1 RETURNING nome, descricao, data_lancamento, id_imagem", [idJogo]);
                if (!apagaJogo.rowCount) {
                    throw new ErroHttp(400, "Erro ao apagar jogo.");
                }

                const idFoto = apagaJogo.rows[0].id_imagem;

                if (idFoto) {

                    const dadosArquivo = await client.query("SELECT extensao FROM arquivo WHERE id = $1", [idFoto]);

                    const pastaDestino = path.join(__dirname, "../uploads")
                    if (dadosArquivo.rowCount) {
                        const nomeArquivo = `${idFoto}${dadosArquivo.rows[0].extensao}`;
                        caminhoFoto = path.join(pastaDestino, nomeArquivo);
                    }


                    const deletaArquivo = await client.query("DELETE FROM arquivo WHERE id = $1 RETURNING *", [idFoto]);
                    if (!deletaArquivo.rowCount) {
                        throw new ErroHttp(400, "Erro ao apagar imagem.");
                    }

                }

                return {
                    jogo: apagaJogo.rows[0],
                    caminhoFoto: caminhoFoto
                }

            });

            if (jogoApagado.caminhoFoto) {
                fs.unlinkSync(jogoApagado.caminhoFoto);
            }

            const { id_imagem, ...jogo } = jogoApagado.jogo;
            return res.status(200).json({ msg: "Jogo apagado com sucesso.", jogo: jogo });

        } catch (error) {
            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao apagar jogo." });
        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});


// Registra uma avaliação

router.post("/:id/avaliacoes", autenticaUsuario, verificaId, async (req, res) => {

    const idJogo = req.id;
    const logado = req.usuario;
    const { estrelas, texto } = req.body || {};

    try {


        if (Number.isNaN(estrelas) || !Number.isInteger(estrelas)) {
            return res.status(400).json({ msg: "Valor inválido para estrelas." });
        }

        if (texto !== null && texto !== undefined) {
            if (typeof texto !== 'string' || texto.trim() === "") {
                return res.status(400).json({ msg: "Texto inválido." });
            }
        }

        const verificaDuplicidade = await db.query("SELECT * FROM avaliacao WHERE id_usuario = $1 AND id_jogo = $2", [logado, idJogo]);
        if (verificaDuplicidade.rowCount != 0) {
            return res.status(409).json({ msg : "Você já fez uma avaliação a esse jogo, altere-a ou exclua e crie uma nova."});
        }

        const adicionaAvaliacao = await db.query(
            "INSERT INTO avaliacao (id_usuario, id_jogo, estrelas, texto) VALUES ($1, $2, $3, $4) RETURNING *",
            [logado, idJogo, estrelas, texto]
        );

        if (!adicionaAvaliacao.rowCount) {
            return res.status(400).json({ msg: "Erro ao registrar avaliação." });
        }

        const jogo = await db.query("SELECT j.nome, a.texto, a.criado_em FROM jogo j JOIN avaliacao a ON j.id_jogo = a.id_jogo WHERE j.id_jogo = $1", [idJogo]);

        return res.status(200).json({
            msg: "Avaliação registrada com sucesso.",
            jogo: {
                nome: jogo.rows[0].nome,
                estrelas: estrelas,
                texto: jogo.rows[0].texto,
                data_criacao : jogo.rows[0].criado_em
            }
        });

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }

})

// Verifica o tamanho do arquivo enviado, e se foi enviado mais que um arquivo

router.use((err, req, res, next) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
            msg: "Arquivo muito grande. O tamanho máximo é 5 MB.",
        });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({
            msg: 'Número máximo de arquivos excedido.',
        });
    }

    res.status(400).json({
        msg: err.message,
    });
});

module.exports = router