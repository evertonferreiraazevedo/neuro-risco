const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Usuario = require('./models/Usuario');
const Paciente = require('./models/Paciente');
const Avaliacao = require('./models/Avaliacao');
const auth = require('./middleware/auth');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'neuro_risco_secret_key_jwt';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas com sucesso.'))
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err.message);
    process.exit(1);
  });

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

/* =================================================/
   ROTAS DE AUTENTICAÇÃO
/* ================================================= */

app.post('/api/auth/register', async (req, res) => {
  try {
    const { nome, coren, email, senha } = req.body;
    if (!nome || !coren || !email || !senha) {
      return res.status(400).json({ erro: 'Todos os campos são obrigatórios.' });
    }

    const usuarioExistente = await Usuario.findOne({ $or: [{ email }, { coren }] });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'E-mail ou COREN já cadastrados no sistema.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      coren,
      email,
      senha: senhaHash
    });

    await novoUsuario.save();

    const token = jwt.sign(
      { id: novoUsuario._id, nome: novoUsuario.nome, coren: novoUsuario.coren, email: novoUsuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso.',
      token,
      usuario: {
        id: novoUsuario._id,
        nome: novoUsuario.nome,
        coren: novoUsuario.coren,
        email: novoUsuario.email
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro interno no servidor ao registrar usuário.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, coren: usuario.coren, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      mensagem: 'Login realizado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        coren: usuario.coren,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno no servidor ao realizar login.' });
  }
});

app.get('/api/auth/perfil', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-senha');
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    res.status(200).json(usuario);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar perfil do usuário.' });
  }
});

app.put('/api/auth/perfil', auth, async (req, res) => {
  try {
    const { nome, coren, senhaAtual, novaSenha } = req.body;
    const usuario = await Usuario.findById(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    if (nome) usuario.nome = nome;
    if (coren) {
      const corenExistente = await Usuario.findOne({ coren, _id: { $ne: usuario._id } });
      if (corenExistente) {
        return res.status(400).json({ erro: 'Este COREN já está cadastrado por outro profissional.' });
      }
      usuario.coren = coren;
    }

    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ erro: 'Informe a senha atual para alterar a senha.' });
      }
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Senha atual incorreta.' });
      }
      const salt = await bcrypt.genSalt(10);
      usuario.senha = await bcrypt.hash(novaSenha, salt);
    }

    await usuario.save();

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, coren: usuario.coren, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      mensagem: 'Perfil atualizado com sucesso.',
      token,
      usuario: {
        id: usuario._id,
        nome: usuario.nome,
        coren: usuario.coren,
        email: usuario.email
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
});

/* =================================================/
   ROTAS DE PACIENTES
/* ================================================= */

app.get('/api/pacientes', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const filtro = {};
    if (status) {
      filtro.status = status.toUpperCase();
    }
    const pacientes = await Paciente.find(filtro).sort({ status: 1, leito: 1, createdAt: -1 });
    res.status(200).json(pacientes);
  } catch (error) {
    console.error('Erro ao listar pacientes:', error);
    res.status(500).json({ erro: 'Erro interno ao listar pacientes.' });
  }
});

app.post('/api/pacientes', auth, async (req, res) => {
  try {
    const { iniciais, leito, diagnostico } = req.body;
    if (!iniciais || !leito || !diagnostico) {
      return res.status(400).json({ erro: 'Iniciais, leito e diagnóstico são obrigatórios.' });
    }

    const novoPaciente = new Paciente({
      iniciais,
      leito: leito.trim().toUpperCase(),
      diagnostico,
      status: 'ATIVO',
      cadastradoPor: req.usuario.id
    });

    await novoPaciente.save();
    res.status(201).json(novoPaciente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        erro: 'Já existe um paciente ATIVO alocado neste leito. Verifique o leito informado.'
      });
    }

    console.error('Erro ao cadastrar paciente:', error);
    res.status(500).json({ erro: 'Erro interno ao cadastrar paciente.' });
  }
});

app.put('/api/pacientes/:id', auth, async (req, res) => {
  try {
    const { iniciais, leito, diagnostico, status } = req.body;
    const paciente = await Paciente.findById(req.params.id);

    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado.' });
    }

    const novoStatus = status ? status.toUpperCase() : paciente.status;
    const novoLeito = leito ? leito.trim().toUpperCase() : paciente.leito;

    if (novoStatus === 'ATIVO') {
      const leitoOcupado = await Paciente.findOne({
        leito: novoLeito,
        status: 'ATIVO',
        _id: { $ne: paciente._id }
      });
      if (leitoOcupado) {
        return res.status(400).json({ erro: `O leito ${novoLeito} já está ocupado por outro paciente ativo.` });
      }
    }

    if (iniciais) paciente.iniciais = iniciais;
    paciente.leito = novoLeito;
    if (diagnostico) paciente.diagnostico = diagnostico;

    if (novoStatus !== paciente.status) {
      paciente.status = novoStatus;
      if (paciente.status === 'ALTA') {
        paciente.dataAlta = new Date();
      } else {
        paciente.dataAlta = null;
      }
    }

    paciente.atualizadoPor = req.usuario.id;
    await paciente.save();

    res.status(200).json(paciente);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        erro: 'Já existe um paciente ATIVO alocado neste leito.'
      });
    }
    console.error('Erro ao atualizar paciente:', error);
    res.status(500).json({ erro: 'Erro interno ao atualizar paciente.' });
  }
});

