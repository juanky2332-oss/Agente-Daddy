'use client';
import { useState, useRef, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { parseDocument } from '@/lib/openai-service';
import { AIExtractedTransaction, TransactionType, Transaction } from '@/lib/types';
import { ScanLine, PenLine, Upload, CheckCircle, X, Edit3, RefreshCw, AlertCircle, Eye } from 'lucide-react';

const CATEGORIES = [
    { id: 'cat-1', name: 'Alimentación' }, { id: 'cat-2', name: 'Vivienda' },
    { id: 'cat-3', name: 'Transporte' }, { id: 'cat-4', name: 'Suscripciones' },
    { id: 'cat-5', name: 'Ocio' }, { id: 'cat-6', name: 'Ingresos' },
    { id: 'cat-7', name: 'Salud' }, { id: 'cat-8', name: 'Educación' },
];

function ScannerContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'manual' ? 'manual' : 'scan';
    const [tab, setTab] = useState<'scan' | 'manual'>(initialTab as 'scan' | 'manual');

    const { settings, addTransaction } = useAppStore();

    // Scan state
    const [dragOver, setDragOver] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [extracted, setExtracted] = useState<AIExtractedTransaction | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [showRecurringPrompt, setShowRecurringPrompt] = useState(false);
    const [saved, setSaved] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Manual form state
    const [manualForm, setManualForm] = useState({
        amount: '', date: new Date().toISOString().split('T')[0],
        type: 'expense' as TransactionType, description: '', category_id: 'cat-1',
        is_recurring: false, recurrence_days: 30
    });

    const PERIODS = [
        { label: 'Puntual', days: 0 },
        { label: 'Diario', days: 1 },
        { label: 'Semanal', days: 7 },
        { label: 'Mensual', days: 30 },
        { label: 'Trimestral', days: 90 },
        { label: 'Anual', days: 365 },
    ];

    const handleFile = useCallback(async (f: File) => {
        setFile(f);
        setAnalyzing(true);
        setExtracted(null);
        setSaved(false);
        setEditMode(false);
        setShowPreview(false);
        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
        setFilePreviewUrl(URL.createObjectURL(f));
        try {
            const result = await parseDocument(f);
            setExtracted(result);
            setEditMode(true); // Default to edit mode so they can modify all fields right away
            if (result.likely_recurring) setShowRecurringPrompt(true);
        } catch (error: any) {
            console.error('OCR Error:', error);
            alert(`Error al procesar el documento:\n${error.message}`);
            setFile(null);
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        } finally {
            setAnalyzing(false);
        }
    }, [filePreviewUrl]);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const confirmTransaction = async (pending = false) => {
        if (!extracted) return;

        setSaved(true);
        let finalReceiptUrl = undefined;

        try {
            if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `receipts/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('receipts')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('receipts')
                    .getPublicUrl(filePath);

                finalReceiptUrl = data.publicUrl;
            }

            const newTx: Transaction = {
                ...extracted,
                id: `t-${Date.now()}`,
                is_confirmed: !pending,
                source: 'auto',
                is_recurring: extracted.likely_recurring || false,
                recurrence_days: extracted.likely_recurring ? (extracted.recurrence_days || 30) : undefined,
                receipt_url: finalReceiptUrl
            };

            addTransaction(newTx);

            // Trigger Calendar Sync if confirmed
            if (!pending) {
                fetch('/api/calendar/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transaction: newTx })
                }).catch(e => console.error('Calendar sync error:', e));
            }

            // Cleanup
            setFile(null);
            setExtracted(null);
            setEditMode(false);
            if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);

            setTimeout(() => setSaved(false), 3000);

        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Hubo un error al guardar. Revisa tu conexión.');
            setSaved(false);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualForm.amount || !manualForm.description) return;
        addTransaction({
            id: `t-${Date.now()}`,
            date: manualForm.date,
            amount: parseFloat(manualForm.amount),
            type: manualForm.type,
            description: manualForm.description,
            category_id: manualForm.category_id,
            is_recurring: manualForm.is_recurring,
            recurrence_days: manualForm.is_recurring ? manualForm.recurrence_days : undefined,
            is_confirmed: true, source: 'manual',
        });
        setManualForm({ amount: '', date: new Date().toISOString().split('T')[0], type: 'expense', description: '', category_id: 'cat-1', is_recurring: false, recurrence_days: 30 });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="page-container">
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Nueva transacción</h1>

            {/* Tabs */}
            <div className="toggle-group" style={{ marginBottom: '24px' }}>
                <button className={`toggle-option ${tab === 'scan' ? 'active-expense' : ''}`} onClick={() => setTab('scan')}>
                    <ScanLine size={16} style={{ display: 'inline', marginRight: 6 }} /> Escanear doc.
                </button>
                <button className={`toggle-option ${tab === 'manual' ? 'active-expense' : ''}`} onClick={() => setTab('manual')}>
                    <PenLine size={16} style={{ display: 'inline', marginRight: 6 }} /> Manual
                </button>
            </div>

            {/* Success Banner */}
            {saved && (
                <div style={{ background: 'var(--income-light)', border: '1px solid var(--income-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle size={18} color="var(--income)" />
                    <span style={{ color: 'var(--income)', fontWeight: 600 }}>¡Transacción guardada con éxito!</span>
                </div>
            )}

            {/* ─── SCAN TAB ─── */}
            {tab === 'scan' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Upload Zone */}
                    {!extracted && (
                        <div
                            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                            {analyzing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                    <div className="spinner" style={{ width: '36px', height: '36px' }} />
                                    <p style={{ fontWeight: 600 }}>Analizando documento con IA…</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Esto puede tardar unos segundos</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '64px', height: '64px', background: 'var(--gray-200)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Upload size={28} color="var(--gray-500)" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, marginBottom: '4px' }}>{file ? file.name : 'Sube o arrastra tu documento'}</p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Imágenes (JPG, PNG) o PDF. Máx. 10MB</p>
                                    </div>
                                    <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                                        Seleccionar archivo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Recurring Prompt */}
                    {showRecurringPrompt && extracted && (
                        <div className="card" style={{ borderLeft: '4px solid var(--black)' }}>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                <RefreshCw size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <p style={{ fontWeight: 700, marginBottom: '6px' }}>¿Es un pago recurrente?</p>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '14px' }}>La IA detectó que podría ser un pago periódico. ¿Con qué frecuencia se repite?</p>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {PERIODS.filter(p => p.days > 0).map(opt => (
                                            <button key={opt.days} className="btn btn-ghost btn-sm" onClick={() => { setExtracted({ ...extracted, likely_recurring: true, recurrence_days: opt.days } as any); setShowRecurringPrompt(false); }}>
                                                {opt.label}
                                            </button>
                                        ))}
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setExtracted({ ...extracted, likely_recurring: false } as any); setShowRecurringPrompt(false); }}>No, puntual</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Extracted Preview */}
                    {extracted && !showRecurringPrompt && (
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertCircle size={18} color="var(--gray-500)" />
                                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                        Revisa y corrige los datos extraídos (confianza <strong>{Math.round((extracted.confidence || 0.9) * 100)}%</strong>).
                                    </span>
                                </div>
                                {filePreviewUrl && (
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setShowPreview(!showPreview)}
                                        style={{ color: showPreview ? 'var(--primary)' : 'var(--gray-500)', background: showPreview ? 'var(--primary-light)' : 'var(--gray-100)', fontWeight: 600 }}
                                    >
                                        <Eye size={16} style={{ marginRight: '6px' }} /> {showPreview ? 'Ocultar doc' : 'Ver original'}
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: showPreview ? 'repeat(auto-fit, minmax(280px, 1fr))' : '1fr', gap: '20px', alignItems: 'start' }}>


                                {showPreview && filePreviewUrl && (
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        minHeight: '350px',
                                        maxHeight: '500px',
                                        overflow: 'auto',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--gray-200)',
                                        backgroundColor: 'var(--gray-50)',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start'
                                    }}>
                                        {file?.type.startsWith('image/') ? (
                                            <img src={filePreviewUrl} alt="Documento escaneado" style={{ maxWidth: '100%', objectFit: 'contain' }} />
                                        ) : (
                                            <iframe src={filePreviewUrl} width="100%" height="100%" style={{ border: 'none', minHeight: '350px' }} title="PDF escaneado" />
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                                    {editMode ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div className="form-group">
                                                <label className="label">Importe (€)</label>
                                                <input className="input" type="number" value={extracted.amount} onChange={(e) => setExtracted({ ...extracted, amount: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Fecha</label>
                                                <input className="input" type="date" value={extracted.date} onChange={(e) => setExtracted({ ...extracted, date: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Tipo</label>
                                                <div className="toggle-group">
                                                    <button className={`toggle-option ${extracted.type === 'income' ? 'active-income' : ''}`} onClick={() => setExtracted({ ...extracted, type: 'income' })}>Ingreso</button>
                                                    <button className={`toggle-option ${extracted.type === 'expense' ? 'active-expense' : ''}`} onClick={() => setExtracted({ ...extracted, type: 'expense' })}>Gasto</button>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Descripción</label>
                                                <input className="input" value={extracted.description} onChange={(e) => setExtracted({ ...extracted, description: e.target.value })} />
                                            </div>
                                            <div className="form-group">
                                                <label className="label">Categoría</label>
                                                <select className="select" value={extracted.category_id} onChange={(e) => setExtracted({ ...extracted, category_id: e.target.value })}>
                                                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label className="label">¿Se repite?</label>
                                                <select
                                                    className="select"
                                                    value={extracted.likely_recurring ? (extracted.recurrence_days || 30) : 0}
                                                    onChange={(e) => {
                                                        const days = parseInt(e.target.value);
                                                        setExtracted({
                                                            ...extracted,
                                                            likely_recurring: days > 0,
                                                            recurrence_days: days > 0 ? days : undefined
                                                        } as any);
                                                    }}
                                                >
                                                    {PERIODS.map(p => <option key={p.days} value={p.days}>{p.label}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                <button disabled={isUploading} className="btn btn-primary flex items-center gap-2 justify-center" style={{ flex: 1, opacity: isUploading ? 0.7 : 1 }} onClick={() => confirmTransaction(false)}>
                                                    {isUploading ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <CheckCircle size={16} />}
                                                    {isUploading ? 'Subiendo...' : 'Confirmar guardado'}
                                                </button>
                                                <button disabled={isUploading} className="btn btn-ghost btn-icon" style={{ opacity: isUploading ? 0.5 : 1 }} title="Guardar como pendiente" onClick={() => confirmTransaction(true)}>
                                                    <RefreshCw size={16} />
                                                </button>
                                                <button disabled={isUploading} className="btn btn-icon" style={{ background: 'var(--expense-light)', color: 'var(--expense)', opacity: isUploading ? 0.5 : 1 }} title="Rechazar y descartar" onClick={() => { setExtracted(null); setFile(null); setShowPreview(false); }}>
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* Preview */
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {[
                                                { label: 'Importe', value: `${extracted.amount.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €` },
                                                { label: 'Fecha', value: new Date(extracted.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) },
                                                { label: 'Tipo', value: extracted.type === 'income' ? '✅ Ingreso' : '🔴 Gasto' },
                                                { label: 'Descripción', value: extracted.description },
                                                { label: 'Categoría', value: CATEGORIES.find(c => c.id === extracted.category_id)?.name || '—' },
                                            ].map(({ label, value }) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>
                                                    <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>{label}</span>
                                                    <span style={{ fontWeight: 600 }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    {!editMode && (
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            <button disabled={isUploading} className="btn btn-primary flex items-center gap-2 justify-center" style={{ flex: 1, opacity: isUploading ? 0.7 : 1 }} onClick={() => confirmTransaction(false)}>
                                                {isUploading ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <CheckCircle size={16} />}
                                                {isUploading ? 'Subiendo...' : 'Confirmar'}
                                            </button>
                                            <button disabled={isUploading} className="btn btn-ghost btn-icon" style={{ opacity: isUploading ? 0.5 : 1 }} title="Editar" onClick={() => setEditMode(true)}>
                                                <Edit3 size={16} />
                                            </button>
                                            <button disabled={isUploading} className="btn btn-ghost btn-icon" style={{ opacity: isUploading ? 0.5 : 1 }} title="Guardar como pendiente" onClick={() => confirmTransaction(true)}>
                                                <RefreshCw size={16} />
                                            </button>
                                            <button disabled={isUploading} className="btn btn-icon" style={{ background: 'var(--expense-light)', color: 'var(--expense)', opacity: isUploading ? 0.5 : 1 }} title="Rechazar" onClick={() => { setExtracted(null); setFile(null); }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ─── MANUAL TAB ─── */}
            {tab === 'manual' && (
                <form onSubmit={handleManualSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="toggle-group">
                        <button type="button" className={`toggle-option ${manualForm.type === 'income' ? 'active-income' : ''}`} onClick={() => setManualForm(f => ({ ...f, type: 'income' }))}>💰 Ingreso</button>
                        <button type="button" className={`toggle-option ${manualForm.type === 'expense' ? 'active-expense' : ''}`} onClick={() => setManualForm(f => ({ ...f, type: 'expense' }))}>💸 Gasto</button>
                    </div>

                    <div className="form-group">
                        <label className="label">Importe (€) *</label>
                        <input className="input" type="number" step="0.01" min="0.01" placeholder="0,00" required value={manualForm.amount} onChange={(e) => setManualForm(f => ({ ...f, amount: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="label">Fecha *</label>
                        <input className="input" type="date" required value={manualForm.date} onChange={(e) => setManualForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="form-group">
                        <label className="label">Categoría</label>
                        <select className="select" value={manualForm.category_id} onChange={(e) => setManualForm(f => ({ ...f, category_id: e.target.value }))}>
                            {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="label">Descripción *</label>
                        <input className="input" type="text" placeholder="Ej: Mercadona, Alquiler, Nómina…" required value={manualForm.description} onChange={(e) => setManualForm(f => ({ ...f, description: e.target.value }))} />
                    </div>

                    <div className="form-group">
                        <label className="label">Periodicidad</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                            {PERIODS.map(p => (
                                <button
                                    key={p.days}
                                    type="button"
                                    className={`btn btn-sm ${((!manualForm.is_recurring && p.days === 0) || (manualForm.is_recurring && manualForm.recurrence_days === p.days)) ? 'btn-primary' : 'btn-ghost'}`}
                                    onClick={() => setManualForm(f => ({ ...f, is_recurring: p.days > 0, recurrence_days: p.days }))}
                                    style={{ fontSize: '0.75rem', padding: '6px 4px' }}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg w-full" style={{ marginTop: '8px' }}>
                        Guardar transacción
                    </button>
                </form>
            )}
        </div>
    );
}

export default function ScannerPage() {
    return (
        <Suspense fallback={
            <div className="page-container flex items-center justify-center min-h-[50vh]">
                <div className="spinner" />
            </div>
        }>
            <ScannerContent />
        </Suspense>
    );
}
