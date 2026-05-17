const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ── Rota Z-API (proxy para Vercel Function em produção, handler local em dev) ──
app.post('/api/whatsapp/notify', async (req, res) => {
  const internalKey = req.headers['x-internal-key'];
  if (!internalKey || internalKey !== process.env.WA_INTERNAL_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { to, type, task, client } = req.body;
  if (!to || !type) return res.status(400).json({ error: 'Missing fields' });

  let phone = String(to).replace(/\D/g, '');
  if (phone.length <= 11) phone = '55' + phone;

  const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

  const message = buildMessage({ type, task, client });

  try {
    const zapiRes = await fetch(ZAPI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, message }),
    });
    const data = await zapiRes.json();
    if (!zapiRes.ok) return res.status(502).json({ error: 'Z-API error', detail: data });
    return res.status(200).json({ success: true, zapiResponse: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ── Arquivos estáticos da pasta public ───────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Fallback: sempre retorna index.html (SPA) ─────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Creative V rodando em http://localhost:${PORT}`);
});

module.exports = app;

function buildMessage({ type, task, client }) {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  switch (type) {
    case 'task_started':  return `🎨 *Creative V*\n\nOlá, *${client?.name||'Cliente'}*! 👋\n\nSua tarefa *"${task?.title}"* foi iniciada!\n\n📅 ${now}`;
    case 'task_review':   return `✅ *Creative V*\n\nOlá, *${client?.name||'Cliente'}*! 🎉\n\nA tarefa *"${task?.title}"* está pronta para revisão.\n\n${task?.link?`🔗 ${task.link}\n\n`:''}Acesse o portal! 🚀`;
    case 'task_done':     return `🏆 *Creative V*\n\nOlá, *${client?.name||'Cliente'}*! 🎊\n\nA tarefa *"${task?.title}"* foi concluída! Obrigado pela confiança! 💜`;
    case 'client_delivery': return `📥 *Creative V — Nova Entrega*\n\n*${client?.name||'Cliente'}* entregou material.\n\nTarefa: *"${task?.title}"*\n${task?.link?`🔗 ${task.link}\n`:''}📅 ${now}`;
    case 'manual':        return task?.message || `📨 *Creative V*\n\nNova notificação.\n📅 ${now}`;
    default:              return `📌 *Creative V*\n\nAtualização na tarefa *"${task?.title}"*.\n📅 ${now}`;
  }
}
