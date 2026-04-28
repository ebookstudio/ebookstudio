import React, { useState, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { EBook, User, UserType } from '../../types';
import { IconBook, IconLogout, IconSettings, IconSparkles, IconCheck, IconRocket, IconEdit, IconChevronRight } from '../../constants';
import * as ReactRouterDOM from 'react-router-dom';
import BookCard from '../BookCard';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import MobileSidebar from './MobileSidebar';
import { Button } from '../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { cn } from '../../lib/utils';

const { useNavigate } = ReactRouterDOM as any;

// ─── Publish Settings Card ────────────────────────────────────────────────────
const PublishCard: React.FC<{
  book: EBook;
  onPublish: (bookId: string, price: number, isFree: boolean) => void;
  onClose: () => void;
}> = ({ book, onPublish, onClose }) => {
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState(299);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    onPublish(book.id, price * 100, isFree); // store price in paise
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
          <IconCheck className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-emerald-400">Published to Store!</p>
          <p className="text-[10px] text-emerald-600 font-medium">Your ebook is now live in the marketplace.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 p-4 bg-zinc-900 border border-zinc-700 rounded-xl space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black text-zinc-100 uppercase tracking-widest">Publish Settings</h4>
        <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 text-lg leading-none">×</button>
      </div>

      {/* Pricing toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsFree(true)}
          className={cn(
            "flex-1 h-9 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
            isFree
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
          )}
        >
          Free
        </button>
        <button
          onClick={() => setIsFree(false)}
          className={cn(
            "flex-1 h-9 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all",
            !isFree
              ? "bg-blue-500/15 border-blue-500/40 text-blue-400"
              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
          )}
        >
          Paid
        </button>
      </div>

      {/* Price input */}
      {!isFree && (
        <div className="space-y-1.5">
          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Price (₹)</label>
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-bold text-sm">₹</span>
            <input
              type="number"
              min={10}
              max={9999}
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              className="flex-1 h-9 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-sm font-bold text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>
          <p className="text-[9px] text-zinc-700 font-medium">You earn 70% · Platform takes 30%</p>
        </div>
      )}

      {isFree && (
        <p className="text-[10px] text-zinc-500 font-medium">
          Your ebook will be freely available to all readers. Great for growing your audience!
        </p>
      )}

      <button
        onClick={handleConfirm}
        className="w-full h-9 bg-zinc-100 hover:bg-white text-zinc-950 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
      >
        <IconRocket className="w-3.5 h-3.5" />
        Publish {isFree ? 'Free' : `at ₹${price}`}
      </button>
    </div>
  );
};

