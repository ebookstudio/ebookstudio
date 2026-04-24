import React, { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { EBook, User, UserType } from '../../types';
import { IconBook, IconHeart, IconLogout, IconSettings, IconChevronRight, IconArrowRight } from '../../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import BookCard from '../BookCard';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

const UserDashboardContent: React.FC = () => {
  const { currentUser, userType, upgradeToSeller, logout, setCurrentUser } = useAppContext();
  const user = currentUser as User; 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'library' | 'wishlist' | 'settings'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const updatedUser = { ...user, profileImageUrl: base64String };
            setCurrentUser(updatedUser, userType);
        };
        reader.readAsDataURL(file);
    }
  };

  const booksToDisplay = activeTab === 'wishlist' ? user.wishlist : user.purchaseHistory;
  const filteredBooks = booksToDisplay?.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const getTitle = () => {
    switch(activeTab) {
        case 'library': return 'Collection';
        case 'wishlist': return 'Favorites';
        case 'settings': return 'Identity';
        default: return 'Dashboard';
    }
  };

    const { isSidebarCollapsed } = useAppContext();

    return (
        <div className="min-h-screen w-full bg-zinc-950 flex text-zinc-100 selection:bg-primary/30">
            <DashboardSidebar 
                userType="USER" 
                activeSection={activeTab} 
                onSectionChange={setActiveTab} 
            />

            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
            )}>
            <DashboardHeader 
                user={user} 
                title={getTitle()} 
                searchQuery={searchQuery} 
                onSearchChange={setSearchQuery}
                showSearch={activeTab !== 'settings'}
            />

            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-[1600px] mx-auto space-y-12">
                    
                    {activeTab === 'settings' ? (
                        <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
                            <div className="bg-zinc-900 border border-border rounded-xl p-8 lg:p-12">
                                <div className="flex flex-col md:flex-row items-center gap-12 border-b border-border pb-12 mb-12">
                                    <div className="relative group">
                                        <Avatar className="w-40 h-40 rounded-full border border-border ring-4 ring-zinc-950 shadow-2xl">
                                            <AvatarImage src={user.profileImageUrl} className="object-cover" />
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-5xl font-bold">{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <Button 
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => profileInputRef.current?.click()}
                                            className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 shadow-xl border-4 border-zinc-950"
                                        >
                                            <IconSettings className="w-4 h-4" />
                                        </Button>
                                        <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                    </div>
                                    <div className="text-center md:text-left flex-1 space-y-4">
                                        <div>
                                            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">{user.name}</h2>
                                            <p className="text-sm text-zinc-500 font-medium">{user.email}</p>
                                        </div>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                            <div className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-md border border-border">
                                                Reader Account
                                            </div>
                                            <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-emerald-500/10">
                                                Active Member
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    <section className="space-y-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Become a Creator</h3>
                                        <div className="bg-zinc-950/50 border border-border rounded-xl p-6 space-y-4">
                                            <p className="text-sm text-zinc-400 leading-relaxed">Turn your ideas into assets. Join our community of digital architects and start publishing today.</p>
                                            <Button 
                                              onClick={upgradeToSeller} 
                                              className="w-full h-11 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest transition-all"
                                            >
                                                Initialize Creation Mode
                                            </Button>
                                        </div>
                                    </section>

                                    <section className="space-y-6">
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">System</h3>
                                        <div className="bg-zinc-950/50 border border-border rounded-xl p-6 space-y-4">
                                            <p className="text-sm text-zinc-400 leading-relaxed">Securely sign out of your account and clear the active session from this device.</p>
                                            <Button 
                                              variant="ghost" 
                                              onClick={handleLogout} 
                                              className="w-full h-11 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 text-xs font-bold uppercase tracking-widest transition-all"
                                            >
                                                <IconLogout className="w-4 h-4 mr-2" /> Sign Out
                                            </Button>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-fade-in space-y-12">
                            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-border">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                                        {activeTab === 'library' ? 'My Library' : 'Saved Favorites'}
                                    </h2>
                                    <p className="text-sm text-zinc-500 font-medium mt-1">
                                        {filteredBooks?.length || 0} items in your digital sanctuary
                                    </p>
                                </div>
                                <Button 
                                    onClick={() => navigate('/store')}
                                    className="h-9 px-6 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider"
                                >
                                    Explore Library
                                </Button>
                            </header>

                            {filteredBooks && filteredBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                                    {filteredBooks.map(book => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-32 text-center border border-dashed border-border rounded-2xl bg-zinc-900/30">
                                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
                                        <IconBook className="w-6 h-6 text-zinc-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-zinc-100 mb-2">
                                        {activeTab === 'wishlist' ? 'Your wishlist is empty' : 'Your library is empty'}
                                    </h3>
                                    <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                                        Explore our curated collection of high-fidelity digital assets and architectural insights.
                                    </p>
                                    <Button 
                                        onClick={() => navigate('/store')} 
                                        className="h-10 px-8 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest"
                                    >
                                        Browse Store
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};

export default UserDashboardContent;
