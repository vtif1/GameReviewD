CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    data_nasc DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash CHAR(60) NOT NULL,
    bio TEXT,
    foto_perfil TEXT,
    tipo VARCHAR(10) NOT NULL DEFAULT 'usuario'
        CHECK(tipo IN('admin', 'usuario'))
);

CREATE TABLE IF NOT EXISTS jogo(
    id_jogo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data_lancamento DATE,
    imagem_url TEXT
);

CREATE TABLE IF NOT EXISTS desenvolvedora (
    id_desenvolvedora SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    data_criacao DATE,
    imagem_url TEXT
);


CREATE TABLE IF NOT EXISTS plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    imagem_url TEXT
);

CREATE TABLE IF NOT EXISTS genero (
    id_genero SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS avaliacao (
    id_avaliacao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_jogo INT NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
    texto TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo) ON DELETE CASCADE,

    UNIQUE (id_usuario, id_jogo)
);

CREATE TABLE IF NOT EXISTS historico_avaliacao (
    id_historico SERIAL PRIMARY KEY,
    id_avaliacao INT NOT NULL,
    estrelas INT NOT NULL CHECK (estrelas BETWEEN 1 AND 5),
    texto TEXT,
    alterado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_avaliacao)
        REFERENCES avaliacao(id_avaliacao) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jogo_desenvolvedora (
    id_jogo INT NOT NULL,
    id_desenvolvedora INT NOT NULL,
    
    PRIMARY KEY (id_jogo, id_desenvolvedora),

    FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo) ON DELETE CASCADE,
    FOREIGN KEY (id_desenvolvedora) REFERENCES desenvolvedora(id_desenvolvedora) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jogo_plataforma (
    id_jogo INT NOT NULL,
    id_plataforma INT NOT NULL,

    PRIMARY KEY (id_jogo, id_plataforma),

    FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo) ON DELETE CASCADE,
    FOREIGN KEY (id_plataforma) REFERENCES plataforma(id_plataforma) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS jogo_genero (
    id_jogo INT NOT NULL,
    id_genero INT NOT NULL,

    PRIMARY KEY (id_jogo, id_genero),

    FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo) ON DELETE CASCADE,
    FOREIGN KEY (id_genero) REFERENCES genero(id_genero) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS seguidores (
    id_seguidor INT NOT NULL,
    id_seguido INT NOT NULL,

    PRIMARY KEY (id_seguidor, id_seguido),

    FOREIGN KEY (id_seguidor) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_seguido) REFERENCES usuario(id_usuario) ON DELETE CASCADE,

    CHECK (id_seguidor <> id_seguido)
);

CREATE TABLE IF NOT EXISTS colecao_jogo_usuario (
    id_jogo INT NOT NULL,
    id_usuario INT NOT NULL,
    status VARCHAR(50) NOT NULL
        CHECK (status IN ('quero_jogar', 'jogando', 'finalizado', 'abandonado')),

    PRIMARY KEY (id_jogo, id_usuario),

    FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favoritos (
    id_jogo INT NOT NULL,
    id_usuario INT NOT NULL,

    PRIMARY KEY (id_jogo, id_usuario),

    FOREIGN KEY (id_jogo) REFERENCES jogo(id_jogo) ON DELETE CASCADE,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);
