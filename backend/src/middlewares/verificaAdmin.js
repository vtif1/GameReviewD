const db = require("../db");

async function verificaAdmin(req, res, next) {

    try {

        const admin = await db.query("SELECT admin FROM usuario WHERE id_usuario = $1", [req.usuario]);

        if (!admin.rowCount) {
            return res.status(404).json({ msg : "Usuário não encontrado."});
        }

        if (!admin.rows[0].admin) {
            return res.status(403).json({ msg: "Permissão negada. Apenas admistradores podem fazer essa operação." });
        }

        next();
    } catch (error) {
        return res.status(500).json({ msg: "Erro." })
    }

}

module.exports = verificaAdmin;