import React, { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { EBook, User } from '../../types';
import { IconBook, IconHeart, IconSettings, IconSearch, IconLogout, IconUser, IconHome, IconStore } from '../../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import BookCard from '../BookCard';

const { useNavigate } = ReactRouterDOM as any;

const UserDashboardContent: React.FC = () => {
  const { currentUser, setCurrentUser, userType, upgradeToSeller } = useAppContext();
  const user = currentUser as User; 
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'library' | 'wishlist' | 'settings'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleLogout = () => {
    setCurrentUser(null, userType);
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

  const SidebarItem = ({ id, label, icon: Icon }: any) => (
      <button 
        onClick={() => setActiveTab(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
            activeTab === id 
            ? 'bg-white/10 text-white shadow-sm' 
            : 'text-zinc-500 hover:text-white hover:bg-white/5'
        }`}
      >
          <Icon className={`w-4 h-4 ${activeTab === id ? 'text-white' : 'text-zinc-500 group-hover:text-white'}`} />
          <span className="type-tiny font-bold">{label}</span>
      </button>
  );

  const MobileNavItem = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center py-2 px-4 flex-1 transition-colors ${
          activeTab === id ? 'text-white' : 'text-zinc-500'
      }`}
    >
        <Icon className={`w-5 h-5 mb-1 ${activeTab === id ? 'text-white' : 'text-current'}`} />
        <span className="type-tiny font-bold uppercase">{label}</span>
    </button>
  );

  const booksToDisplay = activeTab === 'wishlist' ? user.wishlist : user.purchaseHistory;
  const filteredBooks = booksToDisplay?.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-64 flex-shrink-0 border-r border-zinc-900 hidden md:flex flex-col bg-zinc-950 z-20 h-full">
            <div className="p-6 border-b border-zinc-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <IconBook className="w-5 h-5 text-black" />
                    </div>
                    <span className="type-h3 font-black text-white tracking-tighter uppercase">Reader</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <SidebarItem id="home" label="Back to Home" icon={IconHome} />
                <button 
                    onClick={() => navigate('/store')}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                >
                    <IconStore className="w-4 h-4" />
                    <span className="type-tiny font-bold">Marketplace</span>
                </button>
                <div className="h-px bg-zinc-900 my-4"></div>
                
                <SidebarItem id="library" label="My Library" icon={IconBook} />
                <SidebarItem id="wishlist" label="Wishlist" icon={IconHeart} />
                
                <div className="h-px bg-zinc-900 my-4"></div>
                <SidebarItem id="settings" label="Profile Settings" icon={IconSettings} />
            </nav>

            <div className="p-4 border-t border-zinc-900">
                 <div className="glass-card-premium p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                        {user.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">{user.name[0]}</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="type-tiny font-black text-white truncate">{user.name}</p>
                        <p className="type-tiny text-zinc-500 truncate">{user.email}</p>
                    </div>
                 </div>
                 <button 
                    onClick={upgradeToSeller}
                    className="w-full mt-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                 >
                    Upgrade to Writer
                 </button>
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 h-full overflow-y-auto bg-black relative scroll-smooth bg-dot-matrix">
            <div className="p-6 md:p-12 pb-32 max-w-7xl mx-auto">
                
                {/* Top Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <h1 className="type-h2 text-white">
                        {activeTab === 'library' && 'My Collection'}
                        {activeTab === 'wishlist' && 'Saved for Later'}
                        {activeTab === 'settings' && 'Account Settings'}
                    </h1>

                    {/* Search Bar */}
                    {(activeTab === 'library' || activeTab === 'wishlist') && (
                        <div className="relative w-full md:w-96">
                            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                            <input 
                                type="text" 
                                placeholder="Search your library..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-premium pl-12 py-3"
                            />
                        </div>
                    )}
                </div>

                {/* Content Area */}
                {activeTab === 'settings' ? (
                    <div className="max-w-xl animate-fade-in">
                        <div className="glass-card-premium rounded-3xl p-8 md:p-10 mb-8">
                            <h2 className="type-h3 mb-10">Profile Identity</h2>
                            <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 text-center sm:text-left">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
                                        {user.profileImageUrl ? (
                                            <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl text-zinc-700 bg-zinc-900"><IconUser className="w-10 h-10"/></div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => profileInputRef.current?.click()}
                                        className="absolute -bottom-2 -right-2 p-2.5 bg-white text-black rounded-xl shadow-2xl hover:scale-110 transition-transform"
                                    >
                                        <IconSettings className="w-4 h-4" />
                                    </button>
                                    <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </div>
                                <div>
                                    <h3 className="type-h2 text-white mb-1">{user.name}</h3>
                                    <p className="type-body text-zinc-500 mb-4">{user.email}</p>
                                    <span className="type-tiny px-3 py-1 bg-white/5 text-zinc-400 font-bold rounded-full border border-white/5">READER ACCOUNT</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-4">
                                <button onClick={upgradeToSeller} className="btn-primary w-full py-4">
                                    Unlock Writer Studio
                                </button>
                                <button onClick={handleLogout} className="btn-secondary w-full py-4 text-rose-400 border-rose-500/10 hover:bg-rose-500/5">
                                    <IconLogout className="w-4 h-4" /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        {filteredBooks && filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {filteredBooks.map(book => (
                                    <BookCard key={book.id} book={book} />
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card-premium py-24 md:py-32 text-center rounded-[40px]">
                                <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-800">
                                    <IconBook className="w-8 h-8 text-zinc-700" />
                                </div>
                                <h3 className="type-h2 text-white mb-4">
                                    {activeTab === 'wishlist' ? 'Your wishlist is empty' : 'Empty Library'}
                                </h3>
                                <p className="type-body text-muted mb-12 max-w-xs mx-auto">
                                    {activeTab === 'wishlist' ? 'Archive stories you plan to experience later.' : 'Your neural shelf awaits its first volume.'}
                                </p>
                                <button 
                                    onClick={() => navigate('/store')} 
                                    className="btn-primary px-12 py-4"
                                >
                                    Explore Library
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>

        {/* --- MOBILE NAVIGATION --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900 flex items-center justify-around z-50 pb-safe px-4">
            <MobileNavItem id="library" label="Books" icon={IconBook} />
            <MobileNavItem id="wishlist" label="Saved" icon={IconHeart} />
            <MobileNavItem id="settings" label="Profile" icon={IconSettings} />
        </div>
    </div>
  );
};

export default UserDashboardContent;

