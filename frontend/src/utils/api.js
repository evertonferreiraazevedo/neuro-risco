export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token inválido ou expirado: limpa a sessão e força o logout
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/'; // ou redireciona para a tela de login
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return response;
};