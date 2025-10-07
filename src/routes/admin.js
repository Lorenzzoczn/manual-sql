import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import Usuario from '../models/Usuario.js';
import Empresa from '../models/Empresa.js';
import Profissional from '../models/Profissional.js';
import Colaborador from '../models/Colaborador.js';
import Cliente from '../models/Cliente.js';

const router = Router();

router.post(
  '/usuarios/:id/aprovar',
  requireAuth,
  requireAdmin,
  async (req, res) => {
    const { id } = req.params;
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado' });
    if (usuario.status !== 'pendente_aprovacao') return res.status(400).json({ message: 'Usuário não está pendente' });

    usuario.status = 'ativo';
    usuario.atualizadoPor = req.user.id;
    await usuario.save();

    if (usuario.tipoUsuario === 'empresa') await Empresa.updateMany({ usuario: usuario._id }, { status: 'ativa' });
    if (usuario.tipoUsuario === 'profissional') await Profissional.updateMany({ usuario: usuario._id }, { status: 'ativo' });
    if (usuario.tipoUsuario === 'colaborador') await Colaborador.updateMany({ usuario: usuario._id }, { status: 'ativo' });
    if (usuario.tipoUsuario === 'cliente_final') await Cliente.updateMany({ usuario: usuario._id }, { status: 'ativo' });

    res.json({ message: 'Usuário aprovado com sucesso' });
  }
);

router.get('/estatisticas', requireAuth, requireAdmin, async (req, res) => {
  const [usuariosAtivos, usuariosPendentes, empresasAtivas, profissionaisAtivos, colaboradoresAtivos, clientesAtivos, novosUsuarios30d] =
    await Promise.all([
      Usuario.countDocuments({ status: 'ativo' }),
      Usuario.countDocuments({ status: 'pendente_aprovacao' }),
      Empresa.countDocuments({ status: 'ativa' }),
      Profissional.countDocuments({ status: 'ativo' }),
      Colaborador.countDocuments({ status: 'ativo' }),
      Cliente.countDocuments({ status: 'ativo' }),
      Usuario.countDocuments({ dataCriacao: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    ]);
  res.json({ usuariosAtivos, usuariosPendentes, empresasAtivas, profissionaisAtivos, colaboradoresAtivos, clientesAtivos, novosUsuarios30d });
});

export default router;


