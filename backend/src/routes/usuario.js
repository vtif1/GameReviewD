const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const senhaSecreta = process.env.JWT_SECRET;
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const verificaId = require("../middlewares/verificaid");
const autenticaUsuario = require("../middlewares/autenticaUsuario");

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


// Lista todos os usuários

router.get("/", async (req, res) => {

    try {

        const r = await db.query("SELECT id_usuario, username, nome, email, bio, id_imagem_perfil FROM usuario");

        if (!r.rowCount) {
            return res.status(404).json({ msg: "Nenhum usuário cadastrado." })
        }

        return res.status(200).json(r.rows)

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



//Lista os dados do próprio perfil

router.get("/me", autenticaUsuario, async (req, res) => {
    const logado = req.usuario;

    try {

        const existe = await db.query("SELECT nome, username, data_nasc, bio, id_imagem_perfil FROM usuario WHERE id_usuario = $1", [logado]);
        if (!existe.rowCount) {
            return res.status(404).json({ msg: "Usuário não cadastrado." });
        }

        return res.status(200).json(existe.rows[0]);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Lista os dados do perfil de algum usuário

router.get("/:id", verificaId, async (req, res) => {
    const id = req.id;

    try {

        const usuario = await db.query("SELECT id_usuario, username, nome, email, bio, id_imagem_perfil FROM usuario WHERE id_usuario = $1", [id]);

        if (!usuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        return res.status(200).json(usuario.rows[0]);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Cadastro de usuário

router.post("/", upload.single("foto"), async (req, res) => {

    const { username, nome, data_nasc, email, senha } = req.body || {};
    let { bio } = req.body || {};
    const foto = req.file;

    try {

        if (typeof username != 'string' || username.trim() === "") {
            return res.status(400).json({ msg: "Username inválido." });
        }

        if (typeof nome != 'string' || nome.trim() === "") {
            return res.status(400).json({ msg: "Nome inválido." });
        }

        const verificaData = new Date(data_nasc);
        if (!data_nasc || Number.isNaN(verificaData.getTime())) {
            return res.status(400).json({ msg: "Data inválida." });
        }

        const dataAtual = new Date();
        let idade = dataAtual.getFullYear() - verificaData.getFullYear();
        const meses = dataAtual.getMonth() - verificaData.getMonth();

        if (meses < 0 || meses === 0 && dataAtual.getDate() < verificaData.getDate()) {
            idade--;
        }

        if (idade < 14) {
            return res.status(400).json({ msg: "Você deve ter igual ou mais de 14 anos de idade." })
        }

        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (typeof email != 'string' || email.trim() === "" || !regex.test(email)) {
            return res.status(400).json({ msg: "E-mail inválido." })
        }

        if (typeof senha != 'string' || senha.trim() === "") {
            return res.status(400).json({ msg: "Senha inválida." })
        }

        if (senha.length < 8) {
            return res.status(400).json({ msg: "A senha deve conter 8 ou mais caracteres." })
        }

        if (!bio) {
            bio = null;
        } else if (typeof bio !== 'string' || bio.trim() === "") {
            return res.status(400).json({ msg: "Bio inválida." })
        }

        const testeUsername = await db.query("SELECT * FROM usuario WHERE username = $1", [username]);

        if (testeUsername.rowCount != 0) {
            return res.status(409).json({ msg: "Username já cadastrado. Crie outro." })
        }

        const emailFormatado = email.toLowerCase().trim();
        const testeEmail = await db.query("SELECT * FROM usuario WHERE email = $1", [emailFormatado]);

        if (testeEmail.rowCount != 0) {
            return res.status(409).json({ msg: "E-mail já existente." });
        }

        const senhaHash = await bcrypt.hash(senha, 12);


        let caminhoCompleto = null;

        try {

            let idFoto = null;
            const usuarioCriado = await db.transaction(async (client) => {

                if (foto) {

                    const insereArquivo = await client.query(
                        "INSERT INTO arquivo(nome_original, extensao) VALUES ($1, $2) RETURNING *",
                        [req.file.originalname, path.extname(req.file.originalname)]);

                    if (!insereArquivo.rowCount) {
                        throw new ErroHttp(400, "Erro na inserção no banco de dados.");
                    }

                    const idGerado = insereArquivo.rows[0].id;
                    const extensao = insereArquivo.rows[0].extensao;

                    const pastaDestino = path.join(__dirname, "../uploads");
                    if (!fs.existsSync(pastaDestino)) {
                        fs.mkdirSync(pastaDestino);
                    }

                    const nomeFinalDoArquivo = `${idGerado}${extensao}`;
                    caminhoCompleto = path.join(pastaDestino, nomeFinalDoArquivo);

                    fs.writeFileSync(caminhoCompleto, req.file.buffer);

                    idFoto = insereArquivo.rows[0].id;

                }

                const insertUsuario = await client.query(
                    `INSERT INTO usuario (username, nome, data_nasc, email, senha_hash, id_imagem_perfil, bio)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
                    [username.trim(), nome.trim(), data_nasc, emailFormatado, senhaHash, idFoto, bio]
                );

                if (!insertUsuario.rowCount) {
                    throw new ErroHttp(400, "Erro ao inserir usuário.");
                }

                return insertUsuario.rows[0];
            });

            const { senha_hash, ...usuario } = usuarioCriado;

            return res.status(201).json({ msg: "Usuário cadastrado com sucesso.", usuario: usuario })

        } catch (error) {

            if (caminhoCompleto) {
                fs.unlinkSync(caminhoCompleto)
            }

            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(500).json({ msg: "Erro ao inserir usuário." })
        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Login de usuário

router.post("/login", async (req, res) => {

    const { login, senha } = req.body || {};

    try {

        if (typeof login != 'string' || login.trim() === "" || typeof senha != 'string' || senha.trim() === "") {
            return res.status(400).json({ msg: "Insira um login e senha válidos." })
        }

        const verificaLogin = await db.query("SELECT * FROM usuario WHERE username = $1 OR email = $2",
            [login, login]
        );

        if (!verificaLogin.rowCount) {
            return res.status(401).json({ msg: "Dados incorretos." });
        }

        const senhaValida = await bcrypt.compare(senha, verificaLogin.rows[0].senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ msg: "Senha incorreta." });
        }

        let jwtAssinado = jwt.sign(
            { id_usuario: verificaLogin.rows[0].id_usuario },
            senhaSecreta,
            {
                expiresIn: '2h',
                subject: verificaLogin.rows[0].username
            }
        )

        const { senha_hash, ...usuario } = verificaLogin.rows[0];
        return res.status(200).json({ msg: "Login efetuado com sucesso.", token: jwtAssinado, usuario: usuario });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});



// Edição de dados do usuário

router.put("/:id", upload.single("foto"), verificaId, autenticaUsuario, async (req, res) => {
    let { username, nome, data_nasc, email, senha } = req.body || {};
    let { bio } = req.body || {};
    const foto = req.file;

    const idUsuario = req.id;
    const logado = req.usuario;

    try {

        if (logado != idUsuario) {
            return res.status(403).json({ msg: "Operação negada. Esse perfil não é seu." })
        }

        const dadosAntigos = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);

        if (username && typeof username !== 'string') {
            return res.status(400).json({ msg: "Username inválido." });
        } else if (!username || username.trim() === "") {
            username = dadosAntigos.rows[0].username;
        }

        if (nome && typeof nome !== 'string') {
            return res.status(400).json({ msg: "Nome inválido." })
        } else if (!nome || nome.trim() === "") {
            nome = dadosAntigos.rows[0].nome;
        }

        if (!data_nasc) {
            data_nasc = dadosAntigos.rows[0].data_nasc;
        } else {

            const verificaData = new Date(data_nasc);
            if (Number.isNaN(verificaData.getTime())) {
                return res.status(400).json({ msg: "Data inválida." });
            }

            const dataAtual = new Date();
            let idade = dataAtual.getFullYear() - verificaData.getFullYear();
            const meses = dataAtual.getMonth() - verificaData.getMonth();

            if (meses < 0 || meses === 0 && dataAtual.getDate() < verificaData.getDate()) {
                idade--;
            }

            if (idade < 14) {
                return res.status(400).json({ msg: "Você deve ter igual ou mais de 14 anos de idade." })
            }

        }


        if (!email) {
            email = dadosAntigos.rows[0].email;
        } else {

            const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
            if (typeof email != 'string' || email.trim() === "" || !regex.test(email)) {
                return res.status(400).json({ msg: "E-mail inválido." })
            }

        }

        let senhaHash = dadosAntigos.rows[0].senha_hash;
        if (!senha) {
            senha = dadosAntigos.rows[0].senha_hash;
        } else {

            if (typeof senha != 'string' || senha.trim() === "") {
                return res.status(400).json({ msg: "Senha inválida." })
            }

            if (senha.length < 8) {
                return res.status(400).json({ msg: "A senha deve conter 8 ou mais caracteres." })
            }

            senhaHash = await bcrypt.hash(senha, 12);
        }

        if (bio === undefined) {
            bio = dadosAntigos.rows[0].bio;
        } else if (typeof bio !== 'string') {
            return res.status(400).json({ msg: "Bio inválida." })
        } else {
            bio = bio.trim();
        }

        const testeUsername = await db.query("SELECT * FROM usuario WHERE username = $1 AND id_usuario != $2", [username, idUsuario]);

        if (testeUsername.rowCount != 0) {
            return res.status(409).json({ msg: "Username já cadastrado. Crie outro." })
        }

        const emailFormatado = email.toLowerCase().trim();
        const testeEmail = await db.query("SELECT * FROM usuario WHERE email = $1 AND id_usuario != $2", [emailFormatado, idUsuario]);

        if (testeEmail.rowCount != 0) {
            return res.status(409).json({ msg: "E-mail já existente." });
        }

        let caminhoCompleto = null;
        let caminhoFotoAntiga = null;
        try {

            let idFoto = dadosAntigos.rows[0].id_imagem_perfil;
            const idFotoAntiga = idFoto;
            const pastaDestino = path.join(__dirname, "../uploads");

            const usuarioEditado = await db.transaction(async (client) => {

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

                const atualizaUsuario = await client.query(
                    "UPDATE usuario SET username = $1, nome = $2, data_nasc = $3, email = $4, senha_hash = $5, bio = $6, id_imagem_perfil = $7 WHERE id_usuario = $8 RETURNING *",
                    [username.trim(), nome, data_nasc, emailFormatado, senhaHash, bio, idFoto, idUsuario]
                );

                if (!atualizaUsuario.rowCount) {
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

                return atualizaUsuario.rows[0];

            });

            if (caminhoFotoAntiga) {
                fs.unlinkSync(caminhoFotoAntiga)
            }

            const { senha_hash, ...usuario } = usuarioEditado;
            return res.status(200).json({ msg: "Dados atualizados com sucesso.", usuario: usuario });

        } catch (error) {

            if (caminhoCompleto) {
                fs.unlinkSync(caminhoCompleto)
            }

            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao editar usuário." });
        }

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Deletar foto de perfil de usuário.

router.delete("/:id/foto", verificaId, autenticaUsuario, async (req, res) => {
    const idUsuario = req.id;
    const logado = req.usuario;

    try {

        if (logado != idUsuario) {
            return res.status(403).json({ msg: "Operação negada. Esse perfil não é seu." })
        }

        let caminhoFoto = null;

        try {

            const deletaFotoPerfil = await db.transaction(async (client) => {

                const verificaUsuario = await client.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);
                if (!verificaUsuario.rowCount) {
                    throw new ErroHttp(404, "Usuário não encontrado.");
                }


                const dadosUsuario = await client.query("SELECT id_imagem_perfil FROM usuario WHERE id_usuario = $1", [idUsuario]);
                const idFoto = dadosUsuario.rows[0].id_imagem_perfil;

                if (!idFoto) {
                    throw new ErroHttp(400, "Usuário não possui foto.");
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

            return res.status(400).json({ msg: "Erro ao remover foto de perfil." });
        }

        if (caminhoFoto) {
            fs.unlinkSync(caminhoFoto);
        }

        return res.status(200).json({ msg: "Foto removida." });

    } catch (error) {

        return res.status(500).json({ msg: "Erro geral." });
    }

});



// Deletar conta de usuário

router.delete("/:id", autenticaUsuario, verificaId, async (req, res) => {
    const idUsuario = req.id;
    let logado = req.usuario;

    try {

        const teste = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [logado]);

        if (!teste.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." })
        }

        if (idUsuario != logado && !teste.rows[0].admin) {
            return res.status(403).json({ msg: "Operação negada." })
        }

        const existeUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);
        if (!existeUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não cadastrado." });
        }

        let usuarioDeletado = null;
        try {

            usuarioDeletado = await db.transaction(async (client) => {

                const dadosUsuario = await client.query("SELECT id_imagem_perfil FROM usuario WHERE id_usuario = $1", [idUsuario]);

                if (!dadosUsuario.rowCount) {
                    throw new ErroHttp(404, "Usuário não encontrado.");
                }

                const idFoto = dadosUsuario.rows[0].id_imagem_perfil;

                let caminhoFoto = null;
                if (idFoto) {
                    const dadosArquivo = await client.query("SELECT extensao FROM arquivo WHERE id = $1", [idFoto]);

                    const pastaDestino = path.join(__dirname, "../uploads");

                    if (dadosArquivo.rowCount) {
                        const nomeArquivo = `${idFoto}${dadosArquivo.rows[0].extensao}`;
                        caminhoFoto = path.join(pastaDestino, nomeArquivo);
                    }

                    const deletaArquivo = await client.query("DELETE FROM arquivo WHERE id = $1 RETURNING *", [idFoto]);

                    if (!deletaArquivo.rowCount) {
                        throw new ErroHttp(400, "Erro ao apagar foto.");
                    }

                }

                const deletaUsuario = await client.query("DELETE FROM usuario WHERE id_usuario = $1 RETURNING *", [idUsuario]);
                if (!deletaUsuario.rowCount) {
                    throw new ErroHttp(400, "Erro ao apagar usuário.");
                }

                return {
                    usuario: deletaUsuario.rows[0],
                    caminhoFoto: caminhoFoto
                }
            });


        } catch (error) {
            if (error instanceof ErroHttp) {
                return res.status(error.status).json({ msg: error.message });
            }

            return res.status(400).json({ msg: "Erro ao apagar usuário." })
        }


        if (usuarioDeletado.caminhoFoto) {
            fs.unlinkSync(usuarioDeletado.caminhoFoto);
        }

        const { senha_hash, ...usuario } = usuarioDeletado.usuario;
        return res.status(200).json({ msg: "Usuário apagado com sucesso.", usuario: usuario });

    } catch (error) {
        return res.status(500).json({ msg: error.message })
    }

});



// Retorna as próprias avaliações

router.get("/me/avaliacoes", autenticaUsuario, async (req, res) => {
    const logado = req.usuario;

    try {

        const a = await db.query(
            "SELECT j.nome jogo, j.id_imagem, a.texto, a.estrelas, a.criado_em FROM avaliacao a JOIN jogo j ON a.id_jogo = j.id_jogo WHERE id_usuario = $1",
            [logado]);

        if (!a.rowCount) {
            return res.status(404).json({ msg: "Nenhuma avaliação registrada." })
        }

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [logado]);

        const avaliacoesUsuario = {
            usuario: verificaUsuario.rows[0].username,
            avaliacoes: []
        }

        for (const avaliacao of a.rows) {
            avaliacoesUsuario.avaliacoes.push(
                {
                    jogo: avaliacao.jogo,
                    texto: avaliacao.texto,
                    estrelas: avaliacao.estrelas,
                    data_criacao: avaliacao.criado_em
                }
            )
        }

        return res.status(200).json(avaliacoesUsuario);

    } catch (error) {
        return res.status(500).json({ msg : error.message})
    }

});



// Retorna as avaliações de algum usuário

router.get("/:id/avaliacoes", verificaId, async (req, res) => {
    const idUsuario = req.id;

    try {

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);

        if (!verificaUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        const a = await db.query(
            "SELECT j.nome jogo, j.id_imagem, a.texto, a.estrelas, a.criado_em FROM avaliacao a JOIN jogo j ON a.id_jogo = j.id_jogo WHERE id_usuario = $1",
            [idUsuario]);

        if (!a.rowCount) {
            return res.status(404).json({ msg: "Nenhuma avaliação registrada deste usuário." })
        }

        const avaliacoesUsuario = {
            usuario: verificaUsuario.rows[0].username,
            id_imagem: verificaUsuario.rows[0].id_imagem_perfil,
            avaliacoes: []
        }

        for (const avaliacao of a.rows) {
            avaliacoesUsuario.avaliacoes.push(
                {
                    jogo: avaliacao.jogo,
                    texto: avaliacao.texto,
                    estrelas: avaliacao.estrelas,
                    data_criacao: avaliacao.criado_em
                }
            )
        }

        return res.status(200).json(avaliacoesUsuario)

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});



// Retorna a própria coleção de jogos

router.get("/me/colecao", autenticaUsuario, async (req, res) => {
    const logado = req.usuario;

    try {

        const colecao = await db.query(
            `SELECT u.username, j.nome, j.descricao FROM usuario u
            LEFT JOIN colecao_jogo_usuario cju ON u.id_usuario = cju.id_usuario
            LEFT JOIN jogo j ON j.id_jogo = cju.id_jogo
            WHERE u.id_usuario = $1`,
            [logado]
        );

        const colecaoUsuario = {
            usuario: colecao.rows[0].username,
            jogos: []
        }

        for (const jogo of colecao.rows) {

            if (jogo.nome != null) {
                colecaoUsuario.jogos.push(
                    {
                        jogo: jogo.nome,
                        descricao: jogo.descricao
                    }
                )
            }

        }

        return res.status(200).json(colecaoUsuario);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }
});



// Retorna os jogos favoritados da própria coleção

router.get("/me/colecao/favoritos", autenticaUsuario, async (req, res) => {
    const logado = req.usuario;

    try {

        const colecao = await db.query(
            `SELECT u.username, j.nome, j.descricao, j.id_imagem FROM usuario u
            LEFT JOIN colecao_jogo_usuario cju ON u.id_usuario = cju.id_usuario
            LEFT JOIN jogo j ON j.id_jogo = cju.id_jogo AND cju.favorito = TRUE
            WHERE u.id_usuario = $1`,
            [logado]
        );

        const colecaoUsuario = {
            usuario: colecao.rows[0].username,
            favoritos: []
        }

        for (const jogo of colecao.rows) {

            if (jogo.nome != null) {
                colecaoUsuario.favoritos.push(
                    {
                        jogo: jogo.nome,
                        descricao: jogo.descricao,
                        imagem: jogo.id_imagem
                    }
                )
            }
        }

        return res.status(200).json(colecaoUsuario);


    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});


// Favorita ou desfavorita algum jogo

router.patch("/me/colecao/:id/favorito", autenticaUsuario, verificaId, async (req, res) => {
    const { favoritar } = req.body || {};
    const logado = req.usuario;
    const idJogo = req.id;

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);

        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        const verificaJogoColecao = await db.query("SELECT * FROM colecao_jogo_usuario WHERE id_usuario = $1 AND id_jogo = $2 ", [logado, idJogo]);

        if (!verificaJogoColecao.rowCount) {
            return res.status(404).json({ msg: "Jogo não cadastrado na sua coleção." })
        }

        if (typeof favoritar !== 'boolean') {
            return res.status(400).json({ msg : "Parâmetro inválido."});
        }

        const atualizaFavorito = await db.query(
            "UPDATE colecao_jogo_usuario SET favorito = $1 WHERE id_usuario = $2 AND id_jogo = $3 RETURNING *",
            [favoritar, logado, idJogo]);

        if (!atualizaFavorito.rowCount) {
            return res.status(400).json({ msg: "Erro ao favoritar/desfavoritar jogo." });
        }

        return res.status(200).json({ msg: "Jogo favoritado/desfavoritado." });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
});



// Altera o status de algum jogo da coleção

router.patch("/me/colecao/:id", autenticaUsuario, verificaId, async (req, res) => {
    const idJogo = req.id;
    const logado = req.usuario;
    const { status } = req.body || {};

    const listaStatus = ['quero_jogar', "jogando", 'finalizado', 'abandonado'];

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);

        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        const verificaJogoColecao = await db.query("SELECT * FROM colecao_jogo_usuario WHERE id_usuario = $1 AND id_jogo = $2 ", [logado, idJogo]);

        if (!verificaJogoColecao.rowCount) {
            return res.status(404).json({ msg: "Jogo não cadastrado na sua coleção." })
        }

        const statusForm = status.toLowerCase();
        if (!listaStatus.includes(statusForm)) {
            return res.status(400).json({ msg: "Status inválido." });
        }

        const atualizaStatus = await db.query(
            "UPDATE colecao_jogo_usuario SET status = $1 WHERE id_usuario = $2 AND id_jogo = $3 RETURNING *",
            [statusForm, logado, idJogo]
        );

        if (!atualizaStatus.rowCount) {
            return res.status(400).json({ msg: "Erro ao atualizar status." });
        }

        return res.status(200).json({ msg: "Status atualizado." });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
})



// Retorna a coleção de jogos de algum usuário

router.get("/:id/colecao", verificaId, async (req, res) => {
    const idUsuario = req.id;

    try {

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);

        if (!verificaUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        const colecao = await db.query(
            `SELECT u.username, j.nome, j.descricao FROM usuario u
            LEFT JOIN colecao_jogo_usuario cju ON u.id_usuario = cju.id_usuario
            LEFT JOIN jogo j ON j.id_jogo = cju.id_jogo
            WHERE u.id_usuario = $1`,
            [idUsuario]
        );

        const colecaoUsuario = {
            usuario: colecao.rows[0].username,
            jogos: []
        }

        for (const jogo of colecao.rows) {

            if (jogo.nome != null) {
                colecaoUsuario.jogos.push(
                    {
                        jogo: jogo.nome,
                        descricao: jogo.descricao
                    }
                )
            }

        }

        return res.status(200).json(colecaoUsuario);

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." })
    }

});



// Adiciona algum jogo à coleção

router.post("/me/colecao/:id", verificaId, autenticaUsuario, async (req, res) => {
    const logado = req.usuario;
    const idJogo = req.id;

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);

        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        const verificaColecao = await db.query("SELECT * FROM colecao_jogo_usuario WHERE id_usuario = $1 AND id_jogo = $2", [logado, idJogo]);

        if (verificaColecao.rowCount != 0) {
            return res.status(409).json({ msg: "Esse jogo já está na sua coleção." });
        }

        const adicionaJogo = await db.query(
            "INSERT INTO colecao_jogo_usuario (id_jogo, id_usuario) VALUES ($1, $2) RETURNING *",
            [idJogo, logado]
        );

        if (!adicionaJogo.rowCount) {
            return res.status(400).json({ msg: "Erro ao adicionar jogo à coleção." });
        }

        return res.status(200).json({ msg: "Jogo adicionado à sua coleção." })

    } catch (error) {
        return res.status(500).json({ msg: error.message })
    }

});



// Remove algum jogo da coleção

router.delete("/me/colecao/:id", autenticaUsuario, verificaId, async (req, res) => {
    const idJogo = req.id;
    const logado = req.usuario;

    try {

        const verificaJogo = await db.query("SELECT * FROM jogo WHERE id_jogo = $1", [idJogo]);

        if (!verificaJogo.rowCount) {
            return res.status(404).json({ msg: "Jogo não encontrado." });
        }

        const verificaColecao = await db.query("SELECT * FROM colecao_jogo_usuario WHERE id_usuario = $1 AND id_jogo = $2", [logado, idJogo]);

        if (!verificaColecao.rowCount) {
            return res.status(404).json({ msg: "Esse jogo não está na sua coleção." });
        }

        const removeJogo = await db.query(
            "DELETE FROM colecao_jogo_usuario WHERE id_usuario = $1 AND id_jogo = $2 RETURNING *",
            [logado, idJogo]
        );

        if (!removeJogo.rowCount) {
            return res.status(400).json({ msg: "Erro ao deletar jogo de sua coleção." });
        }

        return res.status(200).json({ msg: "Jogo removido de sua coleção." });

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }
});


// Busca os seguidores de um usuário

router.get("/:id/seguidores", verificaId, async (req, res) => {
    const idUsuario = req.id;

    try {

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);
        if (!verificaUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        const seguidores = {
            usuario: verificaUsuario.rows[0].nome,
            seguidores: []
        }

        const seg = await db.query(
            `SELECT u2.username seguidor, u2.id_imagem_perfil FROM usuario u1 
            JOIN seguidores s ON u1.id_usuario = s.id_seguido
            JOIN usuario u2 ON s.id_seguidor = u2.id_usuario
            WHERE u1.id_usuario = $1`,
            [idUsuario]
        );

        for (const seguidor of seg.rows) {
            seguidores.seguidores.push(seguidor.seguidor)
        }

        return res.status(200).json(seguidores);

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});


// Busca os seguindo de um usuário

router.get("/:id/seguindo", verificaId, async (req, res) => {
    const idUsuario = req.id;

    try {

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);
        if (!verificaUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        const lista_seguindo = {
            usuario: verificaUsuario.rows[0].nome,
            seguindo: []
        }

        const seg = await db.query(
            `SELECT u2.username seguido, u2.id_imagem_perfil FROM usuario u1
            JOIN seguidores s ON u1.id_usuario = s.id_seguidor
            JOIN usuario u2 ON s.id_seguido = u2.id_usuario
            WHERE u1.id_usuario = $1`,
            [idUsuario]
        );

        for (const s of seg.rows) {
            lista_seguindo.seguindo.push(s.seguido);
        }

        return res.status(200).json(lista_seguindo);

    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});



// Seguir alguém

router.post("/me/seguindo/:id", autenticaUsuario, verificaId, async (req, res) => {

    const idUsuarioSeguir = req.id;
    const logado = req.usuario;

    try {

        if (idUsuarioSeguir == logado) {
            return res.status(400).json({ msg : "Você não pode seguir a si mesmo."})
        }

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuarioSeguir]);
        if (!verificaUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        const verificaSeguindo = await db.query("SELECT * FROM seguidores WHERE id_seguidor = $1 AND id_seguido = $2", [logado, idUsuarioSeguir]);
        if (verificaSeguindo.rowCount != 0) {
            return res.status(409).json({ msg: "Você já segue esse usuário." });
        }

        const seguirUsuario = await db.query(
            "INSERT INTO seguidores (id_seguidor, id_seguido) VALUES ($1, $2) RETURNING *",
            [logado, idUsuarioSeguir]
        );

        if (!seguirUsuario.rowCount) {
            return res.status(400).json({ msg: "Não foi possível seguir este usuário." });
        }

        return res.status(200).json({ msg: "Usuário seguido com sucesso." })

    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
    }

});



// Parar de seguir alguém

router.delete("/me/seguindo/:id", autenticaUsuario, verificaId, async (req, res) => {

    const idUsuario = req.id;
    const logado = req.usuario;

    try {

        const verificaUsuario = await db.query("SELECT * FROM usuario WHERE id_usuario = $1", [idUsuario]);
        if (!verificaUsuario.rowCount) {
            return res.status(404).json({ msg: "Usuário não encontrado." });
        }

        const verificaSeguindo = await db.query("SELECT * FROM seguidores WHERE id_seguidor = $1 AND id_seguido = $2", [logado, idUsuario]);
        if (!verificaSeguindo.rowCount) {
            return res.status(400).json({ msg: "Você já não segue esse usuário." });
        }

        const paraSeguir = await db.query(
            "DELETE FROM seguidores WHERE id_seguidor = $1 AND id_seguido = $2 RETURNING *",
            [logado, idUsuario]
        );

        if (!paraSeguir.rowCount) {
            return res.status(400).json({ msg: "Erro ao parar de seguir usuário." });
        }


        return res.status(200).json({ msg: "Usuário deixado de seguir com sucesso." });
    } catch (error) {
        return res.status(500).json({ msg: "Erro geral." });
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



module.exports = router;