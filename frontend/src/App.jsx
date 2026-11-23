import './App.css'
import { Route, Routes, useNavigate } from "react-router-dom"
import Principal from './pages/principal/Principal'
import Cadastro from './pages/cadastro/Cadastro';
import { useState } from 'react';
import { useEffect } from 'react';
import Login from './pages/login/Login';
import Perfil from './pages/perfil/Perfil';

function App() {
  const url = "http://localhost:3000";
  const navegar = useNavigate();

  const [usuarios, setUsuarios] = useState({});
  const [jogos, setJogos] = useState([]);
  const [imgs, setImgs] = useState({});

  // Dados do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [seguidores, setSeguidores] = useState([]);
  const [seguindo, setSeguindo] = useState([]);
  const [colecaoUsuario, setColecaoUsuario] = useState([]);
  const [avaliacoesUsuario, setAvaliacoesUsuario] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  async function carregaUsuarios() {

    try {

      const res = await fetch(`${url}/usuario`);

      if (!res.ok) {
        return;
      }

      const usuariosJson = await res.json();

      let dicUsuarios = {};
      for (const usuario of usuariosJson) {
        dicUsuarios[usuario.id_usuario] = usuario;
      }

      setUsuarios(dicUsuarios);

      console.log(dicUsuarios);

    } catch (error) {
      console.log(error);
    }

  }

  async function carregaJogos() {

    try {
      const res = await fetch(`${url}/jogo`);

      if (!res.ok) {
        return;
      }

      const jogosJson = await res.json();
      setJogos(jogosJson);

    } catch (error) {
      console.log(error);
    }


  }

  async function cadastraUsuario(usuario) {

    let option = {
      method: "POST",
      body: usuario
    }

    try {

      let cadastro = await fetch(`${url}/usuario`, option);

      if (!cadastro.ok) {
        const erro = await cadastro.json();
        throw new Error(erro.msg);
      }

      carregaUsuarios();
      navegar("/login")

    } catch (error) {
      alert(error.message);
    }
  }

  async function loginUsuario(usuario) {

    let option = {
      method: "POST",
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify(usuario)
    }

    try {

      let login = await fetch(`${url}/usuario/login`, option);

      if (!login.ok) {
        throw new Error("Login e/ou senha incorretos.")
      }

      let dadosUsuario = await login.json();

      localStorage.setItem("token", dadosUsuario.token);
      setAdmin(dadosUsuario.usuario.admin);

      console.log(dadosUsuario);

      await carregaPerfil();

      await carregaColecaoLogado();
      await carregaSeguidores();
      await carregaSeguindo();
      await carregaAvaliacoesLogado();
      await carregaFavoritos();

      navegar("/");

    } catch (error) {
      alert(error.message);
    }

  }

  async function logout() {
    localStorage.removeItem("token");
    setUsuarioLogado(null);

    navegar("/");
  }

  async function carregaImagens() {

    try {

      const res = await fetch(`${url}/arquivo`);

      if (!res.ok) {
        return;
      }

      const imagensJson = await res.json();
      setImgs(imagensJson);

      console.log(imagensJson)

    } catch (error) {
      console.log(error.message);
    }

  }


  async function carregaPerfil() {
    const token = localStorage.getItem("token");
    console.log(token)
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Status do ngc: ", res.status)

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const dados = await res.json();
      console.log("Dados: ", dados)

      setUsuarioLogado(dados);

      console.log("Dados blabla: ", dados)

    } catch (error) {
      console.log(error.message)
    }

  }
  async function carregaSeguidores() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me/seguidores`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const seguidores = await res.json();
      setSeguidores(seguidores);

    } catch (error) {
      console.log(error.message);
    }
  }

  async function carregaSeguindo() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me/seguindo`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const seguindo = await res.json();
      setSeguindo(seguindo);

    } catch (error) {
      console.log(error.message);
    }
  }

  async function carregaColecaoLogado() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me/colecao`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const colecao = await res.json();
      setColecaoUsuario(colecao);
      console.log(colecao);

    } catch (error) {
      console.log(error.message)
    }

  }

  async function carregaAvaliacoesLogado() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me/avaliacoes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const avaliacoes = await res.json();
      setAvaliacoesUsuario(avaliacoes);
      console.log(avaliacoes);

    } catch (error) {
      console.log(error.message);
    }
  }

  async function carregaFavoritos() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me/colecao/favoritos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const favoritos = await res.json();
      setFavoritos(favoritos);

    } catch (error) {
      console.log(error.message)
    }

  }

  async function deixaSeguir(idUsuario) {
    const token = localStorage.getItem("token");
    if (!token) return;

    let option = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    }

    try {

      const res = await fetch(`${url}/usuario/me/seguindo/${idUsuario}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaSeguindo();

    } catch (error) {
      console.log(error.message)
    }

  }

  /*
  async function favoritaJogo() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {

      const res = await fetch(`${url}/usuario/me/colecao/favoritos`, {
        headers: { Authorization: `Bearer ${token}` }
      });

    } catch (error) {

    }
  }
    */

  useEffect(() => {
    carregaJogos();
    carregaUsuarios();
    carregaImagens();
    carregaPerfil();
    carregaSeguidores();
    carregaSeguindo();
    carregaColecaoLogado();
    carregaAvaliacoesLogado();
    carregaFavoritos();
  }, []);

  return (
    <>
      <Routes>

        <Route path='/' element={
          <Principal jogos={jogos} usuarios={usuarios} fotosJogos={imgs} usuarioLogado={usuarioLogado} admin={admin}></Principal>
        } />

        <Route path='/cadastro' element={
          <Cadastro addUsuario={cadastraUsuario} />
        } />

        <Route path='/login' element={
          <Login loginUsuario={loginUsuario} />
        } />

        <Route path='/me/profile' element={
          <Perfil
            perfil={usuarioLogado}
            fotos={imgs}
            logout={logout}
            seguidores={seguidores}
            seguindo={seguindo}
            colecaoJogos={colecaoUsuario}
            avaliacoes={avaliacoesUsuario}
            favoritos={favoritos}
            logado={usuarioLogado}
            admin={admin}
            deixaSeguir={deixaSeguir}
            carregaSeguindo={carregaSeguindo}
          />
        } />

      </Routes>
    </>
  )
}

export default App
