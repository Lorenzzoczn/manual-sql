import mongoose from 'mongoose';

const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const telefoneRegex = /^[0-9()\-+\s]{10,20}$/;
const cepRegex = /^[0-9]{5}-?[0-9]{3}$/;

const clienteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, maxlength: 150 },
    cpf: { type: String, required: true, unique: true, match: /^[0-9]{11}$/ },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    tipoCliente: { type: String, enum: ['proprietário', 'síndico', 'administrador', 'morador', 'visitante'], required: true },
    telefone: { type: String, validate: (v) => !v || telefoneRegex.test(v) },
    email: { type: String, validate: (v) => !v || emailRegex.test(v) },
    endereco: { type: String },
    cidade: { type: String },
    estado: { type: String, maxlength: 2 },
    cep: { type: String, validate: (v) => !v || cepRegex.test(v) },
    dataNascimento: { type: Date },
    sexo: { type: String, enum: ['M', 'F', 'O'] },
    status: { type: String, enum: ['ativo', 'inativo', 'pendente_aprovacao'], default: 'pendente_aprovacao', index: true },
    criadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
    atualizadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  },
  { timestamps: { createdAt: 'dataCriacao', updatedAt: 'dataAtualizacao' } }
);

clienteSchema.index({ cpf: 1 }, { unique: true });
clienteSchema.index({ nome: 1 });
clienteSchema.index({ usuario: 1 });
clienteSchema.index({ tipoCliente: 1 });
clienteSchema.index({ status: 1 });
clienteSchema.index({ dataCriacao: 1 });

export default mongoose.model('Cliente', clienteSchema);


