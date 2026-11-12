import { use, useState } from "react";

function Cadastro(props) {

    const [username, setUsername] = useState("");
    const [nome, setNome] = useState("");
    const [data_nascimento, setDataNascimento] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [imagemPerfil, setImagemPerfil] = useState("");
    const [bio, setBio] = useState("");

    function enviaFomulario(e) {
        e.preventDefault();

        const dadosUsuario = {
            username: username,
            nome: nome,
            data_nascimento: data_nascimento,
            email: email,
            senha: senha,
            imagemPerfil: imagemPerfil,
            bio: bio
        }

        props.addUsuario(dadosUsuario);
    }


    return (
        <>

            <header>
            </header>

            <div>

                <form onSubmit={enviaFomulario} method="POST" action="">

                    <input 
                        type="text" 
                        name="username" 
                        placeholder="Username" 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />

                    <input 
                        type="text" 
                        name= "nome" 
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
                        required 
                    />

                    <input 
                        type="file" 
                        name="foto de perfil" 
                        placeholder="Foto de perfil"
                        accept="image/*" 
                        onChange={(e) => setImagemPerfil(e.target.value)} 
                        required 
                    />

                </form>

                <button>Cadastrar</button>

            </div>

        </>
    )


}

export default Cadastro;