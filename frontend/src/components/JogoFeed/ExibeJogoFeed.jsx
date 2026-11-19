import JogoFeed from "./JogoFeed";

function ExibeJogoFeed(props) {

    const jogos = props.jogos;
    const imagensJogos = props.fotosJogos;

    let listaJogos = [];
    for (let i = jogos.length - 1; i>=0; i--) {
        let imagem = null;

        for (const img of imagensJogos) {
            if (img.id == jogos[i].id_imagem) {
                imagem = img.id;

                break;
            }
        }
        
        listaJogos.push(
            <JogoFeed 
            key={jogos[i].id_jogo}
            jogo={jogos[i]}
            img={imagem}
            />
        )

    }

    return listaJogos;
}

export default ExibeJogoFeed;