
import { useState } from "react";
import styles from "./JogoEditar.module.css";
import Nav from "../../components/Nav/Nav";
import adminStyles from "./Administracao.module.css";
import { Link } from "react-router-dom";

const url = "http://localhost:3000";

function JogoEditar(props) {

    const [jogoEditando, setJogoEditando] = useState(null);

    const [dadosEditados, setDadosEditados] = useState({
        nome: "",
        descricao: "",
        data_lancamento: ""
    });

    const [foto, setFoto] = useState(null);

    const [desenvolvedoraSelecionada, setDesenvolvedoraSelecionada] = useState("");
    const [generoSelecionado, setGeneroSelecionado] = useState("");
    const [plataformaSelecionada, setPlataformaSelecionada] = useState("");

    const [mensagem, setMensagem] = useState("");
    const [erro, setErro] = useState("");

    function editarJogo(jogo) {
        setJogoEditando(jogo.id_jogo);

        setDadosEditados({
            nome: jogo.nome,
            descricao: jogo.descricao || "",
            data_lancamento: jogo.data_lancamento
                ? jogo.data_lancamento.substring(0, 10)
                : ""
        });

        setFoto(null);
        setMensagem("");
        setErro("");
    }

    function alteraCampo(e) {
        let nomeCampo = e.target.name;
        let valor = e.target.value;

        let novosDados = {
            nome: dadosEditados.nome,
            descricao: dadosEditados.descricao,
            data_lancamento: dadosEditados.data_lancamento
        };

        novosDados[nomeCampo] = valor;

        setDadosEditados(novosDados);
    }

    async function salvarJogo() {

        let formData = new FormData();

        formData.append("nome", dadosEditados.nome);
        formData.append("descricao", dadosEditados.descricao);
        formData.append("data_lancamento", dadosEditados.data_lancamento);

        if (foto) {
            formData.append("foto", foto);
        }

        const sucesso = await props.editaJogo(jogoEditando, formData);

        if (sucesso) {
            setMensagem("Jogo editado com sucesso!");
            setErro("");
            setJogoEditando(null);
        } else {
            setErro("Erro ao editar jogo. Verifique os dados.");
            setMensagem("");
        }
    }

    async function excluirJogo(jogo) {

        const confirmou = window.confirm(`Deseja realmente excluir o jogo "${jogo.nome}"?`);

        if (!confirmou) {
            return;
        }

        const sucesso = await props.apagaJogo(jogo.id_jogo);

        if (sucesso) {
            setMensagem("Jogo excluído com sucesso!");
            setErro("");
            setJogoEditando(null);
        }
    }

    async function adicionarRelacao(tipo, valor) {

        if (!valor) {
            setErro("Selecione uma opção.");
            return;
        }

        const sucesso = await props.adicionaRelacaoJogo(
            jogoEditando,
            tipo,
            Number(valor)
        );

        if (sucesso) {
            setMensagem("Relação adicionada com sucesso!");
            setErro("");

            if (tipo === "desenvolvedores") {
                setDesenvolvedoraSelecionada("");
            }

            if (tipo === "generos") {
                setGeneroSelecionado("");
            }

            if (tipo === "plataformas") {
                setPlataformaSelecionada("");
            }

        } else {
            setErro("Não foi possível adicionar. Talvez essa relação já exista.");
            setMensagem("");
        }
    }

    async function removerRelacao(tipo, idRelacao) {

        const sucesso = await props.removeRelacaoJogo(
            jogoEditando,
            tipo,
            idRelacao
        );

        if (sucesso) {
            setMensagem("Relação removida com sucesso!");
            setErro("");
        } else {
            setErro("Erro ao remover relação.");
            setMensagem("");
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

                    <h1>EDITAR JOGOS</h1>

                    {mensagem && <p className={styles.mensagem}>{mensagem}</p>}
                    {erro && <p className={styles.erro}>{erro}</p>}

                    {props.jogos.length === 0 && (
                        <p className={styles.vazio}>Nenhum jogo cadastrado.</p>
                    )}

                    {props.jogos.map((jogo) => (

                        <div className={styles.card} key={jogo.id_jogo}>

                            <div className={styles.conteudo}>

                                {jogo.id_imagem && (
                                    <img
                                        className={styles.imagem}
                                        src={`${url}/arquivo/${jogo.id_imagem}`}
                                        alt={jogo.nome}
                                    />
                                )}

                                <div className={styles.informacoes}>

                                    <h2>{jogo.nome}</h2>

                                    <p>
                                        <strong>Descrição:</strong>{" "}
                                        {jogo.descricao || "Sem descrição."}
                                    </p>

                                    <p>
                                        <strong>Data de lançamento:</strong>{" "}
                                        {jogo.data_lancamento
                                            ? jogo.data_lancamento.substring(0, 10)
                                            : "Não informada"}
                                    </p>

                                    <button
                                        className={styles.editar}
                                        onClick={() => editarJogo(jogo)}
                                    >
                                        {jogoEditando === jogo.id_jogo
                                            ? "Editando"
                                            : "Editar"}
                                    </button>

                                    <button
                                        className={`${styles.remover} ms-2`}
                                        onClick={() => excluirJogo(jogo)}
                                    >
                                        Excluir
                                    </button>

                                </div>

                            </div>

                            <div className={styles.relacoes}>

                                <h3>Desenvolvedoras</h3>

                                <div className={styles.listaRelacoes}>

                                    {jogo.desenvolvedores.map((d) => (

                                        <div
                                            className={styles.itemRelacao}
                                            key={d.id_desenvolvedora}
                                        >
                                            <span>{d.nome}</span>

                                            {jogoEditando === jogo.id_jogo && (
                                                <button
                                                    className={styles.remover}
                                                    onClick={() => removerRelacao(
                                                        "desenvolvedores",
                                                        d.id_desenvolvedora
                                                    )}
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>

                                    ))}

                                    {jogo.desenvolvedores.length === 0 && (
                                        <p className={styles.vazio}>
                                            Nenhuma desenvolvedora cadastrada.
                                        </p>
                                    )}

                                </div>

                                {jogoEditando === jogo.id_jogo && (

                                    <div className={styles.adicionarRelacao}>

                                        <select
                                            value={desenvolvedoraSelecionada}
                                            onChange={(e) => setDesenvolvedoraSelecionada(e.target.value)}
                                        >
                                            <option value="">
                                                Selecione uma desenvolvedora
                                            </option>

                                            {props.desenvolvedoras.map((d) => (

                                                <option
                                                    key={d.id_desenvolvedora}
                                                    value={d.id_desenvolvedora}
                                                >
                                                    {d.nome}
                                                </option>

                                            ))}

                                        </select>

                                        <button
                                            className={styles.adicionar}
                                            onClick={() => adicionarRelacao(
                                                "desenvolvedores",
                                                desenvolvedoraSelecionada
                                            )}
                                        >
                                            Adicionar
                                        </button>

                                    </div>

                                )}

                                <h3>Gêneros</h3>

                                <div className={styles.listaRelacoes}>

                                    {jogo.generos.map((g) => (

                                        <div
                                            className={styles.itemRelacao}
                                            key={g.id_genero}
                                        >
                                            <span>{g.nome}</span>

                                            {jogoEditando === jogo.id_jogo && (
                                                <button
                                                    className={styles.remover}
                                                    onClick={() => removerRelacao(
                                                        "generos",
                                                        g.id_genero
                                                    )}
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>

                                    ))}

                                    {jogo.generos.length === 0 && (
                                        <p className={styles.vazio}>
                                            Nenhum gênero cadastrado.
                                        </p>
                                    )}

                                </div>

                                {jogoEditando === jogo.id_jogo && (

                                    <div className={styles.adicionarRelacao}>

                                        <select
                                            value={generoSelecionado}
                                            onChange={(e) => setGeneroSelecionado(e.target.value)}
                                        >
                                            <option value="">
                                                Selecione um gênero
                                            </option>

                                            {props.generos.map((g) => (

                                                <option
                                                    key={g.id_genero}
                                                    value={g.id_genero}
                                                >
                                                    {g.nome}
                                                </option>

                                            ))}

                                        </select>

                                        <button
                                            className={styles.adicionar}
                                            onClick={() => adicionarRelacao(
                                                "generos",
                                                generoSelecionado
                                            )}
                                        >
                                            Adicionar
                                        </button>

                                    </div>

                                )}

                                <h3>Plataformas</h3>

                                <div className={styles.listaRelacoes}>

                                    {jogo.plataformas.map((p) => (

                                        <div
                                            className={styles.itemRelacao}
                                            key={p.id_plataforma}
                                        >
                                            <span>{p.nome}</span>

                                            {jogoEditando === jogo.id_jogo && (
                                                <button
                                                    className={styles.remover}
                                                    onClick={() => removerRelacao(
                                                        "plataformas",
                                                        p.id_plataforma
                                                    )}
                                                >
                                                    Remover
                                                </button>
                                            )}
                                        </div>

                                    ))}

                                    {jogo.plataformas.length === 0 && (
                                        <p className={styles.vazio}>
                                            Nenhuma plataforma cadastrada.
                                        </p>
                                    )}

                                </div>

                                {jogoEditando === jogo.id_jogo && (

                                    <div className={styles.adicionarRelacao}>

                                        <select
                                            value={plataformaSelecionada}
                                            onChange={(e) => setPlataformaSelecionada(e.target.value)}
                                        >
                                            <option value="">
                                                Selecione uma plataforma
                                            </option>

                                            {props.plataformas.map((p) => (

                                                <option
                                                    key={p.id_plataforma}
                                                    value={p.id_plataforma}
                                                >
                                                    {p.nome}
                                                </option>

                                            ))}

                                        </select>

                                        <button
                                            className={styles.adicionar}
                                            onClick={() => adicionarRelacao(
                                                "plataformas",
                                                plataformaSelecionada
                                            )}
                                        >
                                            Adicionar
                                        </button>

                                    </div>

                                )}

                            </div>

                            {/* FORMULÁRIO DE EDIÇÃO */}

                            {jogoEditando === jogo.id_jogo && (

                                <div className={styles.formulario}>

                                    <h3>Editar informações do jogo</h3>

                                    <label>Nome:</label>
                                    <input
                                        type="text"
                                        name="nome"
                                        value={dadosEditados.nome}
                                        onChange={alteraCampo}
                                    />

                                    <label>Descrição:</label>
                                    <textarea
                                        name="descricao"
                                        value={dadosEditados.descricao}
                                        onChange={alteraCampo}
                                    />

                                    <label>Data de lançamento:</label>
                                    <input
                                        type="date"
                                        name="data_lancamento"
                                        value={dadosEditados.data_lancamento}
                                        onChange={alteraCampo}
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
                                            onClick={salvarJogo}
                                        >
                                            Salvar
                                        </button>

                                        <button
                                            className={styles.cancelar}
                                            onClick={() => {
                                                setJogoEditando(null);
                                                setMensagem("");
                                                setErro("");
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

export default JogoEditar;
