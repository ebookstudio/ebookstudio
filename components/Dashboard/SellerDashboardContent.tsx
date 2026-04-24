import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Seller, EBook, CreatorSiteConfig, UserType } from '../../types';
import BookUploadForm from '../BookUpload/BookUploadForm';
import AnalyticsChart from './AnalyticsChart';
import { 
    IconSettings, IconBook, IconSparkles, 
    IconEdit, IconRocket, 
    IconActivity, IconPlus, IconCloudUpload, IconGithub, IconLink,
    IconEye, IconDashboard, IconTrendingUp,
    IconArrowUpRight,
    IconUsers,
    IconFileText,
    IconArrowRight,
    IconShieldCheck
} from '../../constants'; 
import * as ReactRouterDOM from 'react-router-dom';
import { saveUserDataToGitHub } from '../../services/cloudService';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import MobileSidebar from './MobileSidebar';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { cn } from '../../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

const mockVisitors = [
    { id: 1, name: "Alice Freeman", email: "alice.f...@gmail.com", location: "Mumbai, IN", time: "2 mins ago", status: "Verified", action: "Viewed 'The Void Start'", avatar: "A" },
    { id: 2, name: "Bob Script", email: "bob.script...@outlook.com", location: "London, UK", time: "15 mins ago", status: "Verified", action: "Purchased 'Neural Architectures'", avatar: "B" },
    { id: 3, name: "Guest User", email: "—", location: "New York, US", time: "42 mins ago", status: "Guest", action: "Browsing Store", avatar: "?" },
    { id: 4, name: "Diana Prince", email: "diana.p...@gmail.com", location: "Toronto, CA", time: "1 hour ago", status: "Verified", action: "Added to Cart", avatar: "D" },
    { id: 5, name: "Evan Wright", email: "evan.w...@yahoo.com", location: "Sydney, AU", time: "3 hours ago", status: "Verified", action: "Viewed Profile", avatar: "E" },
];

const StatCard = ({ label, value, badge, sub, icon: Icon }: any) => (
    <div className="bg-zinc-900 border border-border p-6 rounded-xl relative group hover:border-zinc-700 transition-all">
        <div className="flex justify-between items-start mb-4">
            <p className="text-[11px] font-medium text-zinc-500">{label}</p>
            {badge && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-950 border border-border">
                    <span className="text-[9px] font-bold text-zinc-400">{badge}</span>
                </div>
            )}
        </div>
        <div className="flex items-baseline gap-2 mb-4">
            <h3 className="text-3xl font-bold tracking-tight text-zinc-100">{value}</h3>
        </div>
        <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                <p className="text-[10px] font-medium">{sub}</p>
                <Icon className="w-3 h-3" />
            </div>
            <p className="text-[9px] text-zinc-600 font-medium">Visitors for the last 6 months</p>
        </div>
    </div>
);

