import styles from "./Principal.module.css";
import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png"

import ExibeJogoFeed from "../../components/JogoFeed/ExibeJogoFeed";

function Principal(props) {

    const jogos = props.jogos;
    const fotosJogos = props.fotosJogos;
    const isLogado = props.usuarioLogado;
    const isAdmin = props.admin;

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
                        data-bs-target="#navbarLogin"
                        aria-controls="navbarLogin"
                        aria-expanded="false"
                        aria-label="Alternar navegação"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarLogin">
                        <ul className="navbar-nav ms-auto">

                            {!isLogado ? (

                                <>
                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link active" href="/">Início</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/cadastro">Cadastro</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/login">Login</a>
                                    </li>
                                </>

                            ) : isAdmin ? (
                                <>
                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link active" href="/">Início</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/me/profile">Perfil</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Configurações restritas</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Sair da conta</a>
                                    </li>
                                </>

                            ) : (
                                <>
                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link active" href="/">Início</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/me/profile">Perfil</a>
                                    </li>

                                    <li className={`nav-item ${styles.nav_item}`}>
                                        <a className="nav-link" href="/">Sair da conta</a>
                                    </li>
                                </>
                            )}



                        </ul>
                    </div>

                </div>
            </nav>

            <main>

                <section>
                    <ExibeJogoFeed jogos={jogos} fotosJogos={fotosJogos}></ExibeJogoFeed>
                </section>

            </main>
        </>
    )

}

export default Principal