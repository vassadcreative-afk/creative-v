# ✦ Creative V

Aplicativo web de gestão de clientes e tarefas — pronto para deploy no Vercel.

---

## 🚀 Deploy no Vercel

### 1. Suba para o GitHub
```bash
git init
git add .
git commit -m "feat: creative v"
git remote add origin https://github.com/SEU_USER/creative-v.git
git push -u origin main
```

### 2. Importe no Vercel
1. Acesse [vercel.com](https://vercel.com) → **Add New Project**
2. Conecte o repositório GitHub
3. Vercel detecta automaticamente o `vercel.json` — clique em **Deploy**
4. Pronto! URL gerada automaticamente.

---

## 🔑 Configurar Google Calendar (integração automática)

Para que o Calendar conecte automaticamente no login, siga esses passos:

### No Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Selecione (ou crie) o **mesmo projeto** do Firebase (`creative-v`)
3. Vá em **APIs & Services → Credentials**
4. Clique no **OAuth 2.0 Client ID** existente (ou crie um novo do tipo "Web application")
5. Em **Authorized JavaScript origins**, adicione:
   - `http://localhost:3000` (para desenvolvimento)
   - `https://SEU-APP.vercel.app` (sua URL do Vercel)
6. Em **Authorized redirect URIs**, adicione os mesmos domínios
7. Copie o **Client ID** gerado

### No código
Abra `public/index.html` e edite a linha:
```javascript
const GCAL_CLIENT_ID = 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com';
```
Substitua pelo seu Client ID real.

### Ativar a API
Em **APIs & Services → Library**, pesquise e ative:
- **Google Calendar API**

---

## ✨ Funcionalidades

- **Hoje** — visão geral do dia com tarefas e eventos
- **Quadro** — kanban com colunas: Atrasadas, A fazer, Em andamento, Aguardando, Concluído
- **Calendário** — visualização mensal com marcadores de tarefas
- **Clientes** — sidebar com filtro por cliente
- **Google Calendar** — conecta automaticamente ao entrar com Google (requer Client ID configurado)
- **Login persistente** — não precisa entrar novamente após fechar o navegador

## 📱 Responsivo

| Tela | Comportamento |
|------|--------------|
| ≥ 1400px | Layout expandido, sidebar larga |
| 1024–1399px | Desktop padrão |
| 768–1023px | Tablet landscape, kanban 3 colunas |
| 640–767px | Tablet portrait compacto |
| ≤ 639px | Mobile com bottom nav e FAB |
| ≤ 375px | Mobile pequeno otimizado |

## 🛠 Tecnologias

- HTML5 + CSS3 + JavaScript puro
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (Google Fonts)
- Firebase (Firestore + Auth)
- Google Calendar API (REST direto)
- Express.js (servidor Node para Vercel)
