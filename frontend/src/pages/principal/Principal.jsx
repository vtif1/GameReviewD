import styles from "./Principal.module.css";

// import logotipo from "../../assets/imagens/Neon Five-Star Gaming Controller Emblem.png";

import jogo1 from "../../assets/imagens/59009.jpg";
import jogo2 from "../../assets/imagens/Dark-Souls-III.jpg";
import jogo3 from "../../assets/imagens/FSYACATO3VO4NKYRS5VI6URUCE.jpg";

import ExibeJogoFeed from "../../components/JogoFeed/ExibeJogoFeed";

import { Link } from "react-router-dom";
import ListaUsuarios from "../../components/ListaUsuarios/ListaUsuarios";
import Nav from "../../components/Nav/Nav";
import Rodape from "../../components/Rodape/Rodape";

function Principal(props) {

    const jogos = props.jogos;
    const isLogado = props.usuarioLogado;
    const isAdmin = props.admin;
    const logout = props.logout;

    return (
        <>

            <Nav isLogado={isLogado} isAdmin={isAdmin} logout={logout} nome_pagina={"inicio"} />

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
                    <ListaUsuarios
                        usuarios={props.usuarios}
                        usuarioLogado={props.usuarioLogado}
                        seguindo={props.seguindo}
                        seguirUsuario={props.seguirUsuario}
                        deixaSeguir={props.deixaSeguir}></ListaUsuarios>
                </section>

                <section>
                    <ExibeJogoFeed
                        jogos={jogos}
                        generos={props.generos}
                        plataformas={props.plataformas}
                        desenvolvedoras={props.desenvolvedoras}
                    />
                </section>

            </main>

            <Rodape></Rodape>

        </>
    );

}

export default Principal;
