import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, X, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';
import useGameStoreAdmin from '../store/useGameStore';
import useProviderStore from '../store/useProviderStore';
import useGuestStore from '../store/useGuestStore';
import GuestModal from '../components/GuestModal';

/* ─────────────────────────────────────────
   GAME LAUNCH — via backend proxy (API key lives in server .env)
───────────────────────────────────────── */
const LAUNCH_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/admin/games/launch`;

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const GAME_TYPES = [
    { type: 'ALL', label: 'All Games', icon: '🎮', color: '#ffffff' },
    { type: 'SLOT', label: 'Slot', icon: '🎰', color: '#a855f7' },
    { type: 'CASINO', label: 'Casino', icon: '🃏', color: '#f59e0b' },
    { type: 'LIVE', label: 'Live', icon: '📡', color: '#f43f5e' },
    { type: 'SPORTS', label: 'Sports', icon: '⚽', color: '#3b82f6' },
    { type: 'FISHING', label: 'Fishing', icon: '🎣', color: '#06b6d4' },
    { type: 'ARCADE', label: 'Arcade', icon: '🕹️', color: '#ec4899' },
    { type: 'CRASH', label: 'Crash', icon: '🚀', color: '#ef4444' },
    { type: 'CARD', label: 'Card', icon: '🂡', color: '#22c55e' },
    { type: 'POKER', label: 'Poker', icon: '♠️', color: '#10b981' },
    { type: 'TABLE', label: 'Table', icon: '🎲', color: '#d946ef' },
    { type: 'LOTTERY', label: 'Lottery', icon: '🎟️', color: '#14b8a6' },
    { type: 'NUMBER', label: 'Number', icon: '🔢', color: '#0ea5e9' },
    { type: 'ESPORT', label: 'eSport', icon: '🏆', color: '#8b5cf6' },
    { type: 'CRICKET', label: 'Cricket', icon: '🏏', color: '#84cc16' },
    { type: 'HORSEBOOK', label: 'Horse', icon: '🏇', color: '#eab308' },
    { type: 'COCKFIGHT', label: 'Cockfight', icon: '🐓', color: '#f97316' },
    { type: 'GALAXY', label: 'Galaxy', icon: '🌌', color: '#6366f1' },
    { type: 'UNKNOWN', label: 'Unknown', icon: '❓', color: '#64748b' },
];

const getGameTheme = (type) => {
    switch (type?.toUpperCase()) {
        case 'SLOT': return { glow: '0_0_40px_rgba(168,85,247,0.5)', badge: 'bg-purple-600', shine: 'via-purple-300/30' };
        case 'CASINO': return { glow: '0_0_40px_rgba(245,158,11,0.5)', badge: 'bg-amber-600', shine: 'via-amber-300/30' };
        case 'FISHING': return { glow: '0_0_40px_rgba(6,182,212,0.5)', badge: 'bg-cyan-600', shine: 'via-cyan-300/30' };
        case 'ARCADE': return { glow: '0_0_40px_rgba(236,72,153,0.5)', badge: 'bg-pink-600', shine: 'via-pink-300/30' };
        case 'CRASH': return { glow: '0_0_40px_rgba(239,68,68,0.5)', badge: 'bg-red-600', shine: 'via-red-300/30' };
        case 'CARD': return { glow: '0_0_40px_rgba(34,197,94,0.5)', badge: 'bg-green-600', shine: 'via-green-300/30' };
        case 'COCKFIGHT': return { glow: '0_0_40px_rgba(249,115,22,0.5)', badge: 'bg-orange-600', shine: 'via-orange-300/30' };
        case 'CRICKET': return { glow: '0_0_40px_rgba(132,204,22,0.5)', badge: 'bg-lime-600', shine: 'via-lime-300/30' };
        case 'ESPORT': return { glow: '0_0_40px_rgba(139,92,246,0.5)', badge: 'bg-violet-600', shine: 'via-violet-300/30' };
        case 'GALAXY': return { glow: '0_0_40px_rgba(99,102,241,0.5)', badge: 'bg-indigo-600', shine: 'via-indigo-300/30' };
        case 'HORSEBOOK': return { glow: '0_0_40px_rgba(234,179,8,0.5)', badge: 'bg-yellow-600', shine: 'via-yellow-300/30' };
        case 'LIVE': return { glow: '0_0_40px_rgba(244,63,94,0.5)', badge: 'bg-rose-600', shine: 'via-rose-300/30' };
        case 'LOTTERY': return { glow: '0_0_40px_rgba(20,184,166,0.5)', badge: 'bg-teal-600', shine: 'via-teal-300/30' };
        case 'NUMBER': return { glow: '0_0_40px_rgba(14,165,233,0.5)', badge: 'bg-sky-600', shine: 'via-sky-300/30' };
        case 'POKER': return { glow: '0_0_40px_rgba(16,185,129,0.5)', badge: 'bg-emerald-600', shine: 'via-emerald-300/30' };
        case 'SPORTS': return { glow: '0_0_40px_rgba(59,130,246,0.5)', badge: 'bg-blue-600', shine: 'via-blue-300/30' };
        case 'TABLE': return { glow: '0_0_40px_rgba(217,70,239,0.5)', badge: 'bg-fuchsia-600', shine: 'via-fuchsia-300/30' };
        default: return { glow: '0_0_40px_rgba(100,116,139,0.4)', badge: 'bg-slate-600', shine: 'via-white/10' };
    }
};

/* ─────────────────────────────────────────
   STAR BACKGROUND
───────────────────────────────────────── */
const StarField = () => {
    const stars = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: (Math.random() * 4 + 2).toFixed(1),
        delay: (Math.random() * 5).toFixed(1),
    }));

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {stars.map(s => (
                <div
                    key={s.id}
                    className="star"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        '--duration': `${s.duration}s`,
                        '--delay': `${s.delay}s`,
                    }}
                />
            ))}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-3xl" />
            <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-cyan-600/4 rounded-full blur-3xl" />
        </div>
    );
};

/* ─────────────────────────────────────────
   GAME LAUNCH MODAL
───────────────────────────────────────── */
const GameLaunchModal = ({ game, onClose }) => {
    const [status, setStatus] = useState('loading'); // loading | ready | error
    const [gameUrl, setGameUrl] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [fullscreen, setFullscreen] = useState(false);
    const iframeRef = useRef(null);

    useEffect(() => {
        if (!game) return;
        setStatus('loading');
        setGameUrl(null);
        setErrorMsg('');

        const body = {
            username: 'demo_user',
            money: 1000,
            provider_code: game.providerCode,
            game_code: game.gameCode || 0,
            game_type: game.gameType || 0,
        };

        fetch(LAUNCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        })
            .then(r => r.json())
            .then(data => {
                const url = data?.joyhobe || data?.url || data?.gameUrl;
                if (url) {
                    setGameUrl(url);
                    setStatus('ready');
                } else {
                    setErrorMsg(data?.message || 'Game URL not received');
                    setStatus('error');
                }
            })
            .catch(err => {
                setErrorMsg(err.message || 'Network error');
                setStatus('error');
            });
    }, [game]);

    // close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const typeInfo = GAME_TYPES.find(t => t.type === game?.gameType?.toUpperCase());
    const theme = getGameTheme(game?.gameType);

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            {/* Modal box */}
            <div
                className={`relative flex flex-col rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl transition-all duration-300 ${fullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl'
                    }`}
                style={{
                    background: 'linear-gradient(160deg, #0f172a 0%, #030712 100%)',
                    height: fullscreen ? '100%' : 'min(90vh, 800px)',
                    boxShadow: `0 0 80px ${typeInfo?.color || '#6366f1'}33`,
                }}
            >
                {/* ── HEADER ── */}
                <div
                    className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 shrink-0"
                    style={{ background: 'rgba(15,23,42,0.8)' }}
                >
                    {/* Game thumb */}
                    <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-700/60 shrink-0">
                        <img
                            src={game?.image || `https://via.placeholder.com/36x36/0f172a/334155?text=G`}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-sm text-white truncate">{game?.gameName}</h2>
                        <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold ${theme.badge} text-white px-1.5 py-0.5 rounded-full`}
                        >
                            {typeInfo?.icon} {game?.gameType}
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        <button
                            onClick={() => setFullscreen(f => !f)}
                            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all flex items-center justify-center"
                            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                        >
                            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition-all flex items-center justify-center"
                            title="Close"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="relative flex-1 overflow-hidden">

                    {/* LOADING */}
                    {status === 'loading' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
                            style={{ background: 'linear-gradient(160deg, #0f172a 0%, #030712 100%)' }}
                        >
                            {/* Spinning rings */}
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-2 border-transparent"
                                    style={{
                                        borderTopColor: typeInfo?.color || '#6366f1',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                />
                                <div className="absolute inset-2 rounded-full border-2 border-transparent"
                                    style={{
                                        borderTopColor: `${typeInfo?.color || '#6366f1'}80`,
                                        animation: 'spin 1.5s linear infinite reverse',
                                    }}
                                />
                                <div className="absolute inset-4 rounded-full border-2 border-transparent"
                                    style={{
                                        borderTopColor: `${typeInfo?.color || '#6366f1'}40`,
                                        animation: 'spin 2s linear infinite',
                                    }}
                                />
                                {/* Center logo */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <img
                                        src={logoImg}
                                        alt="logo"
                                        className="w-16 h-16 object-contain drop-shadow-lg"
                                        style={{ animation: 'pulse 2s ease-in-out infinite' }}
                                    />
                                </div>
                                {/* Glow */}
                                <div
                                    className="absolute inset-0 rounded-full blur-xl opacity-30"
                                    style={{ background: typeInfo?.color || '#6366f1' }}
                                />
                            </div>

                            <div className="text-center">
                                <p className="text-white font-bold text-base">{game?.gameName}</p>
                                <p className="text-slate-500 text-xs mt-1 animate-pulse">Launching game...</p>
                            </div>

                            {/* Animated dots */}
                            <div className="flex gap-2">
                                {[0, 1, 2, 3].map(i => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            background: typeInfo?.color || '#6366f1',
                                            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                            opacity: 0.8,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ERROR */}
                    {status === 'error' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 p-6">
                            <div className="text-5xl mb-2">⚠️</div>
                            <h3 className="text-red-400 font-bold text-lg">Failed to Launch</h3>
                            <p className="text-slate-500 text-sm text-center max-w-sm">{errorMsg}</p>
                            <button
                                onClick={onClose}
                                className="mt-2 px-5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    )}

                    {/* IFRAME */}
                    {gameUrl && (
                        <iframe
                            ref={iframeRef}
                            src={gameUrl}
                            className="w-full h-full border-0"
                            allow="fullscreen; autoplay; encrypted-media"
                            allowFullScreen
                            title={game?.gameName}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   GAME CARD
───────────────────────────────────────── */
const GameCard = ({ game, index, onPlay }) => {
    const theme = getGameTheme(game.gameType);
    const typeInfo = GAME_TYPES.find(t => t.type === game.gameType?.toUpperCase());
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="slide-in rainbow-border group relative rounded-2xl p-[2px] cursor-pointer select-none"
            style={{ animationDelay: `${(index % 24) * 40}ms` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Rainbow glow */}
            <div
                className="absolute inset-0 rounded-2xl transition-opacity duration-500 blur-md"
                style={{
                    background: 'linear-gradient(45deg, #ff0044, #ff7700, #ffee00, #00ff88, #00aaff, #8800ff, #ff0044)',
                    backgroundSize: '300% 300%',
                    opacity: hovered ? 0.7 : 0,
                    animation: hovered ? 'rainbow-spin 4s linear infinite' : 'none',
                }}
            />

            {/* Card */}
            <div
                className="relative h-full bg-gradient-to-b from-slate-800/80 to-slate-900 rounded-2xl overflow-hidden z-10 transition-all duration-500"
                style={{
                    boxShadow: hovered ? `0 ${theme.glow}` : '0 2px 8px rgba(0,0,0,0.4)',
                    transform: hovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                }}
            >
                {/* Shimmer */}
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute inset-0 opacity-10 glass-shine" />
                    {hovered && (
                        <div className={`absolute inset-0 bg-gradient-to-tr from-transparent ${theme.shine} to-transparent w-[200%] h-full animate-shine`} />
                    )}
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5 transition-opacity duration-500"
                        style={{ opacity: hovered ? 1 : 0.3 }}
                    />
                </div>

                {/* Image */}
                <div className="relative w-full aspect-[3/4] bg-slate-950 overflow-hidden">
                    <img
                        src={game.image || `https://via.placeholder.com/300x400/0f172a/334155?text=${encodeURIComponent(game.gameName?.[0] || 'G')}`}
                        alt={game.gameName}
                        className="w-full h-full object-cover transition-transform duration-700"
                        style={{ transform: hovered ? 'scale(1.12) rotate(1deg)' : 'scale(1)' }}
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/80" />

                    {/* Type badge */}
                    <div className={`absolute top-2 left-2 ${theme.badge} backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/20 shadow-lg`}>
                        <span>{typeInfo?.icon || '🎮'}</span>
                        <span>{game.gameType || 'GAME'}</span>
                    </div>

                    {/* Popular badge */}
                    {game.popular && (
                        <div className="absolute top-2 right-2 bg-yellow-400/20 backdrop-blur-md border border-yellow-400/40 rounded-full p-1 shadow-lg">
                            <span className="text-yellow-400 text-[10px]">⭐</span>
                        </div>
                    )}

                    {/* Play overlay */}
                    <div
                        className="absolute inset-0 flex items-center justify-center transition-opacity duration-300"
                        style={{ opacity: hovered ? 1 : 0 }}
                        onClick={(e) => { e.stopPropagation(); onPlay(game); }}
                    >
                        <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl hover:bg-white/20 transition-colors">
                            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-3 py-2.5 relative z-20">
                    <h3
                        className="font-bold text-sm leading-tight truncate transition-colors duration-300"
                        style={{ color: hovered ? typeInfo?.color || '#fff' : '#f1f5f9' }}
                        title={game.gameName}
                    >
                        {game.gameName}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">{game.providerCode}</p>
                </div>
            </div>
        </div>
    );
};

