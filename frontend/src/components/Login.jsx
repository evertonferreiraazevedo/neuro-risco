import { useState } from 'react';
import axios from 'axios';

export default function Login({ onLoginSucesso }) {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [coren, setCoren] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    const url = modoCadastro 
      ? 'http://localhost:5000/api/auth/registrar' 
      : 'http://localhost:5000/api/auth/login';

    try {
      if (modoCadastro) {
        await axios.post(url, { nome, coren, email, senha });
        alert('Cadastro realizado com sucesso! Agora faca o login.');
        setModoCadastro(false);
      } else {
        const res = await axios.post(url, { email, senha });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
        onLoginSucesso(res.data.usuario, res.data.token);
      }
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao conectar com o servidor.');
    }
  };

  return (
    <div className="login-container">
      <header style={{ display: 'block', textAlign: 'center' }}>
        <h1>NeuroRisco</h1>
        <p>Acesso Restrito - Enfermagem Neurologica</p>
      </header>

      <div className="card">
        <h2>{modoCadastro ? 'Criar Conta Profissional' : 'Entrar no Sistema'}</h2>
        {erro && <p style={{ color: '#dc2626', marginBottom: '10px', fontSize: '0.9rem' }}>{erro}</p>}

        <form onSubmit={handleSubmit}>
          {modoCadastro && (
            <>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>COREN (Ex: COREN-CE 123456):</label>
                <input type="text" value={coren} onChange={(e) => setCoren(e.target.value)} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label>E-mail:</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Senha:</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
          </div>

          <button type="submit" className="btn-salvar">
            {modoCadastro ? 'Cadastrar' : 'Acessar Plantao'}
          </button>
        </form>

        <button type="button" className="link-alternar" onClick={() => setModoCadastro(!modoCadastro)}>
          {modoCadastro ? 'Ja tem conta? Faca login' : 'Primeiro acesso? Criar conta de residente'}
        </button>
      </div>
    </div>
  );
}
