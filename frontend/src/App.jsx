import './App.css'
import { Route, Routes, useNavigate } from "react-router-dom"
import Principal from './pages/principal/Principal'
import Cadastro from './pages/cadastro/Cadastro';
import { useState } from 'react';
import { useEffect } from 'react';
import Login from './pages/login/Login';
import Perfil from './pages/perfil/Perfil';
import EditarPerfil from './pages/perfil/EditarPerfil';
import UsuarioPerfil from './pages/perfil/UsuarioPerfil';
import JogoDetalhe from './pages/jogo/JogoDetalhe';
import Administracao from './pages/administracao/Administracao';
import JogoAdicionar from './pages/administracao/JogoAdicionar';
import JogoEditar from './pages/administracao/JogoEditar';
import PlataformaAdicionar from './pages/administracao/PlataformaAdicionar';
import PlataformaEditar from './pages/administracao/PlataformaEditar';
import GeneroAdicionar from './pages/administracao/GeneroAdicionar';
import GeneroEditar from './pages/administracao/GeneroEditar';
import DesenvolvedoraAdicionar from './pages/administracao/DesenvolvedoraAdicionar';
import DesenvolvedoraEditar from './pages/administracao/DesenvolvedoraEditar';
import UsuariosGerenciar from './pages/administracao/UsuariosGerenciar';

