import { useState } from "react";
import Nav from "../../components/Nav/Nav";
import styles from "./Administracao.module.css";
import formStyles from "./JogoAdicionar.module.css";
import { Link } from "react-router-dom";

function PlataformaAdicionar(props) {

    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [foto, setFoto] = useState(null);

    const [mensagem, setMensagem] = useState("");

    function limpaFormulario() {
        setNome("");
        setDescricao("");
        setFoto(null);
    }

    async function enviaFormulario(e) {
        e.preventDefault();

        const dados = new FormData();
        dados.append("nome", nome);
        dados.append("descricao", descricao);

        if (foto) {
            dados.append("foto", foto);
        }

        const sucesso = await props.adicionaItem("plataforma", dados);

        if (sucesso) {
            setMensagem("Plataforma adicionada com sucesso!");
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

            <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"} />

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
                                    <h1 className="text-center">Adicionar plataforma</h1>
                                    <p className="text-center text-white-50">
                                        Preencha as informações para cadastrar uma nova plataforma.
                                    </p>
                                </header>

                                {mensagem && <p className={formStyles.mensagem}>{mensagem}</p>}

                                <div className="row g-3">

                                    <div className="col-12">
                                        <label htmlFor="nome" className="form-label mb-1">
                                            Nome
                                        </label>

                                        <input
                                            id="nome"
                                            type="text"
                                            name="nome"
                                            className={formStyles.input}
                                            placeholder="Nome"
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
                                            rows="4"
                                            className={formStyles.input}
                                            placeholder="Descrição"
                                            value={descricao}
                                            onChange={(e) => setDescricao(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="foto" className="form-label mb-1">
                                            Foto <span className="text-body-secondary">(opcional)</span>
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

                                    <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-4">

                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-fill"
                                        >
                                            <i className="bi bi-plus-circle me-2"></i>
                                            Adicionar plataforma
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

export default PlataformaAdicionar;
