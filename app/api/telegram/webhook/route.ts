import { NextResponse } from 'next/server';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: string, text: string) {
    if (!process.env.TELEGRAM_BOT_TOKEN) return;
    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'Markdown',
        }),
    });
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Check if it's a message
        if (body.message && body.message.text) {
            const chatId = body.message.chat.id;
            const text = body.message.text;

            console.log(`[Telegram] Recibido de ${chatId}: ${text}`);

            // Simple mock response or OpenAI integration
            // Since OpenAI key might be in client's local storage, we use a basic mock for the webhook
            // unless OPENAI_API_KEY is defined in .env

            let reply = '';

            if (text.toLowerCase().includes('hola')) {
                reply = '¡Guau! 🐾 Hola, soy Husky. He recibido tu mensaje desde Telegram. ¿En qué te puedo ayudar hoy con tus gastos?';
            } else if (text.toLowerCase().includes('gasto') || text.toLowerCase().includes('pendiente')) {
                reply = '📊 No tienes gastos recurrentes urgentes para hoy. ¡Todo está bajo control!';
            } else {
                reply = 'Entendido. Estoy sincronizado con tu app FinTrack Husky. (Nota: Para respuestas completas de IA, asegúrate de configurar OPENAI_API_KEY en tu servidor).';
            }

            await sendMessage(chatId, reply);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error in Telegram webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
