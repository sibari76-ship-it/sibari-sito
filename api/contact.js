const SITE_URL = 'https://www.sibaribonato.com';
const RESEND_API_URL = 'https://api.resend.com/emails';
const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'info@sibaribonato.com';
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'Sibari Bonato <noreply@sibaribonato.com>';
const CONTACT_REPLY_TO = process.env.CONTACT_REPLY_TO || 'info@sibaribonato.com';

// Rate limiting in-memory — funziona per burst sulla stessa istanza serverless
const rateLimitMap = new Map();
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minuti

const ALLOWED_SERVICES = [
  'Grafica & Brand',
  'Logo Design',
  'Siti Web',
  'Fotografia & Contenuti',
  'Social & Marketing',
  'Più elementi insieme'
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const URL_REGEX = /https?:\/\/|www\.|\.ru\b|\.cn\b|\.xyz\b|\.tk\b|\.pw\b/i;
const CYRILLIC_REGEX = /[Ѐ-ӿ]/;

const EU_COUNTRIES = new Set([
  'IT','AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE',
  'GR','HU','IE','LV','LT','LU','MT','NL','PL','PT','RO','SK',
  'SI','ES','SE','CH','NO','IS','LI','GB','AL','BA','MK','ME',
  'RS','SM','MC','AD','VA','SI','HR','UA','MD'
]);

function isSpamCountry(req) {
  const country = req.headers['x-vercel-ip-country'] || '';
  return country !== '' && !EU_COUNTRIES.has(country.toUpperCase());
}

function getClientIp(req) {
  return (
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  );
}

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function emailShell(content) {
  return `<!doctype html>
  <html lang="it">
    <body style="margin:0;padding:0;background:#0b0b0b;font-family:'Plus Jakarta Sans',Arial,sans-serif;color:#d1d1d1;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b0b0b;border-collapse:collapse;">
        <tr>
          <td style="padding:32px 14px;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:680px;margin:0 auto;border-collapse:separate;">
              <tr>
                <td style="border:1px solid rgba(255,255,255,0.08);border-radius:28px;background:
                  radial-gradient(circle at top left, rgba(240,200,0,0.16), transparent 28%),
                  linear-gradient(180deg,#171717 0%,#101010 100%);
                  padding:34px 26px 28px;">
                  ${content}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function premiumHeader(eyebrow, title, intro) {
  return `
    <div style="display:inline-block;margin:0 0 28px;padding:10px 16px;border:1px solid rgba(255,255,255,0.08);border-radius:999px;background:rgba(255,255,255,0.03);color:#f5f5f5;font-size:18px;font-weight:700;letter-spacing:-0.02em;">
      Sibari Bonato
    </div>
    <p style="margin:0 0 12px;color:#f0c800;font-size:12px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;">${eyebrow}</p>
    <h1 style="margin:0 0 16px;color:#f5f5f5;font-size:46px;line-height:0.98;font-weight:800;letter-spacing:-0.04em;">${title}</h1>
    <p style="margin:0;color:#b7b7b7;font-size:18px;line-height:1.65;">${intro}</p>
  `;
}

function premiumInfoBlock(rows) {
  const items = rows.map(([label, value]) => `
    <tr>
      <td style="padding:16px 0 16px 0;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;width:34%;">
        <div style="color:#8f8f8f;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">${escapeHtml(label)}</div>
      </td>
      <td style="padding:16px 0 16px 18px;border-bottom:1px solid rgba(255,255,255,0.08);vertical-align:top;">
        <div style="color:#f5f5f5;font-size:17px;line-height:1.65;font-weight:600;">${escapeHtml(value)}</div>
      </td>
    </tr>
  `).join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:28px;padding:0;border-collapse:collapse;">
      <tr>
        <td style="padding:24px 24px 8px;border:1px solid rgba(255,255,255,0.08);border-radius:22px;background:rgba(255,255,255,0.025);">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
            ${items}
          </table>
        </td>
      </tr>
    </table>
  `;
}

function ownerEmailHtml(data, meta) {
  return emailShell(`
    ${premiumHeader(
      'Nuovo contatto dal sito',
      'Nuovo messaggio',
      'Richiesta inviata dal form contatti di sibaribonato.com.'
    )}
    ${premiumInfoBlock([
      ['Nome', data.name],
      ['Email', data.email],
      ['Telefono', data.phone || 'Non indicato'],
      ['Servizio', data.service],
      ['Messaggio', data.message],
      ['IP', meta.ip],
      ['Paese', `${meta.country}${meta.country !== '?' && !EU_COUNTRIES.has(meta.country) ? ' ⚠️ non EU' : ' ✓'}`],
      ['Ora', new Date().toISOString()]
    ])}
  `);
}

function ownerEmailText(data, meta) {
  return [
    'Nuovo contatto dal sito',
    '',
    `Nome: ${data.name}`,
    `Email: ${data.email}`,
    `Telefono: ${data.phone || 'Non indicato'}`,
    `Servizio: ${data.service}`,
    '',
    `Messaggio: ${data.message}`,
    '',
    `IP: ${meta.ip}`,
    `Paese: ${meta.country}`
  ].join('\n');
}

async function sendEmail(payload) {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Email send failed');
  }

  return response.json();
}

