import React, { useState } from 'react';
import { X, Loader2, MessageCircle, Send } from 'lucide-react';
import useGuestStore from '../store/useGuestStore';

const GuestModal = ({ onClose, onSuccess }) => {
    const { startSession, loading, error, isRestricted } = useGuestStore();

    const [waNum, setWaNum] = useState('');
    const [tgId, setTgId] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!waNum) {
            setLocalError('WhatsApp number is required.');
            return;
        }

        const result = await startSession(waNum, tgId);
        if (result.success) {
            if (onSuccess) onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>

            <div
                className="relative w-full max-w-sm rounded-2xl border border-slate-700/60 shadow-2xl overflow-hidden"
                style={{ background: 'linear-gradient(160deg, #0f172a 0%, #030712 100%)', boxShadow: '0 0 50px rgba(59,130,246,0.15)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/60" style={{ background: 'rgba(15,23,42,0.8)' }}>
                    <h2 className="font-bold text-lg text-white">Play As Guest</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {isRestricted || error?.includes('contact support') ? (
                        <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">⚠️</span>
                            </div>
                            <h3 className="text-red-400 font-bold mb-2 text-lg">Access Restricted</h3>
                            <p className="text-slate-400 text-sm mb-6">{error || 'Your 1-hour session has expired.'}</p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium text-sm"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <p className="text-slate-400 text-sm mb-2 leading-relaxed">
                                Provide your WhatsApp number to start playing immediately. You will receive <strong>1 hour</strong> of free playtime.
                            </p>

                            {(error || localError) && (
                                <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
                                    {error || localError}
                                </div>
                            )}

                            {/* WhatsApp Field */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5 ml-1">
                                    <MessageCircle size={14} className="text-green-500" />
                                    WhatsApp Number <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        placeholder="+8801XXXXXXXXX"
                                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        value={waNum}
                                        onChange={(e) => setWaNum(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Telegram Field */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1.5 ml-1">
                                    <Send size={14} className="text-blue-400" />
                                    Telegram ID <span className="text-slate-500 font-normal">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="@your_telegram"
                                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-4 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        value={tgId}
                                        onChange={(e) => setTgId(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-800">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center disabled:opacity-50"
                                    style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                                >
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        "Start 1-Hour Session"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GuestModal;
