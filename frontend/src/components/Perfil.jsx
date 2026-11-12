import React, { useState, useEffect } from 'react';

function Perfil({ token, onAtualizarUsuario }) {
  const [nome, setNome] = useState('');
  const [coren, setCoren] = useState('');
  const [email, setEmail] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://neurorisco-api.onrender.com';

  useEffect(() => {
    const buscarPerfil = async () => {
      try {
        setCarregando(true);
        const response = await fetch(`${API_URL}/api/auth/perfil`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setNome(data.nome);
          setCoren(data.coren);
          setEmail(data.email);
        } else {
          setErro(data.erro || 'Erro ao carregar perfil.');
        }
      } catch (err) {
        setErro('Erro de conexão ao carregar perfil.');
      } finally {
        setCarregando(false);
      }
    };

    buscarPerfil();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (novaSenha && novaSenha !== confirmarSenha) {
      setErro('A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      const payload = { nome, coren };
      if (novaSenha) {
        payload.senhaAtual = senhaAtual;
        payload.novaSenha = novaSenha;
      }

      const response = await fetch(`${API_URL}/api/auth/perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (response.ok) {
        setSucesso('Perfil atualizado com sucesso.');
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
        if (data.token && data.usuario) {
          onAtualizarUsuario(data.token, data.usuario);
        }
      } else {
        setErro(data.erro || 'Erro ao atualizar perfil.');
      }
    } catch (err) {
      setErro('Erro de conexão ao atualizar perfil.');
    }
  };

  if (carregando) {
    return <div className="perfil-container"><p>Carregando perfil...</p></div>;
  }

  return (
    <div className="perfil-container">
      <h2>Perfil do Profissional</h2>
      
      {erro && <div className="error-message">{erro}</div>}
      {sucesso && <div className="success-message">{sucesso}</div>}

      <form onSubmit={handleSubmit} className="perfil-form">
        <div className="form-group">
          <label>E-mail (Não pode ser alterado)</label>
          <input type="email" value={email} disabled className="input-disabled" />
        </div>

        <div className="form-group">
          <label>Nome Completo</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>COREN</label>
          <input
            type="text"
            value={coren}
            onChange={(e) => setCoren(e.target.value)}
            required
          />
        </div>

        <hr className="form-divider" />
        <h3>Alterar Senha (Opcional)</h3>

        <div className="form-group">
          <label>Senha Atual</label>
          <input
            type="password"
            placeholder="Digite a senha atual para alterar"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Nova Senha</label>
          <input
            type="password"
            placeholder="Digite a nova senha"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Confirmar Nova Senha</label>
          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary">Salvar Alterações</button>
      </form>
    </div>
  );
}

export default Perfil;