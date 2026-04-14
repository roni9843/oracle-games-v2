import React, { useEffect, useState } from 'react';
import useProviderStore from '../store/useProviderStore';
import { Plus, Edit, Trash2 } from 'lucide-react';

const Providers = () => {
    const { providers, loading, fetchProviders, createProvider, updateProvider, deleteProvider } = useProviderStore();
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(null);
    const [formData, setFormData] = useState({ providerCode: '', providerName: '', gameType: 'SLOT' });

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let result;
        if (editMode) {
            result = await updateProvider(editMode, formData);
        } else {
            result = await createProvider(formData);
        }

        if (result.success) {
            setShowModal(false);
            setFormData({ providerCode: '', providerName: '', gameType: 'SLOT' });
            setEditMode(null);
        } else {
            alert(result.error);
        }
    };

    const openEdit = (provider) => {
        setEditMode(provider._id);
        setFormData({
            providerCode: provider.providerCode,
            providerName: provider.providerName,
            gameType: provider.gameType
        });
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Provider Management</h2>
                <button
                    onClick={() => { setEditMode(null); setFormData({ providerCode: '', providerName: '', gameType: 'SLOT' }); setShowModal(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} /> Add Provider
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {providers.map((provider) => (
                    <div key={provider._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-white">{provider.providerName}</h3>
                                <span className="text-sm text-slate-500 font-mono">{provider.providerCode}</span>
                            </div>
                            <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded">
                                {provider.gameType}
                            </span>
                        </div>
                        <div className="border-t border-slate-800 pt-4 flex justify-end gap-2">
                            <button
                                onClick={() => openEdit(provider)}
                                className="p-2 text-blue-500 hover:bg-slate-800 rounded"
                            >
                                <Edit size={18} />
                            </button>
                            <button
                                onClick={() => { if (confirm('Delete provider? Games linked to this provider will remain but may have broken links.')) deleteProvider(provider._id); }}
                                className="p-2 text-red-500 hover:bg-slate-800 rounded"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {providers.length === 0 && !loading && (
                    <div className="col-span-full text-center text-slate-500 py-12">No providers found.</div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editMode ? 'Edit Provider' : 'Add New Provider'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Provider Code</label>
                                <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                                    value={formData.providerCode} onChange={e => setFormData({ ...formData, providerCode: e.target.value })} disabled={editMode} />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Provider Name</label>
                                <input type="text" required className="w-full bg-slate-950 border border-slate-700 rounded p-2"
                                    value={formData.providerName} onChange={e => setFormData({ ...formData, providerName: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Default Game Type</label>
                                <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                                    value={formData.gameType} onChange={e => setFormData({ ...formData, gameType: e.target.value })}>
                                    <option value="SLOT">SLOT</option>
                                    <option value="CASINO">CASINO</option>
                                    <option value="LIVE">LIVE</option>
                                    <option value="SPORTS">SPORTS</option>
                                    <option value="FISHING">FISHING</option>
                                    <option value="ARCADE">ARCADE</option>
                                    <option value="CRASH">CRASH</option>
                                    <option value="CARD">CARD</option>
                                    <option value="POKER">POKER</option>
                                    <option value="TABLE">TABLE</option>
                                    <option value="LOTTERY">LOTTERY</option>
                                    <option value="NUMBER">NUMBER</option>
                                    <option value="ESPORT">ESPORT</option>
                                    <option value="CRICKET">CRICKET</option>
                                    <option value="HORSEBOOK">HORSEBOOK</option>
                                    <option value="COCKFIGHT">COCKFIGHT</option>
                                    <option value="GALAXY">GALAXY</option>
                                    <option value="UNKNOWN">UNKNOWN</option>
                                </select>
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

export default Providers;