app.patch('/api/pacientes/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['ATIVO', 'ALTA'].includes(status.toUpperCase())) {
      return res.status(400).json({ erro: 'Status inválido. Utilize ATIVO ou ALTA.' });
    }

    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado.' });
    }

    const novoStatus = status.toUpperCase();

    if (novoStatus === 'ATIVO') {
      const leitoOcupado = await Paciente.findOne({
        leito: paciente.leito,
        status: 'ATIVO',
        _id: { $ne: paciente._id }
      });
      if (leitoOcupado) {
        return res.status(400).json({ erro: `Não é possível reativar. O leito ${paciente.leito} já está ocupado por outro paciente ativo.` });
      }
    }

    paciente.status = novoStatus;
    paciente.dataAlta = paciente.status === 'ALTA' ? new Date() : null;
    paciente.atualizadoPor = req.usuario.id;

    await paciente.save();
    res.status(200).json(paciente);
  } catch (error) {
    console.error('Erro ao alterar status do paciente:', error);
    res.status(500).json({ erro: 'Erro interno ao alterar status.' });
  }
});

app.get('/api/pacientes/:id/historico', auth, async (req, res) => {
  try {
    const paciente = await Paciente.findById(req.params.id);
    if (!paciente) {
      return res.status(404).json({ erro: 'Paciente não encontrado.' });
    }

    const avaliacoes = await Avaliacao.find({ pacienteId: req.params.id }).sort({ createdAt: -1 });
    res.status(200).json({ paciente, avaliacoes });
  } catch (error) {
    console.error('Erro ao buscar histórico do paciente:', error);
    res.status(500).json({ erro: 'Erro interno ao buscar histórico do paciente.' });
  }
});

/* =================================================/
   ROTAS DE AVALIAÇÕES
/* ================================================= */

app.get('/api/avaliacoes', auth, async (req, res) => {
  try {
    const { pacienteId } = req.query;
    const filtro = pacienteId ? { pacienteId } : {};
    const avaliacoes = await Avaliacao.find(filtro).sort({ createdAt: -1 });
    res.status(200).json(avaliacoes);
  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({ erro: 'Erro interno ao listar avaliações.' });
  }
});

app.post('/api/avaliacoes', auth, async (req, res) => {
  try {
    const {
      pacienteId,
      iniciais,
      leito,
      escala,
      pontuacao,
      classificacao,
      detalhes,
      condutasSae,
      textoProntuario
    } = req.body;

    if (!iniciais || !leito || !escala || pontuacao === undefined || !classificacao || !textoProntuario) {
      return res.status(400).json({ erro: 'Campos obrigatórios da avaliação ausentes.' });
    }

    let pacienteRef = null;
    if (pacienteId) {
      const pac = await Paciente.findById(pacienteId);
      if (pac) {
        pacienteRef = pac._id;
      }
    }

    const novaAvaliacao = new Avaliacao({
      pacienteId: pacienteRef,
      iniciais,
      leito,
      escala: escala.toUpperCase(),
      pontuacao,
      classificacao,
      detalhes: detalhes || {},
      condutasSae: condutasSae || [],
      textoProntuario,
      avaliadorId: req.usuario.id,
      avaliadorNome: req.usuario.nome,
      avaliadorCoren: req.usuario.coren
    });

    await novaAvaliacao.save();
    res.status(201).json(novaAvaliacao);
  } catch (error) {
    console.error('Erro ao salvar avaliação:', error);
    res.status(500).json({ erro: 'Erro interno ao salvar avaliação.' });
  }
});

app.delete('/api/avaliacoes/:id', auth, async (req, res) => {
  try {
    const avaliacao = await Avaliacao.findById(req.params.id);
    if (!avaliacao) {
      return res.status(404).json({ erro: 'Avaliação não encontrada.' });
    }

    await avaliacao.deleteOne();
    res.status(200).json({ mensagem: 'Avaliação removida com sucesso.' });
  } catch (error) {
    console.error('Erro ao remover avaliação:', error);
    res.status(500).json({ erro: 'Erro interno ao remover avaliação.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});