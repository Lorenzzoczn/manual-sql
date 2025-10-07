import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Usuario from '../models/Usuario.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  const { status, tipoUsuario, page = 1, limit = 20, search } = req.query;
  const filtro = {};
  if (status) filtro.status = status;
  if (tipoUsuario) filtro.tipoUsuario = tipoUsuario;
  if (search) filtro.$or = [{ nome: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Usuario.find(filtro).sort({ dataCriacao: -1 }).skip(skip).limit(Number(limit)),
    Usuario.countDocuments(filtro),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

router.get('/:id', requireAuth, async (req, res) => {
  const item = await Usuario.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Não encontrado' });
  res.json(item);
});

router.patch(
  '/:id/status',
  requireAuth,
  requireAdmin,
  [body('status').isIn(['ativo', 'inativo', 'pendente_aprovacao'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const item = await Usuario.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status, atualizadoPor: req.user.id },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Não encontrado' });
    res.json(item);
  }
);

export default router;


