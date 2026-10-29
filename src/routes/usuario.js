const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const multer = require("multer");
const verificaId = require("../middlewares/verificaid");

router.get("/", async (req, res) => {

    try {

        const r = await db.query("SELECT * FROM usuario");

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Nenhum usuário cadastrado." })
        }

        return res.status(200).json(r.rows)

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});

router.get("/:id", verificaId, async (req, res) => {

    try {

        const usuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [req.params.id]);

        if (!usuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        return res.status(200).json(usuario.rows[0]);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});

router.post("/", upload.single("foto"), async (req, res) => {

    const { username, nome, data_nasc, email, senha, bio } = req.body || {};
    const foto = req.file;

    try {

        let idFoto = null;
        if (foto) {

            const r_arquivo = await db(
                "INSERT INTO arquivo (nome_original, tipo_mime, tamanho_bytes, conteudo) VALUES ($1, $2, $3, $4)",
                [foto.originalname, foto.mimetype, foto.size, foto.buffer]
            );

            idFoto = r_arquivo.rows[0].id;

        }    

        if (!username || username.trim() === "" || typeof username != "string") {
            return res.status(400).json({ msg: "Insira um usuário válido." })
        }

        const testeUsername = await db.query("SELECT * FROM usuario WHERE username = $1", [username]);
        if (testeUsername != 0) {
            return res.status(409).json({ msg: "Já existe um usuário com esse username." });
        }

        if (!nome || nome.trim() === "" || typeof nome != "string") {
            return res.status(400).json({ msg: "Insira um nome válido." });
        }

        if (!data_nasc) {
            return res.status(400).json({ msg: "Insira uma data válida." });
        }

        const testeEmail = await db.query("SELECT * FROM usuario WHERE email = $1", [email])
        if (testeEmail.rowCount != 0) {
            return res.status(409).json({ msg: "Já existe um usuário com esse e-mail." })
        }

        if (!senha || senha.length < 8 || senha.trim() === "") {
            return res.status(400).json({ msg: "Insira uma senha válida." });
        }

        if (foto || foto.trim() === "") {
            return res.status(400).json({ msg : "Insira uma biografia válida."})
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        const r = await db.query(
            "INSERT INTO usuario (username, nome, data_nasc, email, senha_hash, id_imagem_perfil, bio)",
            [username, nome, data_nasc, email, senhaHash, idFoto, bio]
        )

    } catch (error) {

    }

})


module.exports = router;