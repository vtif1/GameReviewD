const db = require("../db");
const jwt = require("jsonwebtoken");
const senhaSecreta = process.env.JWT_SECRET;

async function autenticaUsuario(req, res, next) {

    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(403).json({ msg: "Token inválido." });
    }

    try {

        jwt.verify(token, senhaSecreta, async (err, decoded) => {
            if (err) {
                return res.status(403).json({ msg: "Token inválido" });
            }

            const r = await db.query("SELECT id_usuario FROM usuario WHERE id_usuario = $1", [
                decoded.id_usuario,
            ]);

            if (!r.rowCount) {
                return res.status(403).json({ msg: "Usuário não encontrado." });
            }

            req.usuario = decoded.id_usuario;
            next();
        })

    } catch (error) {
        return res.status(500).json({ msg : "Erro."})
    }



}

module.exports = autenticaUsuario;