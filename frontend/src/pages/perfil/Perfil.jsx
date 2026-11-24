import { use, useState } from "react";
import JogoFeed from "../../components/JogoFeed/JogoFeed";
import semfoto from "../../../src/assets/imagens/semfoto.png";
import jogoSemFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg"
import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png"

import styles from "./Perfil.module.css";
import JogoPerfil from "../../components/JogoFeed/JogoPerfil";
import ItemAvaliacao from "./ItemAvaliacao";

const url = "http://localhost:3000";

function Perfil(props) {
    const [aba, setAba] = useState("colecao");

    const [estrelas, setEstrelas] = useState(0);
    const [texto, setTexto] = useState("");

    const perfil = props.perfil;
    const seguidores = props.seguidores;

    console.log("Seguidores: ", seguidores);
    const seguindo = props.seguindo;
    console.log("Seguindo: ", seguindo)
    const colecao = props.colecaoJogos.jogos ?? [];
    const avaliacoes = props.avaliacoes.avaliacoes ?? [];
    const favoritos = props.favoritos.favoritos ?? [];

    console.log("Favoritos: ", favoritos)
    console.log("Avaliações: ", avaliacoes)

    const isAdmin = props.admin;

    console.log("Seguidores: ", seguidores)

    if (!perfil || !colecao || !avaliacoes || !favoritos) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark" data-bs-theme="dark">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando perfil...</span>
                </div>
            </div>
        );
    }

    const jogosColecao = colecao ?? [];
    console.log("Jogos ai: ", jogosColecao)

    const fotoPerfil = perfil.id_imagem_perfil ? `${url}/arquivo/${perfil.id_imagem_perfil}` : semfoto;

    const abas = [
        { id: "colecao", rotulo: "Coleção", total: jogosColecao.length },
        { id: "favoritos", rotulo: "Favoritos", total: favoritos.length },
        { id: "avaliacoes", rotulo: "Avaliações", total: avaliacoes.length },
    ];

    return (
        <>
            <nav className={`navbar navbar-expand-lg navbar-dark shadow ${styles.nav}`}>
                <div className="container">

                    <a className="navbar-brand fw-bold" href="/">
                        <img
                            src={logotipo}
                            alt="Logotipo"
                            width="35"
                            height="35"
                            className="d-inline-block align-text-center me-2"
                        />
                        GameReviewD
                    </a>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarLogin"
                        aria-controls="navbarLogin"
                        aria-expanded="false"
                        aria-label="Alternar navegação"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarLogin">
                        <ul className="navbar-nav ms-auto">

                            {isAdmin ? (
                                <>
                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link active" href="/">Início</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/me/profile">Perfil</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Configurações restritas</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Sair da conta</a>
                                    </li>
                                </>

                            ) : (
                                <>
                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Início</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link active" href="/me/profile">Perfil</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Sair da conta</a>
                                    </li>
                                </>
                            )}


                        </ul>
                    </div>

                </div>
            </nav>

            <main className={`min-vh-100 bg-body py-5 ${styles.fundo_pagina}`} data-bs-theme="dark">
                <div className="container" style={{ maxWidth: "960px" }}>

                    <section className="card shadow-lg border-secondary-subtle mb-4">
                        <div className={`card-body p-4 ${styles.bloco_info}`}>
                            <div className="row align-items-center g-4">

                                <div className="col-12 col-md-auto text-center">

                                    <img
                                        src={fotoPerfil}
                                        alt={`Foto de ${perfil.username}`}
                                        className="rounded-circle border border-primary border-3 object-fit-cover"
                                        width="120"
                                        height="120"
                                    />

                                </div>

                                <div className="col text-center text-md-start">
                                    <h1 className={`h3 fw-bold mb-0 ${styles.fonte_bebas_neue}`}>{perfil.nome}</h1>
                                    <p className={`text-body-secondary mb-2 ${styles.fonte_comfortaa}`}>@{perfil.username}</p>

                                    <p className={`${styles.fonte_comfortaa}`}>
                                        <a onClick={() => setAba("seguidores")} className={styles.seguidores}>
                                            {seguidores.length}
                                            {seguidores.length === 1 ? " seguidor" : " seguidores"}
                                        </a>

                                        <a onClick={() => setAba("seguindo")} className={styles.seguindo}>, {seguindo.length} seguindo</a>

                                    </p>

                                    {perfil.bio && <p className={`mb-0 ${styles.fonte_comfortaa}`}>{perfil.bio}</p>}
                                </div>

                                <div className="col-12 col-md-auto text-center">
                                    <button className={`btn btn-outline-danger ${styles.fonte_comfortaa}`} onClick={props.logout}>
                                        Sair da conta
                                    </button>
                                </div>

                            </div>

                            <div className="row text-center g-3 mt-3 pt-3 border-top border-secondary-subtle">
                                {abas.map((item) => (
                                    <div className="col-4" key={item.id}>
                                        <div className="fs-4 fw-bold">{item.total}</div>
                                        <div className={`text-body-secondary small ${styles.fonte_comfortaa}`}>{item.rotulo}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <ul className="nav nav-pills nav-fill mb-4 gap-2">
                        {abas.map((item) => (
                            <li className="nav-item" key={item.id}>
                                <button
                                    type="button"
                                    className={`nav-link ${aba === item.id ? "active" : ""} ${styles.fonte_bebas_neue} ${styles.btn_aba}`}
                                    onClick={() => setAba(item.id)}
                                >
                                    {item.rotulo}
                                </button>
                            </li>
                        ))}
                    </ul>

                    {aba === "colecao" && (
                        jogosColecao.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Coleção vazia.
                            </p>
                        ) : (
                            <div className="row g-3">
                                {jogosColecao.map((jogo) => (
                                    <div className="col-12 col-sm-6 col-lg-4" key={jogo.id_jogo}>
                                        <JogoPerfil
                                            jogo={jogo}
                                            status_jogo={jogo.status}
                                            fav_desfavJogo={props.fav_desfavJogo}
                                            apagaJogoColecao={props.apagaJogoColecao}
                                            alteraStatusJogo={props.alteraStatusJogo} />
                                    </div>

                                ))}
                            </div>
                        )
                    )}

                    {aba === "favoritos" && (
                        favoritos.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Nenhum jogo favoritado.
                            </p>
                        ) : (
                            <div className="row g-3">
                                {favoritos.map((jogo) => (
                                    <div className="col-12 col-sm-6 col-lg-4" key={jogo.id_jogo}>
                                        <JogoPerfil
                                            jogo={jogo}
                                            fav_desfavJogo={props.fav_desfavJogo}
                                            apagaJogoColecao={props.apagaJogoColecao}
                                        />
                                    </div>
                                ))}
                            </div>
                        )
                    )}

                    {aba === "avaliacoes" && (
                        avaliacoes.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Você ainda não avaliou nenhum jogo.
                            </p>
                        ) : (
                            <ul className="list-group gap-2">

                                {avaliacoes.map((av) => (
                                    <li className="list-group-item" key={av.id_avaliacao}>

                                        <div className="container">
                                            <div className="row">

                                                <div className="col-lg-4">
                                                    <img
                                                        src={av.id_imagem ? `${url}/arquivo/${av.id_imagem}` : jogoSemFoto}
                                                        alt=""
                                                        className="img-fluid rounded"
                                                    />
                                                </div>

                                                <div className="col-lg-8">

                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <strong>{av.jogo}</strong>
                                                            <span className="badge text-bg-warning ms-3">★ {av.estrelas}</span>
                                                        </div>

                                                        <div className="text-end text-nowrap ms-2">
                                                            <small className="d-block text-body-secondary">
                                                                Criada em {new Date(av.data_criacao).toLocaleDateString("pt-BR")}
                                                            </small>
                                                            <small className="d-block text-body-secondary">
                                                                Editada em {new Date(av.data_edicao).toLocaleDateString("pt-BR")}
                                                            </small>
                                                        </div>
                                                    </div>

                                                    {av.texto && (
                                                        <p className="mb-0 mt-2 text-body-secondary">{av.texto}</p>
                                                    )}

                                                    <ItemAvaliacao
                                                        idJogo={av.id_jogo}
                                                        estrelas={av.estrelas}
                                                        texto={av.texto}
                                                        salvarEdicao={props.editaAvaliacao}
                                                        apagaAvaliacao={props.apagaAvaliacao}></ItemAvaliacao>

                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}

                            </ul>
                        )
                    )}

                    {aba === "seguidores" && (
                        seguidores.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Você não possui seguidores.
                            </p>
                        ) : (
                            <ul className="list-group list-unstyled gap-2">

                                {seguidores.map((seg) => (
                                    <li className={`py-2 px-3 ${styles.seguidor_exibicao}`} key={seg.id_usuario}>

                                        <div className="container justify-content-between align-items-start">
                                            <div className="row">

                                                <div className="foto_perfil col-md-3 align-items-center">
                                                    <img src={seg.id_imagem_perfil ? `${url}/arquivo/${seg.id_imagem_perfil}` : semfoto} alt="" className="img-fluid w-25 rounded-circle" />
                                                    <strong className="text-white ms-2">{seg.seguidor}</strong>
                                                </div>


                                            </div>
                                        </div>

                                    </li>
                                )
                                )}

                            </ul>
                        )
                    )}

                    {aba === "seguindo" && (
                        seguindo.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Você não segue ninguém.
                            </p>
                        ) : (
                            <ul className="list-group list-unstyled gap-2">

                                {seguindo.map((seg) => (
                                    <li className={`py-2 px-3 ${styles.seguindo_exibicao}`} key={seg.id_usuario}>

                                        <div className="container justify-content-between align-items-start">
                                            <div className="row">

                                                <div className="foto_perfil col-md-3 align-items-center">
                                                    <img src={seg.id_imagem_perfil ? `${url}/arquivo/${seg.id_imagem_perfil}` : semfoto} alt="" className="img-fluid w-25 rounded-circle" />
                                                    <strong className="text-white ms-2">{seg.seguido}</strong>
                                                </div>


                                                <div className="col-md-9 d-flex justify-content-end align-items-center">
                                                    <button onClick={() => { props.deixaSeguir(seg.id_usuario) }} className={`border-0 rounded-1 ${styles.btn_seguir}`}>Seguindo</button>
                                                </div>
                                            </div>
                                        </div>

                                    </li>
                                )
                                )}

                            </ul>
                        )
                    )}

                </div>
            </main>
        </>

    );
}

export default Perfil;