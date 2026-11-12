const express = require('express');
const router = express.Router();
const db = require("../db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verificaId = require('../middlewares/verificaid');
const autenticaUsuario = require('../middlewares/autenticaUsuario');
const verificaAdmin = require('../middlewares/verificaAdmin');

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


class ErroHttp extends Error {

    constructor(status, msg) {
        super(msg);
        this.status = status;
    }

}

// Lista todas as desenvolvedoras

router.get("/", async (req, res) => {

    try {

        const r = await db.query("SELECT * FROM desenvolvedora");

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Nenhuma desenvolvedora cadastrada." })
        }

        return res.status(200).json(r.rows);
    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});



// Lista alguma desenvolvedora pelo seu ID, e seus respectivos jogos

router.get("/:id", verificaId, async (req, res) => {
    const id = req.id;

    try {

        const r = await db.query(
            "SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1",
            [id]);

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Desenvolvedora não encontrada." });
        }

        const desenvolvedor = r.rows[0];

        const jogos = await db.query(
            `SELECT j.nome, j.id_imagem FROM jogo j 
            JOIN jogo_desenvolvedora jd ON j.id_jogo = jd.id_jogo 
            JOIN desenvolvedora d ON jd.id_desenvolvedora = d.id_desenvolvedora
            WHERE jd.id_desenvolvedora = $1`,
            [desenvolvedor.id_desenvolvedora]
        );

        desenvolvedor.jogos = jogos.rows;

        return res.status(200).json(desenvolvedor);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Adiciona uma desenvolvedora

router.post("/", upload.single("foto"), autenticaUsuario, verificaAdmin, async (req, res) => {
    const { nome, descricao, data_criacao } = req.body || {};
    const foto = req.file;

    try {

        if (typeof nome !== 'string' || nome.trim() === "") {
            return res.status(400).json({ msg: "Nome inválido." });
        }

        const verificaDesenvolvedora = await db.query("SELECT * FROM desenvolvedora WHERE nome = $1", [nome.trim()]);
        if (verificaDesenvolvedora.rowCount != 0) {
            return res.status(409).json({ msg: "Desenvolvedora já cadastrada." });
        }

        if (typeof descricao !== 'string' || descricao.trim() === "") {
            return res.status(400).json({ msg: "Descrição inválida." });
        }

        const verificaData = new Date(data_criacao);
        if (!data_criacao || Number.isNaN(verificaData.getTime())) {
            return res.status(400).json({ msg: "Data inválida." });
        }

        let caminhoCompleto = null;

        try {

            const pastaDestino = path.join(__dirname, "../uploads");
            let idFoto = null;

            const desenvolvedorAdicionada = await db.transaction(async (client) => {

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

                const insertDesenvolvedora = await client.query(
                    "INSERT INTO desenvolvedora (nome, descricao, data_criacao, id_imagem) VALUES ($1, $2, $3, $4) RETURNING *",
                    [nome.trim(), descricao.trim(), data_criacao, idFoto]
                );

                if (!insertDesenvolvedora.rowCount) {
                    throw new ErroHttp(400, "Erro ao inserir desenvolvedora.");
                }

                return insertDesenvolvedora.rows[0];

            });

            return res.status(200).json({ msg: "Desenvolvedora adicionada.", desenvolvedora: desenvolvedorAdicionada });

        } catch (error) {
            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: error.message });

        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
});



// Edição de uma desenvolvedora

router.put("/:id", upload.single("foto"), autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    let { nome, descricao, data_criacao } = req.body || {};
    const foto = req.file;

    const idDesenvolvedora = req.id;

    try {

        const dadosAntigos = await db.query("SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1", [idDesenvolvedora]);
        if (!dadosAntigos.rowCount) {
            return res.status(404).json({ msg: "Desenvolvedora não encontrada." });
        }

        if (nome && typeof nome !== 'string') {
            return res.status(400).json({ msg: "Nome da desenvolvedora inválido." });
        } else if (!nome || nome.trim() === "") {
            nome = dadosAntigos.rows[0].nome;
        }

        if (descricao && typeof descricao !== 'string') {
            return res.status(400).json({ msg: "Descrição inválida." })
        } else if (!descricao || descricao.trim() === "") {
            descricao = dadosAntigos.rows[0].descricao;
        }

        const verificaData = new Date(data_criacao);
        if (!data_criacao) {
            data_criacao = dadosAntigos.rows[0].data_criacao;
        } else if (Number.isNaN(verificaData.getTime())) {
            return res.status(400).json({ msg: "Data inválida." });
        }


        let caminhoCompleto = null;
        let caminhoFotoAntiga = null;
        try {

            let idFoto = dadosAntigos.rows[0].id_imagem;
            const idFotoAntiga = idFoto;
            const pastaDestino = path.join(__dirname, "../uploads");

            const desenvolvedoraEditada = await db.transaction(async (client) => {

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

                const atualizaDesenvolvedora = await client.query(
                    "UPDATE desenvolvedora SET nome = $1, descricao = $2, data_criacao = $3, id_imagem = $4 WHERE id_desenvolvedora = $5 RETURNING *",
                    [nome, descricao, data_criacao, idFoto, idDesenvolvedora]
                );

                if (!atualizaDesenvolvedora.rowCount) {
                    throw new ErroHttp(400, "Erro ao atualizar desenvolvedora.");
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

                return atualizaDesenvolvedora.rows[0];
            });

            if (caminhoFotoAntiga) {
                fs.unlinkSync(caminhoFotoAntiga);
            }

            return res.status(200).json({ msg: "Dados alterados com sucesso.", desenvolvedora: desenvolvedoraEditada });

        } catch (error) {

            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao alterar dados." });

        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});

// Apagar imagem de desenvolvedora

router.delete("/:id/foto", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idDesenvolvedora = req.id;

    try {

        let caminhoFoto = null;

        try {

            const deletaFotoDev = await db.transaction(async (client) => {

                const verificaDesenvolvedor = await client.query("SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1", [idDesenvolvedora]);
                if (!verificaDesenvolvedor.rowCount) {
                    throw new ErroHttp(404, "Desenvolvedora não encontrada.");
                }


                const dadosDesenvolvedora = await client.query("SELECT id_imagem FROM desenvolvedora WHERE id_desenvolvedora = $1", [idDesenvolvedora]);
                const idFoto = dadosDesenvolvedora.rows[0].id_imagem;

                if (!idFoto) {
                    throw new ErroHttp(400, "Desenvolvedora não possui foto.");
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

            return res.status(400).json({ msg: "Erro ao remover foto de desenvolvedora." });
        }

        if (caminhoFoto) {
            fs.unlinkSync(caminhoFoto);
        }

        return res.status(200).json({ msg: "Foto removida." });

    } catch (error) {

        return res.status(500).json({ msg: "Erro geral." });
    }

});


// Apaga uma plataforma

router.delete("/:id", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {

    const idDesenvolvedora = req.id;

    try {

        const existeDesenvolvedora = await db.query("SELECT * FROM desenvolvedora WHERE id_desenvolvedora = $1", [idDesenvolvedora]);
        if (!existeDesenvolvedora.rowCount) {
            return res.status(404).json({ msg: "Desenvolvedora não encontrada." });
        }

        try {

            let caminhoFoto = null;
            const desenvolvedoraApagada = await db.transaction(async (client) => {

                const apagaDesenvolvedora = await client.query("DELETE FROM desenvolvedora WHERE id_desenvolvedora = $1 RETURNING *", [idDesenvolvedora]);
                if (!apagaDesenvolvedora.rowCount) {
                    throw new ErroHttp(400, "Erro ao apagar desenvolvedora.");
                }

                const idFoto = apagaDesenvolvedora.rows[0].id_imagem;

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
                    desenvolvedora: apagaDesenvolvedora.rows[0],
                    caminhoFoto: caminhoFoto
                }

            });

            if (desenvolvedoraApagada.caminhoFoto) {
                fs.unlinkSync(desenvolvedoraApagada.caminhoFoto);
            }

            const { id_imagem, ...desenvolvedora } = desenvolvedoraApagada.desenvolvedora;
            return res.status(200).json({ msg: "Desenvolvedora apagada.", desenvolvedora: desenvolvedora });

        } catch (error) {

            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao apagar desenvolvedora." });

        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});

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


module.exports = router;