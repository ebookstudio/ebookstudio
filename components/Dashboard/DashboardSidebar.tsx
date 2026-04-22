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
    IconMail
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

                <div className="space-y-6">
                    <div>
                        <SidebarItem 
                            icon={IconHome} 
                            label="Dashboard" 
                            isActive={activeSection === 'stats'} 
                            onClick={() => onSectionChange(userType === 'USER' ? 'library' : 'stats')} 
                        />
                        <SidebarItem 
                            icon={IconActivity} 
                            label="Lifecycle" 
                        />
                        <SidebarItem 
                            icon={IconTrendingUp} 
                            label="Analytics" 
                        />
                        <SidebarItem 
                            icon={IconBriefcase} 
                            label="Projects" 
                        />
                        <SidebarItem 
                            icon={IconUsers} 
                            label="Team" 
                        />
                    </div>

                    <div>
                        <p className="px-3 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Documents</p>
                        <SidebarItem 
                            icon={IconBook} 
                            label="Data Library" 
                            isActive={activeSection === 'library'} 
                            onClick={() => onSectionChange('library')} 
                        />
                        <SidebarItem 
                            icon={IconFileText} 
                            label="Reports" 
                        />
                        <SidebarItem 
                            icon={IconSettings} 
                            label="Studio Settings" 
                            isActive={activeSection === 'settings'} 
                            onClick={() => onSectionChange('settings')} 
                        />
                        <SidebarItem 
                            icon={IconLogout} 
                            label="More..." 
                        />
                    </div>
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
