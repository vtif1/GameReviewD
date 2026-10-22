const express = require("express");
const router = express.Router();
const db = require("../db");
const verificaId = require("../middlewares/verificaid");

router.get("/", async (req, res) => {
    
    try {

        const r = await db.query("SELECT * FROM usuario");

        if (!r.rowCount) {
            return res.status(404).json({ msg : "Nenhum usuário cadastrado."})
        }

        return res.status(200).json(r.rows)
        
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."})
    }

});

router.get("/:id", verificaId, async (req, res) => {

    try {

        const usuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [req.params.id]);

        if (!usuario.rowCount) {
            return res.status(404).json({ msg : "Usuário não encontrado."});
        }

        return res.status(200).json(usuario.rows[0]);
        
    } catch (error) {
        return res.status(500).json({ msg : "Erro geral."})
    }

});

router.post("/", async (req, res) => {

    try {

        const {username, nome, data_nasc, email, senha} = req.body || {};

        if (!username || username.trim() === "" || typeof username != "string") {
            return res.status(400).json({ msg : "Insira um usuário válido."})
        }

        const testeUsername = await db.query("SELECT * FROM usuario WHERE username = $1", [username]);
        if (testeUsername != 0) {
            return res.status(409).json({ msg : "Já existe um usuário com esse username."});
        }

        if (!nome || nome.trim() === "" || typeof nome != "string") {
            return res.status(400).json({ msg : "Insira um nome válido."});
        }

        if (!data_nasc) {
            return res.status(400).json({ msg : "Insira uma data válida."});
        }

        const testeEmail = await db.query("SELECT * FROM usuario WHERE email = $1", [email]) 
        if (testeEmail.rowCount != 0) {
            return res.status(409).json({ msg : "Já existe um usuário com esse e-mail."})
        }
        
    } catch (error) {
        
    }

})


module.exports = router;