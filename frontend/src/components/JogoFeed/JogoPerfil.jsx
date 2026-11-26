import { useState } from "react";
import { Link } from "react-router-dom";
import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg";
import styles from "./JogoPerfil.module.css";

const url = "http://localhost:3000/arquivo";

function JogoPerfil(props) {
    const jogo = props.jogo;
    const [status, setStatus] = useState(props.status_jogo)

    const imagem = props.id_imagem ? `${url}/${props.id_imagem}` : semFoto;

    const listaStatus = [
        { id: 1, status: "quero_jogar", texto: "Quero jogar" },
        { id: 2, status: "jogando", texto: "Jogando" },
        { id: 3, status: "finalizado", texto: "Finalizado" },
        { id: 4, status: "abandonado", texto: "Abandonado" }
    ];

    return (
        <article className={`card jogo-perfil h-100 border-secondary-subtle overflow-hidden ${styles.jogo_perfil}`}>

            <Link to={`/jogo/${jogo.id_jogo}`} className={styles.jogo_perfil_capa}>
                <img
                    src={imagem}
                    alt={`Capa de ${jogo.jogo}`}
                    className="object-fit-cover"
                />
            </Link>

            <div className="container card-body p-3">
                <div className="row">

                    <div className="col-lg-10">

                        <h5 className="card-title fs-6 fw-bold mb-1 text-truncate" title={jogo.jogo}>
                            <Link to={`/jogo/${jogo.id_jogo}`} className={styles.titulo_jogo}>
                                {jogo.jogo}
                            </Link>
                        </h5>

                        {jogo.data_lancamento && (
                            <p className="card-text small text-body-secondary mb-1">
                                {new Date(jogo.data_lancamento).getFullYear()}
                            </p>
                        )}

                        <select name="status" id={`status-${jogo.id_jogo}`} value={status} onChange={(e) => setStatus(e.target.value)} role="button">

                            {listaStatus.map((st) => (
                                <option key={st.id} value={st.status}>{st.texto}</option>
                            ))}

                        </select>

                        <button onClick={() => props.alteraStatusJogo(jogo.id_jogo, status)} className={`ms-2 border-0 rounded-1 ${styles.btn_alterar}`}>Alterar</button>


                    </div>

                    <div className="d-flex col-lg-2 gap-1 justify-content-end align-items-center ">
                        <button onClick={() => props.fav_desfavJogo(jogo.id_jogo, !jogo.favorito)} className={`bg-warning ${styles.btn_funcao}`}><i className={!jogo.favorito ? "bi bi-star" : "bi bi-star-fill"}></i></button>
                        <button onClick={() => props.apagaJogoColecao(jogo.id_jogo)} className={`bg-danger ${styles.btn_funcao}`}><i className="bi bi-trash3"></i></button>
                    </div>

                </div>
            </div>

        </article>
    );
}

export default JogoPerfil;