/* ─────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────── */
const Home = () => {
    const { games, fetchGames, loading, totalPages, page } = useGameStoreAdmin();
    const { providers, fetchProviders } = useProviderStore();

    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState('ALL');
    const [filterProvider, setFilterProvider] = useState('');
    const [launchGame, setLaunchGame] = useState(null); // game object to launch
    const [showGuestModal, setShowGuestModal] = useState(false);
    const [pendingGame, setPendingGame] = useState(null);

    const { checkSession } = useGuestStore();
    const pillsRef = useRef(null);

    const handlePlay = useCallback(async (game) => {
        const isValid = await checkSession();
        if (!isValid) {
            setPendingGame(game);
            setShowGuestModal(true);
        } else {
            setLaunchGame(game);
        }
    }, [checkSession]);

    const handleGuestSuccess = useCallback(() => {
        setShowGuestModal(false);
        if (pendingGame) {
            setLaunchGame(pendingGame);
            setPendingGame(null);
        }
    }, [pendingGame]);

    const handleCloseLaunch = useCallback(() => setLaunchGame(null), []);

    useEffect(() => { fetchProviders(); }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            fetchGames(1, 24, searchTerm, filterProvider, activeType === 'ALL' ? '' : activeType);
        }, 350);
        return () => clearTimeout(t);
    }, [searchTerm, activeType, filterProvider, fetchGames]);

    const handlePage = (n) => fetchGames(n, 24, searchTerm, filterProvider, activeType === 'ALL' ? '' : activeType);
    const clearAll = () => { setSearchTerm(''); setActiveType('ALL'); setFilterProvider(''); };
    const hasFilters = searchTerm || activeType !== 'ALL' || filterProvider;
    const activeTypeInfo = GAME_TYPES.find(t => t.type === activeType);

    const scrollPills = (dir) => pillsRef.current?.scrollBy({ left: dir * 280, behavior: 'smooth' });

    return (
        <div className="min-h-screen bg-[#030712] text-slate-100 font-sans relative overflow-x-hidden">
            <StarField />

            {/* ── HEADER ── */}
            <header className="sticky top-0 z-50 bg-[#030712]/80 backdrop-blur-xl border-b border-slate-800/60">
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center gap-4">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0 no-underline">
                        <img
                            src={logoImg}
                            alt="GameHub"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>

                    {/* Nav Links — Desktop */}
                    <nav className="hidden md:flex items-center gap-1 ml-2">
                        <Link to="/docs"
                            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all no-underline font-medium">
                            📄 Docs
                        </Link>
                        <Link to="/live-cricket"
                            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all no-underline font-medium">
                            🏏 Live Scores
                        </Link>
                        <Link to="/live-crex"
                            className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all no-underline font-medium">
                            📊 Live Crex
                        </Link>
                    </nav>

                    {/* Desktop Search */}
                    <div className="relative flex-1 max-w-lg hidden md:block">
                        <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search among thousands of games..."
                            className="w-full h-9 bg-slate-900/60 border border-slate-700/60 rounded-xl pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="ml-auto flex items-center gap-2 shrink-0">
                        {/* Provider dropdown */}
                        <select
                            className="hidden md:block h-9 bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500/60 transition-all max-w-[160px]"
                            value={filterProvider}
                            onChange={e => setFilterProvider(e.target.value)}
                        >
                            <option value="">All Providers</option>
                            {providers.map(p => (
                                <option key={p._id} value={p.providerCode}>{p.providerName || p.providerCode}</option>
                            ))}
                        </select>

                        {hasFilters && (
                            <button onClick={clearAll} className="h-9 px-3 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-900/20 text-xs flex items-center gap-1.5 transition-colors">
                                <X size={12} /> Reset
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ── TYPE PILLS BAR ── */}
            <div className="sticky top-16 z-40 bg-[#030712]/85 backdrop-blur-xl border-b border-slate-800/40">
                <div className="max-w-screen-xl mx-auto px-4 md:px-8">

                    {/* Relative wrapper for arrows + pills */}
                    <div className="relative flex items-center">

                        {/* ◀ Left Arrow */}
                        <button
                            onClick={() => scrollPills(-1)}
                            className="absolute left-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all hover:scale-110"
                            style={{ boxShadow: '6px 0 20px 10px #030712' }}
                        >
                            <ChevronLeft size={14} />
                        </button>

                        {/* Pills */}
                        <div
                            ref={pillsRef}
                            className="flex gap-1.5 py-2.5 scrollbar-hide"
                            style={{ overflowX: 'auto', cursor: 'grab', paddingLeft: '2rem', paddingRight: '2rem' }}
                            onWheel={(e) => {
                                e.preventDefault();
                                e.currentTarget.scrollLeft += e.deltaY + e.deltaX;
                            }}
                        >
                            {GAME_TYPES.map(({ type, label, icon, color }) => {
                                const isActive = activeType === type;
                                return (
                                    <button
                                        key={type}
                                        onClick={() => setActiveType(type)}
                                        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all duration-200 shrink-0 border ${isActive
                                            ? 'border-transparent scale-105'
                                            : 'bg-slate-900/40 text-slate-500 border-slate-800/60 hover:text-slate-300 hover:border-slate-600 hover:bg-slate-800/50'
                                            }`}
                                        style={isActive ? {
                                            background: `linear-gradient(135deg, ${color}33, ${color}15)`,
                                            borderColor: `${color}60`,
                                            boxShadow: `0 0 12px ${color}40, inset 0 1px 0 ${color}20`,
                                            color: color,
                                        } : {}}
                                    >
                                        <span className="text-base leading-none">{icon}</span>
                                        {label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ▶ Right Arrow */}
                        <button
                            onClick={() => scrollPills(1)}
                            className="absolute right-0 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-500 transition-all hover:scale-110"
                            style={{ boxShadow: '-6px 0 20px 10px #030712' }}
                        >
                            <ChevronRight size={14} />
                        </button>

                    </div>
                </div>
            </div>

            {/* ── MAIN ── */}
            <main className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 py-6">

                {/* Context banner + filter tags */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                        {activeType !== 'ALL' ? (
                            <span className="flex items-center gap-2 text-sm font-semibold" style={{ color: activeTypeInfo?.color }}>
                                <span className="text-xl">{activeTypeInfo?.icon}</span>
                                {activeTypeInfo?.label} Games
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                                <Sparkles size={14} className="text-blue-400" /> All Games
                            </span>
                        )}
                        {!loading && (
                            <span className="text-xs text-slate-600 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                                Page {page}/{totalPages || 1}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                        {filterProvider && (
                            <span className="flex items-center gap-1 text-[10px] bg-blue-900/30 text-blue-300 border border-blue-800/50 px-2.5 py-1 rounded-full">
                                🏢 {providers.find(p => p.providerCode === filterProvider)?.providerName || filterProvider}
                                <button onClick={() => setFilterProvider('')} className="ml-0.5 opacity-60 hover:opacity-100"><X size={9} /></button>
                            </span>
                        )}
                        {searchTerm && (
                            <span className="flex items-center gap-1 text-[10px] bg-slate-800/60 text-slate-400 border border-slate-700/50 px-2.5 py-1 rounded-full">
                                🔍 "{searchTerm}"
                                <button onClick={() => setSearchTerm('')} className="ml-0.5 opacity-60 hover:opacity-100"><X size={9} /></button>
                            </span>
                        )}
                    </div>
                </div>

                {/* Mobile search + provider */}
                <div className="md:hidden flex flex-col gap-2 mb-5">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
                        <input
                            type="text"
                            placeholder="Search games..."
                            className="w-full h-9 bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-9 bg-slate-900 border border-slate-700 rounded-xl px-3 text-sm text-slate-300 focus:outline-none"
                        value={filterProvider}
                        onChange={e => setFilterProvider(e.target.value)}
                    >
                        <option value="">All Providers</option>
                        {providers.map(p => (
                            <option key={p._id} value={p.providerCode}>{p.providerName || p.providerCode}</option>
                        ))}
                    </select>
                </div>

                {/* Loading spinner */}
                {loading && games.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <div className="relative">
                            <Loader2 className="animate-spin text-blue-500" size={48} />
                            <div className="absolute inset-0 blur-xl bg-blue-500/20 rounded-full" />
                        </div>
                        <p className="text-slate-500 text-sm animate-pulse">Loading games...</p>
                    </div>
                )}

                {/* Games Grid */}
                {(!loading || games.length > 0) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {[...games].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0)).map((game, i) => (
                            <GameCard key={game._id || game.gameCode} game={game} index={i} onPlay={handlePlay} />
                        ))}
                    </div>
                )}

                {/* Empty state */}
                {!loading && games.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-28 gap-3 text-center">
                        <div className="text-6xl mb-2 animate-bounce">🎮</div>
                        <h3 className="text-xl font-bold text-slate-300">No games found</h3>
                        <p className="text-slate-600 text-sm max-w-xs">Try changing your filters or search for something else</p>
                        {hasFilters && (
                            <button onClick={clearAll} className="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-xl transition-colors font-semibold">
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-10">
                        <button
                            disabled={page === 1}
                            onClick={() => handlePage(page - 1)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} /> Prev
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePage(p)}
                                        className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${page === p
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                            {totalPages > 7 && <span className="text-slate-600 px-1">…{totalPages}</span>}
                        </div>

                        <button
                            disabled={page === totalPages}
                            onClick={() => handlePage(page + 1)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}

            </main>

            {/* Footer */}
            <footer className="relative z-10 mt-16 border-t border-slate-800/40 py-6 text-center text-xs text-slate-700">
                © {new Date().getFullYear()} GameHub — All Rights Reserved
            </footer>

            {/* Game Launch Modal */}
            {launchGame && (
                <GameLaunchModal game={launchGame} onClose={handleCloseLaunch} />
            )}

            {/* Guest Registration/Validation Modal */}
            {showGuestModal && (
                <GuestModal
                    onClose={() => setShowGuestModal(false)}
                    onSuccess={handleGuestSuccess}
                />
            )}
        </div>
    );
};

export default Home;
