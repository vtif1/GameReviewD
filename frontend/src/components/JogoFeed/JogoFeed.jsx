import { Link } from "react-router-dom";
import styles from "./JogoFeed.module.css";
import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg"

const url = "http://localhost:3000/arquivo";

function JogoFeed(props) {
    const jogo = props.jogo;

    let ano = "";
    if (jogo.data_lancamento) {
        ano = new Date(jogo.data_lancamento).getFullYear();
    }

    return (

        <Link to={`/jogo/${jogo.id_jogo}`} className={styles.card_jogo}>

            <div className={styles.capa}>
                <img
                    src={!jogo.id_imagem ? semFoto : `${url}/${jogo.id_imagem}`}
                    alt={`Capa de ${jogo.nome}`}
                />
            </div>

            <div className={styles.info}>

                <h3>{jogo.nome}</h3>

                {ano !== "" && <span className={styles.ano}>{ano}</span>}

                <div className={styles.generos}>
                    {jogo.generos.map((g) => (
                        <span className={styles.badge} key={g.id_genero}>{g.nome}</span>
                    ))}
                </div>

            </div>

        </Link>

    )

}

export default JogoFeed;