export const SellerDashboardContent: React.FC = () => {
  const { currentUser, updateSellerCreatorSite, addCreatedBook, setCurrentUser, userType, updatePayoutUpi, updateSubscription } = useAppContext();
  const seller = currentUser as Seller; 
  const [activeTab, setActiveTab] = useState<string>('stats');
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
    setActiveTab('stats');
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

  const handlePublishBook = async (bookId: string) => {
      try {
          const res = await fetch('/api/publish-book', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bookId, price: 499 })
          });
          if (res.ok) {
              alert("Book published successfully to the marketplace!");
              window.location.reload();
          } else {
              alert("Failed to publish book.");
          }
      } catch (e) {
          console.error(e);
      }
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

  const getTitle = () => {
    switch(activeTab) {
        case 'stats': return 'Sales Overview';
        case 'books': return 'All Ebooks';
        case 'add-book': return 'Add New Ebook';
        case 'categories': return 'Categories';
        case 'inventory': return 'Inventory';
        case 'orders': return 'Orders & Transactions';
        case 'pricing': return 'Pricing Plans';
        case 'coupons': return 'Coupons / Discounts';
        case 'payouts': return 'Payout Settings';
        case 'refunds': return 'Refunds';
        case 'customers': return 'Customer List';
        case 'downloads': return 'Downloads';
        case 'reviews': return 'Reviews & Ratings';
        case 'top-selling': return 'Top Selling Ebooks';
        case 'funnel': return 'Conversion Funnel';
        case 'payment-health': return 'Razorpay Payment Success/Failure Rate';
        case 'settings': return 'Store Settings';
        case 'gateway': return 'Payment Gateway';
        case 'notifications': return 'Email Notifications';
        default: return 'Dashboard';
    }
  };

    const { isSidebarCollapsed } = useAppContext();

    return (
        <div className="min-h-screen w-full bg-zinc-950 flex text-zinc-100 selection:bg-primary/30">
            <DashboardSidebar 
                userType="SELLER" 
                activeSection={activeTab} 
                onSectionChange={setActiveTab} 
            />

            <div className={cn(
                "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
                isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
            )}>
            <DashboardHeader 
                user={seller} 
                title={getTitle()} 
                searchQuery="" 
                onSearchChange={() => {}}
                showSearch={true}
                mobileSidebar={
                    <MobileSidebar>
                        <DashboardSidebar 
                            userType="SELLER" 
                            activeSection={activeTab} 
                            onSectionChange={setActiveTab} 
                            isMobile={true}
                        />
                    </MobileSidebar>
                }
            />

            <main className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
                    
                    {activeTab === 'stats' && (
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <StatCard 
                                    label="Total Revenue" 
                                    value={isOwner ? "$1,250.00" : "$245.00"} 
                                    badge="+12.5%" 
                                    sub="Trending up this month" 
                                    icon={IconArrowUpRight} 
                                />
                                <StatCard 
                                    label="New Customers" 
                                    value={isOwner ? "1,234" : "12"} 
                                    badge="-20%" 
                                    sub="Down 20% this period" 
                                    icon={IconActivity} 
                                />
                                <StatCard 
                                    label="Active Accounts" 
                                    value={isOwner ? "45,678" : "+5"} 
                                    badge="" 
                                    sub="Strong user retention" 
                                    icon={IconUsers} 
                                />
                            </div>

                            {/* Chart Section */}
                            <div className="bg-zinc-900 border border-border p-8 rounded-xl space-y-6">
                                <div className="space-y-1">
                                    <h4 className="text-base font-bold text-zinc-100">Total Visitors</h4>
                                    <p className="text-[11px] font-medium text-zinc-500 text-zinc-500">Total for the last 3 months</p>
                                </div>
                                <div className="h-[450px]">
                                    <AnalyticsChart className="w-full h-full" hideHeader={true} />
                                </div>
                            </div>

                            {/* Activity Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-zinc-900 border border-border p-8 rounded-xl space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-bold text-zinc-100">Live Sales</h4>
                                            <p className="text-xs text-zinc-500 font-medium">Global transaction record.</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="h-8 px-4 border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                                            Review All
                                        </Button>
                                    </div>
                                    <div className="space-y-6">
                                        {mockVisitors.map(visitor => (
                                            <div key={visitor.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="w-9 h-9 rounded-md border border-border bg-zinc-950 flex items-center justify-center">
                                                        <AvatarFallback className="bg-transparent text-zinc-500 text-xs font-bold">{visitor.avatar}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-200 group-hover:text-zinc-100 transition-colors">{visitor.name}</p>
                                                        <p className="text-[10px] text-zinc-600 font-medium truncate max-w-[150px]">{visitor.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-zinc-100">+$12.50</p>
                                                    <p className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">{visitor.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-zinc-900 border border-border p-8 rounded-xl space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-bold text-zinc-100">Inventory</h4>
                                            <p className="text-xs text-zinc-500 font-medium">Manage your digital publication catalog.</p>
                                        </div>
                                        <Button variant="ghost" onClick={() => setActiveTab('books')} className="text-[10px] font-bold text-zinc-500 hover:text-zinc-100 flex items-center gap-2">
                                            Full Catalog <IconArrowRight className="w-3 h-3" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {myUploadedBooks.slice(0, 4).map(book => (
                                            <div key={book.id} className="p-4 bg-zinc-950 border border-border rounded-lg flex items-center justify-between group hover:border-zinc-700 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <img src={book.coverImageUrl} className="w-8 h-12 object-cover rounded border border-border" alt="" />
                                                    <div>
                                                        <p className="text-xs font-bold text-zinc-200">{book.title}</p>
                                                        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{book.genre}</p>
                                                    </div>
                                                </div>
                                                <p className="text-xs font-bold text-zinc-400">${(book.price / 100).toFixed(2)}</p>
                                            </div>
                                        ))}
                                        {myUploadedBooks.length === 0 && (
                                            <div className="py-12 text-center border border-dashed border-border rounded-lg">
                                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">No Active Assets</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'books' && (
                        <div className="space-y-8">
                             <div className="flex items-center justify-between border-b border-border pb-8">
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Library Assets</h2>
                                    <p className="text-sm text-zinc-500">Manage your high-fidelity publication assets.</p>
                                </div>
                                <Button 
                                    onClick={() => navigate('/ebook-studio')}
                                    className="h-9 px-6 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-bold text-[10px] uppercase tracking-[0.2em]"
                                >
                                    New Creation
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {myUploadedBooks.length > 0 ? (
                                    myUploadedBooks.map(book => (
                                        <div key={book.id} className="bg-zinc-900 border border-border p-6 rounded-xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                                            <div className="flex items-center gap-8">
                                                <div className="relative">
                                                    <img src={book.coverImageUrl} className="w-20 h-32 object-cover rounded-md border border-border shadow-2xl" alt="" />
                                                    <div className={`absolute top-2 left-2 px-1.5 py-0.5 bg-zinc-950/80 backdrop-blur-md rounded border border-border text-[8px] font-black uppercase ${book.isDraft ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                        {book.isDraft ? 'Draft' : 'Active'}
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <h4 className="text-xl font-bold text-zinc-100 group-hover:text-zinc-300 transition-colors">{book.title}</h4>
                                                    <div className="flex gap-4">
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{book.genre}</span>
                                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">•</span>
                                                        <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-widest">${(book.price/100).toFixed(2)}</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 font-medium line-clamp-1 max-w-xl">{book.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col md:flex-row items-center gap-3">
                                                {book.isDraft && (
                                                    <Button variant="default" size="sm" onClick={() => handlePublishBook(book.id)} className="h-9 bg-emerald-500 text-zinc-950 hover:bg-emerald-600 text-[10px] font-bold uppercase tracking-widest px-4 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400">
                                                        <IconRocket className="w-3 h-3 mr-2" /> Publish
                                                    </Button>
                                                )}
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/read/${book.id}`)} className="h-9 border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 px-4">View</Button>
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/edit-ebook/${book.id}`)} className="h-9 border-zinc-800 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 px-4">Edit</Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-32 text-center border border-dashed border-border rounded-xl bg-zinc-900/20">
                                        <IconBook className="w-12 h-12 mx-auto mb-6 text-zinc-800" />
                                        <p className="text-base font-bold text-zinc-500 uppercase tracking-[0.2em] mb-6">No Active Assets</p>
                                        <Button onClick={() => navigate('/ebook-studio')} className="h-10 px-8 bg-zinc-100 text-zinc-950 font-bold text-[10px] uppercase tracking-widest">Initialize Creation</Button>
                                    </div>
                                )}
                            </div>

                            <div className="max-w-4xl mx-auto pt-24">
                                <div className="bg-zinc-900 border border-border rounded-xl p-10 space-y-12 shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-20" />
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-bold text-zinc-100">Publication Studio</h3>
                                        <p className="text-sm text-zinc-500">Initialize a new high-fidelity digital publication.</p>
                                    </div>
                                    <BookUploadForm onBookUploaded={handleBookUploaded} />
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'add-book' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-zinc-900 border border-border rounded-xl p-10 space-y-12 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-20" />
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-bold text-zinc-100">Manual Asset Upload</h3>
                                    <p className="text-sm text-zinc-500">Upload your existing ebook assets directly to the store.</p>
                                </div>
                                <BookUploadForm onBookUploaded={handleBookUploaded} />
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'settings' && (
                        <div className="space-y-8">
                             <div className="max-w-4xl mx-auto">
                                <div className="bg-zinc-900 border border-border rounded-xl p-8 lg:p-16 space-y-16">
                                    <header className="space-y-2">
                                        <h3 className="text-2xl font-bold text-zinc-100">Studio Configuration</h3>
                                        <p className="text-sm text-zinc-500 font-medium">Configure your professional identity and workspace parameters.</p>
                                    </header>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Identity Display</label>
                                                <input name="displayName" value={creatorSiteForm.displayName} onChange={handleCreatorSiteFormChange} className="w-full h-11 bg-zinc-950 border border-border rounded-md px-4 text-xs font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all" />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Workspace URL Slug</label>
                                                <div className="flex">
                                                    <div className="bg-zinc-800 border border-border border-r-0 text-zinc-500 px-4 flex items-center text-[10px] font-bold rounded-l-md">studio/</div>
                                                    <input name="slug" value={creatorSiteForm.slug} onChange={handleCreatorSiteFormChange} className="flex-1 h-11 bg-zinc-950 border border-border rounded-r-md px-4 text-xs font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all font-mono" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Razorpay Payout UPI ID</label>
                                            <div className="flex flex-col md:flex-row gap-4">
                                                <input 
                                                    placeholder="e.g. yourname@upi" 
                                                    value={seller.payoutUpiId || ''} 
                                                    onChange={(e) => updatePayoutUpi(e.target.value)}
                                                    className="flex-1 h-11 bg-zinc-950 border border-border rounded-md px-4 text-xs font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all font-mono" 
                                                />
                                                <div className="px-4 h-11 bg-zinc-900 border border-border rounded-md flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-zinc-600 font-medium ml-1">Your 70% earnings will be auto-transferred to this ID via Razorpay Payouts.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Professional Tagline</label>
                                            <textarea name="tagline" value={creatorSiteForm.tagline} onChange={handleCreatorSiteFormChange} rows={3} className="w-full bg-zinc-950 border border-border rounded-md p-4 text-xs font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all resize-none leading-relaxed" />
                                        </div>
                                        
                                        <div className="pt-4">
                                            <Button 
                                                onClick={handleDeployToGitHub} 
                                                disabled={isDeploying}
                                                className="w-full h-12 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl"
                                            >
                                                {isDeploying ? 'Synchronizing Intelligence...' : <><IconCloudUpload className="w-4 h-4 mr-3"/> Commit Changes to Workspace</>}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    )}
                    {activeTab === 'payouts' && (
                        <div className="space-y-12 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard label="Total Earnings" value={`₹${(seller.payoutHistory?.reduce((s,p) => s+p.amount, 0) || 0).toFixed(2)}`} badge="70% Split" sub="Lifetime writer revenue" icon={IconTrendingUp} />
                                <StatCard label="Pending Payouts" value="₹0.00" badge="Automated" sub="Processed on each sale" icon={IconActivity} />
                                <StatCard label="Platform Commission" value="30%" badge="Active" sub="Fixed marketplace fee" icon={IconShieldCheck} />
                            </div>

                            <div className="bg-zinc-900 border border-border rounded-xl overflow-hidden shadow-2xl">
                                <div className="p-8 border-b border-border bg-zinc-950/50">
                                    <h4 className="text-base font-bold text-zinc-100">Payout Ledger</h4>
                                    <p className="text-xs text-zinc-500 font-medium">Real-time record of all transfers to {seller.payoutUpiId || 'your UPI ID'}.</p>
                                </div>
                                <div className="p-0 overflow-x-auto w-full">
                                    <Table className="min-w-[600px]">
                                        <TableHeader className="bg-zinc-950">
                                            <TableRow className="border-border hover:bg-transparent">
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-12">Transaction ID</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-12">Date</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-12">Amount</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-12">Status</TableHead>
                                                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 h-12 text-right">Receipt</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {seller.payoutHistory && seller.payoutHistory.length > 0 ? (
                                                seller.payoutHistory.map((payout) => (
                                                    <TableRow key={payout.id} className="border-border hover:bg-zinc-950/50 transition-colors">
                                                        <TableCell className="font-mono text-[10px] text-zinc-400">{payout.razorpayPayoutId || payout.id}</TableCell>
                                                        <TableCell className="text-xs font-medium text-zinc-300">{new Date(payout.timestamp).toLocaleDateString()}</TableCell>
                                                        <TableCell className="text-xs font-bold text-zinc-100">₹{payout.amount.toFixed(2)}</TableCell>
                                                        <TableCell>
                                                            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                                                                {payout.status}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-600 hover:text-zinc-100">
                                                                <IconLink className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-48 text-center">
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-700">No payout history detected.</p>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
                            <header className="text-center space-y-4 mb-16">
                                <h2 className="text-4xl font-bold tracking-tighter text-zinc-100">AI Subscription Plans</h2>
                                <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                                    Unlock advanced agentic workflows and high-fidelity generation tools.
                                </p>
                            </header>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-zinc-900 border border-border p-10 rounded-2xl space-y-8 relative overflow-hidden group hover:border-zinc-700 transition-all">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-zinc-100">Creator Free</h3>
                                        <p className="text-xs text-zinc-500 font-medium">Basic marketplace listing & storage.</p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-zinc-100">₹0</span>
                                        <span className="text-zinc-600 text-[10px] font-bold uppercase">/ lifetime</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {['70/30 Marketplace Split', 'Basic Cover Templates', 'Manual Asset Upload', 'Public Creator Site'].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-medium text-zinc-400">
                                                <IconShieldCheck className="w-3.5 h-3.5 text-zinc-700" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button disabled className="w-full h-11 bg-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest border border-border">Default Plan</Button>
                                </div>

                                <div className="bg-zinc-900 border-2 border-zinc-100 p-10 rounded-2xl space-y-8 relative overflow-hidden shadow-2xl">
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-zinc-100 rounded-full text-zinc-950 text-[9px] font-black uppercase tracking-widest">Recommended</div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-zinc-100">Studio Pro</h3>
                                        <p className="text-xs text-zinc-500 font-medium">Full agentic AI generation ecosystem.</p>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-zinc-100">₹499</span>
                                        <span className="text-zinc-600 text-[10px] font-bold uppercase">/ monthly</span>
                                    </div>
                                    <ul className="space-y-4">
                                        {['Agentic Chapter Planning', 'Infinite AI Generations', 'Premium Layout Engines', 'Custom Domains (BETA)', 'Priority SEO Indexing'].map(f => (
                                            <li key={f} className="flex items-center gap-3 text-xs font-medium text-zinc-200">
                                                <IconShieldCheck className="w-3.5 h-3.5 text-zinc-100" /> {f}
                                            </li>
                                        ))}
                                    </ul>
                                    <Button 
                                        onClick={() => updateSubscription('pro_monthly')}
                                        className={cn(
                                            "w-full h-11 text-[10px] font-black uppercase tracking-widest transition-all",
                                            seller.subscription?.isActive ? "bg-zinc-800 text-zinc-100 border border-zinc-700" : "bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
                                        )}
                                    >
                                        {seller.subscription?.isActive ? "Currently Active" : "Initialize Subscription"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Placeholder for new tabs */}
                    {!['stats', 'books', 'settings', 'add-book', 'payouts', 'pricing'].includes(activeTab) && (
                        <div className="py-32 text-center border border-dashed border-border rounded-2xl bg-zinc-900/30 animate-fade-in">
                            <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center mx-auto mb-8 border border-border shadow-xl">
                                <IconSparkles className="w-6 h-6 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-2">
                                {getTitle()} Module
                            </h3>
                            <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                                The {getTitle().toLowerCase()} system is currently synchronizing with the Razorpay API and Ebook Studio core.
                            </p>
                            <Button 
                                onClick={() => setActiveTab('stats')}
                                className="h-10 px-8 bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-border text-xs font-bold uppercase tracking-widest"
                            >
                                Return to Overview
                            </Button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    </div>
  );
};

export default SellerDashboardContent;
