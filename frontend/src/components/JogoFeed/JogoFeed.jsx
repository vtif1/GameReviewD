import semFoto from "../../assets/imagens/neon-video-game-controller-line-260nw-2663195189.jpg"

function JogoFeed(props) {

    const jogo = props.jogo
    const idImg = props.img;

    let imgJogo;
    if (idImg) {
        imgJogo = `.../../../../backend/src/uploads/${idImg}`
    }

    return (
        <>

            <article className="card">

                <header className="">

                    {/* <img src={!jogo.id_imagem ? semFoto : imgJogo} alt="" /> */}
                    <h1>{jogo.nome}</h1>

                </header>

                <div>
                    <h3>{jogo.descricao}</h3>
                    <h5>{jogo.data_lancamento}</h5>

                </div>

            </article>

        </>
    )

}

export default JogoFeed;