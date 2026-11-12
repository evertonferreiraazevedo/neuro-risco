import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Perfil from './components/Perfil';
import Paciente from './components/Paciente';
import Historico from './components/Historico';
import FormGlasgow from './components/FormGlasgow';
import FormBraden from './components/FormBraden';
import FormMorse from './components/FormMorse';
import FormRass from './components/FormRass';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('neurorisco_token') || '');
  const [usuario, setUsuario] = useState(JSON.parse(localStorage.getItem('neurorisco_usuario')) || null);
  const [abaAtiva, setAbaAtiva] = useState('pacientes');
  const [escalaAtiva, setEscalaAtiva] = useState('glasgow'); // Sub-aba para as escalas
  const [pacienteSelecionado, setPacienteSelecionado] = useState(null);
  
  const [darkMode, setDarkMode] = useState(localStorage.getItem('neurorisco_dark_mode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('neurorisco_dark_mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('neurorisco_dark_mode', 'false');
    }
  }, [darkMode]);

  const toggleTema = () => setDarkMode(!darkMode);

  const apiFetch = async (url, options = {}) => {
    const currentToken = localStorage.getItem('neurorisco_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      ...(options.headers || {})
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem('neurorisco_token');
      localStorage.removeItem('neurorisco_usuario');
      setToken('');
      setUsuario(null);
      alert('Sessão expirada. Faça login novamente.');
      throw new Error('Sessão expirada.');
    }

    return response;
  };

  const handleLoginSucesso = (dadosUsuario, novoToken) => {
    localStorage.setItem('neurorisco_token', novoToken);
    localStorage.setItem('neurorisco_usuario', JSON.stringify(dadosUsuario));
    setToken(novoToken);
    setUsuario(dadosUsuario);
    setAbaAtiva('pacientes');
  };

  const handleLogout = () => {
    localStorage.removeItem('neurorisco_token');
    localStorage.removeItem('neurorisco_usuario');
    setToken('');
    setUsuario(null);
    setPacienteSelecionado(null);
  };

  if (!token) {
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
          <button className="btn-theme-toggle" onClick={toggleTema}>
            {darkMode ? '☀️ Modo Claro' : '🌙 Modo Escuro'}
          </button>
          <div className="user-info" onClick={() => setAbaAtiva('perfil')}>
            <span><strong>{usuario?.nome}</strong></span>
            <span>COREN: {usuario?.coren}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sair</button>
        </div>
      </header>

      {pacienteSelecionado && (
        <div className="paciente-ativo-banner">
          <span>
            <strong>Paciente em Atendimento:</strong> {pacienteSelecionado.iniciais} (Leito: {pacienteSelecionado.leito}) - {pacienteSelecionado.diagnostico}
          </span>
          <button className="btn-limpar-paciente" onClick={() => setPacienteSelecionado(null)}>
            Trocar / Desselecionar
          </button>
        </div>
      )}

      {/* Menu de Navegação Principal */}
      <nav className="app-nav">
        <button className={`nav-btn ${abaAtiva === 'pacientes' ? 'active' : ''}`} onClick={() => setAbaAtiva('pacientes')}>
          Pacientes (LGPD)
        </button>
        <button className={`nav-btn ${abaAtiva === 'escalas' ? 'active' : ''}`} onClick={() => setAbaAtiva('escalas')}>
          Escalas Clínicas (SAE)
        </button>
        <button className={`nav-btn ${abaAtiva === 'historico' ? 'active' : ''}`} onClick={() => setAbaAtiva('historico')}>
          Histórico Geral
        </button>
        <button className={`nav-btn ${abaAtiva === 'perfil' ? 'active' : ''}`} onClick={() => setAbaAtiva('perfil')}>
          Meu Perfil
        </button>
      </nav>

      {/* Sub-menu de Escalas (Aparece apenas quando a aba principal for 'escalas') */}
      {abaAtiva === 'escalas' && (
        <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 2.5rem', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          <button className={`nav-btn ${escalaAtiva === 'glasgow' ? 'active' : ''}`} onClick={() => setEscalaAtiva('glasgow')}>Glasgow</button>
          <button className={`nav-btn ${escalaAtiva === 'braden' ? 'active' : ''}`} onClick={() => setEscalaAtiva('braden')}>Braden</button>
          <button className={`nav-btn ${escalaAtiva === 'morse' ? 'active' : ''}`} onClick={() => setEscalaAtiva('morse')}>Morse</button>
          <button className={`nav-btn ${escalaAtiva === 'rass' ? 'active' : ''}`} onClick={() => setEscalaAtiva('rass')}>RASS</button>
        </div>
      )}

      <main className="app-main">
        {abaAtiva === 'pacientes' && (
          <Paciente 
            token={token} 
            apiFetch={apiFetch} 
            usuario={usuario}
            onSelecionarPaciente={(pac) => {
              setPacienteSelecionado(pac);
              setAbaAtiva('escalas');
            }} 
          />
        )}

        {abaAtiva === 'escalas' && (
          <>
            {escalaAtiva === 'glasgow' && <FormGlasgow token={token} apiFetch={apiFetch} usuario={usuario} pacienteSelecionado={pacienteSelecionado} />}
            {escalaAtiva === 'braden' && <FormBraden token={token} apiFetch={apiFetch} usuario={usuario} pacienteSelecionado={pacienteSelecionado} />}
            {escalaAtiva === 'morse' && <FormMorse token={token} apiFetch={apiFetch} usuario={usuario} pacienteSelecionado={pacienteSelecionado} />}
            {escalaAtiva === 'rass' && <FormRass token={token} apiFetch={apiFetch} usuario={usuario} pacienteSelecionado={pacienteSelecionado} />}
          </>
        )}

        {abaAtiva === 'historico' && <Historico token={token} apiFetch={apiFetch} />}
        {abaAtiva === 'perfil' && <Perfil token={token} apiFetch={apiFetch} usuario={usuario} onAtualizarUsuario={(u) => setUsuario(u)} />}
      </main>

      <footer className="app-footer">
        <p>NeuroRisco &copy; {new Date().getFullYear()} - Sistema de Apoio à Decisão Clínica em Enfermagem Neurológica</p>
      </footer>
    </div>
  );
}

export default App;