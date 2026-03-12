'use server';

import { ChatMessage, AIExtractedTransaction } from '@/lib/types';

// ============================================================
// DOCUMENT PARSING (Server side)
// ============================================================
export async function parseDocumentServer(
    contentData: string,
    isPdf: boolean
): Promise<AIExtractedTransaction> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('⚠️ API Key de OpenAI no configurada en el servidor (.env.local)');
    }

    let messagesContent: any[] = [];
    if (isPdf) {
        messagesContent = [
            { type: 'text', text: 'Analyze the following text extracted from a receipt/invoice PDF. Extract EXACT data. IMPORTANT FOR AMOUNT: You MUST extract the FINAL TOTAL AMOUNT to pay including all taxes (IVA). DO NOT extract subtotals or tax bases. Fields needed: amount (number), date (YYYY-MM-DD), type (income|expense), description (legal name of establishment or service), category (ID from list: cat-1: Alimentación, cat-2: Vivienda, cat-3: Transporte, cat-4: Suscripciones, cat-5: Ocio, cat-6: Ingresos, cat-7: Salud, cat-8: Educación), status (pending|confirmed), likely_recurring (boolean), recurrence_days (number, optional, e.g., 30 for monthly). BE PRECISE. Return purely the JSON object without markdown formatting.' },
            { type: 'text', text: contentData.substring(0, 8000) }
        ];
    } else {
        messagesContent = [
            { type: 'text', text: 'Analyze this receipt/invoice image. Extract EXACT data. IMPORTANT FOR AMOUNT: You MUST extract the FINAL TOTAL AMOUNT to pay including all taxes (IVA). DO NOT extract subtotals or tax bases. Fields needed: amount (number), date (YYYY-MM-DD), type (income|expense), description (legal name of establishment or service), category (ID from list: cat-1: Alimentación, cat-2: Vivienda, cat-3: Transporte, cat-4: Suscripciones, cat-5: Ocio, cat-6: Ingresos, cat-7: Salud, cat-8: Educación), status (pending|confirmed), likely_recurring (boolean), recurrence_days (number, optional, e.g., 30 for monthly). BE PRECISE. Return purely the JSON object without markdown formatting.' },
            { type: 'image_url', image_url: { url: contentData } } // contentData is full base64 string
        ];
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: messagesContent }],
            response_format: { type: 'json_object' },
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Error con OpenAI Vision');
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(content);
    return { ...result, confidence: 0.95 };
}

// ============================================================
// HUSKY CHATBOT (Server side)
// ============================================================
export async function sendChatMessageServer(
    messages: ChatMessage[],
    contextJson: string
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('⚠️ API Key  de OpenAI no configurada en el servidor.');
    }

    const systemPrompt = `Eres Agente Daddy, un asistente financiero personal formal, eficiente y muy profesional, aunque conservas la imagen de un Husky. Tienes acceso a los datos financieros del usuario (resumen): ${contextJson}.
    REGLAS: Responde siempre en español. Sé conciso, educado y directo. Evita onomatopeyas de perros ("Guau", "Auuu"). Habla de forma correcta. Puedes usar algún emoticono ocasional (como 📊 o 💡) de forma sutil y justa para no resultar pesado. Si el usuario te pregunta por sus gastos, usa la información proporcionada.`;

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
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Error con OpenAI Chat');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
