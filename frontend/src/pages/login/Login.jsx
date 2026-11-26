import styles from "./Login.module.css";
import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png"

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../../components/Nav/Nav";


function Login(props) {
    const navegar = useNavigate();

    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");

    function enviaFomulario(e) {
        e.preventDefault();

        const dadosUsuario = {
            login: login,
            senha: senha
        }

        props.loginUsuario(dadosUsuario);
    }

    return (

        <>

            <Nav isLogado={props.isLogado} isAdmin={props.isAdmin} logout={props.logout} nome_pagina={"login"}/>

            <main className={`min-vh-100 d-flex justify-content-center align-items-center p-5 ${styles.fundo_pagina}`}>
                <div className="container" style={{ maxWidth: "900px" }}>

                    <div className={`card bg-transparent overflow-hidden ${styles.div_login}`}>
                        <div className="row g-0 bg-transparent">

                            <aside className="col-md-4 col-12 rounded-start-4 d-flex flex-column justify-content-center align-items-center text-center p-4 bg-black text-white">

                                <img src={logotipo} alt="Logotipo" className="img-fluid mb-3 w-lg-25 w-25" />

                                <h2>Não possui conta?</h2>

                                <p>
                                    Cadastre-se e faça parte dessa comunidade!
                                </p>

                                <button onClick={() => navegar("/cadastro")} className="btn btn-outline-light">
                                    Cadastro
                                </button>

                            </aside>

                            <div className={`col-md-8 col-12 p-3 p-md-4 p-lg-5 text-white ${styles.fundo_login}`}>

                                <form onSubmit={enviaFomulario}>

                                    <header className="mb-3">
                                        <h1 className="text-center">Faça login</h1>
                                    </header>

                                    <div className="row g-3">

                                        <div className="col-12">
                                            <label htmlFor="login" className="form-label mb-1">
                                                Login
                                            </label>
                                            <input
                                                id="login"
                                                type="text"
                                                name="login"
                                                className={` ${styles.input}`}
                                                placeholder="Username ou e-mail"
                                                onChange={(e) => setLogin(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="senha" className="form-label mb-1">
                                                Senha
                                            </label>
                                            <input
                                                id="nome"
                                                type="password"
                                                name="senha"
                                                className={` ${styles.input}`}
                                                placeholder="••••••••"
                                                onChange={(e) => setSenha(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-3">
                                            <button type="submit" className="btn btn-primary flex-fill">
                                                Entrar
                                            </button>

                                            <button type="reset" className="btn btn-outline-secondary">
                                                Limpar
                                            </button>
                                        </div>

                                    </div>
                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

        </>

    )

}

export default Login;