// ─── Created Book Row ─────────────────────────────────────────────────────────
const CreatedBookRow: React.FC<{
  book: EBook;
  onPublish: (bookId: string, price: number, isFree: boolean) => void;
}> = ({ book, onPublish }) => {
  const navigate = useNavigate();
  const [showPublish, setShowPublish] = useState(false);

  const isPublished = book.isDraft === false;

  return (
    <div className="bg-zinc-900 border border-border rounded-xl p-5 transition-all hover:border-zinc-700 group">
      <div className="flex items-start gap-5">
        {/* Cover */}
        <div className="relative shrink-0">
          <img
            src={book.coverImageUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=200'}
            className="w-16 h-24 object-cover rounded-md border border-border shadow-xl"
            alt=""
          />
          <div className={cn(
            "absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded text-[8px] font-black uppercase border",
            isPublished
              ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/20 border-amber-500/30 text-amber-400"
          )}>
            {isPublished ? 'Live' : 'Draft'}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <h4 className="text-sm font-bold text-zinc-100 leading-tight line-clamp-2">{book.title}</h4>
          <p className="text-[10px] text-zinc-500 font-medium line-clamp-2">{book.description}</p>
          <div className="flex items-center gap-3 pt-1">
            {isPublished && (
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                {book.price === 0 ? 'Free' : `₹${(book.price / 100).toFixed(0)}`}
              </span>
            )}
            <span className="text-[10px] text-zinc-700 font-medium">
              {book.pages?.length || 0} pages
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/ebookstudio`)}
            className="h-8 px-3 border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <IconEdit className="w-3 h-3 mr-1.5" />
            Edit
          </Button>
          {!isPublished ? (
            <Button
              size="sm"
              onClick={() => setShowPublish(prev => !prev)}
              className="h-8 px-3 bg-zinc-100 hover:bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-wider"
            >
              <IconRocket className="w-3 h-3 mr-1.5" />
              Publish
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/read/${book.id}`)}
              className="h-8 px-3 border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              View
            </Button>
          )}
        </div>
      </div>

      {/* Inline publish settings */}
      {showPublish && !isPublished && (
        <PublishCard
          book={book}
          onPublish={(id, price, isFree) => {
            onPublish(id, price, isFree);
            setShowPublish(false);
          }}
          onClose={() => setShowPublish(false)}
        />
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UserDashboardContent: React.FC = () => {
  const { currentUser, userType, upgradeToSeller, logout, setCurrentUser, publishCreatedBook } = useAppContext();
  const user = currentUser as User;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'library' | 'wishlist' | 'settings'>('library');
  const [libraryView, setLibraryView] = useState<'creations' | 'purchases'>('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const profileInputRef = useRef<HTMLInputElement>(null);
  const { isSidebarCollapsed } = useAppContext();

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

  const createdBooks = (user as any).createdBooks || [];
  const purchasedBooks = user.purchaseHistory || [];

  const getTitle = () => {
    switch (activeTab) {
      case 'library': return 'My Library';
      case 'wishlist': return 'Favorites';
      case 'settings': return 'Identity';
      default: return 'Dashboard';
    }
  };

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
          mobileSidebar={
            <MobileSidebar>
              <DashboardSidebar
                userType="USER"
                activeSection={activeTab}
                onSectionChange={setActiveTab}
                isMobile={true}
              />
            </MobileSidebar>
          }
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-[1600px] mx-auto space-y-10">

            {/* ── SETTINGS TAB ── */}
            {activeTab === 'settings' && (
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
            )}

            {/* ── LIBRARY / WISHLIST TAB ── */}
            {activeTab !== 'settings' && (
              <div className="animate-fade-in space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-border">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
                      {activeTab === 'library' ? 'My Library' : 'Saved Favorites'}
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium mt-1">
                      {activeTab === 'library'
                        ? `${createdBooks.length} created · ${purchasedBooks.length} purchased`
                        : `${(user.wishlist || []).length} saved books`}
                    </p>
                  </div>
                  <Button
                    onClick={() => navigate('/ebookstudio')}
                    className="h-9 px-6 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                  >
                    <IconSparkles className="w-3.5 h-3.5" />
                    New Ebook
                  </Button>
                </header>

                {activeTab === 'library' && (
                  <>
                    {/* Sub-tab switcher */}
                    <div className="flex gap-1 p-1 bg-zinc-900 border border-border rounded-xl w-fit">
                      <button
                        onClick={() => setLibraryView('creations')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          libraryView === 'creations'
                            ? "bg-zinc-100 text-zinc-950 shadow"
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        My Creations ({createdBooks.length})
                      </button>
                      <button
                        onClick={() => setLibraryView('purchases')}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          libraryView === 'purchases'
                            ? "bg-zinc-100 text-zinc-950 shadow"
                            : "text-zinc-500 hover:text-zinc-300"
                        )}
                      >
                        Purchased ({purchasedBooks.length})
                      </button>
                    </div>

                    {/* My Creations */}
                    {libraryView === 'creations' && (
                      <div className="space-y-4">
                        {createdBooks.length > 0 ? (
                          createdBooks.map((book: EBook) => (
                            <CreatedBookRow
                              key={book.id}
                              book={book}
                              onPublish={publishCreatedBook}
                            />
                          ))
                        ) : (
                          <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-zinc-900/30">
                            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border">
                              <IconSparkles className="w-6 h-6 text-zinc-500" />
                            </div>
                            <h3 className="text-lg font-bold text-zinc-100 mb-2">No ebooks created yet</h3>
                            <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                              Use the AI Co-Author to write your first ebook. Once saved, it will appear here as a draft ready to edit and publish.
                            </p>
                            <Button
                              onClick={() => navigate('/ebookstudio')}
                              className="h-10 px-8 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest"
                            >
                              Open Ebook Studio
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Purchased */}
                    {libraryView === 'purchases' && (
                      <>
                        {purchasedBooks.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                            {purchasedBooks
                              .filter((b: EBook) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map((book: EBook) => (
                                <BookCard key={book.id} book={book} />
                              ))}
                          </div>
                        ) : (
                          <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-zinc-900/30">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
                              <IconBook className="w-6 h-6 text-zinc-500" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-2">No purchases yet</h3>
                            <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                              Explore our curated collection of high-fidelity digital assets.
                            </p>
                            <Button
                              onClick={() => navigate('/store')}
                              className="h-10 px-8 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest"
                            >
                              Browse Store
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {/* Wishlist tab */}
                {activeTab === 'wishlist' && (
                  <>
                    {(user.wishlist || []).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                        {(user.wishlist || [])
                          .filter((b: EBook) => b.title.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((book: EBook) => (
                            <BookCard key={book.id} book={book} />
                          ))}
                      </div>
                    ) : (
                      <div className="py-24 text-center border border-dashed border-border rounded-2xl bg-zinc-900/30">
                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-8 border border-border">
                          <IconBook className="w-6 h-6 text-zinc-500" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-100 mb-2">Your wishlist is empty</h3>
                        <p className="text-sm text-zinc-500 mb-8 max-w-sm mx-auto">
                          Explore our curated collection of high-fidelity digital assets.
                        </p>
                        <Button
                          onClick={() => navigate('/store')}
                          className="h-10 px-8 bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-bold uppercase tracking-widest"
                        >
                          Browse Store
                        </Button>
                      </div>
                    )}
                  </>
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
