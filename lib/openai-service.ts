import { AIExtractedTransaction, ChatMessage } from './types';

// ============================================================
// DOCUMENT PARSING (OpenAI Vision)
// ============================================================
export async function parseDocument(
    file: File,
    apiKey: string
): Promise<AIExtractedTransaction> {
    if (!apiKey || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        // MOCK: simulated extracted data
        await new Promise((r) => setTimeout(r, 1500)); // simulate API delay
        return {
            amount: 124.50,
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            description: `Factura ${file.name}`,
            category_id: 'cat-2',
            likely_recurring: true,
            confidence: 0.92,
        };
    }

    // TODO: Real OpenAI Vision API call
    // const formData = new FormData();
    // formData.append('file', file);
    // const base64 = await fileToBase64(file);
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //   method: 'POST',
    //   headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     model: 'gpt-4o',
    //     messages: [{
    //       role: 'user',
    //       content: [
    //         { type: 'text', text: 'Extract: amount (number), date (YYYY-MM-DD), type (income|expense), description, category (Food/Housing/Transport/Subscriptions/Leisure/Income), likely_recurring (bool). Return JSON only.' },
    //         { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } }
    //       ]
    //     }],
    //     max_tokens: 300,
    //   }),
    // });
    throw new Error('Configure OpenAI API key in Settings');
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

    // TODO: Real OpenAI Chat API call
    // const systemPrompt = `Eres Agente Daddy, un asistente financiero personal formal, eficiente y muy profesional, aunque conservas la imagen de un Husky. Tienes acceso a los datos financieros del usuario: ${contextJson}.
    // REGLAS: Responde siempre en español. Sé conciso, educado y directo. Evita onomatopeyas de perros. Habla de forma correcta. Puedes usar algún emoticono ocasional (como 📊 o 💡) de forma sutil y justa para no resultar pesado.`;
    // const response = await fetch('https://api.openai.com/v1/chat/completions', { ... });
    throw new Error('Configure OpenAI API key in Settings');
}
