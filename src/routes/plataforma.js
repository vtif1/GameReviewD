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

// Lista todas as plataformas

router.get("/", async (req, res) => {

    try {

        const r = await db.query("SELECT nome, descricao FROM plataforma");

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Nenhuma plataforma cadastrada." })
        }

        return res.status(200).json(r.rows);
    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});



// Lista alguma plataforma pelo seu ID

router.get("/:id", verificaId, async (req, res) => {
    const id = req.id;

    try {

        const r = await db.query(
            "SELECT nome, descricao FROM plataforma WHERE id_plataforma = $1",
            [id]);

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Plataforma não encontrada." });
        }

        const plataforma = r.rows[0];

        const jogos = await db.query(
            `SELECT j.nome, j.id_imagem FROM jogo j 
            JOIN jogo_plataforma jp ON j.id_jogo = jp.id_jogo 
            JOIN plataforma p ON jp.id_plataforma = p.id_plataforma
            WHERE jp.id_plataforma = $1`,
            [id]
        );

        plataforma.jogos = jogos.rows;

        return res.status(200).json(plataforma);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Adiciona alguma plataforma

router.post("/", upload.single("foto"), autenticaUsuario, verificaAdmin, async (req, res) => {
    const { nome, descricao } = req.body || {};
    const foto = req.file;

    try {

        if (typeof nome !== 'string' || nome.trim() === "") {
            return res.status(400).json({ msg: "Nome inválido." });
        }

        const verificaPlataforma = await db.query("SELECT * FROM plataforma WHERE nome = $1", [nome.trim()]);
        if (verificaPlataforma.rowCount != 0) {
            return res.status(409).json({ msg: "Plataforma já cadastrada." });
        }

        if (typeof descricao !== 'string' || descricao.trim() === "") {
            return res.status(400).json({ msg: "Descrição inválida." });
        }

        let caminhoCompleto = null;
        try {

            const pastaDestino = path.join(__dirname, "../uploads");
            let idFoto = null;

            const plataformaAdicionada = await db.transaction(async (client) => {



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

                const insertPlataforma = await client.query(
                    "INSERT INTO plataforma (nome, descricao, id_imagem) VALUES ($1, $2, $3) RETURNING *",
                    [nome.trim(), descricao.trim(), idFoto]
                );

                if (!insertPlataforma.rowCount) {
                    throw new ErroHttp(400, "Erro ao inserir plataforma.");
                }

                return insertPlataforma.rows[0];

            });

            return res.status(200).json({ msg: "Plataforma adicionada.", plataforma: plataformaAdicionada });

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



// Edita uma plataforma

router.put("/:id", upload.single("foto"), autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    let { nome, descricao } = req.body || {};
    const foto = req.file;

    const idPlataforma = req.id;

    try {

        const dadosAntigos = await db.query("SELECT * FROM plataforma WHERE id_plataforma = $1", [idPlataforma]);
        if (!dadosAntigos.rowCount) {
            return res.status(404).json({ msg: "Plataforma não encontrada." });
        }

        if (nome && typeof nome !== 'string') {
            return res.status(400).json({ msg: "Nome da plataforma inválido." });
        } else if (!nome || nome.trim() === "") {
            nome = dadosAntigos.rows[0].nome;
        }

        if (descricao && typeof descricao !== 'string') {
            return res.status(400).json({ msg: "Descrição inválida." })
        } else if (!descricao || descricao.trim() === "") {
            descricao = dadosAntigos.rows[0].descricao;
        }


        let caminhoCompleto = null;
        let caminhoFotoAntiga = null;
        try {

            let idFoto = dadosAntigos.rows[0].id_imagem;
            const idFotoAntiga = idFoto;
            const pastaDestino = path.join(__dirname, "../uploads");

            const plataformaEditada = await db.transaction(async (client) => {

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

                const atualizaPlataforma = await client.query(
                    "UPDATE plataforma SET nome = $1, descricao = $2, id_imagem = $3 WHERE id_plataforma = $4 RETURNING *",
                    [nome, descricao, idFoto, idPlataforma]
                );

                if (!atualizaPlataforma.rowCount) {
                    throw new ErroHttp(400, "Erro ao atualizar plataforma.");
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

                return atualizaPlataforma.rows[0];
            });

            if (caminhoFotoAntiga) {
                fs.unlinkSync(caminhoFotoAntiga);
            }

            return res.status(200).json({ msg: "Dados alterados com sucesso.", plataforma: plataformaEditada });

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


// Deleta uma plataforma

router.delete("/:id", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {

    const idPlataforma = req.id;

    try {

        const existePlataforma = await db.query("SELECT * FROM plataforma WHERE id_plataforma = $1", [idPlataforma]);
        if (!existePlataforma.rowCount) {
            return res.status(404).json({ msg: "Plataforma não encontrada." });
        }

        try {

            let caminhoFoto = null;
            const plataformaApagada = await db.transaction(async (client) => {

                const apagaPlataforma = await client.query("DELETE FROM plataforma WHERE id_plataforma = $1 RETURNING *", [idPlataforma]);
                if (!apagaPlataforma.rowCount) {
                    throw new ErroHttp(400, "Erro ao apagar plataforma.");
                }

                const idFoto = apagaPlataforma.rows[0].id_imagem;

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
                    plataforma: apagaPlataforma.rows[0],
                    caminhoFoto: caminhoFoto
                }

            });

            if (plataformaApagada.caminhoFoto) {
                fs.unlinkSync(plataformaApagada.caminhoFoto);
            }

            const { id_imagem, ...plataforma } = plataformaApagada.plataforma;
            return res.status(200).json({ msg: "Plataforma apagada.", plataforma: plataforma });

        } catch (error) {

            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao apagar plataforma." });

        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});

// Apagar imagem de plataforma

router.delete("/:id/foto", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const idPlataforma = req.id;

    try {

        let caminhoFoto = null;

        try {

            const deletaFotoPlat = await db.transaction(async (client) => {

                const verificaPlataforma = await client.query("SELECT * FROM plataforma WHERE id_plataforma = $1", [idPlataforma]);
                if (!verificaPlataforma.rowCount) {
                    throw new ErroHttp(404, "Plataforma não encontrada.");
                }

                const dadosPlataforma = await client.query("SELECT id_imagem FROM plataforma WHERE id_plataforma = $1", [idPlataforma]);
                const idFoto = dadosPlataforma.rows[0].id_imagem;

                if (!idFoto) {
                    throw new ErroHttp(400, "Plataforma não possui foto.");
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

            return res.status(400).json({ msg: "Erro ao remover foto de plataforma." });
        }

        if (caminhoFoto) {
            fs.unlinkSync(caminhoFoto);
        }

        return res.status(200).json({ msg: "Foto removida." });

    } catch (error) {

        return res.status(500).json({ msg: "Erro geral." });
    }

});


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