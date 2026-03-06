'use client';
import { useState, useCallback } from 'react';
import { Delete } from 'lucide-react';

interface PinLockProps {
    onSuccess: () => void;
    title?: string;
}

const CORRECT_PIN = '1234'; // In production, load from secure storage

export default function PinLock({ onSuccess, title = 'Introduce tu PIN' }: PinLockProps) {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);
    const [shake, setShake] = useState(false);

    const handleKey = useCallback((key: string) => {
        if (key === 'del') {
            setPin((p) => p.slice(0, -1));
            setError(false);
            return;
        }
        if (pin.length >= 4) return;
        const next = pin + key;
        setPin(next);
        if (next.length === 4) {
            if (next === CORRECT_PIN) {
                setTimeout(onSuccess, 200);
            } else {
                setError(true);
                setShake(true);
                setTimeout(() => { setPin(''); setShake(false); }, 700);
            }
        }
    }, [pin, onSuccess]);

    const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

    return (
        <div className="pin-screen">
            <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>🐾</span>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '4px' }}>{title}</h2>
                {error && <p style={{ color: 'var(--expense)', fontSize: '0.875rem', marginTop: '4px' }}>PIN incorrecto. Inténtalo de nuevo.</p>}
                {!error && <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>Agente Daddy</p>}
            </div>

            <div className={`pin-dots ${shake ? 'shake' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`pin-dot ${i < pin.length ? 'filled' : ''} ${error ? 'error' : ''}`}
                        style={error ? { borderColor: 'var(--expense)', background: i < pin.length ? 'var(--expense)' : '' } : {}} />
                ))}
            </div>

            <div className="pin-pad">
                {KEYS.map((key, i) => (
                    <button
                        key={i}
                        className={`pin-key ${key === '' ? 'empty' : ''}`}
                        onClick={() => key && handleKey(key)}
                        disabled={key === ''}
                        aria-label={key === 'del' ? 'Borrar' : key}
                    >
                        {key === 'del' ? <Delete size={20} /> : key}
                    </button>
                ))}
            </div>

            <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)}
        }
        .shake { animation: shake 0.5s ease; }
      `}</style>
        </div>
    );
}
