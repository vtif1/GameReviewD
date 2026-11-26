import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import semfoto from "../../assets/imagens/semfoto.png";
import jogoSemFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg";
import styles from "./Perfil.module.css";

const url = "http://localhost:3000";

// Página com o perfil de OUTro usuário (o próprio perfil fica em /me/profile)
function UsuarioPerfil(props) {

    const { id } = useParams();

    const [aba, setAba] = useState("colecao");
    const [colecao, setColecao] = useState([]);
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [seguidores, setSeguidores] = useState([]);
    const [seguindo, setSeguindo] = useState([]);

    async function carregaDados() {

        try {

            const resColecao = await fetch(`${url}/usuario/${id}/colecao`);
            if (resColecao.ok) {
                const dados = await resColecao.json();
                setColecao(dados.jogos);
            } else {
                setColecao([]);
            }

            // Retorna 404 quando o usuário não tem avaliações
            const resAvaliacoes = await fetch(`${url}/usuario/${id}/avaliacoes`);
            if (resAvaliacoes.ok) {
                const dados = await resAvaliacoes.json();
                setAvaliacoes(dados.avaliacoes);
            } else {
                setAvaliacoes([]);
            }

            const resSeguidores = await fetch(`${url}/usuario/${id}/seguidores`);
            if (resSeguidores.ok) {
                const dados = await resSeguidores.json();
                setSeguidores(dados.seguidores);
            }

            const resSeguindo = await fetch(`${url}/usuario/${id}/seguindo`);
            if (resSeguindo.ok) {
                const dados = await resSeguindo.json();
                setSeguindo(dados.seguindo);
            }

        } catch (error) {
            console.log(error.message);
        }

    }

    useEffect(() => {
        setAba("colecao");
        carregaDados();
    }, [id]);

    const usuario = props.usuarios[id];

    // Se for o próprio usuário logado, vai para a página do perfil dele
    if (props.usuarioLogado && String(props.usuarioLogado.id_usuario) === id) {
        return <Navigate to="/me/profile" />;
    }

    if (!usuario) {
        return (
            <>
                <Nav isLogado={props.usuarioLogado} isAdmin={props.admin} logout={props.logout} nome_pagina={"inicio"} />

                <main className={`min-vh-100 py-5 text-center text-white ${styles.fundo_pagina}`}>
                    <h2>Usuário não encontrado.</h2>
                    <Link to="/" className="text-white">Voltar para o início</Link>
                </main>
            </>
        );
    }

    const fotoPerfil = usuario.id_imagem_perfil ? `${url}/arquivo/${usuario.id_imagem_perfil}` : semfoto;

    let jaSegue = false;
    for (const s of props.seguindo) {
        if (s.id_usuario === usuario.id_usuario) {
            jaSegue = true;
        }
    }

    function buscaJogo(nome) {
        for (const jogo of props.jogos) {
            if (jogo.nome === nome) {
                return jogo;
            }
        }
        return null;
    }

    async function alternaSeguir() {

        if (!props.usuarioLogado) {
            alert("Faça login para realizar essa ação.");
            return;
        }

        if (jaSegue) {
            await props.deixaSeguir(usuario.id_usuario);
        } else {
            await props.seguirUsuario(usuario.id_usuario);
        }

        await carregaDados();
    }

    const abas = [
        { id: "colecao", rotulo: "Coleção", total: colecao.length },
        { id: "avaliacoes", rotulo: "Avaliações", total: avaliacoes.length },
    ];

    return (
        <>
            <Nav isLogado={props.usuarioLogado} isAdmin={props.admin} logout={props.logout} nome_pagina={"inicio"} />

            <main className={`min-vh-100 bg-body py-5 ${styles.fundo_pagina}`} data-bs-theme="dark">
                <div className="container" style={{ maxWidth: "960px" }}>

                    <section className="card shadow-lg border-secondary-subtle mb-4">
                        <div className={`card-body p-4 ${styles.bloco_info}`}>
                            <div className="row align-items-center g-4">

                                <div className="col-12 col-md-auto text-center">
                                    <img
                                        src={fotoPerfil}
                                        alt={`Foto de ${usuario.username}`}
                                        className="rounded-circle border border-primary border-3 object-fit-cover"
                                        width="120"
                                        height="120"
                                    />
                                </div>

                                <div className="col text-center text-md-start">
                                    <h1 className={`h3 fw-bold mb-0 ${styles.fonte_bebas_neue}`}>{usuario.nome}</h1>
                                    <p className={`text-body-secondary mb-2 ${styles.fonte_comfortaa}`}>@{usuario.username}</p>

                                    <p className={`${styles.fonte_comfortaa}`}>
                                        {seguidores.length}{seguidores.length === 1 ? " seguidor" : " seguidores"}, {seguindo.length} seguindo
                                    </p>

                                    {usuario.bio && <p className={`mb-0 ${styles.fonte_comfortaa}`}>{usuario.bio}</p>}
                                </div>

                                <div className="col-12 col-md-auto text-center">
                                    <button
                                        className={`btn ${jaSegue ? "btn-outline-primary" : "btn-primary"} ${styles.fonte_comfortaa}`}
                                        onClick={alternaSeguir}
                                    >
                                        {jaSegue ? "Seguindo" : "Seguir"}
                                    </button>
                                </div>

                            </div>

                            <div className="row text-center g-3 mt-3 pt-3 border-top border-secondary-subtle">
                                {abas.map((item) => (
                                    <div className="col-6" key={item.id}>
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
                        colecao.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Coleção vazia.
                            </p>
                        ) : (
                            <div className="row g-3">
                                {colecao.map((item) => {

                                    const jogo = buscaJogo(item.jogo);

                                    return (
                                        <div className="col-12 col-sm-6 col-lg-4" key={item.jogo}>
                                            <div className="card h-100 border-secondary-subtle overflow-hidden">

                                                <img
                                                    src={jogo && jogo.id_imagem ? `${url}/arquivo/${jogo.id_imagem}` : jogoSemFoto}
                                                    alt={`Capa de ${item.jogo}`}
                                                    style={{ height: "170px", objectFit: "cover" }}
                                                />

                                                <div className="card-body p-3">
                                                    {jogo ? (
                                                        <Link to={`/jogo/${jogo.id_jogo}`} className="fw-bold text-decoration-none">{item.jogo}</Link>
                                                    ) : (
                                                        <strong>{item.jogo}</strong>
                                                    )}
                                                </div>

                                            </div>
                                        </div>
                                    );

                                })}
                            </div>
                        )
                    )}

                    {aba === "avaliacoes" && (
                        avaliacoes.length === 0 ? (
                            <p className="text-center text-body-secondary py-5">
                                Esse usuário ainda não avaliou nenhum jogo.
                            </p>
                        ) : (
                            <ul className="list-group gap-2">

                                {avaliacoes.map((av) => {

                                    const jogo = buscaJogo(av.jogo);

                                    return (
                                        <li className="list-group-item" key={av.jogo}>

                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    {jogo ? (
                                                        <Link to={`/jogo/${jogo.id_jogo}`} className="text-decoration-none fw-bold">{av.jogo}</Link>
                                                    ) : (
                                                        <strong>{av.jogo}</strong>
                                                    )}
                                                    <span className="badge text-bg-warning ms-3">★ {av.estrelas}</span>
                                                </div>

                                                <small className="text-body-secondary text-nowrap ms-2">
                                                    {new Date(av.data_criacao).toLocaleDateString("pt-BR")}
                                                </small>
                                            </div>

                                            {av.texto && (
                                                <p className="mb-0 mt-2 text-body-secondary">{av.texto}</p>
                                            )}

                                        </li>
                                    );

                                })}
                            </ul>
                        )
                    )}
                </div>
            </main>
        </>
    );
}

export default UsuarioPerfil;
