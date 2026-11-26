import styles from "./Nav.module.css";
import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png";

import { Link } from "react-router-dom";

function Nav(props) {

    return (
        <nav className={`navbar navbar-expand-lg navbar-dark shadow ${styles.nav}`}>
            <div className="container">

                <Link className="navbar-brand fw-bold" to="/">
                    <img
                        src={logotipo}
                        alt="Logotipo"
                        width="35"
                        height="35"
                        className="d-inline-block align-text-center me-2"
                    />
                    GameReviewD
                </Link>

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

                        {!props.isLogado ? (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${props.nome_pagina === 'inicio' && "active"}`} to="/">Início</Link>
                                </li>

                                <li className="nav-item">
                                    <Link className={`nav-link ${props.nome_pagina === 'cadastro' && "active"}`} to="/cadastro">Cadastro</Link>
                                </li>

                                <li className="nav-item">
                                    <Link className={`nav-link ${props.nome_pagina === 'login' && "active"}`} to="/login">Login</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className={`nav-link ${props.nome_pagina === "inicio" && "active"}`} to="/">Início</Link>
                                </li>

                                <li className="nav-item">
                                    <Link className={`nav-link ${props.nome_pagina === "perfil" && "active"}`} to="/me/profile">Perfil</Link>
                                </li>

                                {props.isAdmin && (
                                    <li className="nav-item">
                                        <Link className={`nav-link ${props.nome_pagina === 'restrito' && "active"}`} to="/administracao">Configurações restritas</Link>
                                    </li>
                                )}

                                <li className="nav-item">
                                    <button className="nav-link" onClick={props.logout}>
                                        Sair da conta
                                    </button>
                                </li>
                            </>
                        )}

                    </ul>
                </div>

            </div>
        </nav>
    )

}

export default Nav;
