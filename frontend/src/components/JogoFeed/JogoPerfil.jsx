import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg";
import styles from "./JogoPerfil.module.css";

const url = "http://localhost:3000/arquivo";

function JogoPerfil(props) {
    const jogo = props.jogo;
    console.log("Jogo: ", jogo)

    const imagem = jogo.id_imagem ? `${url}/${jogo.id_imagem}` : semFoto;

    return (
        <article className={`card jogo-perfil h-100 border-secondary-subtle overflow-hidden ${styles.jogo_perfil}`}>

            <div className={`${styles.jogo_perfil_capa}`}>
                <img
                    src={imagem}
                    alt={`Capa de ${jogo.jogo}`}
                    className="object-fit-cover"
                />
            </div>

            <div className="container card-body p-3">
                <div className="row">

                    <div className="col-lg-5">

                        <h5 className="card-title fs-6 fw-bold mb-1 text-truncate" title={jogo.jogo}>
                            {jogo.jogo}
                        </h5>

                        <p className="card-text small text-body-secondary mb-0">
                            {new Date(jogo.data_lancamento).getFullYear()}
                        </p>

                    </div>

                    <div className="d-flex col-lg-7 gap-1 justify-content-end align-items-center ">
                        <button onClick={() => props.fav_desfavJogo(jogo.id_jogo, !jogo.favorito)} className={`bg-warning ${styles.btn_funcao}`}><i className={!jogo.favorito ? "bi bi-star" : "bi bi-star-fill"}></i></button>
                        <button onClick={() => props.apagaJogoColecao(jogo.id_jogo)} className={`bg-danger ${styles.btn_funcao}`}><i className="bi bi-trash3"></i></button>
                    </div>

                </div>
            </div>

        </article>
    );
}

export default JogoPerfil;