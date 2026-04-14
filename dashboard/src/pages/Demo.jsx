import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Wifi, Copy, Check } from 'lucide-react';


/* ── Status config ── */
const getState = (state) => ({
    live: { label: 'LIVE', bg: 'from-red-500 to-rose-600', text: '#f87171', dot: '#ef4444' },
    complete: { label: 'ENDED', bg: 'from-slate-600 to-slate-700', text: '#94a3b8', dot: '#64748b' },
    preview: { label: 'SOON', bg: 'from-amber-500 to-orange-500', text: '#fbbf24', dot: '#f59e0b' },
}[state] || { label: 'MATCH', bg: 'from-slate-600 to-slate-700', text: '#94a3b8', dot: '#64748b' });

/* ── Match Card ── */
const MatchCard = ({ match }) => {
    const st = getState(match.state);
    const isLive = match.state === 'live';

    return (
        <div
            className="relative flex-shrink-0 rounded-2xl overflow-hidden flex flex-col cursor-pointer group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            style={{
                width: 360,
                background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                border: isLive ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isLive
                    ? '0 0 24px rgba(239,68,68,0.15), 0 4px 24px rgba(0,0,0,0.5)'
                    : '0 4px 24px rgba(0,0,0,0.4)',
            }}
        >
            {/* Glow top strip */}
            <div
                className={`h-[3px] w-full bg-gradient-to-r ${st.bg} ${isLive ? 'animate-pulse' : ''}`}
            />

            <a
                href={match.fullUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col flex-1 p-4 gap-3 no-underline"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-slate-400 leading-relaxed flex-1">
                        {match.subtitle || match.title}
                    </p>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full bg-gradient-to-r ${st.bg} text-white leading-none tracking-wide`}
                        >
                            {st.label}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono bg-slate-800/60 px-1.5 py-0.5 rounded">
                            {match.matchType || 'T20'}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/5" />

                {/* Teams */}
                <div className="flex flex-col gap-2">
                    {[match.team1, match.team2].map((team, i) => {
                        const isBatting = isLive && i === 0;
                        return (
                            <div key={i} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors ${isBatting ? 'bg-white/5' : ''}`}>
                                <div className="flex items-center gap-2.5 min-w-0">
                                    {team?.flag ? (
                                        <img
                                            src={team.flag}
                                            alt={team.name}
                                            width={28} height={20}
                                            className="rounded object-cover flex-shrink-0 shadow"
                                            style={{ width: 28, height: 20 }}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-7 h-5 rounded bg-slate-700 flex-shrink-0" />
                                    )}
                                    <span className={`text-sm truncate max-w-[120px] font-${isBatting ? 'bold text-white' : 'medium text-slate-400'}`}>
                                        {team?.name || 'TBD'}
                                    </span>
                                </div>
                                <span className={`text-sm font-bold tabular-nums ${isBatting ? 'text-white' : 'text-slate-500'}`}>
                                    {team?.score || '—'}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 rounded-lg px-3 py-2 mt-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    {isLive ? (
                        <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: st.dot }} />
                            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: st.dot }} />
                        </span>
                    ) : (
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: st.dot }} />
                    )}
                    <span className="text-sm font-semibold leading-snug" style={{ color: st.text }}>
                        {match.status || 'Upcoming'}
                    </span>
                </div>
            </a>

            {/* Footer */}
            {match.links?.length > 0 && (
                <div className="px-4 py-2 flex justify-end gap-3 border-t border-white/5">
                    {match.links.map((link, i) => (
                        <a
                            key={i}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-600 hover:text-slate-300 uppercase tracking-widest transition-colors"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ── Main Page ── */
const Demo = () => {
    const location = useLocation();
    const isCrex = location.pathname === '/live-crex';

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const scrollRef = useRef(null);

    const fetchMatches = async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const endpoint = isCrex ? '/api/cricket/live-crex' : '/api/cricket/matches';
            const api_url = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + endpoint;
            const res = await fetch(api_url);
            const json = await res.json();
            if (json.success) {
                setMatches(json.data || []);
                setLastUpdated(new Date());
            } else {
                setError(json.message || 'Failed to load');
            }
        } catch {
            setError('Backend not reachable');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
        const id = setInterval(() => fetchMatches(true), 3000);
        return () => clearInterval(id);
    }, [isCrex]);

    const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 376, behavior: 'smooth' });

    return (
        <div className="min-h-screen font-sans py-10 px-6" style={{ background: 'linear-gradient(160deg,#030712 0%,#0b1120 100%)' }}>
            <div className="max-w-screen-xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg shadow-green-900/40">
                        {isCrex ? '📊' : '🏏'}
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-lg leading-tight">{isCrex ? 'Live Crex' : 'Live Cricket'}</h1>
                        {lastUpdated && (
                            <p className="text-[11px] text-slate-500">Updated {lastUpdated.toLocaleTimeString()}</p>
                        )}
                    </div>
                </div>

                {/* Skeletons */}
                {loading && matches.length === 0 && (
                    <div className="flex gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex-shrink-0 rounded-2xl animate-pulse h-[240px]"
                                style={{ width: 360, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="rounded-2xl p-5 text-red-400 text-sm flex items-center gap-3"
                        style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
                        <Wifi size={16} />{error}
                    </div>
                )}

                {/* Carousel */}
                {matches.length > 0 && (
                    <div className="relative">
                        <button onClick={() => scroll(-1)}
                            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ChevronLeft size={18} />
                        </button>

                        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2"
                            style={{ scrollbarWidth: 'none' }}>
                            {matches.map((m, i) => <MatchCard key={m.matchId || i} match={m} />)}
                        </div>

                        <button onClick={() => scroll(1)}
                            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {!loading && !error && matches.length === 0 && (
                    <div className="text-center py-20 text-slate-600">
                        <div className="text-5xl mb-3">🏏</div>
                        <p>No matches right now</p>
                    </div>
                )}

                {/* ── API Reference ── */}
                <ApiSection isCrex={isCrex} />

            </div>
        </div>
    );
};

/* ── API Section ── */
const BACKEND = typeof window !== 'undefined'
    ? (import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3000')
    : 'http://localhost:3000';

const endpoints = [
    {
        method: 'GET',
        path: '/api/cricket/matches',
        label: 'Live Match Data (Cricbuzz)',
        desc: 'Scrapes live matches from Cricbuzz carousel.',
        response: `{
  "success": true,
  "count": 12,
  "data": [
    {
      "matchId": "139381",
      "title": "India vs Australia",
      "subtitle": "3rd ODI, Sydney",
      "matchType": "ODI",
      "state": "live",
      "status": "India need 34 runs in 4.2 overs",
      "team1": { "name": "IND", "flag": "...", "score": "287/5" },
      "team2": { "name": "AUS", "flag": "...", "score": "321/6" },
      "fullUrl": "...",
      "links": []
    }
  ]
}`
    },
    {
        method: 'GET',
        path: '/api/cricket/live-crex',
        label: 'Live Match Data (Crex)',
        desc: 'Scrapes live matches directly from Crex.com.',
        response: `{
  "success": true,
  "count": 5,
  "data": [
    {
      "matchId": "1183",
      "title": "CSK vs KKR",
      "subtitle": "IPL 2026",
      "matchType": "22nd T20",
      "state": "preview",
      "status": "Today 8:00 PM",
      "team1": { "name": "CSK", "flag": "...", "score": "" },
      "team2": { "name": "KKR", "flag": "...", "score": "" }
    }
  ]
}`
    }
];

function ApiSection({ isCrex }) {
    const [copied, setCopied] = useState(null);
    const [tab, setTab] = useState('curl');

    const copy = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const ep = isCrex ? endpoints[1] : endpoints[0];
    const url = `${BACKEND}${ep.path}`;

    const snippets = {
        curl: `curl -X GET "${url}" \\
  -H "Accept: application/json"`,
        js: `fetch("${url}")
  .then(res => res.json())
  .then(data => console.log(data));`,
        axios: `import axios from 'axios';

const { data } = await axios.get("${url}");
console.log(data);`,
    };

    return (
        <div className="mt-16">
            {/* Section heading */}
            <div className="flex items-center gap-3 mb-6">
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">API Reference</span>
                <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'linear-gradient(145deg,#1e293b,#0f172a)' }}>

                {/* Endpoint badge */}
                <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">GET</span>
                    <code className="text-sm text-slate-300 font-mono">{ep.path}</code>
                    <button onClick={() => copy(url, 'url')} className="ml-auto p-1.5 rounded-lg text-slate-600 hover:text-slate-300 transition-colors">
                        {copied === 'url' ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                    </button>
                </div>

                <div className="px-5 py-4">
                    <p className="text-sm text-slate-400 mb-5">{ep.desc}</p>

                    {/* Code tabs */}
                    <div className="flex gap-1 mb-3">
                        {['curl', 'js', 'axios'].map(t => (
                            <button key={t} onClick={() => setTab(t)}
                                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${tab === t
                                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                    : 'text-slate-600 hover:text-slate-400'
                                    }`}>
                                {t === 'js' ? 'JavaScript' : t === 'axios' ? 'Axios' : 'cURL'}
                            </button>
                        ))}
                    </div>

                    {/* Code block */}
                    <div className="relative group">
                        <pre className="text-xs font-mono text-blue-300 p-4 rounded-xl overflow-x-auto leading-relaxed"
                            style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {snippets[tab]}
                        </pre>
                        <button onClick={() => copy(snippets[tab], 'snippet')}
                            className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-300"
                            style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {copied === 'snippet' ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
                        </button>
                    </div>

                    {/* Sample response */}
                    <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest mt-5 mb-2">Sample Response</p>
                    <pre className="text-xs font-mono text-slate-500 p-4 rounded-xl overflow-x-auto leading-relaxed"
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        {ep.response}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default Demo;