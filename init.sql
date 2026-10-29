CREATE TABLE IF NOT EXISTS arquivo (
    id SERIAL PRIMARY KEY,
    nome_original VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    tamanho_bytes BIGINT NOT NULL,
    conteudo BYTEA NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    data_nasc DATE NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha_hash CHAR(60) NOT NULL,
    id_imagem_perfil INT,
    bio TEXT,
    admin BOOLEAN NOT NULL,

    FOREIGN KEY (id_imagem_perfil) REFERENCES arquivo(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS jogo(
    id_jogo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    data_lancamento DATE,
    id_imagem INT,

    FOREIGN KEY (id_imagem) REFERENCES arquivo(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS desenvolvedora (
    id_desenvolvedora SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    data_criacao DATE,
    id_imagem INT,

    FOREIGN KEY (id_imagem) REFERENCES arquivo(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS plataforma (
    id_plataforma SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    id_imagem INT,

    FOREIGN KEY (id_imagem) REFERENCES arquivo(id) ON DELETE CASCADE
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

CREATE TABLE IF NOT EXISTS solicitacao_jogo (
    id_solicitacao SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    data_lancamento DATE,
    imagem_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pendente'
        CHECK (status IN ('pendente', 'aprovada', 'rejeitada')),
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS solicitacao_jogo_desenvolvedora (
    id_solicitacao INT NOT NULL,
    id_desenvolvedora INT NOT NULL,

    PRIMARY KEY (id_solicitacao, id_desenvolvedora),

    FOREIGN KEY (id_solicitacao)
        REFERENCES solicitacao_jogo(id_solicitacao) ON DELETE CASCADE,

    FOREIGN KEY (id_desenvolvedora)
        REFERENCES desenvolvedora(id_desenvolvedora) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS solicitacao_jogo_plataforma (
    id_solicitacao INT NOT NULL,
    id_plataforma INT NOT NULL,

    PRIMARY KEY (id_solicitacao, id_plataforma),

    FOREIGN KEY (id_solicitacao)
        REFERENCES solicitacao_jogo(id_solicitacao) ON DELETE CASCADE,

    FOREIGN KEY (id_plataforma)
        REFERENCES plataforma(id_plataforma) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS solicitacao_jogo_genero (
    id_solicitacao INT NOT NULL,
    id_genero INT NOT NULL,

    PRIMARY KEY (id_solicitacao, id_genero),

    FOREIGN KEY (id_solicitacao)
        REFERENCES solicitacao_jogo(id_solicitacao) ON DELETE CASCADE,

    FOREIGN KEY (id_genero)
        REFERENCES genero(id_genero) ON DELETE RESTRICT
);

-- INSERTS no banco

-- Inserção de um administrador
-- Senha: vtozadmin19
INSERT INTO usuario (username, nome, data_nasc, email, senha_hash, tipo)
VALUES (
    'vtoz', 'Vitor Manoel Cesarino', '2009-03-19', 
    'v.manoel@aluno.ifsp.edu.br', '$2a$12$xchfLpFfuJZxGLd27mSIg.ZcFxtKyFGBPWN6FlHeHYyLWZmpR1Viq', TRUE
);

-- Inserção de um usuário comum
-- Senha: userx26

INSERT INTO usuario (username, nome, data_nasc, email, senha_hash, tipo)
VALUES (
    'user', 'Usuário da Silva', '2000-12-25', 
    'user123@gmail.com', '$2a$12$qWhbP1UpBbYl9OXzHSIb3OGXPR5YdQyxiUAE0j0tjhuVUXLMPOd0W', FALSE
);


INSERT INTO jogo (nome, descricao, data_lancamento, imagem_url)
VALUES
('Minecraft',
 'Minecraft é um jogo eletrônico de sobrevivência e construção em mundo aberto, totalmente feito de blocos tridimensionais pixelados. Nele, o jogador 
 explora um universo infinito gerado proceduralmente, onde pode minerar recursos, craftar (fabricar) ferramentas e construir qualquer tipo de estrutura, 
 desde uma cabana simples até castelos complexos. O jogo possui dois modos principais: o Sobrevivência, onde é preciso gerenciar a vida, a fome e se 
 defender de criaturas que surgem à noite (como zumbis e creepers), e o Criativo, que oferece recursos ilimitados e voo livre para focar inteiramente na 
 imaginação e na arquitetura.',
 '2011-11-18', NULL),

('Grand Theft Auto V',
 'Grand Theft Auto V (GTA 5) é um jogo de ação e aventura em mundo aberto ambientado na fictícia e vibrante cidade de Los Santos e seus arredores. 
 A história acompanha as vidas entrelaçadas de três criminosos com passados e personalidades totalmente diferentes: Michael, um ex-assaltante de bancos 
 em crise de meia-idade; Franklin, um jovem das quebradas em busca de crescimento no crime; e Trevor, um psicopata imprevisível e violento. O grande 
 diferencial do jogo é a mecânica de alternar entre esses três protagonistas a qualquer momento, unindo-os em uma série de assaltos complexos e perigosos. 
 Além de sua narrativa ácida e satírica sobre a sociedade moderna, o game se destaca pela imensa liberdade de exploração, variedade de veículos, missões secundárias 
 e o seu aclamado modo multijogador, o GTA Online.',
 '2013-09-17', NULL),

('Fortnite',
 'O Fortnite é um jogo eletrônico gratuito desenvolvido pela Epic Games, lançado em 2017. Ele funciona como uma plataforma multijogador que combina tiro em 
 terceira pessoa, sobrevivência, construção de estruturas e diversos modos de jogo — como o clássico Battle Royale para até 100 jogadores.',
 '2017-07-21', NULL);


INSERT INTO desenvolvedora
(nome, descricao, data_criacao, imagem_url)
VALUES
('Mojang Studios',
 'A Mojang Studios é uma desenvolvedora de jogos eletrônicos sueca, sediada em Estocolmo e mundialmente famosa por criar o Minecraft, o jogo mais 
 vendido de todos os tempos. ',
 '2009-06-18', NULL),

('Rockstar North',
 'A Rockstar North é uma renomada desenvolvedora britânica de jogos eletrônicos sediada em Edimburgo, Escócia, amplamente conhecida por ser a 
 principal criadora da bilionária e aclamada franquia Grand Theft Auto (GTA).',
 NULL, NULL),

('Epic Games',
 'A Epic Games é uma empresa norte-americana de desenvolvimento de jogos e software, amplamente reconhecida como a criadora de Fortnite, um dos maiores 
 fenômenos culturais e de faturamento da indústria dos games, e pelo desenvolvimento da Unreal Engine, um dos motores gráficos mais poderosos e utilizados 
 do mundo por estúdios de jogos, cinema e televisão.',
 '1991-01-15', NULL);


INSERT INTO plataforma (nome, imagem_url)
VALUES
('PC', NULL),
('PlayStation 5', NULL),
('Xbox Series X/S', NULL);


INSERT INTO genero (nome, descricao)
VALUES
('Sobrevivência',
 'Jogos em que os jogadores precisam administrar recursos e superar desafios para sobreviver.'),

('Ação e aventura',
 'Jogos que combinam desafios de ação com exploração e progressão.'),

('Battle Royale',
 'Jogos competitivos em que vários jogadores disputam até restar um vencedor ou uma equipe vencedora.');

INSERT INTO jogo_desenvolvedora (id_jogo, id_desenvolvedora)
VALUES
(1, 1),
(2, 2),
(3, 3);


INSERT INTO jogo_plataforma (id_jogo, id_plataforma)
VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 1), (3, 2), (3, 3);


INSERT INTO jogo_genero (id_jogo, id_genero)
VALUES
(1, 1),
(2, 2),
(3, 3);

INSERT INTO solicitacao_jogo (id_solicitacao, id_usuario, nome, descricao, data_lancamento, imagem_url, status, criado_em) 
VALUES
(1, 2, 'Minecraft Legends', 
'Jogo de ação e estratégia em que o jogador lidera aliados para defender o mundo de Minecraft contra uma invasão de piglins.',
'2023-04-18',  NULL, 'pendente', CURRENT_TIMESTAMP);

INSERT INTO solicitacao_jogo_desenvolvedora (id_solicitacao, id_desenvolvedora)
VALUES (1, 1);

INSERT INTO solicitacao_jogo_plataforma (id_solicitacao, id_plataforma)
VALUES (1,1), (1,2), (1,3);

INSERT INTO solicitacao_jogo_genero (id_solicitacao, id_genero) 
VALUES (1, 2);