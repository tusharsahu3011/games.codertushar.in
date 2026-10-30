# Production Deployment & Domain Routing Guide: `games.codertushar.in`

This guide explains how to deploy **Fun With Dost Yaar** and route it to your custom domain `games.codertushar.in`.

---

## 1. Hosting Architecture Overview

The application features:
- **Client Frontend**: React 19 + TypeScript + Vite SPA.
- **Backend & WebSockets**: Node.js authoritative game engine (`server/bhabhiServer.mjs`) handling real-time rooms, WebRTC voice signaling, and in-game text chat.
- In production, running `node server/bhabhiServer.mjs` automatically serves the pre-built `dist/` frontend and mounts the WebSocket server on the same HTTP port.

---

## 2. Option A: Deploy on Railway (Recommended for WebSockets + Custom Domain)

1. **Create Project**:
   - Go to [Railway.app](https://railway.app).
   - Click **New Project** &rarr; **Deploy from GitHub repo**.
   - Select `tusharsahu3011/games.codertushar.in`.
2. **Configuration**:
   - Railway automatically detects `Dockerfile` and `railway.json`.
   - In **Settings &rarr; Networking &rarr; Custom Domain**, enter:
     ```
     games.codertushar.in
     ```
3. **DNS Configuration (in your domain registrar e.g. Cloudflare, Namecheap, GoDaddy)**:
   - Add a `CNAME` record:
     | Type | Name / Host | Target / Value | TTL |
     | :--- | :--- | :--- | :--- |
     | `CNAME` | `games` | `<your-railway-service>.up.railway.app` | Auto |
   - SSL certificate is provisioned automatically with Let's Encrypt.

---

## 3. Option B: Deploy on Render

1. Go to [Render.com](https://render.com) &rarr; **New Web Service**.
2. Connect `tusharsahu3011/games.codertushar.in`.
3. Settings:
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `node server/bhabhiServer.mjs`
4. Custom Domain:
   - Add `games.codertushar.in` in Render Custom Domains.
   - Point your DNS `CNAME` for `games` to Render's onrender.com host.

---

## 4. Option C: Deploy on VPS (DigitalOcean / AWS / Hetzner) with PM2 & Nginx

1. Clone repo:
   ```bash
   git clone https://github.com/tusharsahu3011/games.codertushar.in.git
   cd games.codertushar.in
   npm ci
   npm run build
   ```
2. Start server with PM2:
   ```bash
   pm2 start server/bhabhiServer.mjs --name "games-hub"
   pm2 save
   ```
3. Configure Nginx with WebSocket upgrade:
   ```nginx
   server {
       server_name games.codertushar.in;

       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
4. Issue SSL certificate with Certbot:
   ```bash
   certbot --nginx -d games.codertushar.in
   ```

---

## 5. Verification Checklist

- [ ] Visit `https://games.codertushar.in` &rarr; Hub loads with solid Gen-Z theme and Lucide icons.
- [ ] Join Bhabhi room &rarr; Dealer Riya introduces the table and deals cards.
- [ ] Audio & voice &rarr; Web Audio sounds play crisply and microphone test passes.
- [ ] Mobile &rarr; Landscape lock prompt triggers if rotated vertically.

