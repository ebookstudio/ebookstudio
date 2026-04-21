import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Seller, EBook, CreatorSiteConfig, UserType } from '../../types';
import BookUploadForm from '../BookUpload/BookUploadForm';
import AnalyticsChart from './AnalyticsChart';
import { 
    IconSettings, IconBook, IconSparkles, 
    IconEdit, IconWallet, IconCheck, IconRocket, 
    IconActivity, IconPlus, IconCloudUpload, IconGithub, IconLink,
    IconUser, IconEye, IconClock, IconGlobe, IconHome, IconDashboard
} from '../../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import { saveUserDataToGitHub } from '../../services/cloudService';
import { mockUsers } from '../../services/mockData';
import MorphicEye from '../MorphicEye';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const { useNavigate } = ReactRouterDOM as any;

const mockVisitors = [
    { id: 1, name: "Alice Freeman", email: "alice.f...@gmail.com", location: "Mumbai, IN", time: "2 mins ago", status: "Signed In", action: "Viewed 'The Void Start'", avatar: "A" },
    { id: 2, name: "Bob Script", email: "bob.script...@outlook.com", location: "London, UK", time: "15 mins ago", status: "Signed In", action: "Purchased 'Neural Architectures'", avatar: "B" },
    { id: 3, name: "Guest User", email: "—", location: "New York, US", time: "42 mins ago", status: "Guest", action: "Browsing Store", avatar: "?" },
    { id: 4, name: "Diana Prince", email: "diana.p...@gmail.com", location: "Toronto, CA", time: "1 hour ago", status: "Signed In", action: "Added to Cart", avatar: "D" },
    { id: 5, name: "Evan Wright", email: "evan.w...@yahoo.com", location: "Sydney, AU", time: "3 hours ago", status: "Signed In", action: "Viewed Profile", avatar: "E" },
    { id: 6, name: "Guest User", email: "—", location: "Berlin, DE", time: "5 hours ago", status: "Guest", action: "Read Preview", avatar: "?" },
];

