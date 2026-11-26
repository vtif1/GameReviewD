import styles from "./Rodape.module.css";

function Rodape() {
    return (
        <footer className={styles.footer}>
            <div className={styles.conteudo}>
                <div className={styles.logo}>
                    <h1>GameReviewD</h1>
                    <p>Seu espaço para descobrir e avaliar jogos.</p>
                </div>

                <div className={styles.info}>
                    <p>Explore jogos, compartilhe opiniões</p>
                    <p>e descubra novas experiências.</p>
                </div>
            </div>

            <div className={styles.final}>
                <p>&copy; {new Date().getFullYear()} GameReviewD. Todos os direitos reservados.</p>
            </div>
        </footer>
    );
}

export default Rodape;
