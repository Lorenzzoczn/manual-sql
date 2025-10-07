import mongoose from 'mongoose';

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const telefoneRegex = /^[0-9()\-+\s]{10,20}$/;
const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
const siteRegex = /^https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

const empresaSchema = new mongoose.Schema(
  {
    razaoSocial: { type: String, required: true, trim: true, maxlength: 150 },
    nomeFantasia: { type: String, trim: true, maxlength: 150 },
    cnpj: { type: String, required: true, unique: true, match: /^[0-9]{14}$/ },
    responsavel: { type: String, required: true, maxlength: 150 },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    inscricaoEstadual: { type: String },
    inscricaoMunicipal: { type: String },
    emailCorporativo: { type: String, validate: (v) => !v || emailRegex.test(v) },
    telefone: { type: String, validate: (v) => !v || telefoneRegex.test(v) },
    endereco: { type: String },
    cidade: { type: String },
    estado: { type: String, maxlength: 2 },
    cep: { type: String, validate: (v) => !v || cepRegex.test(v) },
    site: { type: String, validate: (v) => !v || siteRegex.test(v) },
    status: {
      type: String,
      enum: ['ativa', 'inativa', 'pendente_aprovacao'],
      default: 'pendente_aprovacao',
      index: true,
    },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    atualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } }
);

empresaSchema.index({ cnpj: 1 }, { unique: true });
empresaSchema.index({ razaoSocial: 1 });
empresaSchema.index({ usuario: 1 });
empresaSchema.index({ status: 1 });
empresaSchema.index({ dataCriacao: 1 });

export default mongoose.model('Empresa', empresaSchema);


