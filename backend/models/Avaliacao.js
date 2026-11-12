const mongoose = require('mongoose');

const AvaliacaoSchema = new mongoose.Schema({
  pacienteIniciais: { type: String, required: true, uppercase: true, trim: true },
  leito: { type: String, required: true, trim: true },
  tipoEscala: { 
    type: String, 
    required: true,
    enum: ['GLASGOW_P', 'BRADEN', 'MORSE', 'RASS']
  },
  respostas: { type: Map, of: mongoose.Schema.Types.Mixed, required: true },
  pontuacaoTotal: { type: Number, required: true },
  classificacaoRisco: { type: String, required: true },
  condutasSugeridas: [{ type: String }],
  observacoes: { type: String },
  avaliadorNome: { type: String, required: true },
  avaliadorCoren: { type: String, required: true },
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  dataAvaliacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Avaliacao', AvaliacaoSchema);
