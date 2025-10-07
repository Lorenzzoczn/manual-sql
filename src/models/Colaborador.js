import mongoose from 'mongoose';

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const telefoneRegex = /^[0-9()\-+\s]{10,20}$/;
const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;
const siteRegex = /^https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

const colaboradorSchema = new mongoose.Schema(
  {
    nomeEmpresa: { type: String, required: true, maxlength: 150 },
    cnpj: { type: String, required: true, unique: true, match: /^[0-9]{14}$/ },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipoColaborador: {
      type: String,
      enum: ['fabricante', 'fornecedor', 'instalador', 'projetista', 'consultor', 'distribuidor', 'representante'],
      required: true,
    },
    responsavel: { type: String, required: true, maxlength: 150 },
    telefone: { type: String, validate: (v) => !v || telefoneRegex.test(v) },
    email: { type: String, validate: (v) => !v || emailRegex.test(v) },
    endereco: { type: String },
    cidade: { type: String },
    estado: { type: String, maxlength: 2 },
    cep: { type: String, validate: (v) => !v || cepRegex.test(v) },
    site: { type: String, validate: (v) => !v || siteRegex.test(v) },
    status: { type: String, enum: ['ativo', 'inativo', 'pendente_aprovacao'], default: 'pendente_aprovacao', index: true },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    atualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } }
);

colaboradorSchema.index({ cnpj: 1 }, { unique: true });
colaboradorSchema.index({ nomeEmpresa: 1 });
colaboradorSchema.index({ usuario: 1 });
colaboradorSchema.index({ tipoColaborador: 1 });
colaboradorSchema.index({ status: 1 });
colaboradorSchema.index({ dataCriacao: 1 });

export default mongoose.model('Colaborador', colaboradorSchema);


