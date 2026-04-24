import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { 
    IconSearch, 
    IconBell,
    IconPlus
} from '../../constants';
import { User } from '../../types';

interface DashboardHeaderProps {
    user: User;
    title: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    showSearch?: boolean;
    mobileSidebar?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
    user, 
    title, 
    searchQuery, 
    onSearchChange,
    showSearch = true,
    mobileSidebar
}) => {
    return (
        <header className="h-14 border-b border-border bg-zinc-950 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4 lg:gap-6 flex-1">
                <div className="flex items-center gap-3">
                    {mobileSidebar}
                    <div className="hidden lg:flex w-4 h-4 items-center justify-center border border-zinc-700 rounded bg-zinc-900">
                        <div className="w-2.5 h-px bg-zinc-500" />
                    </div>
                    <div className="hidden lg:block w-px h-4 bg-zinc-800" />
                    <h1 className="text-xs font-bold tracking-widest text-zinc-100 uppercase">{title}</h1>
                </div>
                
                {showSearch && (
                    <div className="relative w-full max-w-xs group hidden md:block">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-600 group-focus-within:text-zinc-200 transition-colors" />
                        <input 
                            placeholder="System Search..." 
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full bg-transparent border-none rounded-md h-8 pl-9 pr-3 text-[11px] font-bold focus:outline-none transition-all placeholder:text-zinc-800 text-zinc-300"
                        />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 pr-4 border-r border-border">
                    <Button variant="ghost" size="icon" className="text-zinc-600 hover:text-zinc-200 h-8 w-8 rounded-md transition-all relative">
                        <IconBell className="w-3.5 h-3.5" />
                        <span className="absolute top-2 right-2 w-1 h-1 bg-zinc-400 rounded-full border border-zinc-950" />
                    </Button>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-zinc-300 truncate max-w-[150px] leading-none mb-1">{user.name}</p>
                        <p className="text-[9px] text-zinc-700 truncate max-w-[150px] font-bold uppercase tracking-tighter">
                            {user.email}
                        </p>
                    </div>
                    <Avatar className="w-8 h-8 rounded border border-border">
                        <AvatarImage src={user.profileImageUrl} className="object-cover" />
                        <AvatarFallback className="bg-zinc-900 text-zinc-600 text-[9px] font-black">{user.name[0]}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
