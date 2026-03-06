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

            // OpenAI Integration for personality
            let reply = '';
            const apiKey = process.env.OPENAI_API_KEY;

            if (apiKey) {
                try {
                    const systemPrompt = `Eres Agente Daddy, un asistente financiero personal formal, eficiente y muy profesional (Husky). 
                    REGLAS: Responde siempre en español. Sé conciso y directo. Evita onomatopeyas de perros. Habla de forma correcta. 
                    Usa algún emoticono ocasional (como 📊 o 💡).`;

                    const response = await fetch('https://api.openai.com/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: 'gpt-4o',
                            messages: [
                                { role: 'system', content: systemPrompt },
                                { role: 'user', content: text }
                            ],
                            max_tokens: 200,
                        }),
                    });

                    if (response.ok) {
                        const aiData = await response.json();
                        reply = aiData.choices[0].message.content;
                    } else {
                        throw new Error('OpenAI API Error');
                    }
                } catch (error) {
                    console.error('Error with AI reply:', error);
                    reply = '¡Hola! 🐾 Soy Husky. He recibido tu mensaje, pero tengo problemas para procesar mi cerebro (IA) ahora mismo. ¿En qué te puedo ayudar?';
                }
            } else {
                // Fallback personality without API key
                if (text.toLowerCase().includes('hola')) {
                    reply = '¡🐾 Hola! Soy Agente Daddy (Husky). Recibo tus mensajes de Telegram, pero para darte consejos financieros avanzados necesito que configures mi OPENAI_API_KEY en Vercel.';
                } else {
                    reply = 'Recibido. Estoy escuchando, pero mi cerebro de IA está desactivado sin la clave de OpenAI configurada en el servidor.';
                }
            }

            await sendMessage(chatId, reply);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Error in Telegram webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
