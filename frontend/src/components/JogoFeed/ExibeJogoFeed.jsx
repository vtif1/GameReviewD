import { useState } from "react";
import JogoFeed from "./JogoFeed";
import styles from "./JogoFeed.module.css";

function ExibeJogoFeed(props) {

    const jogos = props.jogos;
    const generos = props.generos || [];

    const [busca, setBusca] = useState("");
    const [generoFiltro, setGeneroFiltro] = useState("");

    // Mostra os jogos mais recentes primeiro, aplicando a busca e o filtro de gênero
    let listaJogos = [];
    for (let i = jogos.length - 1; i >= 0; i--) {

        const jogo = jogos[i];

        const nomeConfere = jogo.nome.toLowerCase().includes(busca.toLowerCase());

        let generoConfere = true;
        if (generoFiltro !== "") {
            generoConfere = jogo.generos.some((g) => String(g.id_genero) === generoFiltro);
        }

        if (nomeConfere && generoConfere) {
            listaJogos.push(
                <JogoFeed
                    key={jogo.id_jogo}
                    jogo={jogo}
                />
            )
        }

    }

    return (
        <section className={styles.secao_jogos}>

            <div className={styles.cabecalho}>
                <h2>Catálogo de jogos</h2>
                <p>Explore os jogos cadastrados, avalie e adicione à sua coleção.</p>
            </div>

            <div className={styles.filtros}>

                <input
                    type="text"
                    className={styles.campo}
                    placeholder="Buscar jogo pelo nome..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />

                <select
                    className={styles.campo}
                    value={generoFiltro}
                    onChange={(e) => setGeneroFiltro(e.target.value)}
                >
                    <option value="">Todos os gêneros</option>

                    {generos.map((g) => (
                        <option key={g.id_genero} value={g.id_genero}>{g.nome}</option>
                    ))}

                </select>

            </div>

            <div className={styles.grade}>
                {listaJogos}
            </div>

            {listaJogos.length === 0 && (
                <p className={styles.sem_jogos}>Nenhum jogo encontrado.</p>
            )}

        </section>
    );
}

export default ExibeJogoFeed;
