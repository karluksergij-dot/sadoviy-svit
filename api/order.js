// Vercel Serverless Function: надсилання замовлення в Telegram.
// Токен та Chat ID беруться зі змінних середовища Vercel.
//
// ФІЛОСОФІЯ ЗАХИСТУ: втратити справжнє замовлення значно гірше, ніж отримати зайве повідомлення.
// Тому ми НІКОЛИ не відкидаємо «підозрілі» замовлення мовчки — лише позначаємо їх (⚠️).
// Замовлення з багатьма спробами з однієї адреси ТЕЖ доходять — просто з позначкою «МОЖЛИВО СПАМ».
// Аварійний запобіжник від масової атаки ботів — лише від 150 замовлень за 30 хвилин з однієї адреси.

const WINDOW_MS = 30 * 60 * 1000;      // вікно підрахунку: 30 хвилин
const SPAM_MARK_AFTER = 5;             // з 6-го замовлення за вікно — позначка «можливо спам» (але доходить)
const MAX_ORDERS_PER_WINDOW = 150;     // аварійний ліміт (лише масова атака)
const DUPLICATE_WINDOW_MS = 30 * 1000; // подвійний тап: те саме замовлення двічі за 90 с
const MAX_TEXT_LENGTH = 3800;          // ліміт Telegram — 4096 символів

// Стан живе в пам'яті теплого інстансу (на холодному старті обнуляється — це лише робить захист м'якшим).
const ipOrders = new Map();   // ip -> { times: number[], alerted: boolean }
const recentOrders = new Map(); // ключ замовлення -> timestamp

function checkFlood(ip, now) {
  let rec = ipOrders.get(ip);
  if (!rec) { rec = { times: [], alerted: false }; ipOrders.set(ip, rec); }
  rec.times = rec.times.filter(t => now - t < WINDOW_MS);
  if (rec.times.length === 0) rec.alerted = false;

  if (rec.times.length >= MAX_ORDERS_PER_WINDOW) {
    const first = !rec.alerted;
    rec.alerted = true;
    const retryAfter = Math.ceil((WINDOW_MS - (now - rec.times[0])) / 1000);
    return { blocked: true, firstTime: first, retryAfter };
  }
  return { blocked: false, rec };
}

function cleanup(now) {
  if (ipOrders.size > 2000) {
    for (const [k, v] of ipOrders.entries()) {
      if (!v.times.length || now - v.times[v.times.length - 1] > WINDOW_MS) ipOrders.delete(k);
    }
  }
  for (const [k, t] of recentOrders.entries()) {
    if (now - t > DUPLICATE_WINDOW_MS) recentOrders.delete(k);
  }
}

