import { useState } from "react";

function Cadastro(props) {

    const [username, setUsername] = useState("");
    const [nome, setNome] = useState("");
    const [data_nascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [imagemPerfil, setImagemPerfil] = useState(null);
    const [bio, setBio] = useState(null);
    
    
    function enviaFomulario(e) {
        e.preventDefault();
        
        const dadosUsuario = new FormData();
        dadosUsuario.append("username", username);
        dadosUsuario.append("nome", nome);
        dadosUsuario.append("data_nasc", data_nascimento);
        dadosUsuario.append("email", email);
        dadosUsuario.append("senha", senha);

        if (bio) {
            dadosUsuario.append("bio", bio);
        }

        if (imagemPerfil) {
            dadosUsuario.append("foto", imagemPerfil);
        }

        props.addUsuario(dadosUsuario);

        e.currentTarget.reset();
    }

    
    return (
        <>

            <header>
            </header>

            <div>

                <form onSubmit={enviaFomulario} action="">

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        name="nome"
                        placeholder="Nome completo"
                        onChange={(e) => setNome(e.target.value)}
                        required
                    />

                    <input
                        type="date"
                        name="data de nascimento"
                        placeholder="Data de nascimento"
                        onChange={(e) => setDataNascimento(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        name="email"
                        placeholder="E-mail"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        name="senha"
                        placeholder="Senha"
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        name="bio"
                        placeholder="Biografia"
                        onChange={(e) => setBio(e.target.value)}
                    />

                    <input
                        type="file"
                        name="foto de perfil"
                        placeholder="Foto de perfil"
                        accept="image/*"
                        onChange={(e) => setImagemPerfil(e.target.files[0])}
                    />

                    <button>Cadastrar</button>
                    <button type="reset">Resetar</button>
                </form>


            </div>

        </>
    )


}

export default Cadastro;