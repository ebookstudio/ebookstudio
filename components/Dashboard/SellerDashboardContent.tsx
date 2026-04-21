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

  const SidebarItem = ({ id, label, icon: Icon, onClick }: any) => (
    <button 
      onClick={onClick || (() => setActiveTab(id))}
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

  const isOwner = seller.isAdmin === true || seller.email === 'subatomicerror@gmail.com';

  return (
    <div className="h-screen w-full bg-black flex overflow-hidden">
        
        {/* --- SIDEBAR --- */}
        <aside className="w-64 flex-shrink-0 border-r border-zinc-900 hidden md:flex flex-col bg-zinc-950 z-20 h-full">
            <div className="p-6 border-b border-zinc-900">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                        <IconBook className="w-5 h-5 text-black" />
                    </div>
                    <span className="type-h3 font-black text-white tracking-tighter uppercase">Studio</span>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
                <SidebarItem id="home" label="Back to Home" icon={IconHome} onClick={() => navigate('/')} />
                <div className="h-px bg-zinc-900 my-4"></div>
                
                <SidebarItem id="overview" label="Overview" icon={IconActivity} />
                <SidebarItem id="audience" label="Live Feed" icon={IconUser} />
                <SidebarItem id="studio" label="Manuscripts" icon={IconCloudUpload} />
                
                <div className="h-px bg-zinc-900 my-4"></div>
                <SidebarItem id="settings" label="Site Config" icon={IconSettings} />
                
                {isOwner && (
                    <>
                        <div className="h-px bg-zinc-900 my-4"></div>
                        <SidebarItem id="admin" label="System Admin" icon={IconDashboard} />
                    </>
                )}
            </nav>

            <div className="p-4 border-t border-zinc-900">
                 <div className="glass-card-premium p-4 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-zinc-700">
                        {seller.profileImageUrl ? (
                            <img src={seller.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold">{seller.name[0]}</div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="type-tiny font-black text-white truncate flex items-center gap-1">
                            {seller.name}
                            {seller.isVerified && <IconCheck className="w-3 h-3 text-emerald-500" />}
                        </p>
                        <p className="type-tiny text-zinc-500 truncate">
                            {isOwner ? 'System Owner' : 'Writer'}
                        </p>
                    </div>
                 </div>
                 <button 
                    onClick={() => setCurrentUser(currentUser, UserType.USER)}
                    className="w-full mt-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                 >
                    Reader Mode
                 </button>
            </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 h-full overflow-y-auto bg-black relative scroll-smooth bg-dot-matrix">
            <div className="p-6 md:p-12 pb-32 max-w-7xl mx-auto">
            
                 <div className="mb-10 flex justify-between items-center">
                    <h1 className="type-h2 text-white">
                        {activeTab === 'overview' && (isOwner ? 'Platform Hub' : 'Writer Dashboard')}
                        {activeTab === 'audience' && 'Live Audience Feed'}
                        {activeTab === 'studio' && 'Manuscript Manager'}
                        {activeTab === 'settings' && 'Site Configuration'}
                        {activeTab === 'admin' && 'Global Administration'}
                    </h1>
                </div>

                {/* --- OVERVIEW TAB --- */}
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: "Revenue", value: isOwner ? "$12,405" : "$245.00", icon: IconWallet, color: "text-emerald-400" },
                                { label: "Total Visitors", value: isOwner ? "84,320" : "1,240", icon: IconActivity, color: "text-sky-400" },
                                { label: isOwner ? "Total Books" : "Active Books", value: isOwner ? "342" : myUploadedBooks.length.toString(), icon: IconBook, color: "text-amber-400" }
                            ].map((stat, i) => (
                                <div key={i} className="glass-card-premium p-8 rounded-3xl group">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`p-4 rounded-2xl bg-zinc-900 border border-zinc-800 ${stat.color}`}>
                                            <stat.icon className="w-6 h-6" />
                                        </div>
                                        <span className="type-tiny font-bold text-emerald-400">+12.5%</span>
                                    </div>
                                    <h3 className="type-display text-3xl text-white mb-2">{stat.value}</h3>
                                    <p className="type-tiny text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card-premium rounded-3xl p-8 h-[400px]">
                            <AnalyticsChart className="w-full h-full" title={isOwner ? "Platform Revenue (USD)" : "Revenue Performance"} />
                        </div>

                        {!isOwner && (
                            <div className="glass-card-premium rounded-3xl overflow-hidden">
                                <div className="px-8 py-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/50">
                                    <h3 className="type-h3">Recent Manuscripts</h3>
                                    <button onClick={() => setActiveTab('studio')} className="type-tiny text-white font-bold hover:underline underline-offset-4">View All</button>
                                </div>
                                <div className="divide-y divide-zinc-900">
                                    {myUploadedBooks.slice(0, 5).map(book => (
                                        <div key={book.id} className="px-8 py-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center gap-5">
                                                <img src={book.coverImageUrl} className="w-10 h-14 object-cover rounded shadow-lg bg-black border border-zinc-800" alt="" />
                                                <div>
                                                    <p className="type-tiny font-bold text-white group-hover:text-emerald-400 transition-colors">{book.title}</p>
                                                    <p className="type-tiny text-zinc-500">${(book.price / 100).toFixed(2)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <span className="type-tiny text-zinc-600 hidden sm:block">{new Date(book.publicationDate).toLocaleDateString()}</span>
                                                <button onClick={() => navigate(`/edit-ebook/${book.id}`)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                                                    <IconEdit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {myUploadedBooks.length === 0 && (
                                        <div className="p-12 text-center">
                                            <p className="type-body text-zinc-600">No manuscripts uploaded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {/* --- AUDIENCE TAB --- */}
                {activeTab === 'audience' && (
                    <div className="animate-fade-in max-w-5xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="type-tiny font-bold uppercase tracking-widest text-zinc-500 mb-1">Live Connection Feed</h2>
                                <p className="type-tiny text-zinc-600">Real-time engagement tracking</p>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="type-tiny font-bold text-emerald-400 tracking-widest">STREAMING LIVE</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {mockVisitors.map((visitor) => (
                                <div key={visitor.id} className="glass-card-premium hover:bg-zinc-900/50 p-5 flex flex-col md:flex-row md:items-center gap-6 transition-all duration-300">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sm text-zinc-400">
                                            {visitor.avatar}
                                        </div>
                                        <div>
                                            <div className="type-tiny font-bold text-white">{visitor.name}</div>
                                            <div className="type-tiny text-zinc-600">{visitor.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-zinc-500 type-tiny">
                                        <IconGlobe className="w-3 h-3" />
                                        <span>{visitor.location}</span>
                                    </div>
                                    <div className="flex-1 md:max-w-[250px]">
                                         <div className="flex items-center gap-2 text-white type-tiny mb-1">
                                            <IconActivity className="w-3 h-3 text-sky-400" />
                                            <span className="truncate">{visitor.action}</span>
                                         </div>
                                         <div className="type-tiny text-zinc-600 flex items-center gap-1 font-mono">
                                            <IconClock className="w-3 h-3" /> {visitor.time}
                                         </div>
                                    </div>
                                    <div className="flex justify-end min-w-[100px]">
                                        <span className={`px-3 py-1 rounded-full type-tiny font-bold tracking-widest ${
                                            visitor.status === 'Signed In' 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                            : 'bg-zinc-900 text-zinc-600'
                                        }`}>
                                            {visitor.status === 'Signed In' ? 'USER' : 'GUEST'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- STUDIO TAB --- */}
                {activeTab === 'studio' && (
                    <div className="animate-fade-in max-w-5xl mx-auto space-y-12">
                        <div className="glass-card-premium rounded-3xl overflow-hidden">
                            <div className="p-10 border-b border-zinc-900 bg-zinc-950/50">
                                <h2 className="type-h3 mb-2">Your Manuscripts</h2>
                                <p className="type-small text-muted">Refine your content, adjust distribution, and track performance.</p>
                            </div>
                            
                            <div className="divide-y divide-zinc-900 max-h-[500px] overflow-y-auto custom-scrollbar">
                                {myUploadedBooks.length > 0 ? (
                                    myUploadedBooks.map(book => (
                                        <div key={book.id} className="p-8 flex flex-col sm:flex-row items-center gap-8 hover:bg-white/[0.01] transition-colors group">
                                            <img 
                                                src={book.coverImageUrl} 
                                                alt={book.title} 
                                                className="w-20 h-28 object-cover rounded-xl shadow-2xl bg-black border border-zinc-800 group-hover:scale-105 transition-transform"
                                            />
                                            <div className="flex-1 text-center sm:text-left">
                                                <h3 className="type-h3 text-white mb-2 group-hover:text-sky-400 transition-colors">{book.title}</h3>
                                                <div className="flex items-center justify-center sm:justify-start gap-4 type-tiny text-zinc-500 mb-4">
                                                    <span className="font-bold uppercase tracking-widest">{book.genre}</span>
                                                    <span>•</span>
                                                    <span className="font-mono text-white">${(book.price / 100).toFixed(2)}</span>
                                                </div>
                                                <p className="type-tiny text-zinc-600 line-clamp-2 max-w-xl">{book.description}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => navigate(`/read/${book.id}`)}
                                                    className="p-3 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                                                    title="Preview Content"
                                                >
                                                    <IconEye className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => navigate(`/edit-ebook/${book.id}`)}
                                                    className="btn-primary px-8 py-3"
                                                >
                                                    <IconEdit className="w-4 h-4" /> Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center text-zinc-600">
                                        <IconBook className="w-16 h-16 mx-auto mb-6 opacity-10" />
                                        <p className="type-body">You haven't uploaded any manuscripts yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="mb-10 flex items-center gap-6">
                                <div className="h-px flex-1 bg-zinc-900"></div>
                                <span className="type-tiny font-bold text-zinc-500 uppercase tracking-[0.3em]">Launch New Volume</span>
                                <div className="h-px flex-1 bg-zinc-900"></div>
                            </div>
                            <div className="glass-card-premium p-10 rounded-3xl">
                                <BookUploadForm onBookUploaded={handleBookUploaded} />
                            </div>
                        </div>
                    </div>
                )}

                {/* --- SETTINGS TAB --- */}
                {activeTab === 'settings' && (
                    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        <div className="glass-card-premium p-10 rounded-3xl">
                            <div className="mb-10 flex items-center justify-between">
                                <h2 className="type-h3">Digital Presence</h2>
                                {deploymentUrl && (
                                    <a href={deploymentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 type-tiny font-bold text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> SITE LIVE
                                    </a>
                                )}
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="type-tiny font-bold text-zinc-500 uppercase tracking-widest ml-1">Display Identity</label>
                                    <input name="displayName" value={creatorSiteForm.displayName} onChange={handleCreatorSiteFormChange} className="input-premium py-4" placeholder="Your Professional Name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="type-tiny font-bold text-zinc-500 uppercase tracking-widest ml-1">Creator Manifesto</label>
                                    <textarea name="tagline" value={creatorSiteForm.tagline} onChange={handleCreatorSiteFormChange} rows={3} className="input-premium py-4 resize-none" placeholder="A brief statement of your creative vision..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="type-tiny font-bold text-zinc-500 uppercase tracking-widest ml-1">Custom Endpoint (Slug)</label>
                                    <div className="flex gap-1">
                                        <div className="bg-zinc-900 border border-zinc-800 text-zinc-600 px-4 flex items-center type-tiny font-mono rounded-l-xl">ebooks/</div>
                                        <input name="slug" value={creatorSiteForm.slug} onChange={handleCreatorSiteFormChange} className="input-premium rounded-l-none py-4" placeholder="username" />
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handleDeployToGitHub} 
                                    disabled={isDeploying}
                                    className="btn-primary w-full py-5 text-[11px]"
                                >
                                    {isDeploying ? 'Deploying to Cloud...' : <><IconCloudUpload className="w-5 h-5"/> SYNC TO GITHUB PAGES</>}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-8">
                            <div className="glass-card-premium p-10 rounded-3xl text-center">
                                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                                    <IconGithub className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="type-h3 mb-4">Architecture & Hosting</h3>
                                <p className="type-tiny text-zinc-500 mb-8 leading-relaxed">
                                    Your creator site is automatically compiled and distributed via GitHub's global edge network. Latency is minimal.
                                </p>
                                {deploymentUrl ? (
                                    <div className="bg-black/50 p-4 rounded-xl border border-zinc-900 w-full flex justify-between items-center group cursor-pointer hover:border-zinc-700 transition-colors">
                                        <span className="type-tiny text-zinc-400 truncate font-mono">{deploymentUrl}</span>
                                        <IconLink className="w-4 h-4 text-zinc-600 group-hover:text-white"/>
                                    </div>
                                ) : (
                                    <div className="type-tiny text-zinc-700 italic">
                                        Awaiting first deployment...
                                    </div>
                                )}
                            </div>

                             <div className="glass-card-premium p-8 rounded-3xl border-rose-500/10">
                                 <button onClick={() => setCurrentUser(seller, UserType.USER)} className="btn-secondary w-full py-4 text-rose-200 border-rose-500/10 hover:bg-rose-500/5">
                                    EXIT STUDIO MODE
                                 </button>
                             </div>
                        </div>
                    </div>
                )}

                {/* --- ADMIN TAB --- */}
                {activeTab === 'admin' && isOwner && (
                    <div className="animate-fade-in space-y-8 max-w-6xl mx-auto">
                        <div className="glass-card-premium rounded-3xl overflow-hidden">
                            <div className="p-10 border-b border-zinc-900 bg-zinc-950/50">
                                <h2 className="type-h3">Global User Registry</h2>
                                <p className="type-small text-muted">Platform-wide oversight and permission management.</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-900 type-tiny text-zinc-500 uppercase tracking-[0.2em]">
                                            <th className="p-8 font-bold">Identity</th>
                                            <th className="p-8 font-bold">Role</th>
                                            <th className="p-8 font-bold text-right">Access</th>
                                        </tr>
                                    </thead>
                                    <tbody className="type-tiny">
                                        {Object.values(mockUsers).filter(u => u.id !== 'guest').map((user) => (
                                            <tr key={user.id} className="border-b border-zinc-900 last:border-0 hover:bg-white/[0.01] transition-colors">
                                                <td className="p-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold">
                                                            {user.profileImageUrl ? <img src={user.profileImageUrl} alt="" className="w-full h-full rounded-full"/> : user.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="text-white font-bold mb-1">{user.name}</div>
                                                            <div className="text-zinc-600 font-mono">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8">
                                                    <span className={`px-3 py-1 rounded-full font-bold tracking-widest border ${
                                                        (user as Seller).isAdmin ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                                                        'uploadedBooks' in user ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' : 
                                                        'bg-zinc-900 text-zinc-600 border-transparent'
                                                    }`}>
                                                        {(user as Seller).isAdmin ? 'ADMIN' : 'uploadedBooks' in user ? 'WRITER' : 'READER'}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <button className="text-zinc-500 hover:text-white underline underline-offset-4 font-bold">MANAGE</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </main>

        {/* --- FLOATING ACTION BUTTON --- */}
        {!isOwner && (
            <button 
                onClick={() => navigate('/ebook-studio')}
                className="fixed bottom-10 right-10 z-50 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group"
            >
                <IconRocket className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
            </button>
        )}

        {/* --- MOBILE NAVIGATION --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-900 flex items-center justify-around z-50 pb-safe px-4">
            <MobileNavItem id="overview" label="Stats" icon={IconActivity} />
            <MobileNavItem id="audience" label="Live" icon={IconUser} />
            <MobileNavItem id="studio" label="Content" icon={IconCloudUpload} />
            <MobileNavItem id="settings" label="Config" icon={IconSettings} />
            {isOwner && <MobileNavItem id="admin" label="Admin" icon={IconDashboard} />}
        </div>
    </div>
  );
};
