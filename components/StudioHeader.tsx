import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../types';
import { IconBook, IconSparkles, IconLogout, IconSettings, IconPenTip, IconDashboard } from '../constants';
import CoAuthor from './CoAuthor';
import { cn } from '../lib/utils';

const { useNavigate, Link } = ReactRouterDOM as any;

interface StudioHeaderProps {
    children?: React.ReactNode;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({ children }) => {
    const { currentUser, userType, setCurrentUser } = useAppContext();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    if (!currentUser) return null;

    const handleLogout = () => {
        setCurrentUser(null, UserType.GUEST);
        navigate('/login');
    };

    return (
        <header className="h-16 border-b border-border bg-zinc-950 flex-shrink-0 flex items-center justify-between px-6 z-[60] sticky top-0">
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-3 group">
                    <CoAuthor size="sm" className="rounded-md shadow-lg shadow-white/5" />
                    <div className="flex items-center gap-2">
                        <span className="font-bold tracking-tighter text-lg text-zinc-100">EbookStudio</span>
                        <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-border text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">Studio</span>
                    </div>
                </Link>
                <div className="h-4 w-px bg-border mx-2 hidden md:block"></div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-zinc-100 transition-all text-[10px] font-black uppercase tracking-widest group/back"
                >
                    <IconDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
                {children}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 h-9 px-6 bg-zinc-100 text-zinc-950 font-black text-[10px] uppercase tracking-widest rounded-md hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
                >
                    <IconPenTip className="w-3.5 h-3.5" />
                    Write
                </button>

                <div className="h-6 w-px bg-border mx-2"></div>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded bg-zinc-900 border border-border flex items-center justify-center text-xs font-bold overflow-hidden transition-all group-hover:border-zinc-700">
                            {currentUser.profileImageUrl ? (
                                <img src={currentUser.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-zinc-400 font-bold">{currentUser.name.charAt(0)}</span>
                            )}
                        </div>
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                            <div className="absolute right-0 top-12 mt-2 w-56 bg-zinc-900 border border-border shadow-2xl py-2 z-20 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="px-4 py-3 border-b border-border mb-1">
                                    <p className="text-sm font-bold text-zinc-100 truncate">{currentUser.name}</p>
                                    <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest">{userType === 'seller' ? 'Creator' : 'Reader'} Account</p>
                                </div>
                                <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-950 hover:text-zinc-100 transition-all flex items-center gap-3">
                                    <IconDashboard className="w-4 h-4" /> Dashboard
                                </button>
                                <button onClick={() => { navigate('/'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:bg-zinc-950 hover:text-zinc-100 transition-all flex items-center gap-3">
                                    <IconPenTip className="w-4 h-4" /> Studio
                                </button>
                                <div className="my-1 border-t border-border"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/5 transition-all flex items-center gap-3">
                                    <IconLogout className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default StudioHeader;
