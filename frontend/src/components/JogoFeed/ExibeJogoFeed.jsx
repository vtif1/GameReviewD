import JogoFeed from "./JogoFeed";

function ExibeJogoFeed(props) {

    const jogos = props.jogos;

    let listaJogos = [];
    for (let i = jogos.length - 1; i>=0; i--) {
        
        listaJogos.push(
            <JogoFeed 
            key={jogos[i].id_jogo}
            jogo={jogos[i]}
            img={jogos[i].id_imagem}
            />
        )

    }

    return listaJogos;
}

export default ExibeJogoFeed;