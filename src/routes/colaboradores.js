import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import Colaborador from '../models/Colaborador.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { status, page = 1, limit = 20, search, tipoColaborador } = req.query;
  const filtro = {};
  if (status) filtro.status = status;
  if (tipoColaborador) filtro.tipoColaborador = tipoColaborador;
  if (search) filtro.$or = [{ nomeEmpresa: new RegExp(search, 'i') }, { responsavel: new RegExp(search, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Colaborador.find(filtro).sort({ dataCriacao: -1 }).skip(skip).limit(Number(limit)),
    Colaborador.countDocuments(filtro),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

router.post(
  '/',
  requireAuth,
  [body('nomeEmpresa').notEmpty(), body('cnpj').isLength({ min: 14, max: 14 }).isNumeric(), body('tipoColaborador').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const doc = await Colaborador.create({ ...req.body, usuario: req.user.id, criadoPor: req.user.id });
      res.status(201).json(doc);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'CNPJ já cadastrado' });
      res.status(500).json({ message: 'Erro ao criar colaborador', detail: err.message });
    }
  }
);

router.get('/:id', requireAuth, async (req, res) => {
  const doc = await Colaborador.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Não encontrado' });
  res.json(doc);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const doc = await Colaborador.findByIdAndUpdate(
    req.params.id,
    { ...req.body, atualizadoPor: req.user.id },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: 'Não encontrado' });
  res.json(doc);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Colaborador.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;


