import React, { useState } from 'react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

export default function Login({ onLoginSucesso }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [coren, setCoren] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    // Rota corrigida para /api/auth/register (alinhada com o server.js)
    const url = modoCadastro 
      ? `${BASE_URL}/api/auth/register` 
      : `${BASE_URL}/api/auth/login`;

    try {
      if (modoCadastro) {
        await axios.post(url, { nome, coren, email, senha });
        alert('Cadastro realizado com sucesso! Agora faça o login.');
        setModoCadastro(false);
        setNome('');
        setCoren('');
        setEmail('');
        setSenha('');
      } else {
        const res = await axios.post(url, { email, senha });
        localStorage.setItem('neurorisco_token', res.data.token);
        localStorage.setItem('neurorisco_usuario', JSON.stringify(res.data.usuario));
        if (onLoginSucesso) {
          onLoginSucesso(res.data.usuario, res.data.token);
        }
      }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao conectar com o servidor.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <header style={{ display: 'block', textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1>NeuroRisco</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Acesso Restrito - Enfermagem Neurológica</p>
      </header>

      <div className="card">
        <h2>{modoCadastro ? 'Criar Conta Profissional' : 'Entrar no Sistema'}</h2>
        {erro && <div className="error-message">{erro}</div>}

        <form onSubmit={handleSubmit}>
          {modoCadastro && (
            <>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input 
                  type="text" 
                  value={nome} 
                  onChange={(e) => setNome(e.target.value)} 
                  placeholder="Ex: Ana Maria Souza"
                  required 
                />
              </div>
              <div className="form-group">
                <label>COREN (Ex: COREN-CE 123456):</label>
                <input 
                  type="text" 
                  value={coren} 
                  onChange={(e) => setCoren(e.target.value)} 
                  placeholder="Ex: COREN-CE 123456"
                  required 
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label>E-mail:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu.email@enfermagem.com"
              required 
            />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input 
              type="password" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? 'Processando...' : (modoCadastro ? 'Cadastrar' : 'Acessar Plantão')}
          </button>
        </form>

        <button 
          type="button" 
          onClick={() => { setModoCadastro(!modoCadastro); setErro(''); }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-color)',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginTop: '1.25rem',
            width: '100%',
            textAlign: 'center'
          }}
        >
          {modoCadastro ? 'Já tem conta? Faça login' : 'Primeiro acesso? Criar conta de residente'}
        </button>
      </div>
    </div>
  );
}