function App() {
  const url = "http://localhost:3000";
  const navegar = useNavigate();

  const [usuarios, setUsuarios] = useState({});
  const [jogos, setJogos] = useState([]);
  const [imgs, setImgs] = useState({});
  const [desenvolvedoras, setDesenvolvedoras] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [plataformas, setPlataformas] = useState([]);

  // Dados do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [perfilCarregado, setPerfilCarregado] = useState(false);
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

    } catch (error) {
      console.log(error);
    }

  }

  async function carregaJogos() {

    try {
      const res = await fetch(`${url}/jogo`);

      if (res.status === 404) {
        setJogos([]);
        return;
      }

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
    setAdmin(false);

    setSeguidores([]);
    setSeguindo([]);
    setColecaoUsuario([]);
    setAvaliacoesUsuario([]);
    setFavoritos([]);

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

    } catch (error) {
      console.log(error.message);
    }

  }


  async function carregaPerfil() {
    const token = localStorage.getItem("token");

    if (!token) {
      setPerfilCarregado(true);
      return;
    }

    try {

      const res = await fetch(`${url}/usuario/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        localStorage.removeItem("token");
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const dados = await res.json();

      setUsuarioLogado(dados);
      setAdmin(dados.admin)

    } catch (error) {
      console.log(error.message)
    }

    setPerfilCarregado(true);

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

      if (res.status === 404) {
        setAvaliacoesUsuario([]);
        return;
      }

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const avaliacoes = await res.json();
      setAvaliacoesUsuario(avaliacoes);

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

  async function carregaDesenvolvedoras() {

    try {

      const res = await fetch(`${url}/desenvolvedora`);

      if (res.status === 404) {
        setDesenvolvedoras([]);
        return;
      }

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const dados = await res.json();

      setDesenvolvedoras(dados);

    } catch (error) {
      console.log(error);
    }
  }

  async function carregaGeneros() {

    try {

      const res = await fetch(`${url}/genero`);

      if (res.status === 404) {
        setGeneros([]);
        return;
      }

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const dados = await res.json();

      setGeneros(dados);

    } catch (error) {
      console.log(error);
    }
  }

  async function carregaPlataformas() {

    try {

      const res = await fetch(`${url}/plataforma`);

      if (res.status === 404) {
        setPlataformas([]);
        return;
      }

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      const dados = await res.json();

      setPlataformas(dados);

    } catch (error) {
      console.log(error);
    }
  }

  async function segueUsuario(idUsuario) {
    const token = localStorage.getItem("token");
    if (!token) return;

    let option = {
      method: "POST",
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
      console.log(error.message);
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

  async function fav_desfavJogo(idJogo, fav) {
    const token = localStorage.getItem("token");
    if (!token) return;

    let option = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ favoritar: fav })
    }

    try {

      const res = await fetch(`${url}/usuario/me/colecao/${idJogo}/favorito`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaFavoritos();
      await carregaColecaoLogado();

    } catch (error) {
      console.log(error.message);
    }

  }

  async function editaPerfil(idUsuario, dados) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const res = await fetch(`${url}/usuario/${idUsuario}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: dados
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaPerfil();
      await carregaUsuarios();
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function removeFotoPerfil(idUsuario) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const res = await fetch(`${url}/usuario/${idUsuario}/foto`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaPerfil();
      await carregaUsuarios();
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function adicionaJogoColecao(idJogo) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    let option = {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }

    try {

      const res = await fetch(`${url}/usuario/me/colecao/${idJogo}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaColecaoLogado();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }

  }

  async function apagaJogoColecao(idJogo) {
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

      const res = await fetch(`${url}/usuario/me/colecao/${idJogo}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaColecaoLogado();
      await carregaFavoritos();

    } catch (error) {
      console.log(error.message)
    }

  }

  async function avaliaJogo(idJogo, estrelas, texto) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    let corpo = { estrelas: Number(estrelas) };
    if (texto) {
      corpo.texto = texto;
    }

    let option = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(corpo)
    }

    try {

      const res = await fetch(`${url}/jogo/${idJogo}/avaliacoes`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaAvaliacoesLogado();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }

  }

  async function editaAvaliacao(idJogo, texto, estrelas) {
    const token = localStorage.getItem("token");
    if (!token) return;

    let option = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ texto: texto, estrelas: estrelas })
    }

    try {

      const res = await fetch(`${url}/jogo/${idJogo}/avaliacoes`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaAvaliacoesLogado();

    } catch (error) {
      alert(error.message);
    }

  }

  async function apagaAvaliacao(idJogo) {
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

      const res = await fetch(`${url}/jogo/${idJogo}/avaliacoes`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaAvaliacoesLogado();

    } catch (error) {
      alert(error.message);
    }

  }

  async function alteraStatusJogo(idJogo, status) {
    const token = localStorage.getItem("token");
    if (!token) return;

    let option = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ status: status })
    }

    try {

      const res = await fetch(`${url}/usuario/me/colecao/${idJogo}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaColecaoLogado();

    } catch (error) {
      console.log(error.message)
    }

  }


  // ---------- Funções do administrador ----------

  async function adicionaJogo(dados) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {

      let option = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: dados
      }

      const res = await fetch(`${url}/jogo`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaJogos();
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function editaJogo(idJogo, dados) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {

      let option = {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: dados
      }

      const res = await fetch(`${url}/jogo/${idJogo}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaJogos();
      return true;

    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  async function apagaJogo(idJogo) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {

      const res = await fetch(`${url}/jogo/${idJogo}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaJogos();
      await carregaColecaoLogado();
      await carregaFavoritos();
      await carregaAvaliacoesLogado();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function adicionaRelacaoJogo(idJogo, tipo, valor) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    let rota = "";
    let corpo = {};

    if (tipo === "desenvolvedores") {
      rota = "desenvolvedores";
      corpo = { desenvolvedora: valor };
    }

    if (tipo === "generos") {
      rota = "generos";
      corpo = { genero: valor };
    }

    if (tipo === "plataformas") {
      rota = "plataformas";
      corpo = { plataforma: valor };
    }

    try {

      const res = await fetch(`${url}/jogo/${idJogo}/${rota}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(corpo)
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg || "Erro ao adicionar relação.");
      }

      await carregaJogos();
      return true;

    } catch (error) {
      console.log("Erro ao adicionar relação:", error.message);
      return false;
    }
  }

  async function removeRelacaoJogo(idJogo, tipo, idRelacao) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    let rota = "";

    if (tipo === "desenvolvedores") {
      rota = `desenvolvedores/${idRelacao}`;
    }

    if (tipo === "generos") {
      rota = `generos/${idRelacao}`;
    }

    if (tipo === "plataformas") {
      rota = `plataformas/${idRelacao}`;
    }

    try {

      const res = await fetch(`${url}/jogo/${idJogo}/${rota}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg || "Erro ao remover relação.");
      }

      await carregaJogos();
      return true;

    } catch (error) {
      console.log("Erro ao remover relação:", error.message);
      return false;
    }
  }

  // Recarrega a lista certa depois de adicionar, editar ou apagar
  // a rota pode ser: "genero", "plataforma" ou "desenvolvedora"
  async function recarregaItens(rota) {
    if (rota === "genero") {
      await carregaGeneros();
    }

    if (rota === "plataforma") {
      await carregaPlataformas();
    }

    if (rota === "desenvolvedora") {
      await carregaDesenvolvedoras();
    }

    // Os jogos também mudam, pois mostram nomes de gêneros, plataformas e desenvolvedoras
    await carregaJogos();
  }

  async function adicionaItem(rota, dados) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    // Plataforma e desenvolvedora enviam FormData (por causa da foto)
    let option = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: dados
    }

    if (rota === "genero") {
      option.headers["Content-Type"] = "application/json";
      option.body = JSON.stringify(dados);
    }

    try {

      const res = await fetch(`${url}/${rota}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await recarregaItens(rota);
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function editaItem(rota, id, dados) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    let option = {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: dados
    }

    if (rota === "genero") {
      option.headers["Content-Type"] = "application/json";
      option.body = JSON.stringify(dados);
    }

    try {

      const res = await fetch(`${url}/${rota}/${id}`, option);

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await recarregaItens(rota);
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function apagaItem(rota, id) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {

      const res = await fetch(`${url}/${rota}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await recarregaItens(rota);
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }

  async function apagaUsuario(idUsuario) {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {

      const res = await fetch(`${url}/usuario/${idUsuario}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const erro = await res.json();
        throw new Error(erro.msg);
      }

      await carregaUsuarios();
      await carregaSeguidores();
      await carregaSeguindo();
      await carregaImagens();
      return true;

    } catch (error) {
      alert(error.message);
      return false;
    }
  }


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
    carregaGeneros();
    carregaDesenvolvedoras();
    carregaPlataformas();
  }, []);

  return (
    <>
      <Routes>

        <Route path='/' element={
          <Principal
            jogos={jogos}
            generos={generos}
            plataformas={plataformas}
            desenvolvedoras={desenvolvedoras}
            usuarios={usuarios}
            fotosJogos={imgs}
            usuarioLogado={usuarioLogado}
            admin={admin}
            seguindo={seguindo}
            seguirUsuario={segueUsuario}
            deixaSeguir={deixaSeguir}
            logout={logout}></Principal>
        } />

        <Route path='/cadastro' element={
          <Cadastro
            addUsuario={cadastraUsuario}
            usuarioLogado={usuarioLogado}
            admin={admin} />
        } />

        <Route path='/login' element={
          <Login
            loginUsuario={loginUsuario}
            usuarioLogado={usuarioLogado}
            admin={admin} />
        } />

        <Route path='/me/profile' element={
          <Perfil
            perfil={usuarioLogado}
            perfilCarregado={perfilCarregado}
            fotos={imgs}
            jogos={jogos}
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
            fav_desfavJogo={fav_desfavJogo}
            apagaJogoColecao={apagaJogoColecao}
            editaAvaliacao={editaAvaliacao}
            alteraStatusJogo={alteraStatusJogo}
            apagaAvaliacao={apagaAvaliacao}
          />
        } />

        <Route path='/me/editar' element={
          <EditarPerfil
            perfil={usuarioLogado}
            perfilCarregado={perfilCarregado}
            usuarios={usuarios}
            admin={admin}
            logout={logout}
            editaPerfil={editaPerfil}
            removeFotoPerfil={removeFotoPerfil}
            apagaUsuario={apagaUsuario}
          />
        } />

        <Route path='/usuario/:id' element={
          <UsuarioPerfil
            usuarios={usuarios}
            jogos={jogos}
            usuarioLogado={usuarioLogado}
            admin={admin}
            seguindo={seguindo}
            seguirUsuario={segueUsuario}
            deixaSeguir={deixaSeguir}
            logout={logout}
          />
        } />

        <Route path='/jogo/:id' element={
          <JogoDetalhe
            jogos={jogos}
            usuarios={usuarios}
            logado={usuarioLogado}
            admin={admin}
            logout={logout}
            colecaoJogos={colecaoUsuario}
            avaliacoes={avaliacoesUsuario}
            adicionaJogoColecao={adicionaJogoColecao}
            apagaJogoColecao={apagaJogoColecao}
            fav_desfavJogo={fav_desfavJogo}
            avaliaJogo={avaliaJogo}
          />
        } />

        <Route path='/administracao' element={<Administracao logado={usuarioLogado} admin={admin} logout={logout} />} />

        <Route path='/admin/jogo/adicionar' element={
          <JogoAdicionar
            logado={usuarioLogado}
            admin={admin}
            logout={logout}
            desenvolvedoras={desenvolvedoras}
            generos={generos}
            plataformas={plataformas}
            adicionaJogo={adicionaJogo}
          />
        } />

        <Route path='/admin/jogo/editar' element={
          <JogoEditar
            jogos={jogos}
            carregaJogos={carregaJogos}
            logado={usuarioLogado}
            admin={admin}
            logout={logout}
            desenvolvedoras={desenvolvedoras}
            generos={generos}
            plataformas={plataformas}
            editaJogo={editaJogo}
            apagaJogo={apagaJogo}
            adicionaRelacaoJogo={adicionaRelacaoJogo}
            removeRelacaoJogo={removeRelacaoJogo}
          />
        } />

        <Route path='/admin/plataforma/adicionar' element={
          <PlataformaAdicionar logado={usuarioLogado} admin={admin} logout={logout} adicionaItem={adicionaItem} />
        } />

        <Route path='/admin/plataforma/editar' element={
          <PlataformaEditar logado={usuarioLogado} admin={admin} logout={logout} plataformas={plataformas} editaItem={editaItem} apagaItem={apagaItem} />
        } />

        <Route path='/admin/genero/adicionar' element={
          <GeneroAdicionar logado={usuarioLogado} admin={admin} logout={logout} adicionaItem={adicionaItem} />
        } />

        <Route path='/admin/genero/editar' element={
          <GeneroEditar logado={usuarioLogado} admin={admin} logout={logout} generos={generos} editaItem={editaItem} apagaItem={apagaItem} />
        } />

        <Route path='/admin/desenvolvedora/adicionar' element={
          <DesenvolvedoraAdicionar logado={usuarioLogado} admin={admin} logout={logout} adicionaItem={adicionaItem} />
        } />

        <Route path='/admin/desenvolvedora/editar' element={
          <DesenvolvedoraEditar logado={usuarioLogado} admin={admin} logout={logout} desenvolvedoras={desenvolvedoras} editaItem={editaItem} apagaItem={apagaItem} />
        } />

        <Route path='/admin/usuarios' element={
          <UsuariosGerenciar logado={usuarioLogado} admin={admin} logout={logout} usuarios={usuarios} apagaUsuario={apagaUsuario} />
        } />

      </Routes>
    </>
  )
}


export default App
