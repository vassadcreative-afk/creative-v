// api/whatsapp/notify.js
// Vercel Serverless Function — Creative V → Z-API → WhatsApp
// Coloque em: /api/whatsapp/notify.js na raiz do seu projeto Vercel

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verifica chave interna
  const internalKey = req.headers['x-internal-key'];
  if (!internalKey || internalKey !== process.env.WA_INTERNAL_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { to, type, event, task, client } = req.body;
  if (!to || !type) {
    return res.status(400).json({ error: 'Missing required fields: to, type' });
  }

  const phone = formatPhone(to);
  const message = buildMessage({ type, event, task, client });

  // ── Z-API: endpoint por instância ───────────────────────────────────────────
  // Docs: https://developer.z-api.io/en/message/send-message-text
  // POST https://api.z-api.io/instances/{instanceId}/token/{token}/send-text
  const ZAPI_URL = `https://api.z-api.io/instances/${process.env.ZAPI_INSTANCE_ID}/token/${process.env.ZAPI_TOKEN}/send-text`;

  try {
    const zapiRes = await fetch(ZAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Client-Token': process.env.ZAPI_CLIENT_TOKEN, // Security token do painel Z-API
      },
      body: JSON.stringify({
        phone,       // ex: "5541999999999"
        message,
      }),
    });

    const data = await zapiRes.json();

    if (!zapiRes.ok) {
      console.error('[Z-API] Erro:', zapiRes.status, data);
      return res.status(502).json({ error: 'Z-API error', detail: data });
    }

    return res.status(200).json({ success: true, zapiResponse: data });

  } catch (err) {
    console.error('[Z-API] Fetch error:', err);
    return res.status(500).json({ error: 'Internal server error', detail: err.message });
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPhone(raw) {
  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('0')) digits = digits.slice(1);
  // Z-API aceita com ou sem DDI; com DDI é mais seguro
  if (digits.length <= 11) digits = '55' + digits;
  return digits;
}

function buildMessage({ type, event, task, client }) {
  const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  switch (type) {
    case 'task_started':
      return (
        `🎨 *Creative V*\n\n` +
        `Olá, *${client?.name || 'Cliente'}*! 👋\n\n` +
        `Sua tarefa *"${task?.title}"* foi iniciada e já está em andamento.\n\n` +
        `📅 ${now}\n\n` +
        `Acompanhe pelo portal do cliente. Qualquer dúvida, estamos à disposição! 😊`
      );

    case 'task_review':
      return (
        `✅ *Creative V*\n\n` +
        `Olá, *${client?.name || 'Cliente'}*! 🎉\n\n` +
        `A tarefa *"${task?.title}"* está pronta para sua *revisão e aprovação*.\n\n` +
        `${task?.link ? `🔗 *Link de entrega:* ${task.link}\n\n` : ''}` +
        `Acesse o portal para dar seu feedback. Aguardamos seu retorno! 🚀`
      );

    case 'task_done':
      return (
        `🏆 *Creative V*\n\n` +
        `Olá, *${client?.name || 'Cliente'}*! 🎊\n\n` +
        `A tarefa *"${task?.title}"* foi *concluída e aprovada*!\n\n` +
        `Foi um prazer trabalhar neste projeto. Obrigado pela confiança! 💜`
      );

    case 'task_update':
      return (
        `📌 *Creative V*\n\n` +
        `Olá, *${client?.name || 'Cliente'}*!\n\n` +
        `Atualização na tarefa *"${task?.title}"*:\n` +
        `Status: *${translateStatus(task?.status)}*\n\n` +
        `📅 ${now}`
      );

    case 'client_delivery':
      return (
        `📥 *Creative V — Nova Entrega*\n\n` +
        `O cliente *${client?.name || 'Cliente'}* entregou material para aprovação.\n\n` +
        `📋 Tarefa: *"${task?.title}"*\n` +
        `${task?.link ? `🔗 Link: ${task.link}\n` : ''}` +
        `📅 ${now}\n\n` +
        `Acesse o painel para revisar! 🎨`
      );

    case 'client_comment':
      return (
        `💬 *Creative V — Comentário de Cliente*\n\n` +
        `*${client?.name || 'Cliente'}* comentou na tarefa *"${task?.title}"*.\n\n` +
        `📅 ${now}\n\nAcesse o painel! 👀`
      );

    case 'event_reminder':
      return (
        `⏰ *Creative V — Lembrete*\n\n` +
        `*"${event?.title}"*\n` +
        `📅 ${event?.date || now}\n` +
        `${event?.description ? `📝 ${event.description}` : ''}`
      );

    case 'manual':
      return task?.message || `📨 *Creative V*\n\nMensagem enviada pelo painel.\n\n📅 ${now}`;

    default:
      return `📨 *Creative V*\n\nVocê tem uma nova notificação.\n\n📅 ${now}`;
  }
}

function translateStatus(status) {
  const map = {
    todo:     '⬜ A fazer',
    progress: '🔵 Em andamento',
    review:   '🟡 Em revisão',
    waiting:  '🟠 Aguardando cliente',
    done:     '✅ Concluído',
  };
  return map[status] || status || 'Atualizado';
}
