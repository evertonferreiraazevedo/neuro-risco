const mongoose = require('mongoose');

const AvaliacaoSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paciente',
      default: null,
      index: true
    },
    iniciais: {
      type: String,
      required: [true, 'As iniciais do paciente são obrigatórias.'],
      trim: true,
      uppercase: true
    },
    leito: {
      type: String,
      required: [true, 'O leito do paciente é obrigatório.'],
      trim: true,
      uppercase: true
    },
    escala: {
      type: String,
      required: [true, 'O tipo da escala clínica é obrigatório.'],
      enum: ['GLASGOW', 'BRADEN', 'MORSE', 'RASS'],
      uppercase: true,
      index: true
    },
    pontuacao: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'A pontuação da escala é obrigatória.']
    },
    classificacao: {
      type: String,
      required: [true, 'A classificação clínica é obrigatória.'],
      trim: true
    },
    detalhes: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    condutasSae: {
      type: [String],
      default: []
    },
    textoProntuario: {
      type: String,
      required: [true, 'O texto formatado para prontuário é obrigatório.']
    },
    avaliadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    avaliadorNome: {
      type: String,
      required: true,
      trim: true
    },
    avaliadorCoren: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

AvaliacaoSchema.index({ pacienteId: 1, createdAt: -1 });
AvaliacaoSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Avaliacao', AvaliacaoSchema);