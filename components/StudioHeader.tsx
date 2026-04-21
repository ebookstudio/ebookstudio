
import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { UserType } from '../types';
import { IconBook, IconSparkles, IconLogout, IconSettings, IconPenTip, IconDashboard } from '../constants';
import MorphicEye from './MorphicEye';

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
        <header className="h-16 border-b border-white/5 bg-[#0b0b0b] flex-shrink-0 flex items-center justify-between px-6 z-[60] sticky top-0">
            <div className="flex items-center gap-6">
                <Link to="/" className="flex items-center gap-3 group">
                    <MorphicEye className="w-8 h-8 border border-white/10 bg-neutral-900 rounded-full" />
                    <div className="flex items-center gap-2">
                        <span className="font-bold tracking-tighter text-lg">ebookstudio</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-neutral-500">Studio</span>
                    </div>
                </Link>
                <div className="h-4 w-px bg-white/10 mx-2 hidden md:block"></div>
                <button
                    onClick={() => navigate('/dashboard')}
                    className="hidden md:flex items-center gap-2 text-neutral-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest group/back"
                >
                    <IconDashboard className="w-3.5 h-3.5 group-hover/back:scale-110 transition-transform" />
                    <span>Dashboard</span>
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
                {children}
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95"
                >
                    <IconPenTip className="w-3.5 h-3.5" />
                    Write
                </button>

                <div className="h-6 w-px bg-white/10 mx-2"></div>

                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-xs font-bold overflow-hidden transition-all group-hover:border-white/30">
                            {currentUser.profileImageUrl ? (
                                <img src={currentUser.profileImageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                                currentUser.name.charAt(0)
                            )}
                        </div>
                    </button>

                    {dropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                            <div className="absolute right-0 top-12 mt-2 w-56 bg-[#0a0a0a] border border-white/10 shadow-2xl py-2 z-20 rounded-xl animate-slide-up">
                                <div className="px-4 py-3 border-b border-white/5 mb-1">
                                    <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                                    <p className="text-[10px] text-neutral-500 uppercase font-mono">{userType === 'seller' ? 'Writer' : 'Reader'} Account</p>
                                </div>
                                <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3">
                                    <IconDashboard className="w-4 h-4" /> Dashboard
                                </button>
                                <button onClick={() => { navigate('/'); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3">
                                    <IconPenTip className="w-4 h-4" /> Studio
                                </button>
                                <div className="my-1 border-t border-white/5"></div>
                                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-400/5 transition-all flex items-center gap-3">
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
