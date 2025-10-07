import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import Profissional from '../models/Profissional.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { status, page = 1, limit = 20, search, profissao } = req.query;
  const filtro = {};
  if (status) filtro.status = status;
  if (profissao) filtro.profissao = profissao;
  if (search) filtro.$or = [{ nome: new RegExp(search, 'i') }, { especialidade: new RegExp(search, 'i') }];
  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Profissional.find(filtro).sort({ dataCriacao: -1 }).skip(skip).limit(Number(limit)),
    Profissional.countDocuments(filtro),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
});

router.post(
  '/',
  requireAuth,
  [body('nome').notEmpty(), body('cpf').isLength({ min: 11, max: 11 }).isNumeric(), body('profissao').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const doc = await Profissional.create({ ...req.body, usuario: req.user.id, criadoPor: req.user.id });
      res.status(201).json(doc);
    } catch (err) {
      if (err.code === 11000) return res.status(409).json({ message: 'CPF já cadastrado' });
      res.status(500).json({ message: 'Erro ao criar profissional', detail: err.message });
    }
  }
);

router.get('/:id', requireAuth, async (req, res) => {
  const doc = await Profissional.findById(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Não encontrado' });
  res.json(doc);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const doc = await Profissional.findByIdAndUpdate(
    req.params.id,
    { ...req.body, atualizadoPor: req.user.id },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: 'Não encontrado' });
  res.json(doc);
});

router.delete('/:id', requireAuth, async (req, res) => {
  await Profissional.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;


