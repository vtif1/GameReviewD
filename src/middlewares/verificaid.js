function verificaId(req, res, next) {
    const id = Number(req.params.id);

    if (id <= 0 || !Number.isInteger(id)) {
        return res.status(400).json({ msg : "Parâmetro inválido."})
    }

    next();
}

module.exports = verificaId;