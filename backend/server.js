require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require('./models/Usuario');
const Avaliacao = require('./models/Avaliacao');
const auth = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('[OK] Conectado ao MongoDB Atlas.'))
  .catch((err) => console.error('[ERRO] Falha no MongoDB:', err));

// --- ROTAS DE AUTENTICACAO ---

// Registrar novo usuario
app.post('/api/auth/registrar', async (req, res) => {
  try {
    const { nome, coren, email, senha } = req.body;
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ erro: 'Este e-mail ja esta cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaCriptografada = await bcrypt.hash(senha, salt);

    const novoUsuario = new Usuario({
      nome,
      coren,
      email,
      senha: senhaCriptografada
    });

    await novoUsuario.save();
    res.status(201).json({ mensagem: 'Usuario cadastrado com sucesso!' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao registrar usuario.', detalhes: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(400).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: usuario._id, nome: usuario.nome, coren: usuario.coren },
      process.env.JWT_SECRET,
      { expiresIn: '12h' } // Duracao de um plantao de 12 horas
    );

    res.json({
      token,
      usuario: { id: usuario._id, nome: usuario.nome, coren: usuario.coren, email: usuario.email }
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao realizar login.' });
  }
});

// --- ROTAS PROTEGIDAS DE AVALIACOES ---

app.post('/api/avaliacoes', auth, async (req, res) => {
  try {
    const novaAvaliacao = new Avaliacao({
      ...req.body,
      avaliadorNome: req.usuario.nome,
      avaliadorCoren: req.usuario.coren,
      usuarioId: req.usuario.id
    });
    const salva = await novaAvaliacao.save();
    res.status(201).json(salva);
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao salvar avaliacao.', detalhes: error.message });
  }
});

app.get('/api/avaliacoes', auth, async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.find({ usuarioId: req.usuario.id }).sort({ dataAvaliacao: -1 });
    res.json(avaliacoes);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar avaliacoes.' });
  }
});

app.delete('/api/avaliacoes/:id', auth, async (req, res) => {
  try {
    await Avaliacao.findOneAndDelete({ _id: req.params.id, usuarioId: req.usuario.id });
    res.json({ mensagem: 'Avaliacao excluida.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir avaliacao.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[INFO] Servidor rodando na porta ${PORT}`));
