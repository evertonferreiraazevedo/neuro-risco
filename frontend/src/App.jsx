import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import Login from './components/Login';
import FormGlasgow from './components/FormGlasgow';
import FormBraden from './components/FormBraden';
import FormMorse from './components/FormMorse';
import FormRass from './components/FormRass';
import Historico from './components/Historico';

const API_URL = 'http://localhost:5000/api/avaliacoes';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('GLASGOW_P');
  const [historico, setHistorico] = useState([]);

  // Recupera sessao salva caso a pagina seja atualizada
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');
    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);

  // Carrega historico sempre que o token estiver disponivel
  useEffect(() => {
    if (token) carregarHistorico();
  }, [token]);

  const carregarHistorico = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistorico(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const handleSalvarAvaliacao = async (dados) => {
    try {
      await axios.post(API_URL, dados, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Avaliacao registrada com sucesso!');
      carregarHistorico();
    } catch (err) {
      alert('Erro ao salvar avaliacao.');
    }
  };

  const handleExcluirAvaliacao = async (id) => {
    if (!window.confirm('Deseja realmente excluir este registro?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      carregarHistorico();
    } catch (err) {
      alert('Erro ao excluir.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuario(null);
    setToken(null);
    setHistorico([]);
  };

  // Se nao estiver logado, exibe apenas a tela de Login
  if (!token || !usuario) {
    return <Login onLoginSucesso={(user, tok) => { setUsuario(user); setToken(tok); }} />;
  }

  return (
    <div className="container">
      <header>
        <div>
          <h1>NeuroRisco - Enfermagem</h1>
          <p>Enf. {usuario.nome} ({usuario.coren})</p>
        </div>
        <button type="button" className="btn-sair" onClick={handleLogout}>Sair</button>
      </header>

      {/* MENU DE ABAS DAS ESCALAS */}
      <div className="tabs">
        <button className={`tab-btn ${abaAtiva === 'GLASGOW_P' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('GLASGOW_P')}>
          Glasgow-P
        </button>
        <button className={`tab-btn ${abaAtiva === 'BRADEN' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('BRADEN')}>
          Escala de Braden
        </button>
        <button className={`tab-btn ${abaAtiva === 'MORSE' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('MORSE')}>
          Escala de Morse
        </button>
        <button className={`tab-btn ${abaAtiva === 'RASS' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('RASS')}>
          Escala RASS
        </button>
      </div>

      {/* FORMULARIO DA ESCALA SELECIONADA */}
      {abaAtiva === 'GLASGOW_P' && <FormGlasgow onSalvar={handleSalvarAvaliacao} />}
      {abaAtiva === 'BRADEN' && <FormBraden onSalvar={handleSalvarAvaliacao} />}
      {abaAtiva === 'MORSE' && <FormMorse onSalvar={handleSalvarAvaliacao} />}
      {abaAtiva === 'RASS' && <FormRass onSalvar={handleSalvarAvaliacao} />}

      {/* HISTORICO UNIFICADO */}
      <Historico lista={historico} onExcluir={handleExcluirAvaliacao} />
    </div>
  );
}

export default App;
