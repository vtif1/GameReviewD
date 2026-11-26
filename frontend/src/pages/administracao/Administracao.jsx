
import { Link } from "react-router-dom";
import styles from "./Administracao.module.css";
import Nav from "../../components/Nav/Nav";

const opcoes = [
    {
        titulo: "Adicionar jogo",
        descricao: "Cadastrar jogos no catálogo.",
        icone: <i className="bi bi-controller"></i>,
        caminho: "/admin/jogo/adicionar"
    },
    {
        titulo: "Editar jogo",
        descricao: "Alterar jogos cadastrados.",
        icone: <i className="bi bi-pencil"></i>,
        caminho: "/admin/jogo/editar"
    },
    {
        titulo: "Adicionar plataforma",
        descricao: "Cadastrar plataformas.",
        icone: <i className="bi bi-pc-display-horizontal"></i>,
        caminho: "/admin/plataforma/adicionar"
    },
    {
        titulo: "Editar plataforma",
        descricao: "Alterar plataformas.",
        icone: <i className="bi bi-gear"></i>,
        caminho: "/admin/plataforma/editar"
    },
    {
        titulo: "Adicionar gênero",
        descricao: "Cadastrar novos gêneros.",
        icone: <i className="bi bi-tag"></i>,
        caminho: "/admin/genero/adicionar"
    },
    {
        titulo: "Editar gênero",
        descricao: "Alterar gêneros existentes.",
        icone: <i className="bi bi-clipboard"></i>,
        caminho: "/admin/genero/editar"
    },
    {
        titulo: "Adicionar desenvolvedora",
        descricao: "Cadastrar desenvolvedoras.",
        icone: <i className="bi bi-building"></i>,
        caminho: "/admin/desenvolvedora/adicionar"
    },
    {
        titulo: "Editar desenvolvedora",
        descricao: "Alterar desenvolvedoras.",
        icone: <i className="bi bi-building-gear"></i>,
        caminho: "/admin/desenvolvedora/editar"
    },
    {
        titulo: "Gerenciar usuários",
        descricao: "Administrar contas.",
        icone: <i className="bi bi-people"></i>,
        caminho: "/admin/usuarios"
    }
];

function Administracao(props) {

    if (!props.admin) {
        return (
            <>
                <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"}></Nav>

                <main className={styles.pagina}>
                    <div className={styles.cabecalho}>
                        <h1>Acesso restrito</h1>
                        <p>Apenas administradores podem acessar essa página.</p>
                    </div>
                </main>
            </>
        );
    }

    return (

        <>
            <Nav isLogado={props.logado} isAdmin={props.admin} logout={props.logout} nome_pagina={"restrito"}></Nav>

            <main className={styles.pagina}>
                <div className={styles.cabecalho}>
                    <h1>Configurações administrativas</h1>
                    <p>Selecione uma função para gerenciar a plataforma.</p>
                </div>

                <div className={styles.grid}>
                    {opcoes.map((opcao) => (
                        <Link
                            to={opcao.caminho}
                            className={styles.card}
                            key={opcao.titulo}
                        >
                            <div className={styles.icone}>
                                {opcao.icone}
                            </div>

                            <hr className={styles.linha}/>

                            <h2>{opcao.titulo}</h2>

                            <p>{opcao.descricao}</p>
                        </Link>
                    ))}
                </div>
            </main>

        </>
    );
}

export default Administracao;
