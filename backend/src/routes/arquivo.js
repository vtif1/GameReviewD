const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");
const fs = require("fs");

// Retorna a imagem de algum elemento específico

router.get("/:id", async (req, res) => {
    try {
        const r = await db.query("SELECT * FROM arquivo WHERE id = $1", [req.params.id]);
        if (!r.rowCount) {
            return res.status(404).json({ erro: "Imagem não encontrada no servidor." });
        }
        const caminhoCompleto = path.join(
            __dirname,
            "../uploads",
            `${r.rows[0].id}${r.rows[0].extensao}`,
        );
        if (fs.existsSync(caminhoCompleto)) {
            return res.sendFile(caminhoCompleto);
        } else {
            return res.status(404).json({ erro: "Imagem não encontrada no servidor." });
        }
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
});

module.exports = router;
