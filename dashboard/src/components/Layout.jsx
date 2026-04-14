import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Gamepad2, Building2, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Guest Users', path: '/guests', icon: Users },
        { name: 'Clients (API Keys)', path: '/clients', icon: Users },
        { name: 'Games', path: '/games', icon: Gamepad2 },
        { name: 'Providers', path: '/providers', icon: Building2 },
    ];

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="text-2xl font-bold text-blue-500">Game API</h1>
                    <p className="text-xs text-slate-500">Admin Dashboard</p>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-red-500 hover:text-red-400 hover:bg-slate-800 w-full px-4 py-3 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center px-8 sticky top-0 z-10">
                    <h2 className="text-lg font-semibold text-slate-200">
                        {navItems.find((i) => i.path === location.pathname)?.name || 'Dashboard'}
                    </h2>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
