import './App.css'
import { Route, Routes } from "react-router-dom"
import Principal from './pages/principal/Principal'
import Cadastro from './pages/cadastro/Cadastro';
import { useState } from 'react';
import { useEffect } from 'react';

function App() {
  const [usuarios, setUsuarios] = useState({});
  const [jogos, setJogos] = useState({});

  async function carregaUsuarios() {
    
    try {
      
      const res = await fetch("http://localhost:3000/usuario");

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
      const res = await fetch("http://localhost:3000/jogo");

      if (!res.ok) {
        return;
      }

      const jogosJson = await res.json();

      let dicJogos = {}
      for (const jogo of jogosJson) {
        dicJogos[jogo.id_jogo] = jogo
      }

      setJogos(dicJogos);

      console.log(dicJogos);

    } catch (error) {
      console.log(error);
    }


  }

  async function cadastraUsuario(usuario) {

    let option = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario)
    }

    try {

      let cadastro = await fetch("http://localhost:3000/usuario", option);

      if (!cadastro.ok) {
        const erro = await cadastro.json();
        throw new Error(erro.message);
      }

      console.log("Oii");

      carregaUsuarios();

    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    carregaJogos();
    carregaUsuarios();
  }, [])

  return (
    <>
      <Routes>

        <Route path='/' element={
          <Principal jogos={jogos} usuarios={usuarios}></Principal>
        }></Route>

        <Route path='/cadastro' element={
          <Cadastro addUsuario={cadastraUsuario} />
        } />

      </Routes>
    </>
  )
}

export default App