export const SellerDashboardContent: React.FC = () => {
  const { currentUser, updateSellerCreatorSite, addCreatedBook, setCurrentUser, userType } = useAppContext();
  const seller = currentUser as Seller; 
  const [activeTab, setActiveTab] = useState<'overview' | 'studio' | 'audience' | 'settings' | 'admin'>('overview');
  const navigate = useNavigate();
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);

  const myUploadedBooks = seller?.uploadedBooks || [];

  const [creatorSiteForm, setCreatorSiteForm] = useState<CreatorSiteConfig>(
    seller?.creatorSite || {
      isEnabled: false,
      slug: seller?.name.toLowerCase().replace(/\s+/g, '-'),
      theme: 'dark-minimal',
      profileImageUrl: seller?.profileImageUrl || '',
      displayName: seller?.name || '',
      tagline: 'Author & Digital Creator',
      showcasedBookIds: [],
    }
  );

  useEffect(() => {
    if (seller?.creatorSite) {
      setCreatorSiteForm(seller.creatorSite);
    }
  }, [seller]);

  if (!seller) return null;

  const handleBookUploaded = (book: EBook) => {
    addCreatedBook(book); 
    setActiveTab('overview');
  };

  const handleDeployToGitHub = async () => {
    if (!creatorSiteForm.slug) return;
    setIsDeploying(true);
    updateSellerCreatorSite(creatorSiteForm);
    const result = await saveUserDataToGitHub(creatorSiteForm.slug, {
        sellerProfile: seller,
        siteConfig: creatorSiteForm,
        books: myUploadedBooks
    });
    if (result.success) {
        setDeploymentUrl(result.url || null);
    }
    setIsDeploying(false);
  };

  const handleCreatorSiteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setCreatorSiteForm(prev => ({ ...prev, [name]: checked }));
    } else {
        setCreatorSiteForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const isOwner = seller.isAdmin === true || seller.email === 'subatomicerror@gmail.com';

  return (
    <div className="h-screen w-full bg-[#000000] flex overflow-hidden selection:bg-white selection:text-black">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-80 flex-shrink-0 border-r border-white/5 hidden lg:flex flex-col bg-[#050505] z-20 h-full">
            <div className="p-10 border-b border-white/5">
                <div className="flex items-center gap-6">
                    <MorphicEye variant="logo" className="w-8 h-8" />
                    <span className="text-white text-lg font-black tracking-tighter uppercase">Studio Core</span>
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
                </div>

                <Separator className="my-8 bg-white/5 mx-4" />
                
                <div className="space-y-2">
                    <Button 
                      variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('overview')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'overview' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconActivity className="mr-4 w-4 h-4" /> Overview
                    </Button>
                    <Button 
                      variant={activeTab === 'audience' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('audience')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'audience' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconUser className="mr-4 w-4 h-4" /> Live Feed
                    </Button>
                    <Button 
                      variant={activeTab === 'studio' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('studio')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'studio' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconCloudUpload className="mr-4 w-4 h-4" /> Manuscripts
                    </Button>
                </div>

                <Separator className="my-8 bg-white/5 mx-4" />
                
                <div className="space-y-2">
                    <Button 
                      variant={activeTab === 'settings' ? 'secondary' : 'ghost'} 
                      onClick={() => setActiveTab('settings')}
                      className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'settings' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <IconSettings className="mr-4 w-4 h-4" /> Site Config
                    </Button>
                    {isOwner && (
                        <Button 
                          variant={activeTab === 'admin' ? 'secondary' : 'ghost'} 
                          onClick={() => setActiveTab('admin')}
                          className={`w-full justify-start h-14 rounded-2xl px-6 font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500 ${activeTab === 'admin' ? 'bg-white text-black hover:bg-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <IconDashboard className="mr-4 w-4 h-4" /> Admin Hub
                        </Button>
                    )}
                </div>
            </ScrollArea>

            <div className="p-8 border-t border-white/5">
                 <div className="bg-white/5 p-6 rounded-3xl flex items-center gap-4 border border-white/5">
                    <Avatar className="w-12 h-12 rounded-2xl border border-white/10">
                        <AvatarImage src={seller.profileImageUrl} />
                        <AvatarFallback className="bg-zinc-900 text-zinc-500 font-black">{seller.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-[10px] font-black uppercase tracking-widest truncate flex items-center gap-2">
                            {seller.name}
                            {seller.isVerified && <IconCheck className="w-3 h-3 text-emerald-500" />}
                        </p>
                        <p className="text-zinc-600 text-[10px] font-bold truncate mt-1">
                            {isOwner ? 'System Owner' : 'Writer Protocol'}
                        </p>
                    </div>
                 </div>
                 <Button 
                    variant="ghost"
                    onClick={() => setCurrentUser(currentUser, UserType.USER)}
                    className="w-full mt-6 text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-[0.3em] h-auto p-2"
                 >
                    Reader Mode
                 </Button>
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 h-full overflow-hidden bg-black relative flex flex-col">
            <div className="absolute inset-0 bg-dot-matrix opacity-[0.2] pointer-events-none" />
            
            {/* Header Area */}
            <div className="relative z-10 px-8 py-10 lg:px-16 lg:py-16 border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-white text-4xl lg:text-5xl font-black tracking-tighter leading-none">
                            {activeTab === 'overview' && (isOwner ? 'Platform Hub' : 'Writer Dashboard')}
                            {activeTab === 'audience' && 'Live Audience Feed'}
                            {activeTab === 'studio' && 'Manuscript Manager'}
                            {activeTab === 'settings' && 'Site Configuration'}
                            {activeTab === 'admin' && 'Global Administration'}
                        </h1>
                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">
                            Studio Access Protocol v2.4.1
                        </p>
                    </div>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <ScrollArea className="flex-1 px-8 py-10 lg:px-16 lg:py-16 relative z-10">
                <div className="max-w-7xl mx-auto pb-48">
                    
                    {/* --- OVERVIEW TAB --- */}
                    {activeTab === 'overview' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    { label: "Revenue", value: isOwner ? "$12,405" : "$245.00", icon: IconWallet, color: "text-emerald-400" },
                                    { label: "Total Visitors", value: isOwner ? "84,320" : "1,240", icon: IconActivity, color: "text-sky-400" },
                                    { label: isOwner ? "Total Books" : "Active Books", value: isOwner ? "342" : myUploadedBooks.length.toString(), icon: IconBook, color: "text-amber-400" }
                                ].map((stat, i) => (
                                    <Card key={i} className="bg-[#050505] border-white/5 rounded-[40px] p-10 group hover:border-white/10 transition-all duration-700">
                                        <div className="flex items-start justify-between mb-8">
                                            <div className={`p-5 rounded-3xl bg-white/5 border border-white/5 ${stat.color}`}>
                                                <stat.icon className="w-8 h-8" />
                                            </div>
                                            <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest px-4 py-1">
                                              +12.5%
                                            </Badge>
                                        </div>
                                        <h3 className="text-white text-5xl font-black tracking-tighter mb-2">{stat.value}</h3>
                                        <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</p>
                                    </Card>
                                ))}
                            </div>

                            <Card className="bg-[#050505] border-white/5 rounded-[48px] p-10 lg:p-16 h-[500px]">
                                <AnalyticsChart className="w-full h-full" title={isOwner ? "Platform Revenue (USD)" : "Revenue Performance"} />
                            </Card>

                            {!isOwner && (
                                <Card className="bg-[#050505] border-white/5 rounded-[48px] overflow-hidden">
                                    <CardHeader className="px-10 py-10 lg:px-16 lg:py-12 border-b border-white/5 flex flex-row items-center justify-between">
                                        <CardTitle className="text-white text-2xl font-black tracking-tighter">Recent Manuscripts</CardTitle>
                                        <Button variant="ghost" onClick={() => setActiveTab('studio')} className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white">View All</Button>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <Table>
                                            <TableBody>
                                                {myUploadedBooks.slice(0, 5).map(book => (
                                                    <TableRow key={book.id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
                                                        <TableCell className="p-8 lg:p-10">
                                                            <div className="flex items-center gap-8">
                                                                <img src={book.coverImageUrl} className="w-12 h-16 object-cover rounded-xl shadow-2xl border border-white/5" alt="" />
                                                                <div>
                                                                    <p className="text-white text-lg font-black tracking-tight group-hover:text-emerald-400 transition-colors">{book.title}</p>
                                                                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest mt-1">${(book.price / 100).toFixed(2)}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right p-8 lg:p-10">
                                                            <div className="flex items-center justify-end gap-10">
                                                                <span className="text-zinc-700 text-[10px] font-black uppercase tracking-widest hidden sm:block">{new Date(book.publicationDate).toLocaleDateString()}</span>
                                                                <Button 
                                                                  variant="ghost" 
                                                                  size="icon" 
                                                                  onClick={() => navigate(`/edit-ebook/${book.id}`)}
                                                                  className="h-12 w-12 rounded-2xl text-zinc-600 hover:text-white hover:bg-white/5"
                                                                >
                                                                    <IconEdit className="w-5 h-5" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                                {myUploadedBooks.length === 0 && (
                                                    <TableRow>
                                                        <TableCell className="p-32 text-center text-zinc-700 font-medium text-lg">
                                                            No manuscripts uploaded yet.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    )}
                    
                    {/* --- AUDIENCE TAB --- */}
                    {activeTab === 'audience' && (
                        <div className="animate-fade-in space-y-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Live Connection Feed</h2>
                                    <p className="text-white text-3xl font-black tracking-tighter">Real-time Engagement</p>
                                </div>
                                <Badge variant="outline" className="h-10 px-6 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                                    <span className="relative flex h-2 w-2 mr-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Synchronized Live
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {mockVisitors.map((visitor) => (
                                    <Card key={visitor.id} className="bg-[#050505] border-white/5 rounded-[32px] p-8 lg:px-12 flex flex-col md:flex-row md:items-center gap-8 group hover:border-white/10 transition-all duration-700">
                                        <div className="flex items-center gap-6 flex-1">
                                            <Avatar className="w-16 h-16 rounded-2xl border border-white/5">
                                                <AvatarFallback className="bg-zinc-900 text-zinc-600 font-black text-xl">{visitor.avatar}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="text-white text-xl font-black tracking-tight">{visitor.name}</div>
                                                <div className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest mt-1">{visitor.email}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                            <IconGlobe className="w-4 h-4" />
                                            <span>{visitor.location}</span>
                                        </div>
                                        <div className="flex-1 md:max-w-[300px]">
                                             <div className="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-widest mb-2">
                                                <IconActivity className="w-4 h-4 text-sky-400" />
                                                <span className="truncate">{visitor.action}</span>
                                             </div>
                                             <div className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                                <IconClock className="w-3.5 h-3.5" /> {visitor.time}
                                             </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <Badge variant="outline" className={`px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                visitor.status === 'Signed In' 
                                                ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' 
                                                : 'bg-zinc-900 text-zinc-700 border-transparent'
                                            }`}>
                                                {visitor.status === 'Signed In' ? 'Sovereign' : 'Guest'}
                                            </Badge>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- STUDIO TAB --- */}
                    {activeTab === 'studio' && (
                        <div className="animate-fade-in space-y-20">
                            <Card className="bg-[#050505] border-white/5 rounded-[48px] overflow-hidden">
                                <CardHeader className="px-10 py-10 lg:px-16 lg:py-12 border-b border-white/5">
                                    <CardTitle className="text-white text-3xl font-black tracking-tighter">Sovereign Manuscripts</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium text-lg">Refine your content, adjust distribution parameters, and track neural performance.</CardDescription>
                                </CardHeader>
                                
                                <CardContent className="p-0">
                                    <div className="divide-y divide-white/5">
                                        {myUploadedBooks.length > 0 ? (
                                            myUploadedBooks.map(book => (
                                                <div key={book.id} className="p-10 lg:p-16 flex flex-col lg:flex-row items-center gap-12 hover:bg-white/[0.01] transition-colors group">
                                                    <img 
                                                        src={book.coverImageUrl} 
                                                        alt={book.title} 
                                                        className="w-24 h-32 object-cover rounded-2xl shadow-2xl border border-white/5 group-hover:scale-105 transition-all duration-700"
                                                    />
                                                    <div className="flex-1 text-center lg:text-left">
                                                        <h3 className="text-white text-3xl font-black tracking-tighter mb-4 group-hover:text-emerald-400 transition-colors">{book.title}</h3>
                                                        <div className="flex items-center justify-center lg:justify-start gap-6 mb-6">
                                                            <Badge variant="outline" className="px-6 py-1 border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-white group-hover:border-white/20 transition-all">
                                                              {book.genre}
                                                            </Badge>
                                                            <span className="text-zinc-700 text-lg font-black tracking-tighter">${(book.price / 100).toFixed(2)}</span>
                                                        </div>
                                                        <p className="text-zinc-600 text-lg font-medium leading-relaxed line-clamp-2 max-w-2xl">{book.description}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <Button 
                                                            variant="outline"
                                                            onClick={() => navigate(`/read/${book.id}`)}
                                                            className="h-14 w-14 rounded-2xl border-white/5 text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                                                        >
                                                            <IconEye className="w-6 h-6" />
                                                        </Button>
                                                        <Button 
                                                            onClick={() => navigate(`/edit-ebook/${book.id}`)}
                                                            className="h-14 px-10 rounded-2xl bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105"
                                                        >
                                                            <IconEdit className="w-4 h-4 mr-3" /> Edit
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-48 text-center text-zinc-800">
                                                <IconBook className="w-20 h-20 mx-auto mb-10 opacity-5" />
                                                <p className="text-2xl font-black tracking-tighter">No manuscripts uploaded yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-12">
                                <div className="flex items-center gap-8">
                                    <Separator className="flex-1 bg-white/5" />
                                    <span className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.5em]">Launch New Protocol</span>
                                    <Separator className="flex-1 bg-white/5" />
                                </div>
                                <Card className="bg-[#050505] border-white/5 rounded-[48px] p-10 lg:p-20 shadow-2xl">
                                    <BookUploadForm onBookUploaded={handleBookUploaded} />
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* --- SETTINGS TAB --- */}
                    {activeTab === 'settings' && (
                        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <Card className="bg-[#050505] border-white/5 rounded-[48px] p-10 lg:p-16">
                                <CardHeader className="p-0 mb-16 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white text-3xl font-black tracking-tighter mb-4">Digital Presence</CardTitle>
                                        <CardDescription className="text-zinc-500 font-medium text-lg">Configure your sovereign distribution endpoint.</CardDescription>
                                    </div>
                                    {deploymentUrl && (
                                        <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] font-black uppercase tracking-widest px-6 h-10 rounded-full">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-3"></span> ACTIVE
                                        </Badge>
                                    )}
                                </CardHeader>

                                <CardContent className="p-0 space-y-10">
                                    <div className="space-y-3">
                                        <label className="text-zinc-600 text-[10px] font-black uppercase tracking-widest ml-1">Display Identity</label>
                                        <Input name="displayName" value={creatorSiteForm.displayName} onChange={handleCreatorSiteFormChange} className="h-16 bg-white/5 border-white/5 rounded-2xl px-8 text-sm font-medium" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-zinc-600 text-[10px] font-black uppercase tracking-widest ml-1">Creator Manifesto</label>
                                        <textarea name="tagline" value={creatorSiteForm.tagline} onChange={handleCreatorSiteFormChange} rows={3} className="w-full bg-white/5 border border-white/5 rounded-2xl p-8 text-sm font-medium text-white placeholder:text-zinc-700 resize-none outline-none focus:border-white/10" />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-zinc-600 text-[10px] font-black uppercase tracking-widest ml-1">Custom Endpoint (Slug)</label>
                                        <div className="flex gap-px">
                                            <div className="bg-white/5 border border-white/5 text-zinc-700 px-8 flex items-center text-[10px] font-black uppercase tracking-widest rounded-l-2xl">studio/</div>
                                            <Input name="slug" value={creatorSiteForm.slug} onChange={handleCreatorSiteFormChange} className="h-16 bg-white/5 border-white/5 rounded-l-none rounded-r-2xl px-8 text-sm font-medium" />
                                        </div>
                                    </div>
                                    
                                    <Button 
                                        onClick={handleDeployToGitHub} 
                                        disabled={isDeploying}
                                        className="w-full h-16 rounded-full bg-white text-black hover:bg-zinc-200 text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 mt-6"
                                    >
                                        {isDeploying ? 'Synchronizing Cloud...' : <><IconCloudUpload className="w-5 h-5 mr-4"/> SYNC TO GITHUB PROTOCOL</>}
                                    </Button>
                                </CardContent>
                            </Card>
                            
                            <div className="flex flex-col gap-12">
                                <Card className="bg-[#050505] border-white/5 rounded-[48px] p-10 lg:p-16 text-center flex flex-col items-center justify-center">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-10 border border-white/5">
                                        <IconGithub className="w-10 h-10 text-white" />
                                    </div>
                                    <CardTitle className="text-white text-2xl font-black tracking-tighter mb-4">Architecture & Sync</CardTitle>
                                    <p className="text-zinc-600 text-lg font-medium leading-relaxed mb-12">
                                        Your creator site is automatically compiled and distributed via GitHub's global edge protocol. Synchronize to update.
                                    </p>
                                    {deploymentUrl ? (
                                        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 w-full flex justify-between items-center group cursor-pointer hover:border-white/20 transition-all">
                                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest truncate">{deploymentUrl}</span>
                                            <IconLink className="w-5 h-5 text-zinc-700 group-hover:text-white transition-colors"/>
                                        </div>
                                    ) : (
                                        <Badge variant="outline" className="border-white/5 text-zinc-800 text-[9px] font-black uppercase tracking-[0.4em] px-8 py-2">
                                            Awaiting Sync
                                        </Badge>
                                    )}
                                </Card>

                                 <Card className="bg-[#050505] border-rose-500/10 rounded-[48px] p-8 flex items-center justify-center">
                                     <Button 
                                       variant="ghost" 
                                       onClick={() => setCurrentUser(seller, UserType.USER)} 
                                       className="w-full h-16 rounded-full text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/5 text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                                     >
                                        EXIT STUDIO PROTOCOL
                                     </Button>
                                 </Card>
                            </div>
                        </div>
                    )}

                    {/* --- ADMIN TAB --- */}
                    {activeTab === 'admin' && isOwner && (
                        <div className="animate-fade-in">
                            <Card className="bg-[#050505] border-white/5 rounded-[48px] overflow-hidden">
                                <CardHeader className="px-10 py-10 lg:px-16 lg:py-12 border-b border-white/5">
                                    <CardTitle className="text-white text-3xl font-black tracking-tighter">Global User Registry</CardTitle>
                                    <CardDescription className="text-zinc-500 font-medium text-lg">Platform-wide oversight and high-level permission management.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/5 hover:bg-transparent">
                                                <TableHead className="p-10 text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Identity Core</TableHead>
                                                <TableHead className="p-10 text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Role Protocol</TableHead>
                                                <TableHead className="p-10 text-right text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em]">Access</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {Object.values(mockUsers).filter(u => u.id !== 'guest').map((user) => (
                                                <TableRow key={user.id} className="border-white/5 hover:bg-white/[0.01] transition-colors group">
                                                    <TableCell className="p-10">
                                                        <div className="flex items-center gap-8">
                                                            <Avatar className="w-14 h-14 rounded-2xl border border-white/5">
                                                                <AvatarImage src={user.profileImageUrl} />
                                                                <AvatarFallback className="bg-zinc-900 text-zinc-600 font-black text-xl">{user.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-white text-xl font-black tracking-tight">{user.name}</div>
                                                                <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest mt-1">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="p-10">
                                                        <Badge variant="outline" className={`px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                            (user as Seller).isAdmin ? 'bg-purple-500/5 text-purple-400 border-purple-500/10' : 
                                                            'uploadedBooks' in user ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' : 
                                                            'bg-zinc-950 text-zinc-800 border-transparent'
                                                        }`}>
                                                            {(user as Seller).isAdmin ? 'ADMIN' : 'uploadedBooks' in user ? 'WRITER' : 'READER'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="p-10 text-right">
                                                        <Button variant="ghost" className="text-zinc-600 hover:text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/5 rounded-xl">
                                                          MANAGE
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                </div>
            </ScrollArea>
        </main>

        {/* --- FLOATING ACTION --- */}
        {!isOwner && (
            <Button 
                size="icon"
                onClick={() => navigate('/ebook-studio')}
                className="fixed bottom-12 right-12 z-50 w-20 h-20 bg-white text-black rounded-[28px] shadow-2xl hover:scale-110 active:scale-95 transition-all group overflow-hidden"
            >
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2)_0%,transparent_50%)] pointer-events-none" />
                <IconRocket className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
            </Button>
        )}

        {/* --- MOBILE NAVIGATION --- */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-black/60 backdrop-blur-3xl border-t border-white/5 flex items-center justify-around z-50 px-8">
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('overview')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'overview' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconActivity className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Stats</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('audience')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'audience' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconUser className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Live</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('studio')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'studio' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconCloudUpload className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Content</span>
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col gap-2 h-auto py-2 ${activeTab === 'settings' ? 'text-white' : 'text-zinc-600'}`}
            >
                <IconSettings className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">Config</span>
            </Button>
        </div>
    </div>
  );
};

export default SellerDashboardContent;
