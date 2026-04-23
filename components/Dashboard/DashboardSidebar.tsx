import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { ScrollArea } from '../../components/ui/scroll-area';
import { 
    IconHome, 
    IconStore, 
    IconBook, 
    IconHeart, 
    IconSettings, 
    IconLogout,
    IconTrendingUp,
    IconPlus,
    IconActivity,
    IconBriefcase,
    IconUsers,
    IconFileText,
    IconMail,
    IconLayout,
    IconTag,
    IconReceipt,
    IconTicket,
    IconRotateCcw,
    IconDownload,
    IconPenTip,
    IconCreditCard,
    IconLock,
    IconCheck,
    IconStar,
    IconDashboard as IconGrid
} from '../../constants';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center h-8 px-3 rounded-md text-xs font-medium transition-all group mb-0.5",
                isActive 
                    ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
            )}
        >
            <Icon className={cn("mr-3 h-3.5 w-3.5 shrink-0", isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />
            <span>{label}</span>
        </button>
    );
};

interface DashboardSidebarProps {
    userType: 'USER' | 'SELLER';
    activeSection: string;
    onSectionChange: (section: any) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userType, activeSection, onSectionChange }) => {
    const navigate = useNavigate();

    return (
        <aside className="w-60 flex-shrink-0 border-r border-border hidden lg:flex flex-col bg-zinc-950 h-screen sticky top-0 z-40">
            {/* Logo Section */}
            <div className="h-14 flex items-center px-6 mb-4">
                <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="w-4 h-4 rounded-full border border-zinc-500 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-zinc-500" />
                    </div>
                    <span className="font-bold text-sm tracking-tight text-zinc-100">EbookStudio</span>
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                {/* Quick Create Section */}
                <div className="mb-6 flex gap-1">
                    <Button 
                        onClick={() => navigate('/ebook-studio')}
                        className="flex-1 h-8 justify-start px-3 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700/30 shadow-sm transition-all"
                    >
                        <div className="flex items-center">
                            <IconPlus className="mr-2 h-3 w-3 text-zinc-100" />
                            <span className="text-[11px] font-medium">Quick Create</span>
                        </div>
                    </Button>
                    <div className="w-8 h-8 rounded-md bg-zinc-950 border border-border flex items-center justify-center text-zinc-500 hover:text-zinc-200 cursor-pointer transition-all">
                        <IconMail className="h-3.5 w-3.5" />
                    </div>
                </div>

                <div className="space-y-8 pb-8">
                    {userType === 'SELLER' ? (
                        <>
                            {/* Create Section */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Create</p>
                                <SidebarItem icon={IconLayout} label="Templates" isActive={activeSection === 'templates'} onClick={() => onSectionChange('templates')} />
                                <SidebarItem icon={IconPenTip} label="My Drafts" isActive={activeSection === 'drafts'} onClick={() => onSectionChange('drafts')} />
                                <SidebarItem icon={IconCloudUpload} label="Import Document" isActive={activeSection === 'import'} onClick={() => onSectionChange('import')} />
                            </div>

                            {/* Store Management Section */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Store Management</p>
                                <SidebarItem icon={IconBook} label="All Ebooks" isActive={activeSection === 'books'} onClick={() => onSectionChange('books')} />
                                <SidebarItem icon={IconTag} label="Categories" isActive={activeSection === 'categories'} onClick={() => onSectionChange('categories')} />
                                <SidebarItem icon={IconBriefcase} label="Inventory" isActive={activeSection === 'inventory'} onClick={() => onSectionChange('inventory')} />
                            </div>

                            {/* Payments (Razorpay) Section */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Payments (Razorpay)</p>
                                <SidebarItem icon={IconReceipt} label="Orders & Transactions" isActive={activeSection === 'orders'} onClick={() => onSectionChange('orders')} />
                                <SidebarItem icon={IconWallet} label="Pricing Plans" isActive={activeSection === 'pricing'} onClick={() => onSectionChange('pricing')} />
                                <SidebarItem icon={IconTicket} label="Coupons / Discounts" isActive={activeSection === 'coupons'} onClick={() => onSectionChange('coupons')} />
                                <SidebarItem icon={IconCreditCard} label="Payout Settings" isActive={activeSection === 'payouts'} onClick={() => onSectionChange('payouts')} />
                                <SidebarItem icon={IconRotateCcw} label="Refunds" isActive={activeSection === 'refunds'} onClick={() => onSectionChange('refunds')} />
                            </div>

                            {/* Customers Section */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Customers</p>
                                <SidebarItem icon={IconUsers} label="Customer List" isActive={activeSection === 'customers'} onClick={() => onSectionChange('customers')} />
                                <SidebarItem icon={IconDownload} label="Downloads" isActive={activeSection === 'downloads'} onClick={() => onSectionChange('downloads')} />
                                <SidebarItem icon={IconStar} label="Reviews & Ratings" isActive={activeSection === 'reviews'} onClick={() => onSectionChange('reviews')} />
                            </div>

                            {/* Analytics Section */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Analytics</p>
                                <SidebarItem icon={IconTrendingUp} label="Sales Overview" isActive={activeSection === 'stats'} onClick={() => onSectionChange('stats')} />
                                <SidebarItem icon={IconStar} label="Top Selling Ebooks" isActive={activeSection === 'top-selling'} onClick={() => onSectionChange('top-selling')} />
                                <SidebarItem icon={IconActivity} label="Conversion Funnel" isActive={activeSection === 'funnel'} onClick={() => onSectionChange('funnel')} />
                                <SidebarItem icon={IconCheck} label="Payment Success" isActive={activeSection === 'payment-health'} onClick={() => onSectionChange('payment-health')} />
                            </div>

                            {/* Settings Section */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Settings</p>
                                <SidebarItem icon={IconSettings} label="Store Settings" isActive={activeSection === 'settings'} onClick={() => onSectionChange('settings')} />
                                <SidebarItem icon={IconLock} label="Payment Gateway" isActive={activeSection === 'gateway'} onClick={() => onSectionChange('gateway')} />
                                <SidebarItem icon={IconMail} label="Email Notifications" isActive={activeSection === 'notifications'} onClick={() => onSectionChange('notifications')} />
                                <SidebarItem icon={IconUsers} label="Team Members" isActive={activeSection === 'team'} onClick={() => onSectionChange('team')} />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Reader Sidebar */}
                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Reader Hub</p>
                                <SidebarItem 
                                    icon={IconHome} 
                                    label="My Library" 
                                    isActive={activeSection === 'library'} 
                                    onClick={() => onSectionChange('library')} 
                                />
                                <SidebarItem 
                                    icon={IconHeart} 
                                    label="Favorites" 
                                    isActive={activeSection === 'wishlist'} 
                                    onClick={() => onSectionChange('wishlist')} 
                                />
                                <SidebarItem 
                                    icon={IconTrendingUp} 
                                    label="Activity" 
                                    isActive={activeSection === 'activity'} 
                                    onClick={() => onSectionChange('activity')} 
                                />
                            </div>

                            <div>
                                <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Account</p>
                                <SidebarItem 
                                    icon={IconSettings} 
                                    label="Identity" 
                                    isActive={activeSection === 'settings'} 
                                    onClick={() => onSectionChange('settings')} 
                                />
                                <SidebarItem 
                                    icon={IconStore} 
                                    label="Marketplace" 
                                    onClick={() => navigate('/store')} 
                                />
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Section */}
            <div className="p-4 border-t border-border">
                <button 
                    className="w-full flex items-center h-8 px-3 rounded-md text-[11px] font-medium text-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all group"
                    onClick={() => navigate('/login')}
                >
                    <IconLogout className="mr-3 h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
