import React, { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { EBook, User } from '../../types';
import { IconBook, IconHeart, IconSettings, IconSearch, IconLogout, IconUser, IconHome, IconStore } from '../../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import BookCard from '../BookCard';
import MorphicEye from '../MorphicEye';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

  const booksToDisplay = activeTab === 'wishlist' ? user.wishlist : user.purchaseHistory;
  const filteredBooks = booksToDisplay?.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-screen w-full bg-[#000000] flex overflow-hidden selection:bg-white selection:text-black">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-80 flex-shrink-0 border-r border-white/5 hidden lg:flex flex-col bg-[#050505] z-20 h-full">
            <div className="p-10 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <MorphicEye variant="logo" className="w-8 h-8" />
                    <span className="text-white text-lg font-black tracking-tighter uppercase">Reader Hub</span>
                </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-10">
                <div className="space-y-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate('/')}
                      className="w-full justify-start h-14 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 px-6 font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                        <IconHome className="mr-4 w-4 h-4" /> Home
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => navigate('/store')}
                      className="w-full justify-start h-14 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 px-6 font-black text-[10px] uppercase tracking-[0.2em]"
                    >
                        <IconStore className="mr-4 w-4 h-4" /> Marketplace
                    </Button>
                </div>

                <Separator className="my-8 bg-white/5 mx-4" />
                
                <div className="space-y-2">
                    <Button 
                      variant={activeTab === 'library' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('library')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'library' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconBook className="mr-4 w-4 h-4" /> Library
                    </Button>
                    <Button 
                      variant={activeTab === 'wishlist' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('wishlist')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'wishlist' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconHeart className="mr-4 w-4 h-4" /> Wishlist
                    </Button>
                </div>

                <Separator className="my-8 bg-white/5 mx-4" />
                
                <div className="space-y-2">
                    <Button 
                      variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('settings')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'settings' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconSettings className="mr-4 w-4 h-4" /> Account
                    </Button>
                </div>
            </ScrollArea>

            <div className="p-8 border-t border-white/5">
                 <div className="bg-white/5 p-6 rounded-3xl flex items-center gap-4 border border-white/5">
                    <Avatar className="w-12 h-12 rounded-2xl border border-white/10">
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback className="bg-zinc-900 text-zinc-500 font-black">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-[10px] font-black uppercase tracking-widest truncate">{user.name}</p>
                        <p className="text-zinc-600 text-[10px] font-bold truncate mt-1">{user.email}</p>
                    </div>
                 </div>
                 <Button 
                    variant="ghost"
                    onClick={upgradeToSeller}
                    className="w-full mt-6 text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.3em] h-auto p-2"
                 >
                    Upgrade to Writer
                 </Button>
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 h-full overflow-hidden bg-black relative flex flex-col">
            <div className="absolute inset-0 bg-dot-matrix opacity-[0.2] pointer-events-none" />
            
            {/* Header / Search Area */}
            <div className="relative z-10 px-8 py-10 lg:px-16 lg:py-16 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-white text-4xl lg:text-5xl font-black tracking-tighter leading-none">
                            {activeTab === 'library' && 'My Collection'}
                            {activeTab === 'wishlist' && 'Saved Protocols'}
                            {activeTab === 'settings' && 'Sovereign Identity'}
                        </h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">
                            Reader Access Protocol v1.0.4
                        </p>
                    </div>

                    {(activeTab === 'library' || activeTab === 'wishlist') && (
                        <div className="relative w-full md:w-96">
                            <IconSearch className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                            <Input 
                                placeholder="Search Archive..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border-white/5 rounded-full h-14 pl-14 text-sm font-medium focus-visible:ring-white/10"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 px-8 py-10 lg:px-16 lg:py-16 relative z-10">
                <div className="max-w-7xl mx-auto pb-48">
                    {activeTab === 'settings' ? (
                        <div className="max-w-2xl animate-fade-in">
                            <Card className="bg-[#050505] border-white/5 rounded-[48px] overflow-hidden p-10 lg:p-16">
                                <CardHeader className="p-0 mb-16 text-center lg:text-left">
                                    <CardTitle className="text-white text-3xl font-black tracking-tighter mb-4">Identity Core</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium text-lg">Manage your sovereign metadata and access credentials.</CardDescription>
                                </CardHeader>
                                
                                <CardContent className="p-0">
                                    <div className="flex flex-col sm:flex-row items-center gap-10 mb-16 text-center sm:text-left">
                                        <div className="relative group">
                                            <Avatar className="w-32 h-32 rounded-[32px] border border-white/10 shadow-2xl transition-all duration-700 group-hover:scale-105">
                                                <AvatarImage src={user.profileImageUrl} />
                                                <AvatarFallback className="bg-zinc-900 text-zinc-700 text-4xl font-black">{user.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <Button 
                                                variant="secondary"
                                                size="icon"
                                                onClick={() => profileInputRef.current?.click()}
                                                className="absolute -bottom-4 -right-4 w-12 h-12 rounded-2xl bg-white text-black hover:bg-zinc-200 shadow-2xl transition-all hover:scale-110"
                                            >
                                                <IconSettings className="w-5 h-5" />
                                            </Button>
                                            <input type="file" ref={profileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-white text-3xl font-black tracking-tighter mb-2">{user.name}</h3>
                                            <p className="text-zinc-500 text-lg font-medium mb-6">{user.email}</p>
                                            <Badge variant="outline" className="px-6 py-2 border-white/10 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">
                                              Reader Protocol Active
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    <Separator className="my-16 bg-white/5" />

                                    <div className="space-y-6">
                                        <Button 
                                          onClick={upgradeToSeller} 
                                          className="w-full h-16 rounded-full bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                                        >
                                            Unlock Writer Studio
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          onClick={handleLogout} 
                                          className="w-full h-16 rounded-full text-zinc-600 hover:text-rose-400 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            <IconLogout className="mr-4 w-4 h-4" /> Terminate Session
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            {filteredBooks && filteredBooks.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                                    {filteredBooks.map(book => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>
                            ) : (
                                <div className="py-48 text-center border border-dashed border-white/5 rounded-[60px]">
                                    <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-white/5">
                                        <IconBook className="w-10 h-10 text-zinc-700" />
                                    </div>
                                    <h3 className="text-white text-3xl font-black tracking-tighter mb-4">
                                        {activeTab === 'wishlist' ? 'Archive is empty' : 'Repository inactive'}
                                    </h3>
                                    <p className="text-zinc-600 text-lg font-medium mb-16 max-w-sm mx-auto">
                                        {activeTab === 'wishlist' ? 'Synchronize stories to your wishlist to access them later.' : 'Your neural shelf awaits its first protocol synchronization.'}
                                    </p>
                                    <Button 
                                        onClick={() => navigate('/store')} 
                                        className="h-16 px-16 rounded-full bg-white text-black hover:bg-zinc-200 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 shadow-2xl"
                                    >
                                        Explore Archive
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </main>

        {/* --- MOBILE NAVIGATION --- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around z-50 px-8">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('library')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'library' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconBook className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Books</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('wishlist')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'wishlist' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconHeart className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Saved</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconSettings className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Identity</span>
            </Button>
        </div>
    </div>
  );
};

export default UserDashboardContent;

