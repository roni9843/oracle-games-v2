import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Guests = () => {
    const [guests, setGuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchGuests = async (page = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/guests?page=${page}&limit=20&search=${searchQuery}`);
            setGuests(res.data.data || []);
            setTotalPages(res.data.totalPages || 1);
            setPage(res.data.page || 1);
        } catch (error) {
            console.error('Failed to fetch guests', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchGuests(1, search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            await api.patch(`/admin/guests/${id}/${action}`);
            // Refresh list
            fetchGuests(page, search);
        } catch (error) {
            console.error(`Failed to ${action} guest:`, error);
            alert(error.response?.data?.message || 'Action failed');
        } finally {
            setActionLoading(null);
        }
    };

    const isExpired = (endDate) => new Date() > new Date(endDate);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Guest Users
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Manage 1-hour session players and their access.
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search WhatsApp / Telegram..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-300">
                            <tr>
                                <th className="px-6 py-4 font-semibold">WhatsApp Number</th>
                                <th className="px-6 py-4 font-semibold">Telegram ID</th>
                                <th className="px-6 py-4 font-semibold">Session Ends</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                                        Loading guests...
                                    </td>
                                </tr>
                            ) : guests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                                        No guest users found.
                                    </td>
                                </tr>
                            ) : (
                                guests.map((guest) => {
                                    const expired = isExpired(guest.sessionEndsAt);
                                    const restricted = guest.isRestricted;

                                    let statusColor = 'bg-green-500/10 text-green-500 border-green-500/20';
                                    let statusText = 'Active Session';

                                    if (restricted) {
                                        statusColor = 'bg-red-500/10 text-red-500 border-red-500/20';
                                        statusText = 'Restricted';
                                    } else if (expired) {
                                        statusColor = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
                                        statusText = 'Expired';
                                    }

                                    return (
                                        <tr key={guest._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-slate-200">
                                                {guest.whatsappNumber}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {guest.telegramId || <span className="text-slate-600 italic">None</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs ${expired && !restricted ? 'text-red-400' : 'text-slate-400'}`}>
                                                    {new Date(guest.sessionEndsAt).toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {(restricted || expired) ? (
                                                    <button
                                                        onClick={() => handleAction(guest._id, 'unrestrict')}
                                                        disabled={actionLoading === guest._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-colors border border-blue-500/20 disabled:opacity-50"
                                                    >
                                                        {actionLoading === guest._id ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                                                        Unrestrict (1H)
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAction(guest._id, 'restrict')}
                                                        disabled={actionLoading === guest._id}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors border border-red-500/20 disabled:opacity-50"
                                                    >
                                                        {actionLoading === guest._id ? <Loader2 size={14} className="animate-spin" /> : <ShieldAlert size={14} />}
                                                        Restrict
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination block */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchGuests(page - 1, search)}
                            className="px-3 py-1 bg-slate-800 rounded text-xs disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchGuests(page + 1, search)}
                            className="px-3 py-1 bg-slate-800 rounded text-xs disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Guests;
