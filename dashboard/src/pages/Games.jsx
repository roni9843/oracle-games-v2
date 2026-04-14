import React, { useEffect, useState } from 'react';
import useGameStoreAdmin from '../store/useGameStore';
import useProviderStore from '../store/useProviderStore';
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, X, Star } from 'lucide-react';

const Games = () => {
    const { games, total, page, totalPages, loading, fetchGames, createGame, deleteGame, updateGame, togglePopular } = useGameStoreAdmin();
    const { providers, fetchProviders } = useProviderStore();

    const [search, setSearch] = useState('');
    const [filterProvider, setFilterProvider] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterPopular, setFilterPopular] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(null);

    const initialForm = {
        gameCode: '', gameName: '', providerCode: '', gameType: 'SLOT',
        image: '', jackpot: 'FALSE', freeTry: 'FALSE', rtp: 100
    };
    const [formData, setFormData] = useState(initialForm);

    // Fetch providers for the dropdown
    useEffect(() => {
        fetchProviders();
    }, []);

    // Debounced search and filter effect
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGames(1, 20, search, filterProvider, filterType, filterPopular);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, filterProvider, filterType, filterPopular]);

    // Pagination change
    useEffect(() => {
        if (page > 1) { // Avoid double fetch on initial load if handled by above effect
            fetchGames(page, 20, search, filterProvider, filterType);
        }
    }, [page]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let payload = { ...formData };
        if (payload.gameCode === '0') {
            payload.gameCode = 0;
        }

        let result;
        if (editMode) {
            result = await updateGame(editMode, payload);
        } else {
            result = await createGame(payload);
        }

        if (result.success) {
            setShowModal(false);
            setFormData(initialForm);
            setEditMode(null);
            fetchGames(page, 20, search, filterProvider, filterType);
        } else {
            alert(result.error);
        }
    };

    const openEdit = (game) => {
        setEditMode(game._id);
        setFormData({
            gameCode: game.gameCode,
            gameName: game.gameName,
            providerCode: game.providerCode,
            gameType: game.gameType || 'SLOT',
            image: game.image || '',
            jackpot: game.jackpot,
            freeTry: game.freeTry,
            rtp: game.rtp
        });
        setShowModal(true);
    };

    const clearFilters = () => {
        setSearch('');
        setFilterProvider('');
        setFilterType('');
        setFilterPopular(false);
    };

    return (
        <div>
            <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Games Management</h2>
                    <button
                        onClick={() => { setEditMode(null); setFormData(initialForm); setShowModal(true); }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} /> Add Game
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Name or Code..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:border-blue-500 outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none w-full md:w-48"
                            value={filterProvider}
                            onChange={e => setFilterProvider(e.target.value)}
                        >
                            <option value="">All Providers</option>
                            {providers.map(p => (
                                <option key={p._id} value={p.providerCode}>{p.providerName}</option>
                            ))}
                        </select>

                        <select
                            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:border-blue-500 outline-none w-full md:w-40"
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="ARCADE">ARCADE</option>
                            <option value="CARD">CARD</option>
                            <option value="CASINO">CASINO</option>
                            <option value="COCKFIGHT">COCKFIGHT</option>
                            <option value="CRASH">CRASH</option>
                            <option value="CRICKET">CRICKET</option>
                            <option value="ESPORT">ESPORT</option>
                            <option value="FISHING">FISHING</option>
                            <option value="GALAXY">GALAXY</option>
                            <option value="HORSEBOOK">HORSEBOOK</option>
                            <option value="LIVE">LIVE</option>
                            <option value="LOTTERY">LOTTERY</option>
                            <option value="NUMBER">NUMBER</option>
                            <option value="POKER">POKER</option>
                            <option value="SLOT">SLOT</option>
                            <option value="SPORTS">SPORTS</option>
                            <option value="TABLE">TABLE</option>
                            <option value="UNKNOWN">UNKNOWN</option>
                        </select>

                        {/* Popular filter toggle */}
                        <button
                            onClick={() => setFilterPopular(p => !p)}
                            title={filterPopular ? 'Show all games' : 'Show popular only'}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${filterPopular
                                ? 'bg-yellow-400/15 text-yellow-400 border-yellow-400/40'
                                : 'bg-slate-950 text-slate-400 border-slate-700 hover:text-yellow-400 hover:border-yellow-400/40'
                                }`}
                        >
                            <Star size={15} fill={filterPopular ? 'currentColor' : 'none'} />
                            Popular
                        </button>

                        {(search || filterProvider || filterType || filterPopular) && (
                            <button
                                onClick={clearFilters}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                                title="Clear Filters"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Image</th>
                            <th className="p-4">Game Name</th>
                            <th className="p-4">Code</th>
                            <th className="p-4">Provider</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-center">Popular</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {games.map((game) => (
                            <tr key={game._id} className="hover:bg-slate-800/50">
                                <td className="p-4">
                                    {game.image ? (
                                        <img src={game.image} alt={game.gameName} className="w-10 h-10 rounded object-cover" />
                                    ) : (
                                        <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center text-xs text-slate-500">No Img</div>
                                    )}
                                </td>
                                <td className="p-4 font-medium">{game.gameName}</td>
                                <td className="p-4 text-slate-400 font-mono text-xs">{game.gameCode}</td>
                                <td className="p-4 text-blue-400">{game.providerCode}</td>
                                <td className="p-4">
                                    <span className="bg-slate-800 px-2 py-1 rounded text-xs">{game.gameType || 'N/A'}</span>
                                </td>
                                <td className="p-4 text-center">
                                    <button
                                        onClick={() => togglePopular(game._id)}
                                        title={game.popular ? 'Remove from popular' : 'Mark as popular'}
                                        className={`p-1.5 rounded-lg transition-all ${game.popular
                                            ? 'text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20'
                                            : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800'
                                            }`}
                                    >
                                        <Star size={16} fill={game.popular ? 'currentColor' : 'none'} />
                                    </button>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button onClick={() => openEdit(game)} className="p-2 text-blue-500 hover:bg-slate-800 rounded">
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => { if (confirm('Delete game?')) deleteGame(game._id); }}
                                        className="p-2 text-red-500 hover:bg-slate-800 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {games.length === 0 && !loading && (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">No games found matching filters.</td></tr>
                        )}
                        {loading && (
                            <tr><td colSpan="6" className="p-8 text-center text-slate-500">Loading games...</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-sm text-slate-400">
                <div>Total: {totalPages > 0 ? (page - 1) * 20 + games.length : 0} / {totalPages * 20} est.</div>
                {/* Total count isn't returned in the variable 'total' in my store, but 'totalPages' is. 
            Actually the store has 'total' but I didn't destructure it? 
            Checking store... store has 'total', but component didn't use it. 
            Checking component code destructuring... yes 'total' is there.
        */}
                <div className="flex gap-2">
                    <button
                        disabled={page <= 1}
                        onClick={() => fetchGames(page - 1, 20, search, filterProvider, filterType)}
                        className="p-2 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 disabled:opacity-50"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="px-4 py-2 bg-slate-900 border border-slate-800 rounded">
                        Page {page} of {totalPages || 1}
                    </span>
                    <button
                        disabled={page >= totalPages}
                        onClick={() => fetchGames(page + 1, 20, search, filterProvider, filterType)}
                        className="p-2 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 disabled:opacity-50"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Modal - SAME AS BEFORE */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg my-auto">
                        <h3 className="text-xl font-bold mb-4">{editMode ? 'Edit Game' : 'Add New Game'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Game Code</label>
                                    <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                                        value={formData.gameCode} onChange={e => setFormData({ ...formData, gameCode: e.target.value })} disabled={editMode} />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Provider Code</label>
                                    <select
                                        required
                                        className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                        value={formData.providerCode}
                                        onChange={e => setFormData({ ...formData, providerCode: e.target.value })}
                                    >
                                        <option value="">Select Provider</option>
                                        {providers.map(p => (
                                            <option key={p._id} value={p.providerCode}>{p.providerCode} ({p.providerName})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Game Name</label>
                                <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                                    value={formData.gameName} onChange={e => setFormData({ ...formData, gameName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Image URL</label>
                                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                                    value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Game Type</label>
                                    <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                        value={formData.gameType} onChange={e => setFormData({ ...formData, gameType: e.target.value })}>
                                        <option value="ARCADE">ARCADE</option>
                                        <option value="CARD">CARD</option>
                                        <option value="CASINO">CASINO</option>
                                        <option value="COCKFIGHT">COCKFIGHT</option>
                                        <option value="CRASH">CRASH</option>
                                        <option value="CRICKET">CRICKET</option>
                                        <option value="ESPORT">ESPORT</option>
                                        <option value="FISHING">FISHING</option>
                                        <option value="GALAXY">GALAXY</option>
                                        <option value="HORSEBOOK">HORSEBOOK</option>
                                        <option value="LIVE">LIVE</option>
                                        <option value="LOTTERY">LOTTERY</option>
                                        <option value="NUMBER">NUMBER</option>
                                        <option value="POKER">POKER</option>
                                        <option value="SLOT">SLOT</option>
                                        <option value="SPORTS">SPORTS</option>
                                        <option value="TABLE">TABLE</option>
                                        <option value="UNKNOWN">UNKNOWN</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">RTP</label>
                                    <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                                        value={formData.rtp} onChange={e => setFormData({ ...formData, rtp: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">{editMode ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Games;
