import { AIExtractedTransaction, ChatMessage } from './types';
import { parseDocumentServer, sendChatMessageServer } from '@/app/actions/openai';

// ============================================================
// DOCUMENT PARSING 
// ============================================================
export async function parseDocument(
    file: File
): Promise<AIExtractedTransaction> {
    let contentData = '';
    let isPdf = false;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        const base64 = await base64Promise;
        contentData = `data:${file.type};base64,${base64}`;
    } else if (file.type === 'application/pdf') {
        isPdf = true;
        const formData = new FormData();
        formData.append('file', file);

        const parseRes = await fetch('/api/pdf-extract', {
            method: 'POST',
            body: formData
        });

        if (!parseRes.ok) {
            const errData = await parseRes.json().catch(() => ({}));
            throw new Error(errData.error || 'Error al extraer texto del PDF en el servidor local.');
        }

        const textData = await parseRes.json();
        contentData = textData.text;
    } else {
        throw new Error(`Formato no soportado (${file.type}). Sube una imagen (JPG/PNG) o un PDF.`);
    }

    return await parseDocumentServer(contentData, isPdf);
}

// ============================================================
// HUSKY CHATBOT 
// ============================================================
export async function sendChatMessage(
    messages: ChatMessage[],
    contextJson: string
): Promise<string> {
    return await sendChatMessageServer(messages, contextJson);
}
