import React, { useState } from 'react';
import { Key, Globe, Search, Play, Database, Code, ChevronRight, ChevronDown, Copy, Check, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png';

// --- Sub-Components (Defined Outside to prevent re-creation) ---

const CodeSnippet = ({ type, url, method = 'GET', body, apiKey, copyToClipboard, headerKey = 'x-api-key' }) => {
    // For external URLs, don't prepend localhost
    const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${url}`;
    let code = '';

    if (type === 'curl') {
        let bodyStr = '';
        if (method === 'POST' && body) {
            bodyStr = ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
        }
                code = `curl -X ${method} "${fullUrl}" \\
    -H "${headerKey}: ${apiKey || 'YOUR_API_KEY'}" \\
    -H "Content-Type: application/json"${bodyStr}`;
    } else if (type === 'js') {
        code = `fetch("${fullUrl}", {
  method: "${method}",
  headers: {
        "${headerKey}": "${apiKey || 'YOUR_API_KEY'}",
    "Content-Type": "application/json"
  }${method === 'POST' && body ? `,\n  body: JSON.stringify(${JSON.stringify(body, null, 2)})` : ''}
})
.then(res => res.json())
.then(data => console.log(data));`;
    } else if (type === 'axios') {
        code = `import axios from 'axios';

axios.${method.toLowerCase()}("${fullUrl}", ${method === 'POST' && body ? JSON.stringify(body, null, 2) + ', ' : ''}{
  headers: {
        "${headerKey}": "${apiKey || 'YOUR_API_KEY'}"
  }
})
.then(res => console.log(res.data));`;
    }

    return (
        <div className="relative group">
            <pre className="bg-slate-950 p-4 rounded-lg text-xs font-mono text-blue-300 overflow-x-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                {code}
            </pre>
            <button
                onClick={() => copyToClipboard(code)}
                className="absolute top-2 right-2 p-2 bg-slate-800 text-slate-400 rounded hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy Code"
            >
                <Copy size={14} />
            </button>
        </div>
    );
};

const EndpointBlock = ({
    id, method, path, title, description, inputs, requestUrl, body,
    activeTab, setActiveTab, executeRequest, loading, status, output, apiKey, copyToClipboard,
    defaultOpen = false, featured = false, headerKey = 'x-api-key'
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen || featured);
    const currentTab = activeTab[id] || 'response';

    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className={`rounded-xl transition-all duration-500 ${featured ? 'p-[2px] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-gradient shadow-[0_0_30px_rgba(236,72,153,0.3)]' : ''}`}>
            <section id={id} className={`bg-slate-900 border ${featured ? 'border-transparent' : 'border-slate-800'} rounded-[10px] overflow-hidden shadow-lg h-full`}>

                {/* Header - Clickable for Accordion */}
                <div
                    className={`p-4 md:p-6 border-b border-slate-800 cursor-pointer flex items-center justify-between group transition-colors ${featured ? 'bg-gradient-to-r from-pink-500/10 via-red-500/10 to-yellow-500/10 hover:bg-slate-800/80' : 'bg-gradient-to-r from-slate-900 to-slate-900/50 hover:bg-slate-800/50'}`}
                    onClick={toggle}
                >
                    <div className="flex items-center gap-4 flex-1">
                        <span className={`px-3 py-1 rounded text-xs font-bold border w-16 text-center ${featured ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' :
                            method === 'GET' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                method === 'POST' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                            }`}>
                            {method}
                        </span>
                        <div className="flex flex-col">
                            <h3 className={`text-lg md:text-xl font-bold font-mono transition-colors ${featured ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400' : 'text-white group-hover:text-blue-400'}`}>
                                {title} {featured && <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full align-middle">NEW</span>}
                            </h3>
                            <p className="text-slate-400 text-xs md:text-sm mt-1 font-mono opacity-80">{path}</p>
                        </div>
                    </div>
                    <div className="text-slate-500 group-hover:text-white transition-colors">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>

                {/* Collapsible Content */}
                {isOpen && (
                    <div className="animate-accordion-down">
                        <div className="p-6 bg-slate-900/50 border-b border-slate-800">
                            <p className="text-slate-300 text-sm mb-6 leading-relaxed bg-slate-950/50 p-4 rounded border border-slate-800/50">
                                {description}
                            </p>

                            {/* Inputs */}
                            <div className="space-y-4">
                                {inputs}
                            </div>

                            <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-800/50">
                                <div className="font-mono text-xs text-slate-500 truncate max-w-md hidden md:block" title={requestUrl}>
                                    {method} {requestUrl}
                                </div>
                                <button
                                    onClick={() => executeRequest(requestUrl, id, method, body, headerKey)}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ml-auto md:ml-0 ${featured ? 'bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-400 hover:to-red-500 text-white shadow-pink-500/20' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20'}`}
                                >
                                    {loading[id] ? (
                                        <span className="animate-pulse">Running...</span>
                                    ) : (
                                        <><Play size={16} fill="currentColor" /> {featured ? 'Launch Game' : 'Send Request'}</>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Output & Code Tabs */}
                        <div className="bg-slate-950 min-h-[100px]">
                            <div className="flex border-b border-slate-800 overflow-x-auto">
                                {['response', 'curl', 'js', 'axios'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(prev => ({ ...prev, [id]: tab }))}
                                        className={`px-4 py-2 text-xs font-medium uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${currentTab === tab
                                            ? 'border-blue-500 text-white bg-slate-900'
                                            : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div className="p-4">
                                {currentTab === 'response' && (
                                    <div className="relative">
                                        {status[id] && (
                                            <div className="absolute top-0 right-0 flex gap-2 mb-2 z-10">
                                                <span className={`text-xs px-2 py-0.5 rounded font-mono ${status[id].ok ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {status[id].code}
                                                </span>
                                                <span className="text-xs px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-400">
                                                    {status[id].time}
                                                </span>
                                            </div>
                                        )}
                                        {output[id] ? (
                                            <pre className="text-xs text-green-400 font-mono overflow-x-auto max-h-[400px] leading-relaxed custom-scrollbar bg-slate-950 p-2 rounded">
                                                {output[id]}
                                            </pre>
                                        ) : (
                                            <div className="text-slate-600 text-sm italic text-center py-8">
                                                Click "{featured ? 'Launch Game' : 'Send Request'}" to see the response here.
                                            </div>
                                        )}
                                    </div>
                                )}
                                {currentTab !== 'response' && (
                                    <CodeSnippet
                                        type={currentTab}
                                        url={requestUrl}
                                        method={method}
                                        body={body}
                                        apiKey={apiKey}
                                            copyToClipboard={copyToClipboard}
                                            headerKey={headerKey}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

// --- Main Component ---

const Documentation = () => {
    const [apiKey, setApiKey] = useState(localStorage.getItem('test_api_key') || '');
    const [activeTab, setActiveTab] = useState({});

    // Response State
    const [output, setOutput] = useState({});
    const [loading, setLoading] = useState({});
    const [status, setStatus] = useState({});

    // Input States
    const [gameSearch, setGameSearch] = useState('');
    const [gameType, setGameType] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [providerCode, setProviderCode] = useState('');
    const [gameId, setGameId] = useState('');
    const [multiGameIds, setMultiGameIds] = useState('');

    // Launch Game Inputs
    const [launchUser, setLaunchUser] = useState('username');
    const [launchGameCode, setLaunchGameCode] = useState('abcdgefg123');
    const [launchProvider, setLaunchProvider] = useState('JILI');
    const [launchGameType, setLaunchGameType] = useState('SLOT');
    const [launchMoney, setLaunchMoney] = useState(1000);

    const updateApiKey = (val) => {
        setApiKey(val);
        localStorage.setItem('test_api_key', val);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const executeRequest = async (url, id, method = 'GET', body = null, headerKey = 'x-api-key') => {
        // ... (rest of executeRequest logic remains same, but note URL handling)
        if (!apiKey) {
            alert('Please enter an API Key first!');
            return;
        }

        setLoading(prev => ({ ...prev, [id]: true }));
        setOutput(prev => ({ ...prev, [id]: null }));
        setStatus(prev => ({ ...prev, [id]: null }));
        setActiveTab(prev => ({ ...prev, [id]: 'response' }));

        const startTime = performance.now();
        try {
            // Handle external vs internal URLs
            const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}${url}`;

            const options = {
                method,
                headers: {
                    [headerKey]: apiKey,
                    'Content-Type': 'application/json'
                }
            };

            if (method === 'POST' && body) {
                options.body = JSON.stringify(body);
            }

            const res = await fetch(fullUrl, options);
            const data = await res.json();
            const endTime = performance.now();

            setStatus(prev => ({
                ...prev,
                [id]: {
                    code: res.status,
                    time: (endTime - startTime).toFixed(0) + 'ms',
                    ok: res.ok
                }
            }));
            setOutput(prev => ({ ...prev, [id]: JSON.stringify(data, null, 2) }));
        } catch (err) {
            setStatus(prev => ({ ...prev, [id]: { code: 'ERR', time: '0ms', ok: false } }));
            setOutput(prev => ({ ...prev, [id]: `Error: ${err.message}` }));
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    // ... (rest of helper functions)
    const getGamesUrl = () => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (gameSearch) params.append('search', gameSearch);
        if (gameType) params.append('gameType', gameType);
        return `/api/games?${params.toString()}`;
    };

    const getGamesByIdsUrl = () => {
        const ids = multiGameIds.trim();
        return `/api/games/by-ids?ids=${encodeURIComponent(ids)}`;
    };

    // Shared Helper Props for EndpointBlocks
    const blockProps = {
        activeTab,
        setActiveTab,
        executeRequest,
        loading,
        status,
        output,
        apiKey,
        copyToClipboard
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 pb-20">

            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 backdrop-blur-md bg-opacity-80">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center no-underline">
                        <img src={logoImg} alt="Logo" className="h-9 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-4">
                        <a href="#authentication" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Authentication</a>
                        <a href="#launch" className="text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors">Game Launch</a>
                        <a href="#games" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Games</a>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

                {/* Intro Hero */}
                <div className="text-center max-w-3xl mx-auto py-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                        Integrate <span className="text-blue-500">Faster</span>, Build <span className="text-purple-500">Better</span>.
                    </h2>
                    <p className="text-lg text-slate-400 leading-relaxed mb-8">
                        Complete API reference for accessing our massive library of games.
                        Test endpoints in real-time, copy code snippets, and build your integration in minutes.
                    </p>
                </div>

                {/* Authentication */}
                <section id="authentication" className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 p-8 rounded-2xl shadow-xl">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Key size={24} />
                                </div>
                                <h3 className="text-2xl font-bold text-white">Authentication</h3>
                            </div>
                            <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                                Security is paramount. All requests must be authenticated using your unique API Key.
                                Provide this key in the <code className="text-blue-300 font-mono">x-api-key</code> header. (Game Launch uses <code className="text-pink-300 font-mono">x-dstgame-key</code>.)
                            </p>
                            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-sm text-blue-300 shadow-inner">
                                x-api-key: YOUR_API_KEY
                            </div>
                        </div>
                        <div className="w-full md:w-5/12 ml-auto">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Test with your Key</label>
                            <div className={`relative transition-all duration-300 rounded-xl ${!apiKey ? 'p-[2px] bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-gradient' : ''}`}>
                                <div className={`relative bg-slate-950 rounded-[10px] w-full flex items-center ${!apiKey ? '' : 'border border-slate-700'}`}>
                                    <Key className="absolute left-4 text-slate-500" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Paste x-dstgame-key here..."
                                        className="w-full bg-transparent rounded-[10px] pl-10 pr-4 py-3 text-white focus:outline-none font-mono text-sm placeholder:text-slate-600"
                                        value={apiKey}
                                        onChange={(e) => updateApiKey(e.target.value)}
                                    />
                                    {apiKey && <div className="absolute right-4 text-green-500"><Check size={16} /></div>}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2 text-center">Your key is stored locally for this session.</p>
                        </div>
                    </div>
                </section>

                <div className="grid gap-6">

                    {/* FEATURED: Game Launch */}
                    <div id="launch">
                        <EndpointBlock
                            {...blockProps}
                            id="game_launch"
                            method="POST"
                            path="https://crazybet99.com/getgameurl/v2"
                            title="Launch Game URL"
                            description="Generate a secure game launch URL for a user. Note: This connects to the external V2 API."
                            requestUrl={`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/admin/games/launch`}
                            featured={true}
                            headerKey="x-dstgame-key"
                            body={{
                                username: launchUser,
                                money: launchMoney,
                                game_code: launchGameCode,
                                provider_code: launchProvider,
                                game_type: launchGameType
                            }}
                            inputs={
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-pink-400 mb-1.5 font-mono">username</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none hover:border-slate-600 transition-colors"
                                                    value={launchUser}
                                                    onChange={e => setLaunchUser(e.target.value)}
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Type: <span className="text-slate-400">String</span> (Required)</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-pink-400 mb-1.5 font-mono">game_code</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none hover:border-slate-600 transition-colors"
                                                    value={launchGameCode}
                                                    onChange={e => setLaunchGameCode(e.target.value)}
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Type: <span className="text-slate-400">String | 0</span> (Default: <span className="text-yellow-500">0</span> if Lobby)</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-pink-400 mb-1.5 font-mono">game_type</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none hover:border-slate-600 transition-colors"
                                                    value={launchGameType}
                                                    onChange={e => setLaunchGameType(e.target.value)}
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Type: <span className="text-slate-400">String | 0</span> (Default: <span className="text-yellow-500">0</span> if Lobby)</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-medium text-pink-400 mb-1.5 font-mono">provider_code</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none hover:border-slate-600 transition-colors"
                                                    value={launchProvider}
                                                    onChange={e => setLaunchProvider(e.target.value)}
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Type: <span className="text-slate-400">String</span> (Required)</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-pink-400 mb-1.5 font-mono">money</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-pink-500 outline-none hover:border-slate-600 transition-colors"
                                                    value={launchMoney}
                                                    onChange={e => setLaunchMoney(e.target.value)}
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 font-mono">Type: <span className="text-slate-400">Int/Number</span> (Required)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-pink-300 font-semibold">
                                            <Code size={14} /> Node/Express with qs
                                        </div>
                                        <pre className="text-[11px] leading-relaxed text-blue-200 font-mono whitespace-pre overflow-x-auto bg-slate-900 rounded-md p-3 border border-slate-800">
{`const axios = require('axios');
const qs = require('qs');

app.post('/launch', async (req, res) => {
  try {
        const payload = {
            username: req.body.username,
            money: parseInt(req.body.money, 10) || 50,
            provider_code: req.body.provider_code,
            game_code: req.body.game_code || 0,
            game_type: req.body.game_type || 0,
        };

    const { data } = await axios.post(
      'https://crazybet99.com/getgameurl/v2',
      qs.stringify(payload),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-dstgame-key': process.env.DST_GAME_KEY,
        },
      }
    );

    return res.json({ success: true, url: data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});`}
                                        </pre>
                                    </div>
                                </div>
                            }
                        />
                    </div>

                    {/* 1. Providers List */}
                    <EndpointBlock
                        {...blockProps}
                        id="providers"
                        method="GET"
                        path="/api/providers"
                        title="List Providers"
                        description="Retrieve a complete list of all game providers available on the platform."
                        requestUrl="/api/providers"
                        inputs={
                            <div className="text-sm text-slate-500 italic">No parameters required.</div>
                        }
                    />

                    {/* 2. Single Provider */}
                    <EndpointBlock
                        {...blockProps}
                        id="single_provider"
                        method="GET"
                        path="/api/providers/:code"
                        title="Get Provider Details"
                        description="Get detailed information about a specific provider and their associated games."
                        requestUrl={`/api/providers/${providerCode || ':code'}`}
                        inputs={
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Provider Code</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. JILI"
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                        value={providerCode}
                                        onChange={e => setProviderCode(e.target.value)}
                                    />
                                </div>
                            </div>
                        }
                    />

                    {/* 3. Games List */}
                    <EndpointBlock
                        {...blockProps}
                        id="games_list"
                        method="GET"
                        path="/api/games"
                        title="List Games"
                        description="Search and filter through the entire games catalog. Supports pagination and searching."
                        requestUrl={getGamesUrl()}
                        inputs={
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Search Query</label>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-2.5 text-slate-600" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Game Name or Code..."
                                                className="w-full bg-slate-950 border border-slate-700 rounded pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                value={gameSearch}
                                                onChange={e => setGameSearch(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">Game Type</label>
                                        <select
                                            className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                            value={gameType}
                                            onChange={e => setGameType(e.target.value)}
                                        >
                                            <option value="">All Types</option>
                                            <option value="SLOT">SLOT</option>
                                            <option value="CASINO">CASINO</option>
                                            <option value="FISHING">FISHING</option>
                                            <option value="CRASH">CRASH</option>
                                            <option value="ARCADE">ARCADE</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Page</label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                value={page}
                                                onChange={e => setPage(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">Limit</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="100"
                                                className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                                                value={limit}
                                                onChange={e => setLimit(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    />

                    {/* 4. Single Game */}
                    <EndpointBlock
                        {...blockProps}
                        id="single_game"
                        method="GET"
                        path="/api/games/:id"
                        title="Get Game Details"
                        description="Retrieve detailed metadata for a single game by its unique ID."
                        requestUrl={`/api/games/${gameId || ':id'}`}
                        inputs={
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Game ID </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 65c92..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none font-mono"
                                        value={gameId}
                                        onChange={e => setGameId(e.target.value)}
                                    />
                                </div>
                            </div>
                        }
                    />

                    {/* 5. Multiple Games by IDs */}
                    <EndpointBlock
                        {...blockProps}
                        id="games_by_ids"
                        method="GET"
                        path="/api/games/by-ids?ids=id1,id2"
                        title="Get Games by IDs"
                        description="Fetch multiple games in one call by providing a comma-separated list of MongoDB game IDs. Returns the same metadata as the single game endpoint for each match."
                        requestUrl={getGamesByIdsUrl()}
                        inputs={
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Game IDs (comma separated)</label>
                                    <textarea
                                        placeholder="65c92...,65c93...,65c94..."
                                        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none font-mono min-h-[80px]"
                                        value={multiGameIds}
                                        onChange={e => setMultiGameIds(e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-500 mt-1 font-mono">Tip: Paste multiple IDs separated by commas; invalid IDs are ignored.</p>
                                </div>
                            </div>
                        }
                    />

                </div>
            </div>

            <footer className="max-w-7xl mx-auto px-6 pt-12 text-center pb-8">
                <p className="text-slate-600 text-sm">
                    &copy; 2024 Game API System. Designed for Developers.
                </p>
            </footer>

        </div>
    );
};

export default Documentation;
