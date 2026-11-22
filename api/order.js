// Vercel Serverless Function: безпечне надсилання замовлення в Telegram з АНТИСПАМ-захистом
// Токен та Chat ID беруться з безпечних змінних середовища Vercel

// In-memory IP rate limiter (зберігається в межах теплого інстансу)
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 хвилина
  const maxRequestsPerMinute = 8;
  const blockDurationMs = 2 * 60 * 1000; // 2 хвилини блокування при зловживанні

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [], blockedUntil: 0 };
    rateLimitMap.set(ip, record);
  }

  // Якщо IP тимчасово заблокований
  if (record.blockedUntil > now) {
    return { limited: true, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
  }

  // Очищаємо застарілі таймстемпи (старші 1 хв)
  record.timestamps = record.timestamps.filter(t => now - t < windowMs);

  if (record.timestamps.length >= maxRequestsPerMinute) {
    // Встановлюємо блокування на 5 хв
    record.blockedUntil = now + blockDurationMs;
    return { limited: true, retryAfter: Math.ceil(blockDurationMs / 1000) };
  }

  record.timestamps.push(now);

  // Періодичне очищення мапи від старих записів, щоб пам'ять не переповнювалася
  if (rateLimitMap.size > 2000) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now - (val.timestamps[val.timestamps.length - 1] || 0) > 3600000) {
        rateLimitMap.delete(key);
      }
    }
  }

  return { limited: false };
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

  // 1. Отримуємо IP клієнта
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (forwarded ? forwarded.split(',')[0].trim() : (req.headers['x-real-ip'] || req.socket.remoteAddress || 'unknown'));

  // 2. АНТИСПАМ: Перевірка Rate Limit по IP
  const rateCheck = isRateLimited(clientIp);
  if (rateCheck.limited) {
    console.warn(`[AntiSpam RateLimit] Заблоковано IP: ${clientIp}, зачекайте ${rateCheck.retryAfter}s`);
    return res.status(429).json({
      ok: false,
      error: `Занадто багато замовлень за короткий час. Будь ласка, зачекайте кілька хвилин або зателефонуйте нам: 096 639 47 13`
    });
  }

  try {
    const { text, orderId, website, formTime } = req.body || {};

    // 3. АНТИСПАМ: Honeypot-пастка (якщо поле website заповнене — це автоматичний спам-бот)
    if (website && typeof website === 'string' && website.trim().length > 0) {
      console.warn(`[AntiSpam Honeypot] Спам-бот спійманий з IP ${clientIp}, honeypot="${website}"`);
      // Повертаємо 200 ok: true, щоб бот не перебирав інші форми, але в Telegram нічого НЕ надсилаємо!
      return res.status(200).json({ ok: true, filtered: true });
    }

    // 4. АНТИСПАМ: Перевірка швидкості заповнення (Time-Trap)
    // Людина фізично не може відкрити форму, ввести ім'я, номер та оформити замовлення швидше ніж за 1.8 секунди
    if (typeof formTime === 'number' && formTime > 0 && formTime < 400) {
      console.warn(`[AntiSpam TimeTrap] Надшвидке надсилання (${formTime}ms) від IP ${clientIp}. Схоже на бота.`);
      return res.status(200).json({ ok: true, filtered: true });
    }

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ ok: false, error: 'Порожній текст замовлення' });
    }

    // 5. АНТИСПАМ: Перевірка на заборонений спам-контент (реклама казино, крипти, сумнівні посилання)
    const spamRegex = /(casino|казино|vulkan|bitcoin|forex|viagra|porn)/i;
    if (spamRegex.test(text)) {
      console.warn(`[AntiSpam Content] Відхилено спам за ключовими словами від IP ${clientIp}`);
      return res.status(200).json({ ok: true, filtered: true });
    }

    // 6. Надсилаємо легітимне замовлення в Telegram-канал/чат замовниці
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const send = async (payload) => {
      const r = await fetch(tgUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return r.json();
    };

    let data = await send({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true });

    // Якщо Telegram не зміг розібрати HTML-розмітку — надсилаємо те саме простим текстом
    if (!data.ok && /parse entities|can't parse/i.test(data.description || '')) {
      const plain = text.replace(/<[^>]+>/g, '');
      data = await send({ chat_id: chatId, text: plain, disable_web_page_preview: true });
    }

    if (!data.ok) {
      console.error('[Telegram ERROR]', data.error_code, data.description);
      return res.status(502).json({ ok: false, error: data.description || 'Telegram error', code: data.error_code });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Помилка відправки в Telegram через Vercel API:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
