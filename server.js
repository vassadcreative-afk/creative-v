const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Arquivos HTML públicos — servidos diretamente, sem autenticação
const PUBLIC_PAGES = ['/briefing_completo.html', '/briefing_form.html'];
app.get(PUBLIC_PAGES, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', req.path));
});

// Fallback to index.html for SPA (painel — requer login)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Creative V rodando em http://localhost:${PORT}`);
});

module.exports = app;
