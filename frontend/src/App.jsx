import { useState } from 'react'
import './App.css'
import { Route, Routes, useNavigate } from "react-router-dom"
import Principal from './pages/principal/Principal'
import Cadastro from './pages/cadastro/Cadastro';

function App() {
  const [jogos, setJogos] = useState([]);

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

    } catch (error) {
      console.log(error)
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




    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Routes>

        <Route path='/' element={
          <Principal
            listaJogos={jogos}

          />}
        />

        <Route path='/cadastro' element={
          <Cadastro addUsuario={cadastraUsuario} />
        } />

      </Routes>
    </>
  )
}

export default App
