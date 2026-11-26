import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import styles from "../cadastro/Cadastro.module.css";

function EditarPerfil(props) {

    const navegar = useNavigate();
    const perfil = props.perfil;

    const [username, setUsername] = useState("");
    const [nome, setNome] = useState("");
    const [dataNasc, setDataNasc] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [senha, setSenha] = useState("");
    const [foto, setFoto] = useState(null);

    useEffect(() => {
        if (perfil) {
            setUsername(perfil.username);
            setNome(perfil.nome);
            setDataNasc(perfil.data_nasc ? perfil.data_nasc.substring(0, 10) : "");
            setBio(perfil.bio || "");

            const usuario = props.usuarios[perfil.id_usuario];
            if (usuario) {
                setEmail(usuario.email);
            }
        }
    }, [perfil, props.usuarios]);

    if (!perfil && props.perfilCarregado) {
        return <Navigate to="/login" />;
    }

    if (!perfil) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark" data-bs-theme="dark">
                <div className="spinner-border text-primary" role="status"></div>
            </div>
        );
    }

    async function enviaFormulario(e) {
        e.preventDefault();

        const dados = new FormData();
        dados.append("username", username);
        dados.append("nome", nome);
        dados.append("data_nasc", dataNasc);
        dados.append("email", email);
        dados.append("bio", bio);

        // Só envia a senha se o usuário digitou uma nova
        if (senha) {
            dados.append("senha", senha);
        }

        if (foto) {
            dados.append("foto", foto);
        }

        const sucesso = await props.editaPerfil(perfil.id_usuario, dados);

        if (sucesso) {
            alert("Perfil atualizado com sucesso!");
            navegar("/me/profile");
        }
    }

    async function removeFoto() {
        if (!window.confirm("Deseja remover sua foto de perfil?")) {
            return;
        }

        await props.removeFotoPerfil(perfil.id_usuario);
    }

    async function excluiConta() {
        if (!window.confirm("Deseja realmente excluir sua conta? Essa ação não pode ser desfeita.")) {
            return;
        }

        const sucesso = await props.apagaUsuario(perfil.id_usuario);

        if (sucesso) {
            props.logout();
        }
    }

    return (
        <>
            <Nav isLogado={perfil} isAdmin={props.admin} logout={props.logout} nome_pagina={"perfil"} />

            <main className={`min-vh-100 d-flex justify-content-center align-items-center p-5 ${styles.fundo_pagina}`}>
                <div className="container" style={{ maxWidth: "800px" }}>

                    <div className={`card bg-transparent overflow-hidden ${styles.div_cadastro}`}>
                        <div className={`p-3 p-md-4 p-lg-5 text-white ${styles.fundo_cadastro}`}>

                            <form onSubmit={enviaFormulario}>

                                <header className="mb-3">
                                    <h1 className="text-center">Editar perfil</h1>
                                </header>

                                <div className="row g-3">

                                    <div className="col-md-6">
                                        <label htmlFor="username" className="form-label mb-1">Username</label>
                                        <input id="username" type="text" className={styles.input}
                                            value={username} onChange={(e) => setUsername(e.target.value)} required />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="nome" className="form-label mb-1">Nome completo</label>
                                        <input id="nome" type="text" className={styles.input}
                                            value={nome} onChange={(e) => setNome(e.target.value)} required />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="data_nasc" className="form-label mb-1">Data de nascimento</label>
                                        <input id="data_nasc" type="date" className={styles.input}
                                            value={dataNasc} onChange={(e) => setDataNasc(e.target.value)} required />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="email" className="form-label mb-1">E-mail</label>
                                        <input id="email" type="email" className={styles.input}
                                            value={email} onChange={(e) => setEmail(e.target.value)} required />
                                    </div>

                                    <div className="col-12">
                                        <label htmlFor="senha" className="form-label mb-1">
                                            Nova senha <span className="text-body-secondary">(deixe em branco para manter)</span>
                                        </label>
                                        <input id="senha" type="password" className={styles.input}
                                            placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="bio" className="form-label mb-1">Biografia</label>
                                        <textarea id="bio" rows="2" className={styles.input}
                                            value={bio} onChange={(e) => setBio(e.target.value)} />
                                    </div>

                                    <div className="col-md-6">
                                        <label htmlFor="foto" className="form-label mb-1">Nova foto de perfil</label>
                                        <input id="foto" type="file" accept="image/*" className={styles.input}
                                            onChange={(e) => setFoto(e.target.files[0])} />
                                    </div>

                                    <div className="col-12 d-flex flex-column flex-sm-row gap-2 mt-3">
                                        <button type="submit" className="btn btn-primary flex-fill">Salvar alterações</button>
                                        <button type="button" className="btn btn-outline-secondary" onClick={() => navegar("/me/profile")}>Cancelar</button>
                                    </div>

                                    <div className="col-12 d-flex flex-column flex-sm-row gap-2">
                                        {perfil.id_imagem_perfil && (
                                            <button type="button" className="btn btn-outline-warning" onClick={removeFoto}>Remover foto</button>
                                        )}
                                        <button type="button" className="btn btn-outline-danger" onClick={excluiConta}>Excluir minha conta</button>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default EditarPerfil;