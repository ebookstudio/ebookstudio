import React, { useState } from 'react';
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
    IconWallet,
    IconCloudUpload,
    IconChevronLeft,
    IconChevronRight,
    IconDashboard as IconGrid
} from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import * as ReactRouterDOM from 'react-router-dom';

const { useNavigate } = ReactRouterDOM as any;

interface SidebarItemProps {
    icon: React.ElementType;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    isCollapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon: Icon, label, isActive, onClick, isCollapsed }) => {
    return (
        <button
            onClick={onClick}
            title={isCollapsed ? label : undefined}
            className={cn(
                "w-full flex items-center h-9 px-3 rounded-md text-xs font-medium transition-all group mb-0.5",
                isActive 
                    ? "bg-zinc-800 text-zinc-100 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900",
                isCollapsed && "justify-center px-0"
            )}
        >
            <Icon className={cn("h-4 w-4 shrink-0 transition-all", isCollapsed ? "" : "mr-3", isActive ? "text-zinc-100" : "text-zinc-500 group-hover:text-zinc-300")} />
            {!isCollapsed && <span className="truncate">{label}</span>}
        </button>
    );
};

interface DashboardSidebarProps {
    userType: 'USER' | 'SELLER';
    activeSection: string;
    onSectionChange: (section: any) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ userType, activeSection, onSectionChange }) => {
    const { isSidebarCollapsed: isCollapsed, setIsSidebarCollapsed: setIsCollapsed, logout } = useAppContext();
    const navigate = useNavigate();

    return (
        <aside 
            className={cn(
                "flex-shrink-0 border-r border-border hidden lg:flex flex-col bg-zinc-950 h-[100dvh] fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out overflow-hidden",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className={cn("h-16 flex items-center mb-4 px-4 flex-shrink-0", isCollapsed ? "justify-center" : "justify-between px-6")}>
                {!isCollapsed && (
                    <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-5 h-5 rounded-full border-2 border-zinc-500 flex items-center justify-center group-hover:border-zinc-100 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-zinc-500 group-hover:bg-zinc-100 transition-colors" />
                        </div>
                        <span className="font-bold text-sm tracking-tight text-zinc-100">EbookStudio</span>
                    </div>
                )}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-8 h-8 rounded-md bg-zinc-900/50 border border-border flex items-center justify-center text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                >
                    {isCollapsed ? <IconChevronRight className="h-4 w-4" /> : <IconChevronLeft className="h-4 w-4" />}
                </button>
            </div>

            <ScrollArea className="flex-1 px-3 min-h-0" type="auto">
                {/* Quick Create Section */}
                <div className={cn("mb-6 flex gap-1", isCollapsed && "flex-col items-center gap-2")}>
                    <Button 
                        onClick={() => navigate('/ebook-studio')}
                        title="Quick Create"
                        className={cn(
                            "h-9 rounded-md bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700/30 shadow-sm transition-all",
                            isCollapsed ? "w-9 p-0 justify-center" : "flex-1 justify-start px-3"
                        )}
                    >
                        <IconPlus className={cn("h-4 w-4 text-zinc-100", !isCollapsed && "mr-2")} />
                        {!isCollapsed && <span className="text-[11px] font-medium">Quick Create</span>}
                    </Button>
                    <div 
                        title="Notifications"
                        className="w-9 h-9 rounded-md bg-zinc-950 border border-border flex items-center justify-center text-zinc-500 hover:text-zinc-200 cursor-pointer transition-all"
                    >
                        <IconMail className="h-4 w-4" />
                    </div>
                </div>

                <div className="space-y-8 pb-8">
                    {userType === 'SELLER' ? (
                        <>
                            {/* Store Management Section */}
                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">🏪 Store</p>}
                                <SidebarItem icon={IconBook} label="All Ebooks" isActive={activeSection === 'books'} onClick={() => onSectionChange('books')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconPlus} label="Add New" isActive={activeSection === 'add-book'} onClick={() => onSectionChange('add-book')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconTag} label="Categories" isActive={activeSection === 'categories'} onClick={() => onSectionChange('categories')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconBriefcase} label="Inventory" isActive={activeSection === 'inventory'} onClick={() => onSectionChange('inventory')} isCollapsed={isCollapsed} />
                            </div>

                            {/* Payments Section */}
                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">💰 Payments</p>}
                                <SidebarItem icon={IconReceipt} label="Orders" isActive={activeSection === 'orders'} onClick={() => onSectionChange('orders')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconWallet} label="Pricing" isActive={activeSection === 'pricing'} onClick={() => onSectionChange('pricing')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconTicket} label="Coupons" isActive={activeSection === 'coupons'} onClick={() => onSectionChange('coupons')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconCreditCard} label="Payouts" isActive={activeSection === 'payouts'} onClick={() => onSectionChange('payouts')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconRotateCcw} label="Refunds" isActive={activeSection === 'refunds'} onClick={() => onSectionChange('refunds')} isCollapsed={isCollapsed} />
                            </div>

                            {/* Customers Section */}
                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">👥 Customers</p>}
                                <SidebarItem icon={IconUsers} label="Customers" isActive={activeSection === 'customers'} onClick={() => onSectionChange('customers')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconDownload} label="Downloads" isActive={activeSection === 'downloads'} onClick={() => onSectionChange('downloads')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconStar} label="Reviews" isActive={activeSection === 'reviews'} onClick={() => onSectionChange('reviews')} isCollapsed={isCollapsed} />
                            </div>

                            {/* Analytics Section */}
                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">📊 Analytics</p>}
                                <SidebarItem icon={IconTrendingUp} label="Overview" isActive={activeSection === 'stats'} onClick={() => onSectionChange('stats')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconStar} label="Top Selling" isActive={activeSection === 'top-selling'} onClick={() => onSectionChange('top-selling')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconActivity} label="Funnel" isActive={activeSection === 'funnel'} onClick={() => onSectionChange('funnel')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconCheck} label="Health" isActive={activeSection === 'payment-health'} onClick={() => onSectionChange('payment-health')} isCollapsed={isCollapsed} />
                            </div>

                            {/* Settings Section */}
                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">⚙️ Settings</p>}
                                <SidebarItem icon={IconSettings} label="Settings" isActive={activeSection === 'settings'} onClick={() => onSectionChange('settings')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconLock} label="Gateway" isActive={activeSection === 'gateway'} onClick={() => onSectionChange('gateway')} isCollapsed={isCollapsed} />
                                <SidebarItem icon={IconMail} label="Notifications" isActive={activeSection === 'notifications'} onClick={() => onSectionChange('notifications')} isCollapsed={isCollapsed} />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Reader Sidebar */}
                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Reader Hub</p>}
                                <SidebarItem 
                                    icon={IconHome} 
                                    label="My Library" 
                                    isActive={activeSection === 'library'} 
                                    onClick={() => onSectionChange('library')} 
                                    isCollapsed={isCollapsed}
                                />
                                <SidebarItem 
                                    icon={IconHeart} 
                                    label="Favorites" 
                                    isActive={activeSection === 'wishlist'} 
                                    onClick={() => onSectionChange('wishlist')} 
                                    isCollapsed={isCollapsed}
                                />
                                <SidebarItem 
                                    icon={IconTrendingUp} 
                                    label="Activity" 
                                    isActive={activeSection === 'activity'} 
                                    onClick={() => onSectionChange('activity')} 
                                    isCollapsed={isCollapsed}
                                />
                            </div>

                            <div>
                                {!isCollapsed && <p className="px-3 mb-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Account</p>}
                                <SidebarItem 
                                    icon={IconSettings} 
                                    label="Identity" 
                                    isActive={activeSection === 'settings'} 
                                    onClick={() => onSectionChange('settings')} 
                                    isCollapsed={isCollapsed}
                                />
                                <SidebarItem 
                                    icon={IconStore} 
                                    label="Marketplace" 
                                    onClick={() => navigate('/store')} 
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        </>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Section */}
            <div className={cn("p-4 border-t border-border flex-shrink-0 bg-zinc-950", isCollapsed && "flex justify-center px-0")}>
                <button 
                    title="Sign Out"
                    className={cn(
                        "flex items-center h-9 px-3 rounded-md text-[11px] font-medium text-zinc-600 hover:text-zinc-200 hover:bg-zinc-900 transition-all group",
                        isCollapsed ? "w-9 p-0 justify-center" : "w-full"
                    )}
                    onClick={async () => {
                        await logout();
                        navigate('/login');
                    }}
                >
                    <IconLogout className={cn("h-4 w-4 text-zinc-600 group-hover:text-zinc-300", !isCollapsed && "mr-3")} />
                    {!isCollapsed && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
};

export default DashboardSidebar;
