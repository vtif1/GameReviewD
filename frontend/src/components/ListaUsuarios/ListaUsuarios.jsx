
import { Link } from "react-router-dom";
import styles from "./ListaUsuarios.module.css";
import semFoto from "../../assets/imagens/semfoto.png"

function ListaUsuarios(props) {

    const usuarios = props.usuarios;
    const usuarioLogado = props.usuarioLogado;
    const seguindo = props.seguindo || [];

    const listaUsuarios = Object.values(usuarios || {});

    const outrosUsuarios = listaUsuarios.filter(
        usuario => usuario.id_usuario !== usuarioLogado?.id_usuario
    );

    // Verifica se o usuário logado já segue esse usuário
    function jaSegue(idUsuario) {
        return seguindo.some((s) => s.id_usuario === idUsuario);
    }

    function clicouSeguir(idUsuario) {

        if (!usuarioLogado) {
            alert("Faça login para realizar essa ação.");
            return;
        }

        if (jaSegue(idUsuario)) {
            props.deixaSeguir(idUsuario);
        } else {
            props.seguirUsuario(idUsuario);
        }
    }

    return (
        <section className={styles.secao_usuarios}>

            <div className={styles.cabecalho}>
                <div>
                    <h2>Conheça outros jogadores</h2>
                    <p>Encontre pessoas e compartilhe sua paixão por jogos.</p>
                </div>
            </div>

            <div className={styles.lista_usuarios}>

                {outrosUsuarios.map(usuario => (

                    <div
                        className={styles.card_usuario}
                        key={usuario.id_usuario}
                    >

                        <Link to={`/usuario/${usuario.id_usuario}`} className={styles.link_perfil}>

                            <div className={styles.foto_container}>

                                <img
                                    src={usuario.id_imagem_perfil ? `http://localhost:3000/arquivo/${usuario.id_imagem_perfil}` : semFoto}
                                    alt={`Foto de ${usuario.username}`}
                                    className={styles.foto_perfil}
                                />

                            </div>

                            <h3>{usuario.nome}</h3>

                            <span className={styles.username}>
                                @{usuario.username}
                            </span>

                        </Link>

                        <button
                            className={jaSegue(usuario.id_usuario) ? styles.btn_seguindo : styles.btn_seguir}
                            onClick={() => clicouSeguir(usuario.id_usuario)}
                        >
                            {jaSegue(usuario.id_usuario) ? "Seguindo" : "Seguir"}
                        </button>

                    </div>

                ))}

                {outrosUsuarios.length === 0 && (
                    <p className={styles.sem_usuarios}>
                        Nenhum outro jogador encontrado.
                    </p>
                )}

            </div>

        </section>
    );

}

export default ListaUsuarios;
