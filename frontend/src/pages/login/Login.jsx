import { useState } from "react";

function Login(props) {

    const [login, setLogin] = useState("");
    const [senha, setSenha] = useState("");

    function enviaFomulario(e) {
        e.preventDefault();

        const dadosUsuario = {
            login: login,
            senha: senha
        }

        props.loginUsuario(dadosUsuario);
    }

    return (

        <form onSubmit={enviaFomulario}>

            <input type="text" name="login" id="" onChange={(e) => setLogin(e.target.value)} placeholder="Username ou e-mail" required/>
            <input type="text" name="senha" id="" onChange={(e) => setSenha(e.target.value)} placeholder="Senha" required/>
            <button>Fazer login</button>

        </form>

    )

}

export default Login;