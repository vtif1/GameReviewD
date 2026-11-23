import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg"
const url = "http://localhost:3000/arquivo";

function JogoFeed(props) {
    const jogo = props.jogo;
    const idImg = props.img;


    return (
        <>

            <article className="card">

                <header className="text-center">

                    <img src={!jogo.id_imagem ? semFoto : `${url}/${idImg}`} alt="" className="img-fluid"/>
                    <h4>{jogo.jogo}</h4>

                </header>

                <div>

                </div>

            </article>

        </>
    )

}

export default JogoFeed;