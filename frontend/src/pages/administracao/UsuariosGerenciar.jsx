import { useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import styles from "./JogoEditar.module.css";
import adminStyles from "./Administracao.module.css";
import semFoto from "../../assets/imagens/semfoto.png";

const url = "http://localhost:3000";

function UsuariosGerenciar(props) {

    const [mensagem, setMensagem] = useState("");

    const listaUsuarios = Object.values(props.usuarios || {});

    async function excluir(usuario) {

        const confirmou = window.confirm(`Deseja realmente excluir o usuário "${usuario.username}"? Essa ação não pode ser desfeita.`);

        if (!confirmou) {
            return;
        }

        const sucesso = await props.apagaUsuario(usuario.id_usuario);

        if (sucesso) {
            setMensagem("Usuário excluído com sucesso!");
        }
    }

    if (!props.admin) {
        return (
            <div className={styles.container}>
                <h2>Acesso restrito aos administradores.</h2>
            </div>
        );
    }

    return (

        <>
            <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"}></Nav>

            <main className={styles.fundo}>

                <div className={styles.container}>

                    <Link to="/administracao" className={adminStyles.voltar}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </Link>

                    <h1>GERENCIAR USUÁRIOS</h1>

                    {mensagem && <p className={styles.mensagem}>{mensagem}</p>}

                    {listaUsuarios.map((usuario) => (

                        <div className={styles.card} key={usuario.id_usuario}>

                            <div className="d-flex flex-column flex-md-row align-items-center gap-4">

                                <img
                                    src={usuario.id_imagem_perfil ? `${url}/arquivo/${usuario.id_imagem_perfil}` : semFoto}
                                    alt={`Foto de ${usuario.username}`}
                                    className="rounded-circle border border-primary border-3 object-fit-cover"
                                    width="90"
                                    height="90"
                                />

                                <div className={`${styles.informacoes} text-center text-md-start`}>

                                    <h2>{usuario.nome}</h2>

                                    <p className="mb-1">
                                        <strong>Username:</strong> @{usuario.username}
                                    </p>

                                    <p className="mb-1">
                                        <strong>E-mail:</strong> {usuario.email}
                                    </p>

                                    <p className="mb-0">
                                        <strong>Bio:</strong> {usuario.bio || "Sem biografia."}
                                    </p>

                                </div>

                                {props.logado && props.logado.id_usuario === usuario.id_usuario ? (
                                    <span className={styles.vazio}>Você</span>
                                ) : (
                                    <button
                                        className={styles.remover}
                                        onClick={() => excluir(usuario)}
                                    >
                                        <i className="bi bi-trash3 me-2"></i>
                                        Excluir
                                    </button>
                                )}

                            </div>
                        </div>
                    ))}

                </div>
            </main>

        </>
    );
}

export default UsuariosGerenciar;
