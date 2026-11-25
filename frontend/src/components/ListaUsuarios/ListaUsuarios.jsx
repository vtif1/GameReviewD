
import styles from "./ListaUsuarios.module.css";
import semFoto from "../../assets/imagens/semfoto.png"

function ListaUsuarios(props) {

    const usuarios = props.usuarios;
    const usuarioLogado = props.usuarioLogado;

    const listaUsuarios = Object.values(usuarios || {});

    const outrosUsuarios = listaUsuarios.filter(
        usuario => usuario.id_usuario !== usuarioLogado?.id_usuario
    );

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

                        <button
                            className={styles.btn_seguir}
                            onClick={() => props.seguirUsuario(usuario.id_usuario)}
                        >
                            Seguir
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
