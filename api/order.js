// Vercel Serverless Function: надсилання замовлення в Telegram.
// Токен та Chat ID беруться зі змінних середовища Vercel.
//
// ФІЛОСОФІЯ ЗАХИСТУ: втратити справжнє замовлення значно гірше, ніж отримати зайве повідомлення.
// Тому ми НІКОЛИ не відкидаємо «підозрілі» замовлення мовчки — лише позначаємо їх (⚠️).
// Єдина блокада — справжній потоп: 20+ замовлень з однієї адреси за 30 хвилин
// (власниця отримує про це одне повідомлення, а справжній клієнт бачить запасний шлях: телефон/Viber).

const WINDOW_MS = 30 * 60 * 1000;      // вікно підрахунку: 30 хвилин
const MAX_ORDERS_PER_WINDOW = 20;      // ліміт замовлень з однієї адреси за вікно
const DUPLICATE_WINDOW_MS = 90 * 1000; // подвійний тап: те саме замовлення двічі за 90 с
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
    const { text, website, formTime } = req.body || {};

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ ok: false, error: 'Порожній текст замовлення' });
    }

    // 1. ПОТОП: 20+ замовлень з однієї адреси за 30 хв — єдина реальна блокада
    const flood = checkFlood(clientIp, now);
    if (flood.blocked) {
      console.warn(`[Flood] ${clientIp}: ліміт ${MAX_ORDERS_PER_WINDOW}/30хв, пауза ~${flood.retryAfter}с`);
      if (flood.firstTime) {
        // Одне попередження власниці (не саме замовлення)
        try {
          await send({
            chat_id: chatId,
            text: `⚠️ Підозріла активність: з однієї адреси надійшло ${MAX_ORDERS_PER_WINDOW}+ замовлень за 30 хвилин. Нові замовлення з неї тимчасово не пересилаються (орієнтовно ~${Math.ceil(flood.retryAfter / 60)} хв). Якщо це справжній клієнт — він побачить запасний шлях (телефон / Viber).`
          });
        } catch (e) { console.error('Не вдалося надіслати попередження про потоп', e); }
      }
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
      return res.status(200).json({ ok: true, deduped: true });
    }

    // 3. ПОЗНАЧКИ (нічого не відкидаємо, лише попереджаємо)
    const flags = [];
    if (website && typeof website === 'string' && website.trim()) flags.push('заповнено приховане поле (автозаповнення або бот)');
    if (typeof formTime === 'number' && formTime > 0 && formTime < 1500) flags.push('надто швидке заповнення');
    const phoneDigits = ((text.match(/tel:([\d+]+)/) || [])[1] || '').replace(/\D/g, '');
    if (phoneDigits && (/^(\d)\1+$/.test(phoneDigits))) flags.push('схожий на фіктивний номер телефону');
    if (/https?:\/\/(?!t\.me)/i.test(text.replace(/<a href="tel:[^"]*">/g, ''))) flags.push('у тексті є посилання');

    let outText = text.length > MAX_TEXT_LENGTH ? text.slice(0, MAX_TEXT_LENGTH) + '…' : text;
    if (flags.length) outText = `⚠️ <i>Можливий спам: ${flags.join('; ')}</i>\n` + outText;

    // 4. ВІДПРАВКА (HTML; якщо Telegram не розібрав розмітку — повтор простим текстом)
    let data = await send({ chat_id: chatId, text: outText, parse_mode: 'HTML', disable_web_page_preview: true });
    if (!data.ok && /parse entities|can't parse/i.test(data.description || '')) {
      data = await send({ chat_id: chatId, text: outText.replace(/<[^>]+>/g, ''), disable_web_page_preview: true });
    }

    if (!data.ok) {
      console.error('[Telegram ERROR]', data.error_code, data.description);
      return res.status(502).json({ ok: false, error: data.description || 'Telegram error', code: data.error_code });
    }

    // Лічимо лише ДОСТАВЛЕНІ замовлення
    flood.rec.times.push(now);
    recentOrders.set(fp, now);
    return res.status(200).json({ ok: true, flagged: flags.length > 0 });
  } catch (err) {
    console.error('Помилка відправки в Telegram через Vercel API:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
