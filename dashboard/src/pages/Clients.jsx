import React, { useEffect, useState } from 'react';
import { useClientStore } from '../store/useClientStore';
import { Copy, RefreshCw, Trash2, Plus, Check, X } from 'lucide-react';

const Clients = () => {
    const { clients, loading, fetchClients, createClient, deleteClient, regenerateKey, toggleClient } = useClientStore();
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ username: '', description: '' });

    useEffect(() => {
        fetchClients();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        const result = await createClient(formData);
        if (result.success) {
            setShowModal(false);
            setFormData({ username: '', description: '' });
        } else {
            alert(result.error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading && clients.length === 0) return <div className="text-slate-400">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">API Clients</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> New Client
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Username</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">API Key</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {clients.map((client) => (
                            <tr key={client._id} className="hover:bg-slate-800/50">
                                <td className="p-4 font-medium">{client.username}</td>
                                <td className="p-4 text-slate-400">{client.description || '-'}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800 font-mono text-xs max-w-[200px] truncate">
                                        <span className="truncate">{client.apiKey}</span>
                                        <button onClick={() => copyToClipboard(client.apiKey)} className="text-slate-500 hover:text-blue-400">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${client.isEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {client.isEnabled ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button
                                        onClick={() => toggleClient(client._id, !client.isEnabled)}
                                        title={client.isEnabled ? 'Disable' : 'Enable'}
                                        className={`p-2 rounded hover:bg-slate-700 ${client.isEnabled ? 'text-emerald-500' : 'text-red-500'}`}
                                    >
                                        {client.isEnabled ? <Check size={18} /> : <X size={18} />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Regenerate API Key? Old key will stop working immediately.')) regenerateKey(client._id);
                                        }}
                                        title="Regenerate Key"
                                        className="p-2 text-yellow-500 hover:bg-slate-700 rounded"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete client? This cannot be undone.')) deleteClient(client._id);
                                        }}
                                        title="Delete"
                                        className="p-2 text-red-500 hover:bg-slate-700 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {clients.length === 0 && (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-500">No clients found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Create New Client</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
