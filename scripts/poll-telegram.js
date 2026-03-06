const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Read .env.local to get the token
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const tokenMatch = envContent.match(/TELEGRAM_BOT_TOKEN=["']?([^"'\s]+)["']?/);

if (!tokenMatch) {
    console.error('❌ No se encontró TELEGRAM_BOT_TOKEN en .env.local');
    process.exit(1);
}

const TOKEN = tokenMatch[1];
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const LOCAL_WEBHOOK_URL = 'http://localhost:3000/api/telegram/webhook';

console.log('🐾 Husky Local Bridge — Iniciando Polling...');
console.log(`🤖 Usando Token: ${TOKEN.split(':')[0]}:[HIDDEN]`);

let lastUpdateId = 0;

async function poll() {
    const url = `${TELEGRAM_API}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`;

    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const result = JSON.parse(data);
                if (result.ok && result.result.length > 0) {
                    result.result.forEach(update => {
                        lastUpdateId = update.update_id;
                        forwardUpdate(update);
                    });
                }
            } catch (e) {
                console.error('Error parseando respuesta de Telegram:', e.message);
            }
            poll(); // Continue polling
        });
    }).on('error', (err) => {
        console.error('Error de red en Telegram:', err.message);
        setTimeout(poll, 5000); // Retry after delay
    });
}

function forwardUpdate(update) {
    console.log(`📩 Recibido mensaje de ${update.message?.from?.first_name || 'Alguien'}: "${update.message?.text || '[No text]'}"`);

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const req = http.request(LOCAL_WEBHOOK_URL, options, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ Mensaje reenviado con éxito a localhost:3000');
        } else {
            console.error(`❌ Error al reenviar a localhost:3000 (Status: ${res.statusCode})`);
        }
    });

    req.on('error', (e) => {
        console.error(`❌ Error al conectar con localhost:3000: ${e.message}`);
        console.log('💡 ¿Está la app Next.js corriendo en el puerto 3000?');
    });

    req.write(JSON.stringify(update));
    req.end();
}

poll();
