import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const router = Router();

router.post(
  '/register',
  [
    body('nome').isString().isLength({ min: 2 }).trim(),
    body('email').isEmail().normalizeEmail(),
    body('senha').isLength({ min: 6 }),
    body('tipoUsuario').isIn(['empresa', 'profissional', 'colaborador', 'cliente_final', 'admin']),
    body('cpfCnpj').isLength({ min: 11, max: 14 }).isNumeric(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { nome, email, senha, tipoUsuario, cpfCnpj, telefone, endereco, cidade, estado, cep } = req.body;
      const usuario = new Usuario({
        nome,
        email,
        tipoUsuario,
        cpfCnpj,
        telefone,
        endereco,
        cidade,
        estado,
        cep,
      });
      await usuario.setPassword(senha);
      await usuario.save();
      return res.status(201).json({ id: usuario._id, email: usuario.email, status: usuario.status });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Email ou CPF/CNPJ já cadastrado' });
      }
      return res.status(500).json({ message: 'Erro ao registrar', detail: err.message });
    }
  }
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('senha').isString().isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, senha } = req.body;
      const usuario = await Usuario.findOne({ email });
      if (!usuario) return res.status(401).json({ message: 'Credenciais inválidas' });
      const ok = await usuario.validatePassword(senha);
      if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
      const token = jwt.sign({ sub: usuario._id, role: usuario.tipoUsuario }, process.env.JWT_SECRET || 'dev', {
        expiresIn: '8h',
      });
      return res.json({ token });
    } catch (err) {
      return res.status(500).json({ message: 'Erro ao autenticar', detail: err.message });
    }
  }
);

export default router;


