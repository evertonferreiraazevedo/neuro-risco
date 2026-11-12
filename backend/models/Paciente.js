const mongoose = require('mongoose');

const PacienteSchema = new mongoose.Schema(
  {
    iniciais: {
      type: String,
      required: [true, 'As iniciais do paciente são obrigatórias.'],
      trim: true,
      uppercase: true,
      maxlength: [15, 'As iniciais não podem exceder 15 caracteres.']
    },
    leito: {
      type: String,
      required: [true, 'O identificador do leito é obrigatório.'],
      trim: true,
      uppercase: true,
      maxlength: [20, 'O leito não pode exceder 20 caracteres.']
    },
    diagnostico: {
      type: String,
      required: [true, 'O diagnóstico ou hipótese diagnóstica é obrigatório.'],
      trim: true,
      maxlength: [200, 'O diagnóstico não pode exceder 200 caracteres.']
    },
    status: {
      type: String,
      enum: ['ATIVO', 'ALTA'],
      default: 'ATIVO',
      index: true
    },
    dataAdmissao: {
      type: Date,
      default: Date.now
    },
    dataAlta: {
      type: Date,
      default: null
    },
    cadastradoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },
    atualizadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Índice único parcial: garante que o leito seja único estritamente para pacientes ATIVOS
PacienteSchema.index(
  { leito: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'ATIVO' }
  }
);

module.exports = mongoose.model('Paciente', PacienteSchema);