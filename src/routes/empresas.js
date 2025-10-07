import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import Empresa from '../models/Empresa.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  const filtro = {};
  if (status) filtro.status = status;
  if (search) filtro.$or = [{ razaoSocial: new RegExp(search, 'i') }, { nomeFantasia: new RegExp(search, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Empresa.find(filtro).sort({ dataCriacao: -1 }).skip(skip).limit(Number(limit)),
    Empresa.countDocuments(filtro),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

router.post(
  '/',
  requireAuth,
  [
    body('razaoSocial').isString().notEmpty(),
    body('cnpj').isLength({ min: 14, max: 14 }).isNumeric(),
    body('responsavel').isString().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const doc = await Empresa.create({ ...req.body, usuario: req.user.id, criadoPor: req.user.id });
      res.status(201).json(doc);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'CNPJ já cadastrado' });
      res.status(500).json({ message: 'Erro ao criar empresa', detail: err.message });
    }
  }
);

router.get('/:id', requireAuth, async (req, res) => {
  const doc = await Empresa.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Não encontrado' });
  res.json(doc);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const doc = await Empresa.findByIdAndUpdate(req.params.id, { ...req.body, atualizadoPor: req.user.id }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Não encontrado' });
  res.json(doc);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Empresa.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;


