const express = require("express");
const router = express.Router();
const db = require("../db");
const verificaId = require("../middlewares/verificaid");
const autenticaUsuario = require("../middlewares/autenticaUsuario");
const verificaAdmin = require("../middlewares/verificaAdmin");

router.get("/", async (req, res) => {

    try {

        const r = await db.query("SELECT * FROM genero");

        if (!r.rowCount) {
            return res.status(404).json({ msg : "Nenhum gênero cadastrado."})
        }

        return res.status(200).json(r.rows);
        
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."})
    }

});

router.get("/:id", verificaId, async (req, res) => {
    const idGenero = req.id;

    try {

        const r = await db.query("SELECT * FROM genero WHERE id_genero = $1", [idGenero]);

        if (!r.rowCount) {
            return res.status(404).json({ msg : "Gênero não existente no sistema."});
        }

        const genero = r.rows[0];
        const jogos = await db.query(
            `SELECT j.nome FROM jogo j
            JOIN jogo_genero jg ON j.id_jogo = jg.id_jogo
            JOIN genero g ON jg.id_genero = g.id_genero
            WHERE jg.id_genero = $1`,
            [idGenero]
        );

        genero.jogos = jogos.rows;

        return res.status(200).json(genero);
        
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."});
    }

});

router.post("/", autenticaUsuario, verificaAdmin, async (req, res) => {
    const { nome, descricao } = req.body || {};

    try {

        if (typeof nome != 'string' || nome.trim() === "") {
            return res.status(400).json({ msg : "Nome inválido."});
        }

        const verificaNome = await db.query("SELECT * FROM genero WHERE nome = $1", [nome.trim()]);
        if (verificaNome.rowCount != 0) {
            return res.status(409).json({ msg : "Gênero já existente."});
        }

        if (typeof descricao != 'string' || descricao.trim() === "") {
            return res.status(400).json({ msg : "Descrição inválida."});
        }

        const insereGenero = await db.query(
            "INSERT INTO genero (nome, descricao) VALUES ($1, $2) RETURNING *",
            [nome.trim(), descricao.trim()]
        );

        if (!insereGenero.rowCount) {
            return res.status(400).json({ msg : "Erro ao inserir gênero."});
        }

        return res.status(200).json({ msg : "Gênero adicionado.", genero: insereGenero.rows[0]})
        
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."})
    }

});

router.put("/:id", autenticaUsuario, verificaAdmin, verificaId, async (req, res) => {
    const { nome, descricao } = req.body || {};

    try {
        const dadosAtuais = await db.query("SELECT nome, descricao FROM genero WHERE id_genero = $1", [req.params.id]);

        if (!dadosAtuais.rowCount) {
            return res.status(404).json({ msg : "Gênero não existente."})
        }

        let novoNome = null, novaDescricao = null;
        if (!nome) {
            novoNome = dadosAtuais.rows[0].nome;
        } else if (typeof nome != 'string' || nome.trim() === "") {
            return res.status(400).json({ msg : "Nome inválido."})
        } else { 

            const verificaNome = await db.query("SELECT * FROM genero WHERE nome = $1 AND id_genero != $2", [nome.trim(), req.params.id]);
            if (verificaNome.rowCount != 0) {
                return res.status(403).json({ msg : "Gênero com o nome já cadastrado."});
            }

            novoNome = nome.trim();
        }

        if (descricao == null) {
            novaDescricao = dadosAtuais.rows[0].descricao;
        } else if (typeof descricao != 'string') {
            return res.status(400).json({ msg : "Descrição inválida."})
        } else {
            novaDescricao = descricao.trim();
        }

        const atualizaGenero = await db.query("UPDATE genero SET nome = $1, descricao = $2 WHERE id_genero = $3 RETURNING *", [novoNome, novaDescricao, req.params.id]);
        if (!atualizaGenero.rowCount) {
            return res.status(400).json({ msg : "Erro ao atualizar gênero."});
        }
        
        return res.status(200).json({ msg : "Gênero editado.", dados: atualizaGenero.rows[0]});
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."});
    }

});



// Apaga um gênero

router.delete("/:id", verificaId, autenticaUsuario, verificaAdmin, async (req, res) => {

    try {

        const verificaGenero = await db.query("SELECT * FROM genero WHERE id_genero = $1", [req.params.id]);
        if (!verificaGenero.rowCount) {
            return res.status(404).json({msg : "Gênero não cadastrado."});
        }

        const deletaGenero = await db.query("DELETE FROM genero WHERE id_genero = $1 RETURNING *", [req.params.id]);
        if (!deletaGenero.rowCount) {
            return res.status(400).json({ msg : "Erro ao deletar gênero."})
        }

        return res.status(200).json({ msg : "Gênero deletado."})
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."})
    }

});

router.get("/:id/jogos", verificaId, async (req, res) => {

    try {

        const jogosGenero = await db.query(
            `SELECT j.nome, j.descricao, j.data_lancamento FROM genero g 
            JOIN jogo_genero jg ON g.id_genero = jg.id_genero 
            JOIN jogo j ON jg.id_jogo = j.id_jogo 
            WHERE g.id_genero = $1`,
            [req.params.id]
        )

        if (!jogosGenero.rowCount) {
            return res.status(404).json({ msg : "Jogos não encontrados com o gênero informado."});
        }

        return res.status(200).json(jogosGenero.rows)
        
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."})
    }

});

module.exports = router;