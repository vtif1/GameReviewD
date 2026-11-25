
import styles from "./Principal.module.css";

import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png";

import jogo1 from "../../assets/imagens/59009.jpg";
import jogo2 from "../../assets/imagens/Dark-Souls-III.jpg";
import jogo3 from "../../assets/imagens/FSYACATO3VO4NKYRS5VI6URUCE.jpg";

import ExibeJogoFeed from "../../components/JogoFeed/ExibeJogoFeed";

import { Link } from "react-router-dom";
import ListaUsuarios from "../../components/ListaUsuarios/ListaUsuarios";

function Principal(props) {

    const jogos = props.jogos;
    const fotosJogos = props.fotosJogos;
    const isLogado = props.usuarioLogado;
    const isAdmin = props.admin;

    return (
        <>

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

                            {!isLogado ? (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link active" to="/">Início</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className="nav-link" to="/cadastro">Cadastro</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className="nav-link" to="/login">Login</Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link active" to="/">Início</Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link className="nav-link" to="/me/profile">Perfil</Link>
                                    </li>

                                    {isAdmin && (
                                        <li className="nav-item">
                                            <Link className="nav-link" to="/">Configurações restritas</Link>
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


            <section className={styles.hero}>

                <div
                    id="carouselHero"
                    className="carousel slide carousel-fade"
                    data-bs-ride="carousel"
                    data-bs-interval="5000"
                >
                    <div className="carousel-indicators">

                        <button
                            type="button"
                            data-bs-target="#carouselHero"
                            data-bs-slide-to="0"
                            className="active"
                            aria-current="true"
                        ></button>

                        <button
                            type="button"
                            data-bs-target="#carouselHero"
                            data-bs-slide-to="1"
                        ></button>

                        <button
                            type="button"
                            data-bs-target="#carouselHero"
                            data-bs-slide-to="2"
                        ></button>

                    </div>


                    <div className="carousel-inner">

                        <div className="carousel-item active">
                            <img src={jogo1} className={styles.hero_img} alt="Jogo em destaque 1" />
                        </div>

                        <div className="carousel-item">
                            <img src={jogo2} className={styles.hero_img} alt="Jogo em destaque 2" />
                        </div>

                        <div className="carousel-item">
                            <img src={jogo3} className={styles.hero_img} alt="Jogo em destaque 3" />
                        </div>

                    </div>


                    <div className={styles.hero_content}>

                        <h1>Seu universo gamer começa aqui.</h1>

                        <p>
                            Descubra novos jogos, compartilhe suas avaliações
                            e organize sua coleção em um só lugar.
                        </p>

                        {!isLogado ? (

                            <div className={styles.hero_buttons}>

                                <Link to="/cadastro" className={styles.btn_cadastro}>
                                    Criar conta
                                </Link>

                                <Link to="/login" className={styles.btn_login}>
                                    Fazer login
                                </Link>

                            </div>

                        ) : (

                            <div className={styles.hero_buttons}>

                                <Link to="/me/profile" className={styles.btn_cadastro}>
                                    Acessar meu perfil
                                </Link>

                            </div>

                        )}

                    </div>


                    <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#carouselHero"
                        data-bs-slide="prev"
                    >
                        <span className="carousel-control-prev-icon"></span>
                    </button>

                    <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#carouselHero"
                        data-bs-slide="next"
                    >
                        <span className="carousel-control-next-icon"></span>
                    </button>

                </div>

            </section>


            <main>

                <section>
                    <ListaUsuarios usuarios={props.usuarios} usuarioLogado={props.usuarioLogado} seguirUsuario={props.seguirUsuario}></ListaUsuarios>
                </section>

                <section>
                    <ExibeJogoFeed
                        jogos={jogos}
                        fotosJogos={fotosJogos}
                    />
                </section>

            </main>

        </>
    );

}

export default Principal;
