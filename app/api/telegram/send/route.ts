import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message } = body;

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            return NextResponse.json(
                { ok: false, error: 'La configuración del servidor (Token/ChatId) está incompleta.' },
                { status: 500 }
            );
        }

        if (!message) {
            return NextResponse.json(
                { ok: false, error: 'Falta parámetro requerido: message' },
                { status: 400 }
            );
        }

        const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return NextResponse.json(
                { ok: false, error: errorData.description || 'Error al enviar mensaje' },
                { status: response.status }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Telegram Send Error:', error);
        return NextResponse.json(
            { ok: false, error: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
