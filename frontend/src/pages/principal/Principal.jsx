import { useEffect } from "react";
import ExibeJogoFeed from "../../components/JogoFeed/ExibeJogoFeed";

function Principal(props) {

    const jogos = props.jogos;
    const fotosJogos = props.fotosJogos;

    return (
        <>
            <section>
                <ExibeJogoFeed jogos={jogos} fotosJogos={fotosJogos}></ExibeJogoFeed>
            </section>
        </>
    )

}

export default Principal