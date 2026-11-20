// Vercel Serverless Function: безпечне надсилання замовлення в Telegram
// Токен та Chat ID беруться з безпечних змінних середовища Vercel
// Ніхто у браузері чи на GitHub не зможе побачити ваш токен!

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

  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ ok: false, error: 'Порожній текст замовлення' });
    }

    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error('Помилка відправки в Telegram через Vercel API:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
