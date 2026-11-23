import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg";
import styles from "./JogoPerfil.module.css";

const url = "http://localhost:3000/arquivo";

function JogoPerfil(props) {
    const jogo = props.jogo;

    const imagem = jogo.id_imagem ? `${url}/${jogo.id_imagem}` : semFoto;

    return (
        <article className={`card jogo-perfil h-100 border-secondary-subtle overflow-hidden ${styles.jogo_perfil}`}>

            <div className={`ratio ratio-4x3 ${styles.jogo_perfil_capa}`}>
                <img
                    src={imagem}
                    alt={`Capa de ${jogo.jogo}`}
                    className="object-fit-cover"
                />
            </div>

            <div className="card-body p-3">
                <h5 className="card-title fs-6 fw-bold mb-1 text-truncate" title={jogo.jogo}>
                    {jogo.jogo}
                </h5>


                <p className="card-text small text-body-secondary mb-0">
                    {new Date(jogo.data_lancamento).getFullYear()}
                </p>

            </div>

        </article>
    );
}

export default JogoPerfil;