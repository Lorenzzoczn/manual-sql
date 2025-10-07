import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const telefoneRegex = /^[0-9()\-+\s]{10,20}$/;
const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;

const usuarioSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: { validator: (v) => emailRegex.test(v), message: 'Email inválido' },
    },
    senhaHash: { type: String, required: true },
    tipoUsuario: {
      type: String,
      enum: ['empresa', 'profissional', 'colaborador', 'cliente_final', 'admin'],
      required: true,
    },
    cpfCnpj: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (v) => (v?.length === 11 || v?.length === 14) && /^[0-9]+$/.test(v),
        message: 'CPF/CNPJ inválido',
      },
    },
    telefone: { type: String, validate: (v) => !v || telefoneRegex.test(v) },
    endereco: { type: String },
    cidade: { type: String },
    estado: { type: String, maxlength: 2 },
    cep: { type: String, validate: (v) => !v || cepRegex.test(v) },
    status: {
      type: String,
      enum: ['ativo', 'inativo', 'pendente_aprovacao'],
      default: 'pendente_aprovacao',
      index: true,
    },
    ultimoAcesso: { type: Date },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    atualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } }
);

usuarioSchema.index({ email: 1 }, { unique: true });
usuarioSchema.index({ cpfCnpj: 1 }, { unique: true });
usuarioSchema.index({ tipoUsuario: 1 });
usuarioSchema.index({ status: 1 });
usuarioSchema.index({ dataCriacao: 1 });

usuarioSchema.methods.setPassword = async function (senha) {
  const salt = await bcrypt.genSalt(10);
  this.senhaHash = await bcrypt.hash(senha, salt);
};

usuarioSchema.methods.validatePassword = async function (senha) {
  return bcrypt.compare(senha, this.senhaHash);
};

usuarioSchema.pre('save', function (next) {
  // Atualiza ultimoAcesso quando status muda para ativo
  if (this.isModified('status') && this.status === 'ativo') {
    this.ultimoAcesso = new Date();
  }
  next();
});

export default mongoose.model('Usuario', usuarioSchema);


