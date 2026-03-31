# Setup Vercel Postgres + Blob Storage

## Passo 1: Criar Database no Vercel

1. Entre em https://vercel.com/dashboard
2. Vá para seu projeto FeAutos
3. Clique em **Storage** → **Create Database**
4. Selecione **Postgres** (ou se preferir Neon, crie um account no Neon)
5. Complete a criação
6. Copie a `DATABASE_URL` (será automaticamente adicionada ao .env.local)

## Passo 2: Habilitar Vercel Blob Storage

1. No mesmo painel de Storage, clique em **Create** → **Blob**
2. Selecione a região mais próxima
3. Copie o `BLOB_READ_WRITE_TOKEN`
4. Adicione como variável de ambiente no Vercel

## Passo 3: Configurar Variáveis de Ambiente na Vercel

No dashboard do seu projeto, vá para **Settings** → **Environment Variables** e adicione:

```
DATABASE_URL=postgresql://... (já vem da Postgres)
BLOB_READ_WRITE_TOKEN=vercel_blob_... (copie do painel Blob)
SESSION_SECRET=seu-secret-aleatorio-aqui
ADMIN_EMAIL=admin@feautos.local
ADMIN_PASSWORD=admin123
NODE_ENV=production
```

## Passo 4: Deploy com Migrations Automáticas

Crie um arquivo `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "npm run build && npm run prisma:migrate:deploy && npm run prisma:seed",
  "devCommand": "npm run dev"
}
```

## Passo 5: Testar Localmente com DATABASE_URL

1. Copie a `DATABASE_URL` da Vercel
2. Crie/atualize `.env.local` com:
   ```
   DATABASE_URL=postgresql://...
   BLOB_READ_WRITE_TOKEN=vercel_blob_...
   ```

3. Na pasta do projeto, execute:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate:dev --name init
   npm run prisma:seed
   npm run dev
   ```

## Passo 6: Empurrar para GitHub e Deploy

```bash
git add .
git commit -m "Migrate to Vercel Postgres + Blob Storage"
git push origin main
```

Vercel detectará as mudanças e hará deploy automático.

## Migração de Dados (SQLite → Postgres)

Se você tem dados no SQLite local que quer migrar:

1. Exporte dados do SQLite:
   ```bash
   sqlite3 data/fe_autos.db ".mode csv" ".output cars.csv" "SELECT * FROM cars;"
   ```

2. Crie um script `prisma/migrate-data.ts` para importar:
   ```typescript
   import { PrismaClient } from "@prisma/client";
   import * as fs from "fs";
   import * as csv from "csv-parse/sync";

   const prisma = new PrismaClient();

   async function main() {
     const data = fs.readFileSync("cars.csv", "utf-8");
     const records = csv.parse(data);
     // Process records and insert
   }

   main().catch(console.error);
   ```

## Troubleshooting

- **`BLOB_READ_WRITE_TOKEN` não funciona**: Verifique se está no format correto no painel Blob
- **Migrations falham**: Execute `npm run prisma:migrate:deploy` manualmente
- **Imagens não aparecem**: Verifique se o token Blob está correto

## Próximos Passos Opcionais

- Configurar autenticação Google OAuth (já está no código)
- Adicionar CDN cache headers nas imagens
- Implementar backups automáticos do Postgres
- Configurar webhooks para notificações
