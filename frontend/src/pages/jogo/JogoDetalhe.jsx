import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import styles from "./JogoDetalhe.module.css";
import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg";

const url = "http://localhost:3000";

function JogoDetalhe(props) {

    const { id } = useParams();

    const [avaliacoes, setAvaliacoes] = useState([]);
    const [estrelas, setEstrelas] = useState(5);
    const [texto, setTexto] = useState("");

    async function carregaAvaliacoes() {

        try {

            const res = await fetch(`${url}/jogo/${id}/avaliacoes`);

            if (!res.ok) {
                setAvaliacoes([]);
                return;
            }

            const dados = await res.json();

            setAvaliacoes(dados.avaliacoes ?? []);

        } catch (error) {
            console.log(error.message);
        }

    }

    useEffect(() => {
        carregaAvaliacoes();
    }, [id]);

    const jogos = props.jogos;
    const colecao = props.colecaoJogos.jogos ?? [];
    const minhasAvaliacoes = props.avaliacoes.avaliacoes ?? [];

    let jogo = null;
    for (const j of jogos) {
        if (String(j.id_jogo) === id) {
            jogo = j;
        }
    }

    if (!jogo) {
        return (
            <>
                <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"inicio"} />

                <main className={`${styles.pagina} text-center`}>
                    <h2>Jogo não encontrado.</h2>
                    <Link to="/" className={styles.voltar}>Voltar para o início</Link>
                </main>
            </>
        );
    }

    let jogoColecao = null;
    for (const item of colecao) {
        if (item.id_jogo === jogo.id_jogo) {
            jogoColecao = item;
        }
    }

    let jaAvaliou = false;
    for (const av of minhasAvaliacoes) {
        if (av.id_jogo === jogo.id_jogo) {
            jaAvaliou = true;
        }
    }

    let soma = 0;
    for (const av of avaliacoes) {
        soma += av.estrelas;
    }
    const media = avaliacoes.length > 0 ? (soma / avaliacoes.length).toFixed(1) : null;

    function buscaIdUsuario(username) {
        for (const usuario of Object.values(props.usuarios)) {
            if (usuario.username === username) {
                return usuario.id_usuario;
            }
        }
        return null;
    }

    async function enviaAvaliacao(e) {
        e.preventDefault();

        const sucesso = await props.avaliaJogo(jogo.id_jogo, estrelas, texto.trim());

        if (sucesso) {
            setTexto("");
            setEstrelas(5);
            await carregaAvaliacoes();
        }
    }

    async function adicionaColecao() {
        await props.adicionaJogoColecao(jogo.id_jogo);
    }

    return (

        <>

            <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"inicio"} />

            <main className={styles.pagina}>

                <div className="container" style={{ maxWidth: "1000px" }}>

                    <Link to="/" className={styles.voltar}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </Link>

                    <section className={styles.bloco}>

                        <div className="row g-4">

                            <div className="col-md-4 text-center">
                                <img
                                    src={jogo.id_imagem ? `${url}/arquivo/${jogo.id_imagem}` : semFoto}
                                    alt={`Capa de ${jogo.nome}`}
                                    className={styles.capa}
                                />
                            </div>

                            <div className="col-md-8">

                                <h1 className={styles.titulo}>{jogo.nome}</h1>

                                <p className={styles.media}>
                                    {media ? (
                                        <>
                                            <span className={styles.estrela}>★ {media}</span>
                                            <span className="ms-2">({avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"})</span>
                                        </>
                                    ) : (
                                        "Ainda sem avaliações"
                                    )}
                                </p>

                                <p className={styles.descricao}>{jogo.descricao}</p>

                                <p className={styles.dado}>
                                    <strong>Lançamento: </strong>
                                    {jogo.data_lancamento
                                        ? new Date(jogo.data_lancamento).toLocaleDateString("pt-BR")
                                        : "Não informado"}
                                </p>

                                <p className={styles.dado}>
                                    <strong>Desenvolvedora(s): </strong>
                                    {jogo.desenvolvedores.length === 0 ? "Não informado" : jogo.desenvolvedores.map((d) => d.nome).join(", ")}
                                </p>

                                <div className={styles.dado}>
                                    <strong>Plataformas: </strong>
                                    {jogo.plataformas.map((p) => (
                                        <span className={styles.badge} key={p.id_plataforma}>{p.nome}</span>
                                    ))}
                                    {jogo.plataformas.length === 0 && "Não informado"}
                                </div>

                                <div className={styles.dado}>
                                    <strong>Gêneros: </strong>
                                    {jogo.generos.map((g) => (
                                        <span className={styles.badge} key={g.id_genero}>{g.nome}</span>
                                    ))}
                                    {jogo.generos.length === 0 && "Não informado"}
                                </div>

                                <div className={styles.acoes}>

                                    {!props.logado && (
                                        <Link to="/login" className={styles.btn_principal}>
                                            Faça login para avaliar e colecionar
                                        </Link>
                                    )}

                                    {props.logado && !jogoColecao && (
                                        <button className={styles.btn_principal} onClick={adicionaColecao}>
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Adicionar à coleção
                                        </button>
                                    )}

                                    {props.logado && jogoColecao && (
                                        <>
                                            <button
                                                className={styles.btn_favorito}
                                                onClick={() => props.fav_desfavJogo(jogo.id_jogo, !jogoColecao.favorito)}
                                            >
                                                <i className={jogoColecao.favorito ? "bi bi-star-fill me-2" : "bi bi-star me-2"}></i>
                                                {jogoColecao.favorito ? "Favorito" : "Favoritar"}
                                            </button>

                                            <button
                                                className={styles.btn_remover}
                                                onClick={() => props.apagaJogoColecao(jogo.id_jogo)}
                                            >
                                                <i className="bi bi-trash3 me-2"></i>
                                                Remover da coleção
                                            </button>
                                        </>
                                    )}

                                </div>

                            </div>

                        </div>

                    </section>

                    <section className={styles.bloco}>

                        <h2 className={styles.subtitulo}>Avaliações</h2>

                        {props.logado && !jaAvaliou && (

                            <form onSubmit={enviaAvaliacao} className={styles.form_avaliacao}>

                                <label htmlFor="estrelas" className="form-label mb-1">Sua nota</label>
                                <select
                                    id="estrelas"
                                    className={styles.campo}
                                    value={estrelas}
                                    onChange={(e) => setEstrelas(e.target.value)}
                                >
                                    <option value="5">★★★★★ (5)</option>
                                    <option value="4">★★★★ (4)</option>
                                    <option value="3">★★★ (3)</option>
                                    <option value="2">★★ (2)</option>
                                    <option value="1">★ (1)</option>
                                </select>

                                <label htmlFor="texto" className="form-label mb-1 mt-3">Comentário <span className="text-body-secondary">(opcional)</span></label>
                                <textarea
                                    id="texto"
                                    rows="3"
                                    className={styles.campo}
                                    placeholder="O que você achou do jogo?"
                                    value={texto}
                                    onChange={(e) => setTexto(e.target.value)}
                                />

                                <button type="submit" className={`${styles.btn_principal} mt-3`}>
                                    Enviar avaliação
                                </button>

                            </form>

                        )}

                        {props.logado && jaAvaliou && (
                            <p className={styles.aviso}>
                                Você já avaliou esse jogo. Para alterar ou apagar sua avaliação, acesse o seu <Link to="/me/profile">perfil</Link>.
                            </p>
                        )}

                        {avaliacoes.length === 0 ? (
                            <p className={styles.aviso}>Nenhuma avaliação ainda. Seja o primeiro!</p>
                        ) : (
                            <ul className="list-unstyled mb-0">

                                {avaliacoes.map((av) => (

                                    <li className={styles.avaliacao} key={av.usuario}>

                                        <div className="d-flex justify-content-between align-items-center">

                                            {buscaIdUsuario(av.usuario) ? (
                                                <Link to={`/usuario/${buscaIdUsuario(av.usuario)}`} className={styles.usuario}>
                                                    @{av.usuario}
                                                </Link>
                                            ) : (
                                                <span className={styles.usuario}>@{av.usuario}</span>
                                            )}

                                            <span className={styles.estrela}>{"★".repeat(av.estrelas)}{"☆".repeat(5 - av.estrelas)}</span>

                                        </div>

                                        {av.feedback && <p className="mb-0 mt-2">{av.feedback}</p>}

                                    </li>

                                ))}

                            </ul>
                        )}

                    </section>

                </div>

            </main>

        </>

    );
}

export default JogoDetalhe;