module.exports = async function handler(req, res) {
  // CORS — solo il dominio ufficiale
  const allowedOrigins = [SITE_URL, 'https://sibari-sito.vercel.app'];
  const origin = req.headers['origin'] || '';
  const referer = req.headers['referer'] || '';

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', SITE_URL);
  }

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Blocco richieste non provenienti dal sito
  const originOk = allowedOrigins.some(o => origin.startsWith(o));
  const refererOk = referer.includes('sibaribonato.com') || referer.includes('sibari-sito.vercel.app');
  if (!originOk && !refererOk) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY missing' });
  }

  const ip = getClientIp(req);

  // Rate limiting
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra qualche minuto.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

  // Honeypot — se compilato è un bot
  if (body.website || body.company_name) {
    // Risposta silenziosamente positiva — il bot non sa di essere bloccato
    return res.status(200).json({ ok: true });
  }

  const clean = {
    name:    String(body.name    || '').trim().slice(0, 100),
    email:   String(body.email   || '').trim().toLowerCase().slice(0, 200),
    phone:   String(body.phone   || '').trim().slice(0, 30),
    service: String(body.service || '').trim(),
    message: String(body.message || '').trim().slice(0, 2000)
  };

  // Validazione campi obbligatori
  if (!clean.name || !clean.email || !clean.service || !clean.message) {
    return res.status(400).json({ error: 'Campi obbligatori mancanti.' });
  }

  // Validazione email
  if (!EMAIL_REGEX.test(clean.email) || clean.email.length > 200) {
    return res.status(400).json({ error: 'Indirizzo email non valido.' });
  }

  // Validazione servizio (whitelist)
  if (!ALLOWED_SERVICES.includes(clean.service)) {
    return res.status(400).json({ error: 'Servizio non valido.' });
  }

  // Blocco cirillico — nome, email, messaggio
  if (CYRILLIC_REGEX.test(clean.name) || CYRILLIC_REGEX.test(clean.email) || CYRILLIC_REGEX.test(clean.message)) {
    return res.status(400).json({ error: 'Caratteri non supportati.' });
  }

  // Validazione messaggio — min 20 caratteri, no URL, no TLD spam
  if (clean.message.length < 20) {
    return res.status(400).json({ error: 'Il messaggio è troppo breve (minimo 20 caratteri).' });
  }
  if (URL_REGEX.test(clean.message) || URL_REGEX.test(clean.name)) {
    return res.status(400).json({ error: 'Il messaggio non può contenere link.' });
  }

  // Validazione nome — no URL, no solo numeri
  if (/^\d+$/.test(clean.name) || clean.name.length < 2) {
    return res.status(400).json({ error: 'Nome non valido.' });
  }

  const country = req.headers['x-vercel-ip-country'] || '?';
  const spamFlag = isSpamCountry(req) ? '[SPAM?] ' : '';
  const meta = { ip, country };

  try {
    await sendEmail({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: clean.email,
      subject: `${spamFlag}Nuovo contatto dal sito — ${clean.name}`,
      html: ownerEmailHtml(clean, meta),
      text: ownerEmailText(clean, meta)
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Invio fallito.', details: String(error.message || error) });
  }
};
