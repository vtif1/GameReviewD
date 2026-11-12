import { useEffect } from "react";
import ExibeJogoFeed from "../../components/JogoFeed/ExibeJogo";

function Principal(props) {

    const jogos = props.jogos;

    return (
        <>
            <section>

                <ExibeJogoFeed jogos={jogos}></ExibeJogoFeed>


            </section>
        </>
    )

}

export default Principal