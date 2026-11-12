import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Paciente from './components/Paciente';
import Perfil from './components/Perfil';
import FormGlasgow from './components/FormGlasgow';
import FormBraden from './components/FormBraden';
import FormMorse from './components/FormMorse';
import FormRass from './components/FormRass';
import Historico from './components/Historico';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('neurorisco_token') || '');
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('neurorisco_usuario')) || null);
  const [abaAtiva, setAbaAtiva] = useState('pacientes');
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);

  const handleLogout = () => {
    setToken('');
    setUsuario(null);
    setPacienteSelecionado(null);
    localStorage.removeItem('neurorisco_token');
    localStorage.removeItem('neurorisco_usuario');
  };

  const apiFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401 || response.status === 403) {
      handleLogout();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    return response;
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('neurorisco_token', token);
    } else {
      localStorage.removeItem('neurorisco_token');
    }
  }, [token]);

  useEffect(() => {
    if (usuario) {
      localStorage.setItem('neurorisco_usuario', JSON.stringify(usuario));
    } else {
      localStorage.removeItem('neurorisco_usuario');
    }
  }, [usuario]);

  const handleLoginSucesso = (tokenRecebido, usuarioRecebido) => {
    setToken(tokenRecebido);
    setUsuario(usuarioRecebido);
    setAbaAtiva('pacientes');
  };

  const handleAtualizarUsuario = (novoToken, novoUsuario) => {
    setToken(novoToken);
    setUsuario(novoUsuario);
  };

  if (!token || !usuario) {
    return <Login onLoginSucesso={handleLoginSucesso} />;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <h1>NeuroRisco</h1>
          <p>Apoio à Decisão Clínica e SAE em Neurologia</p>
        </div>
        <div className="header-user">
          <div className="user-info" onClick={() => setAbaAtiva('perfil')} title="Editar Perfil">
            <span><strong>{usuario.nome}</strong></span>
            <span>COREN: {usuario.coren}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {pacienteSelecionado && (
        <div className="paciente-ativo-banner">
          <span>Paciente em atendimento: <strong>{pacienteSelecionado.iniciais}</strong> (Leito: <strong>{pacienteSelecionado.leito}</strong>)</span>
          <button onClick={() => setPacienteSelecionado(null)} className="btn-limpar-paciente">Trocar / Desvincular</button>
        </div>
      )}

      <nav className="app-nav">
        <button
          className={abaAtiva === 'pacientes' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('pacientes')}
        >
          Pacientes
        </button>
        <button
          className={abaAtiva === 'glasgow' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('glasgow')}
        >
          Glasgow
        </button>
        <button
          className={abaAtiva === 'braden' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('braden')}
        >
          Braden
        </button>
        <button
          className={abaAtiva === 'morse' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('morse')}
        >
          Morse
        </button>
        <button
          className={abaAtiva === 'rass' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('rass')}
        >
          RASS
        </button>
        <button
          className={abaAtiva === 'historico' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('historico')}
        >
          Histórico Geral
        </button>
        <button
          className={abaAtiva === 'perfil' ? 'nav-btn active' : 'nav-btn'}
          onClick={() => setAbaAtiva('perfil')}
        >
          Meu Perfil
        </button>
      </nav>

      <main className="app-main">
        {abaAtiva === 'pacientes' && (
          <Paciente
            token={token}
            apiFetch={apiFetch}
            onSelecionarPaciente={(pac) => {
              setPacienteSelecionado(pac);
              setAbaAtiva('glasgow');
            }}
          />
        )}
        {abaAtiva === 'glasgow' && (
          <FormGlasgow
            token={token}
            apiFetch={apiFetch}
            pacienteSelecionado={pacienteSelecionado}
            onAvaliacaoSalva={() => setAbaAtiva('historico')}
          />
        )}
        {abaAtiva === 'braden' && (
          <FormBraden
            token={token}
            apiFetch={apiFetch}
            pacienteSelecionado={pacienteSelecionado}
            onAvaliacaoSalva={() => setAbaAtiva('historico')}
          />
        )}
        {abaAtiva === 'morse' && (
          <FormMorse
            token={token}
            apiFetch={apiFetch}
            pacienteSelecionado={pacienteSelecionado}
            onAvaliacaoSalva={() => setAbaAtiva('historico')}
          />
        )}
        {abaAtiva === 'rass' && (
          <FormRass
            token={token}
            apiFetch={apiFetch}
            pacienteSelecionado={pacienteSelecionado}
            onAvaliacaoSalva={() => setAbaAtiva('historico')}
          />
        )}
        {abaAtiva === 'historico' && (
          <Historico token={token} apiFetch={apiFetch} />
        )}
        {abaAtiva === 'perfil' && (
          <Perfil token={token} apiFetch={apiFetch} onAtualizarUsuario={handleAtualizarUsuario} />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; NeuroRisco - Sistematização da Assistência de Enfermagem em Neurologia e Neurointensivismo.</p>
      </footer>
    </div>
  );
}

export default App;