// Відбиток замовлення для захисту від подвійного тапу: телефон + склад (без номера замовлення)
function orderFingerprint(text) {
  const phone = (text.match(/tel:([\d+]+)/) || [])[1] || '';
  const body = text.split('Замовлені саджанці')[1] || text;
  const items = body.replace(/#SS-\d+/g, '').replace(/⏰.*$/s, '').replace(/\s+/g, ' ').trim();
  return phone + '|' + items;
}

// Необов'язковий журнал у Google-таблицю: якщо задано SHEETS_WEBHOOK_URL, кожна спроба замовлення
// (навіть невдала) записується рядком. Збій журналу НІКОЛИ не впливає на замовлення.
async function logToSheet(order, status, flags) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const o = order && typeof order === 'object' ? order : {};
    const items = Array.isArray(o.items) ? o.items.map(i => `${i.name} × ${i.quantity}`).join('; ') : '';
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        secret: process.env.SHEETS_SECRET || '',
        time: new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' }),
        orderId: o.orderId || '', name: o.name || '', phone: o.phone || '', address: o.address || '',
        payment: o.payment || '', comment: o.comment || '', items, total: o.totalSum || '',
        status, flags: (flags || []).join('; ')
      })
    });
  } catch (e) {
    console.error('[Sheets] не вдалося записати рядок:', e.message);
  } finally { clearTimeout(timer); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Метод не підтримується' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error('Змінні TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID не налаштовані у Vercel');
    return res.status(500).json({
      ok: false,
      error: 'Telegram credentials not configured in Vercel Environment Variables'
    });
  }

  const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
  const send = async (payload) => {
    const r = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return r.json();
  };

  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (forwarded ? forwarded.split(',')[0].trim() : (req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress) || 'unknown'));
  const now = Date.now();
  cleanup(now);

  try {
    const { text, website, formTime, order } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ ok: false, error: 'Порожній текст замовлення' });
    }

    // 1. АВАРІЙНИЙ ЗАПОБІЖНИК: лише масова атака (150+ за 30 хв з однієї адреси)
    const flood = checkFlood(clientIp, now);
    if (flood.blocked) {
      console.warn(`[Flood] ${clientIp}: аварійний ліміт ${MAX_ORDERS_PER_WINDOW}/30хв, пауза ~${flood.retryAfter}с`);
      if (flood.firstTime) {
        // Одне попередження власниці (не саме замовлення)
        try {
          await send({
            chat_id: chatId,
            text: `⚠️ Схоже на атаку ботів: з однієї адреси ${MAX_ORDERS_PER_WINDOW}+ замовлень за 30 хвилин. Нові з неї тимчасово не пересилаються (~${Math.ceil(flood.retryAfter / 60)} хв).`
          });
        } catch (e) { console.error('Не вдалося надіслати попередження про потоп', e); }
      }
      await logToSheet(order, 'ЗАБЛОКОВАНО: потоп з однієї адреси', []);
      return res.status(429).json({
        ok: false,
        error: 'Забагато замовлень з вашої адреси за короткий час. Зателефонуйте нам: 096 639 47 13'
      });
    }

    // 2. ПОДВІЙНИЙ ТАП: те саме замовлення двічі за 90 с — не дублюємо, але клієнту кажемо «ок»
    const fp = orderFingerprint(text);
    const prev = recentOrders.get(fp);
    if (prev && now - prev < DUPLICATE_WINDOW_MS) {
      console.warn(`[Duplicate] те саме замовлення від ${clientIp} — не дублюємо`);
      await logToSheet(order, 'дубль (повторний тап, не пересилали)', []);
      return res.status(200).json({ ok: true, deduped: true });
    }

    // 3. ПОЗНАЧКИ (нічого не відкидаємо, лише попереджаємо)
    const flags = [];
    if (website && typeof website === 'string' && website.trim()) flags.push('заповнено приховане поле (автозаповнення або бот)');
    if (flood.rec.times.length >= SPAM_MARK_AFTER) flags.push('багато замовлень з однієї адреси за короткий час');
    const phoneDigits = ((text.match(/tel:([\d+]+)/) || [])[1] || '').replace(/\D/g, '');
    if (phoneDigits && (/^(\d)\1+$/.test(phoneDigits))) flags.push('схожий на фіктивний номер телефону');
    if (/https?:\/\/(?!t\.me)/i.test(text.replace(/<a href="tel:[^"]*">/g, ''))) flags.push('у тексті є посилання');

    let outText = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) + '…' : text;
    // Позначку «МОЖЛИВО СПАМ» вимкнено: автозаповнення телефонів давало хибні спрацювання.
    // Ознаки лише пишемо в журнал Vercel. Щоб увімкнути позначку знову: SPAM_LABEL=1 у змінних середовища.
    if (flags.length) console.warn('[Flags]', clientIp, flags.join('; '));
    if (flags.length && process.env.SPAM_LABEL === '1') outText = `⚠️ <b>МОЖЛИВО СПАМ</b> (${flags.join('; ')})\n\n` + outText;

    // 4. ВІДПРАВКА (HTML; якщо Telegram не розібрав розмітку — повтор простим текстом)
    let data = await send({ chat_id: chatId, text: outText, parse_mode: 'HTML', disable_web_page_preview: true });
    if (!data.ok && /parse entities|can't parse/i.test(data.description || '')) {
      data = await send({ chat_id: chatId, text: outText.replace(/<[^>]+>/g, ''), disable_web_page_preview: true });
    }

    if (!data.ok) {
      console.error('[Telegram ERROR]', data.error_code, data.description);
      await logToSheet(order, 'ПОМИЛКА Telegram: ' + (data.description || data.error_code), flags);
      return res.status(502).json({ ok: false, error: data.description || 'Telegram error', code: data.error_code });
    }

    // Лічимо лише ДОСТАВЛЕНІ замовлення
    flood.rec.times.push(now);
    recentOrders.set(fp, now);
    await logToSheet(order, 'надіслано в Telegram', flags);
    return res.status(200).json({ ok: true, flagged: flags.length > 0 });
  } catch (err) {
    console.error('Помилка відправки в Telegram через Vercel API:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
