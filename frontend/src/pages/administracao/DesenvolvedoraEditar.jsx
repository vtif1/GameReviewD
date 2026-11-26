import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import styles from "./JogoEditar.module.css";
import adminStyles from "./Administracao.module.css";

const url = "http://localhost:3000";

function DesenvolvedoraEditar(props) {

    const [editando, setEditando] = useState(null);

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataCriacao, setDataCriacao] = useState("");
    const [foto, setFoto] = useState(null);

    const [mensagem, setMensagem] = useState("");

    function editar(item) {
        setEditando(item.id_desenvolvedora);

        setNome(item.nome);
        setDescricao(item.descricao || "");
        setDataCriacao(item.data_criacao ? item.data_criacao.substring(0, 10) : "");
        setFoto(null);

        setMensagem("");
    }

    async function salvar() {

        const dados = new FormData();
        dados.append("nome", nome);
        dados.append("descricao", descricao);
        dados.append("data_criacao", dataCriacao);

        if (foto) {
            dados.append("foto", foto);
        }

        const sucesso = await props.editaItem("desenvolvedora", editando, dados);

        if (sucesso) {
            setMensagem("Desenvolvedora editada com sucesso!");
            setEditando(null);
        }
    }

    async function excluir(item) {

        const confirmou = window.confirm(`Deseja realmente excluir "${item.nome}"?`);

        if (!confirmou) {
            return;
        }

        const sucesso = await props.apagaItem("desenvolvedora", item.id_desenvolvedora);

        if (sucesso) {
            setMensagem("Desenvolvedora excluída com sucesso!");
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

                    <h1>EDITAR DESENVOLVEDORAS</h1>

                    {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

                    {props.desenvolvedoras.length === 0 && (
                        <p className={styles.vazio}>Nenhuma desenvolvedora cadastrada.</p>
                    )}

                    {props.desenvolvedoras.map((item) => (

                        <div className={styles.card} key={item.id_desenvolvedora}>

                            <div className={styles.conteudo}>

                                {item.id_imagem && (
                                    <img
                                        className={styles.imagem}
                                        src={`${url}/arquivo/${item.id_imagem}`}
                                        alt={item.nome}
                                    />
                                )}

                                <div className={styles.informacoes}>

                                    <h2>{item.nome}</h2>

                                    <p>
                                        <strong>Descrição:</strong>{" "}
                                        {item.descricao || "Sem descrição."}
                                    </p>

                                    <p>
                                        <strong>Data de criação:</strong>{" "}
                                        {item.data_criacao
                                            ? item.data_criacao.substring(0, 10)
                                            : "Não informada"}
                                    </p>

                                    <button
                                        className={styles.editar}
                                        onClick={() => editar(item)}
                                    >
                                        {editando === item.id_desenvolvedora ? "Editando" : "Editar"}
                                    </button>

                                    <button
                                        className={`${styles.remover} ms-2`}
                                        onClick={() => excluir(item)}
                                    >
                                        Excluir
                                    </button>

                                </div>

                            </div>

                            {editando === item.id_desenvolvedora && (

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

                                    <label>Data de criação:</label>
                                    <input
                                        type="date"
                                        value={dataCriacao}
                                        onChange={(e) => setDataCriacao(e.target.value)}
                                    />

                                    <label>Nova imagem:</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFoto(e.target.files[0])}
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

export default DesenvolvedoraEditar;
