import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import styles from "./JogoEditar.module.css";
import adminStyles from "./Administracao.module.css";

function GeneroEditar(props) {

    const [editando, setEditando] = useState(null);

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");

    const [mensagem, setMensagem] = useState("");

    function editar(item) {
        setEditando(item.id_genero);

        setNome(item.nome);
        setDescricao(item.descricao || "");

        setMensagem("");
    }

    async function salvar() {

        // O gênero não tem foto, então é enviado como JSON
        const dados = {
            nome: nome,
            descricao: descricao
        }

        const sucesso = await props.editaItem("genero", editando, dados);

        if (sucesso) {
            setMensagem("Gênero editado com sucesso!");
            setEditando(null);
        }
    }

    async function excluir(item) {

        const confirmou = window.confirm(`Deseja realmente excluir "${item.nome}"?`);

        if (!confirmou) {
            return;
        }

        const sucesso = await props.apagaItem("genero", item.id_genero);

        if (sucesso) {
            setMensagem("Gênero excluído com sucesso!");
            setEditando(null);
        }
    }

    if (!props.admin) {
        return (
            <div className={styles.container}>
                <h2>Acesso restrito aos administradores.</h2>
            </div>
        );
    }

    return (

        <>
            <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"}></Nav>

            <main className={styles.fundo}>

                <div className={styles.container}>

                    <Link to="/administracao" className={adminStyles.voltar}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </Link>

                    <h1>EDITAR GÊNEROS</h1>

                    {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

                    {props.generos.length === 0 && (
                        <p className={styles.vazio}>Nenhum gênero cadastrado.</p>
                    )}

                    {props.generos.map((item) => (

                        <div className={styles.card} key={item.id_genero}>

                            <div className={styles.conteudo}>

                                <div className={styles.informacoes}>

                                    <h2>{item.nome}</h2>

                                    <p>
                                        <strong>Descrição:</strong>{" "}
                                        {item.descricao || "Sem descrição."}
                                    </p>

                                    <button
                                        className={styles.editar}
                                        onClick={() => editar(item)}
                                    >
                                        {editando === item.id_genero ? "Editando" : "Editar"}
                                    </button>

                                    <button
                                        className={`${styles.remover} ms-2`}
                                        onClick={() => excluir(item)}
                                    >
                                        Excluir
                                    </button>

                                </div>

                            </div>

                            {editando === item.id_genero && (

                                <div className={styles.formulario}>

                                    <h3>Editar informações</h3>

                                    <label>Nome:</label>
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(e) => setNome(e.target.value)}
                                    />

                                    <label>Descrição:</label>
                                    <textarea
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                    />

                                    <div className={styles.botoes}>

                                        <button
                                            className={styles.salvar}
                                            onClick={salvar}
                                        >
                                            Salvar
                                        </button>

                                        <button
                                            className={styles.cancelar}
                                            onClick={() => {
                                                setEditando(null);
                                                setMensagem("");
                                            }}
                                        >
                                            Cancelar
                                        </button>

                                    </div>
                                </div>

                            )}
                        </div>

                    ))}
                </div>
            </main>

        </>
    );
}

export default GeneroEditar;
