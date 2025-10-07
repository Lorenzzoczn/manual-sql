# Manual Predial API (Express + MongoDB)

API REST para o sistema de cadastros do Manual Predial. Replica os principais conceitos do SQL (usuários, empresas, profissionais, colaboradores, clientes) usando MongoDB/Mongoose.

## Requisitos
- Node.js 18+
- MongoDB 6+

## Configuração
1. Copie `.env.example` para `.env` e ajuste as variáveis.
2. Instale dependências:
```
npm install
```
3. Inicie em desenvolvimento:
```
npm run dev
```

## Endpoints principais
- `POST /api/auth/register` – cria um usuário (status inicia como `pendente_aprovacao`)
- `POST /api/auth/login` – retorna JWT
- `GET /api/usuarios` – lista (admin)
- `PATCH /api/usuarios/:id/status` – altera status (admin)
- `POST/GET/PATCH/DELETE /api/empresas`
- `POST/GET/PATCH/DELETE /api/profissionais`
- `POST/GET/PATCH/DELETE /api/colaboradores`
- `POST/GET/PATCH/DELETE /api/clientes`
- `POST /api/admin/usuarios/:id/aprovar` – aprovar usuário (admin)
- `GET /api/admin/estatisticas` – estatísticas gerais (admin)

Envie header `Authorization: Bearer <token>` para endpoints protegidos.

## Observações
- Hash de senha com bcrypt.
- Validações inspiradas nas `CHECK` do SQL original.
- Índices equivalentes foram adicionados nos schemas Mongoose.

