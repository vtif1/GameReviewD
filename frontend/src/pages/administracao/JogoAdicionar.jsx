import { useState } from "react";
import Nav from "../../components/Nav/Nav";
import styles from "./Administracao.module.css";
import formStyles from "./JogoAdicionar.module.css";
import { Link } from "react-router-dom";

function JogoAdicionar(props) {

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [dataLancamento, setDataLancamento] = useState("");
    const [foto, setFoto] = useState(null);

    const [desenvolvedorasMarcadas, setDesenvolvedorasMarcadas] = useState([]);
    const [generosMarcados, setGenerosMarcados] = useState([]);
    const [plataformasMarcadas, setPlataformasMarcadas] = useState([]);

    const [mensagem, setMensagem] = useState("");

    function alternaMarcado(lista, setLista, id) {

        if (lista.includes(id)) {
            setLista(lista.filter((item) => item !== id));
        } else {
            setLista([...lista, id]);
        }

    }

    function limpaFormulario() {
        setNome("");
        setDescricao("");
        setDataLancamento("");
        setFoto(null);
        setDesenvolvedorasMarcadas([]);
        setGenerosMarcados([]);
        setPlataformasMarcadas([]);
    }

    async function enviaFormulario(e) {
        e.preventDefault();

        const dados = new FormData();
        dados.append("nome", nome);
        dados.append("descricao", descricao);

        if (dataLancamento) {
            dados.append("data_lancamento", dataLancamento);
        }

        if (foto) {
            dados.append("foto", foto);
        }

        dados.append("desenvolvedores", JSON.stringify(desenvolvedorasMarcadas));
        dados.append("generos", JSON.stringify(generosMarcados));
        dados.append("plataformas", JSON.stringify(plataformasMarcadas));

        const sucesso = await props.adicionaJogo(dados);

        if (sucesso) {
            setMensagem("Jogo adicionado com sucesso!");
            e.target.reset();
            limpaFormulario();
        } else {
            setMensagem("");
        }
    }

    if (!props.admin) {
        return (
            <>
                <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"} />

                <main className={styles.pagina}>
                    <div className={styles.cabecalho}>
                        <h1>Acesso restrito</h1>
                        <p>Apenas administradores podem acessar essa página.</p>
                    </div>
                </main>
            </>
        );
    }

    return (

        <>

            <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"}/>

            <main className={`min-vh-100 d-flex justify-content-center align-items-center p-4 p-md-5 ${formStyles.fundo_pagina}`}>

                <div className="container" style={{ maxWidth: "850px" }}>

                    <Link to="/administracao" className={styles.voltar}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </Link>

                    <div className={`card bg-transparent overflow-hidden ${formStyles.div_formulario}`}>

                        <div className={`p-3 p-md-4 p-lg-5 text-white ${formStyles.fundo_formulario}`}>

                            <form onSubmit={enviaFormulario} onReset={limpaFormulario}>

                                <header className="mb-4">
                                    <h1 className="text-center">Adicionar jogo</h1>
                                    <p className="text-center text-white-50">
                                        Preencha as informações para adicionar
                                        um jogo ao catálogo.
                                    </p>
                                </header>

                                {mensagem && <p className={formStyles.mensagem}>{mensagem}</p>}

                                <div className="row g-3">

                                    <div className="col-12">
                                        <label htmlFor="nome" className="form-label mb-1">
                                            Nome do jogo
                                        </label>

                                        <input
                                            id="nome"
                                            type="text"
                                            name="nome"
                                            className={formStyles.input}
                                            placeholder="Nome do jogo"
                                            value={nome}
                                            onChange={(e) => setNome(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="descricao" className="form-label mb-1">
                                            Descrição
                                        </label>

                                        <textarea
                                            id="descricao"
                                            name="descricao"
                                            rows="5"
                                            className={formStyles.input}
                                            placeholder="Descreva o jogo..."
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="data_lancamento" className="form-label mb-1">
                                            Data de lançamento <span className="text-body-secondary">(opcional)</span>
                                        </label>

                                        <input
                                            id="data_lancamento"
                                            type="date"
                                            name="data_lancamento"
                                            className={formStyles.input}
                                            value={dataLancamento}
                                            onChange={(e) => setDataLancamento(e.target.value)}
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="foto" className="form-label mb-1">
                                            Foto do jogo <span className="text-body-secondary">(opcional)</span>
                                        </label>

                                        <input
                                            id="foto"
                                            type="file"
                                            name="foto"
                                            className={formStyles.input}
                                            accept="image/*"
                                            onChange={(e) => setFoto(e.target.files[0])}
                                        />
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label mb-1">
                                            Desenvolvedoras
                                        </label>

                                        <div className={formStyles.grupo_opcoes}>

                                            {props.desenvolvedoras.map((d) => (
                                                <label className={formStyles.opcao} key={d.id_desenvolvedora}>
                                                    <input
                                                        type="checkbox"
                                                        checked={desenvolvedorasMarcadas.includes(d.id_desenvolvedora)}
                                                        onChange={() => alternaMarcado(desenvolvedorasMarcadas, setDesenvolvedorasMarcadas, d.id_desenvolvedora)}
                                                    />
                                                    {d.nome}
                                                </label>
                                            ))}

                                            {props.desenvolvedoras.length === 0 && (
                                                <p className={formStyles.sem_opcoes}>Nenhuma desenvolvedora cadastrada.</p>
                                            )}

                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label mb-1">
                                            Gêneros
                                        </label>

                                        <div className={formStyles.grupo_opcoes}>

                                            {props.generos.map((g) => (
                                                <label className={formStyles.opcao} key={g.id_genero}>
                                                    <input
                                                        type="checkbox"
                                                        checked={generosMarcados.includes(g.id_genero)}
                                                        onChange={() => alternaMarcado(generosMarcados, setGenerosMarcados, g.id_genero)}
                                                    />
                                                    {g.nome}
                                                </label>
                                            ))}

                                            {props.generos.length === 0 && (
                                                <p className={formStyles.sem_opcoes}>Nenhum gênero cadastrado.</p>
                                            )}

                                        </div>
                                    </div>

                                    <div className="col-12">
                                        <label className="form-label mb-1">
                                            Plataformas
                                        </label>

                                        <div className={formStyles.grupo_opcoes}>

                                            {props.plataformas.map((p) => (
                                                <label className={formStyles.opcao} key={p.id_plataforma}>
                                                    <input
                                                        type="checkbox"
                                                        checked={plataformasMarcadas.includes(p.id_plataforma)}
                                                        onChange={() => alternaMarcado(plataformasMarcadas, setPlataformasMarcadas, p.id_plataforma)}
                                                    />
                                                    {p.nome}
                                                </label>
                                            ))}

                                            {props.plataformas.length === 0 && (
                                                <p className={formStyles.sem_opcoes}>Nenhuma plataforma cadastrada.</p>
                                            )}

                                        </div>
                                    </div>

                                    <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-4">

                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-fill"
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Adicionar jogo
                                        </button>

                                        <button
                                            type="reset"
                                            className="btn btn-outline-secondary"
                                        >
                                            Limpar
                                        </button>

                                    </div>
                                </div>

                            </form>
                        </div>
                    </div>

                </div>
            </main>

        </>
    );
}

export default JogoAdicionar;
