import { AIExtractedTransaction, ChatMessage } from './types';

// ============================================================
// DOCUMENT PARSING (OpenAI Vision)
// ============================================================
export async function parseDocument(
    file: File,
    apiKey: string
): Promise<AIExtractedTransaction> {
    if (!apiKey || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        if (!apiKey) console.warn('OpenAI API Key is missing. Using mock data.');
        // MOCK: simulated extracted data
        await new Promise((r) => setTimeout(r, 1500)); // simulate API delay
        return {
            amount: 124.50,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            description: `[MOCK] Factura ${file.name}`,
            category_id: 'cat-2',
            likely_recurring: true,
            recurrence_days: 30,
            confidence: 0.92,
        };
    }

    // Real OpenAI Vision API call
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    const base64 = await base64Promise;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [{
                role: 'user',
                content: [
                    { type: 'text', text: 'Analyze this receipt/invoice image or PDF. Extract EXACT data: amount (number), date (YYYY-MM-DD), type (income|expense), description (legal name of establishment or service), category (ID from list: cat-1: Alimentación, cat-2: Vivienda, cat-3: Transporte, cat-4: Suscripciones, cat-5: Ocio, cat-6: Ingresos, cat-7: Salud, cat-8: Educación), likely_recurring (boolean), recurrence_days (number, optional, e.g., 30 for monthly). BE PRECISE. Return JSON only.' },
                    { type: 'image_url', image_url: { url: `data:${file.type};base64,${base64}` } }
                ]
            }],
            response_format: { type: 'json_object' },
            max_tokens: 500,
        }),
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error?.message || 'Error con OpenAI Vision');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return {
        ...result,
        confidence: 0.95
    };
}

// ============================================================
// HUSKY CHATBOT (OpenAI Chat)
// ============================================================
export async function sendChatMessage(
    messages: ChatMessage[],
    apiKey: string,
    contextJson: string
): Promise<string> {
    if (!apiKey || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        await new Promise((r) => setTimeout(r, 1000));
        const responses = [
            'He analizado tu balance. Actualmente has gastado un total de 1.017,48 € este mes. Te sugiero revisar la partida de alquiler (850 €).',
            'Tu balance actual es de +1.382,52 €. Tienes un buen margen, pero te recomiendo supervisar tus suscripciones activas para optimizar gastos.',
            'Comparando con el mes anterior, has reducido un 12% tus gastos en ocio. Si mantienes esta tendencia, podrías ahorrar unos 300 € adicionales.',
            'Según mis proyecciones, finalizarás el mes con un balance positivo estimado de +1.100 €. Buen trabajo gestionando tus finanzas. 📊',
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Real OpenAI Chat API call
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
