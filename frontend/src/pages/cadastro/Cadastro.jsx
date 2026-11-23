import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png"
import styles from "./Cadastro.module.css";


function Cadastro(props) {

    const navegar = useNavigate();

    const [username, setUsername] = useState("");
    const [nome, setNome] = useState("");
    const [data_nascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [imagemPerfil, setImagemPerfil] = useState(null);
    const [bio, setBio] = useState(null);


    function enviaFomulario(e) {
        e.preventDefault();

        const dadosUsuario = new FormData();
        dadosUsuario.append("username", username);
        dadosUsuario.append("nome", nome);
        dadosUsuario.append("data_nasc", data_nascimento);
        dadosUsuario.append("email", email);
        dadosUsuario.append("senha", senha);

        if (bio) {
            dadosUsuario.append("bio", bio);
        }

        if (imagemPerfil) {
            dadosUsuario.append("foto", imagemPerfil);
        }

        props.addUsuario(dadosUsuario);

        e.currentTarget.reset();
    }


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
                        data-bs-target="#navbarCadastro"
                        aria-controls="navbarCadastro"
                        aria-expanded="false"
                        aria-label="Alternar navegação"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarCadastro">
                        <ul className="navbar-nav ms-auto">

                            <li className={`nav-item ${styles.nav_item}`}>
                                <a className="nav-link" href="/">Início</a>
                            </li>

                            <li className={`nav-item ${styles.nav_item}`}>
                                <a className="nav-link active" href="/cadastro">Cadastro</a>
                            </li>

                            <li className={`nav-item ${styles.nav_item}`}>
                                <a className="nav-link" href="/login">Login</a>
                            </li>

                        </ul>
                    </div>

                </div>
            </nav>

            <main className={`min-vh-100 d-flex justify-content-center align-items-center p-5 ${styles.fundo_pagina}`}>
                <div className="container" style={{ maxWidth: "900px" }}>

                    <div className={`card bg-transparent overflow-hidden ${styles.div_cadastro}`}>
                        <div className="row g-0 bg-transparent">

                            <aside className="col-md-4 col-12 rounded-start-4 d-flex flex-column justify-content-center align-items-center text-center p-4 bg-black text-white">

                                <img src={logotipo} alt="Logotipo" className="img-fluid mb-3 w-lg-25 w-25" />

                                <h2>Já possui login?</h2>

                                <p>
                                    Entre na sua conta e continue de onde parou!
                                </p>

                                <button onClick={() => navegar("/login")} className="btn btn-outline-light">
                                    Login
                                </button>

                            </aside>

                            <div className={`col-md-8 col-12 p-3 p-md-4 p-lg-5 text-white ${styles.fundo_cadastro}`}>

                                <form onSubmit={enviaFomulario}>

                                    <header className="mb-3">
                                        <h1 className="text-center">Cadastre-se</h1>
                                    </header>

                                    <div className="row g-3">

                                        <div className="col-md-6">
                                            <label htmlFor="username" className="form-label mb-1">
                                                Username
                                            </label>
                                            <input
                                                id="username"
                                                type="text"
                                                name="username"
                                                className={` ${styles.input}`}
                                                placeholder="Username"
                                                onChange={(e) => setUsername(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="nome" className="form-label mb-1">
                                                Nome completo
                                            </label>
                                            <input
                                                id="nome"
                                                type="text"
                                                name="nome"
                                                className={` ${styles.input}`}
                                                placeholder="Nome completo"
                                                onChange={(e) => setNome(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="data_nasc" className="form-label mb-1">
                                                Data de nascimento
                                            </label>
                                            <input
                                                id="data_nasc"
                                                type="date"
                                                name="data_nasc"
                                                className={` ${styles.input}`}
                                                onChange={(e) => setDataNascimento(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="email" className="form-label mb-1">
                                                E-mail
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                className={` ${styles.input}`}
                                                placeholder="voce@email.com"
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <label htmlFor="senha" className="form-label mb-1">
                                                Senha
                                            </label>
                                            <input
                                                id="senha"
                                                type="password"
                                                name="senha"
                                                className={` ${styles.input}`}
                                                placeholder="••••••••"
                                                onChange={(e) => setSenha(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="bio" className="form-label mb-1">
                                                Biografia <span className="text-body-secondary">(opcional)</span>
                                            </label>
                                            <textarea
                                                id="bio"
                                                name="bio"
                                                rows="2"
                                                className={` ${styles.input}`}
                                                placeholder="Fale um pouco sobre você..."
                                                onChange={(e) => setBio(e.target.value)}
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <label htmlFor="foto" className="form-label mb-1">
                                                Foto de perfil <span className="text-body-secondary">(opcional)</span>
                                            </label>
                                            <input
                                                id="foto"
                                                type="file"
                                                name="foto"
                                                className={` ${styles.input}`}
                                                accept="image/*"
                                                onChange={(e) => setImagemPerfil(e.target.files[0])}
                                            />
                                        </div>

                                        <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-3">
                                            <button type="submit" className="btn btn-primary flex-fill">
                                                Cadastrar
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

export default Cadastro;