import React, { useEffect, useState } from 'react';
import { Users, Gamepad2, Building2, TrendingUp } from 'lucide-react';
import api from '../lib/axios';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        clients: 0,
        games: 0,
        providers: 0,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [clients, games, providers] = await Promise.all([
                    api.get('/admin/clients'),
                    api.get('/admin/games?limit=1'), // just to get count
                    api.get('/admin/providers')
                ]);

                setStats({
                    clients: clients.data.count,
                    games: games.data.count,
                    providers: providers.data.count,
                    loading: false
                });
            } catch (error) {
                console.error('Failed to fetch stats', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
    }, []);

    if (stats.loading) return <div className="text-slate-400">Loading stats...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Clients"
                    value={stats.clients}
                    icon={Users}
                    color="bg-purple-500 text-purple-500"
                />
                <StatCard
                    title="Total Games"
                    value={stats.games}
                    icon={Gamepad2}
                    color="bg-blue-500 text-blue-500"
                />
                <StatCard
                    title="Total Providers"
                    value={stats.providers}
                    icon={Building2}
                    color="bg-emerald-500 text-emerald-500"
                />
            </div>

            <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-blue-500" />
                    System Overview
                </h3>
                <p className="text-slate-400">
                    System is running normally. API endpoints are active.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;
