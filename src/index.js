import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { connectToDatabase } from './lib/mongoose.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/usuarios.js';
import empresaRoutes from './routes/empresas.js';
import profissionalRoutes from './routes/profissionais.js';
import colaboradorRoutes from './routes/colaboradores.js';
import clienteRoutes from './routes/clientes.js';
import adminRoutes from './routes/admin.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ name: 'Manual Predial API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/admin', adminRoutes);

const port = process.env.PORT || 4000;

connectToDatabase()
  .then(() => {
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });


