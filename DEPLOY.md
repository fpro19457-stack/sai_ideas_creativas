# Deploy Sai Ideas Creativas

## Requisitos
- VPS con Ubuntu 20.04+
- Node.js 18+
- Nginx
- PostgreSQL (o usar Neon/Supabase)
- Domain configurado con DNS apuntando al VPS

## Pasos

### 1. Clonar repo en VPS
```bash
ssh usuario@vps
git clone https://github.com/tu-repo/sai-ideas-creativas.git
cd sai-ideas-creativas
```

### 2. Instalar dependencias
```bash
npm ci
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
nano .env
```

Variables necesarias:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=genera-una-clave-secreta-larga
NEXTAUTH_URL=https://tu-dominio.com
NEXT_PUBLIC_URL=https://tu-dominio.com
RESEND_API_KEY=re_tu_api_key
ADMIN_EMAIL=tu@email.com
TRANSFERENCIA_CBU=...
TRANSFERENCIA_ALIAS=...
TRANSFERENCIA_TITULAR=...
TRANSFERENCIA_BANCO=...
```

### 4. Migrar base de datos
```bash
npx prisma migrate deploy
```

### 5. Build
```bash
npm run build
```

### 6. Iniciar con PM2
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # para auto-iniciar al reiniciar el servidor
```

### 7. Configurar Nginx
```bash
sudo nano /etc/nginx/sites-available/sai-ideas-creivas
```

Contenido:
```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 50M;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/sai-ideas-creivas /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL con Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
```

### 9. Verificar
```bash
curl -I https://tu-dominio.com
```

## Comandos útiles
```bash
pm2 status              # ver estado
pm2 logs sai-ideas-creativas  # ver logs
pm2 restart sai-ideas-creativas  # reiniciar
```

## Actualizar
```bash
cd sai-ideas-creativas
git pull
npm ci
npm run build
pm2 restart sai-ideas-creativas
```