
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Seller, UserType, EBook, CartItem, AppContextType, CreatorSiteConfig } from '../types';
import { mockEBooks, mockUsers } from '../services/mockData';
import { initializeGeminiChat } from '../services/aiService';
import { auth, googleProvider, signInWithPopup, signOut, db } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { razorpayService } from '../services/razorpayService';
import { RAZORPAY_KEY_ID } from '../constants';

const defaultAppContext: AppContextType = {
  currentUser: null,
  userType: UserType.GUEST,
  setCurrentUser: () => {},
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  theme: 'dark',
  geminiChat: null,
  initializeChat: async () => {},
  isChatbotOpen: false,
  toggleChatbot: () => {},
  updateSellerCreatorSite: () => {},
  allBooks: [],
  addCreatedBook: () => {},
  updateEBook: () => {}, 
  handleGoogleLogin: async () => false,
  handleEmailLogin: async () => ({ success: false }),
  upgradeToSeller: () => {},
  verifyUser: () => {},
  isInitialAuthCheck: true,
  isAuthenticating: false,
  logout: async () => {},
  finalizePurchase: async () => {},
  updatePayoutUpi: async () => {},
  updateSubscription: async () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

// Key for persisting app state in browser storage
const STORAGE_KEY = 'ebook_engine_production_live_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Initialize State from LocalStorage (Lazy Loading)
  const [currentUser, setCurrentUserState] = useState<User | Seller | null>(() => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY);
          return stored ? JSON.parse(stored).currentUser : null;
      } catch (e) { return null; }
  });

  const [userType, setUserTypeState] = useState<UserType>(() => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY);
          return stored ? JSON.parse(stored).userType : UserType.GUEST;
      } catch (e) { return UserType.GUEST; }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY);
          return stored ? JSON.parse(stored).cart : [];
      } catch (e) { return []; }
  });

  const [allBooks, setAllBooks] = useState<EBook[]>(() => {
      try {
          const stored = localStorage.getItem(STORAGE_KEY);
          // Fallback to mockEBooks only if storage is completely empty (first visit)
          // otherwise keep the list empty or synced
          if (!stored) return mockEBooks;
          
          const parsed = JSON.parse(stored);
          return parsed.allBooks && parsed.allBooks.length > 0 ? parsed.allBooks : mockEBooks;
      } catch (e) { return mockEBooks; }
  });

  const [geminiChat, setGeminiChat] = useState<any>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const syncWithNeon = useCallback(async (userId: string) => {
    try {
      const response = await fetch(`/api/get-user-status?userId=${userId}`);
      if (!response.ok) return;
      
      const data = await response.json();
      
      setCurrentUserState(prev => {
        if (!prev) return null;
        
        // Merge Neon data into existing user/seller object
        if (userType === UserType.SELLER) {
          return {
            ...prev,
            subscription: data.subscription ? {
              isActive: data.subscription.status === 'active',
              planId: data.subscription.plan_id,
              startDate: data.subscription.created_at,
              endDate: data.subscription.current_period_end,
              razorpaySubscriptionId: data.subscription.razorpay_subscription_id
            } : (prev as Seller).subscription,
            payoutHistory: data.payoutHistory || (prev as Seller).payoutHistory
          } as Seller;
        } else {
          return {
            ...prev,
            purchasedBookIds: data.purchasedBookIds || prev.purchasedBookIds
          } as User;
        }
      });
    } catch (error) {
      console.error("Neon Sync Failed:", error);
    }
  }, [userType]);

  // 2. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            console.log("Firebase Auth State: Logged In", firebaseUser.email);
            
            // Try to load full profile from Firestore
            try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                let userData: any = null;

                if (userDoc.exists()) {
                    userData = userDoc.data();
                } else {
                    userData = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'Writer',
                        email: firebaseUser.email || '',
                        purchaseHistory: [],
                        purchasedBookIds: [],
                        wishlist: [],
                    };
                    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
                }
                setCurrentUserState(userData);
                // Detect seller status from explicit field or uploadedBooks array
                const isSeller = userData.userType === UserType.SELLER || (userData.uploadedBooks && Array.isArray(userData.uploadedBooks));
                setUserTypeState(isSeller ? UserType.SELLER : UserType.USER);
                
                // Sync with Neon immediately after login
                syncWithNeon(firebaseUser.uid);
            } catch (error) {
                console.error("Profile Load Error:", error);
            }
        } else {
            setCurrentUserState(null);
            setUserTypeState(UserType.GUEST);
        }
        setIsInitialAuthCheck(false);
    });

    return () => unsubscribe();
  }, [syncWithNeon]);

  // 3. Persistence Effect: Save state on any change
  useEffect(() => {
      const stateToSave = {
          cart,
          allBooks,
          currentUser,
          userType
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [cart, allBooks, currentUser, userType]);

  const setCurrentUser = (user: User | Seller | null, type: UserType) => {
    setCurrentUserState(user);
    setUserTypeState(type);
    if (!user) {
      setCart([]); // Clear cart on logout
    }
  };

  const addToCart = (book: EBook) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === book.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...book, quantity: 1 }];
    });
  };

  const removeFromCart = (bookId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== bookId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const initializeChat = useCallback(async () => {
    if (!geminiChat) {
      console.log("Initializing Gemini Chat from AppContext...");
      const chatInstance = await initializeGeminiChat();
      setGeminiChat(chatInstance);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geminiChat]); 

  const toggleChatbot = () => {
    setIsChatbotOpen(prevIsOpenState => {
      const newIsChatbotOpen = !prevIsOpenState; 
      if (newIsChatbotOpen && !geminiChat) { 
          initializeChat();
      }
      return newIsChatbotOpen; 
    });
  };
  
  const updateSellerCreatorSite = (config: CreatorSiteConfig) => {
    setCurrentUserState(prevUser => {
        if (prevUser && (prevUser.id.startsWith('seller') || prevUser.id.startsWith('google') || userType === UserType.SELLER)) { 
            const updatedSeller = { ...prevUser as Seller, creatorSite: config };
            
            // Update local mock store for simulation consistency
            if (mockUsers[updatedSeller.id]) {
                (mockUsers[updatedSeller.id] as Seller).creatorSite = config;
            }
            return updatedSeller;
        }
        return prevUser;
    });
  };

  const addCreatedBook = (book: EBook) => {
    setAllBooks(prevBooks => {
        // Prevent duplicates
        if (prevBooks.some(b => b.id === book.id)) return prevBooks;
        return [book, ...prevBooks];
    });

    // If current user is a seller, also add to their uploadedBooks
    if (currentUser && userType === UserType.SELLER) {
        setCurrentUserState(prev => {
            const seller = prev as Seller;
            const currentUploadedBooks = seller.uploadedBooks || [];
            return {
                ...seller,
                uploadedBooks: [book, ...currentUploadedBooks]
            };
        });
    }
  };

  const updateEBook = (updatedBook: EBook) => {
    setAllBooks(prevBooks => prevBooks.map(b => b.id === updatedBook.id ? updatedBook : b));

    // Update the book in the current seller's uploadedBooks list
    if (currentUser && currentUser.id === updatedBook.sellerId && userType === UserType.SELLER) {
        setCurrentUserState(prevUser => {
            const seller = prevUser as Seller;
            return {
                ...seller,
                uploadedBooks: seller.uploadedBooks.map(b => b.id === updatedBook.id ? updatedBook : b)
            };
        });
    }
  };

  // --- AUTH METHODS ---

  const handleGoogleLogin = async () => {
    try {
        setIsAuthenticating(true);
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Google Login Success:", result.user.displayName);
        
        // Optimistically set a basic user state while Firestore/Neon sync happens
        const basicUser: User = {
            id: result.user.uid,
            name: result.user.displayName || 'User',
            email: result.user.email || '',
            purchaseHistory: [],
            purchasedBookIds: [],
            wishlist: [],
        };
        setCurrentUserState(basicUser);
        setUserTypeState(UserType.USER);

        setIsAuthenticating(false);
        return true;
    } catch (e: any) {
        setIsAuthenticating(false);
        console.error("Google Login Failed Error Code:", e.code);
        console.error("Google Login Failed Message:", e.message);
        if (e.code === 'auth/configuration-not-found') {
            alert("Configuration Error: Please enable 'Google' as a sign-in provider in your Firebase Console.");
        } else if (e.code === 'auth/unauthorized-domain') {
            alert("Domain Error: This domain is not authorized in Firebase Console. Add 'ebookstudio.vercel.app' to Authorized Domains.");
        } else {
            alert("Login failed: " + e.message);
        }
        return false;
    }
  };

  const logout = async () => {
      try {
          await signOut(auth);
          setCurrentUserState(null);
          setUserTypeState(UserType.GUEST);
          setCart([]);
      } catch (e) {
          console.error("Logout failed", e);
      }
  }

  // ADDED: Email Login for Admin/Owner and Paid Writers
  const handleEmailLogin = async (email: string, password: string): Promise<{success: boolean, message?: string}> => {
      // 1. RAZORPAY REVIEWER BYPASS
      // This allows the Razorpay team to verify the checkout flow and dashboard
      if (email === 'reviewer@ebookstudio.com' && password === 'EbookReviewer2024!') {
          console.log("RAZORPAY REVIEWER AUTH ACTIVATED");
          const reviewerUser: Seller = {
              id: 'razorpay-reviewer-id',
              name: 'Razorpay Reviewer',
              email: 'reviewer@ebookstudio.com',
              payoutEmail: 'reviewer@ebookstudio.com',
              uploadedBooks: allBooks.slice(0, 3), // Show some books
              isVerified: true,
              isAdmin: false,
              username: '@reviewer',
              profileImageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
              creatorSite: {
                   isEnabled: true,
                   slug: 'reviewer-site',
                   theme: 'dark-minimal',
                   displayName: 'Razorpay Reviewer',
                   tagline: 'Quality Assurance Unit',
                   showcasedBookIds: [allBooks[0]?.id]
              },
              subscription: {
                  isActive: true,
                  planId: 'plan_studio_pro',
                  startDate: new Date().toISOString(),
                  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                  razorpaySubscriptionId: 'sub_test_reviewer'
              }
          };
          setCurrentUser(reviewerUser, UserType.SELLER);
          return { success: true };
      }

      try {
          setIsAuthenticating(true);
          await signInWithEmailAndPassword(auth, email, password);
          return { success: true };
      } catch (e: any) {
          setIsAuthenticating(false);
          console.error("Email Login Failed", e);
          return { success: false, message: e.message || "Invalid credentials." };
      }
  };

  const upgradeToSeller = () => {
    if (currentUser && userType === UserType.USER) {
        const user = currentUser as User;
        
        const newSeller: Seller = {
            id: user.id,
            name: user.name,
            email: user.email,
            payoutEmail: user.email, 
            uploadedBooks: [],
            isVerified: user.isVerified || false,
            username: user.username || `@${user.name.replace(/\s+/g, '').toLowerCase()}`,
            profileImageUrl: user.profileImageUrl,
            creatorSite: {
                 isEnabled: false,
                 slug: user.name.toLowerCase().replace(/\s+/g, '-'),
                 theme: 'dark-minimal',
                 profileImageUrl: user.profileImageUrl,
                 displayName: user.name,
                 tagline: 'Digital Creator',
                 showcasedBookIds: []
            }
        };
        
        setCurrentUser(newSeller, UserType.SELLER);
        
        // Persist to Firestore with explicit userType
        setDoc(doc(db, 'users', user.id), { ...newSeller, userType: UserType.SELLER, uploadedBooks: [] }, { merge: true })
            .then(() => console.log("Upgraded to Seller in Firestore"))
            .catch(err => console.error("Firestore Upgrade Failed:", err));

        // Update runtime cache
        mockUsers[user.id] = newSeller;
        
        console.log("Upgraded to Seller:", newSeller.name);
    }
  };

  const verifyUser = () => {
      if (currentUser) {
          const updatedUser = { ...currentUser, isVerified: true };
          setCurrentUserState(updatedUser);
      }
  };

  const finalizePurchase = async (books: EBook[]) => {
    if (!currentUser) return;
    
    console.log(`[AppContext] Finalizing Purchase for ${books.length} books`);
    const user = currentUser as User;
    const purchasedBookIds = user.purchasedBookIds || [];
    const newBookIds = books.map(b => b.id);
    
    const updatedUser: User = {
        ...user,
        purchaseHistory: [...(user.purchaseHistory || []), ...books],
        purchasedBookIds: [...purchasedBookIds, ...newBookIds]
    };
    
    setCurrentUserState(updatedUser);
    
    // Process Payouts for Sellers
    for (const book of books) {
        // In a real app, this would be handled by a webhook on the server
        // Here we simulate the split and record the payout for the seller
        const sellerId = book.sellerId;
        // In this simulated environment, we don't have easy access to all sellers 
        // to update their payoutHistory unless they are the current user
        // But we can simulate the platform commission logic
    }
  };

  const updatePayoutUpi = async (upiId: string) => {
    if (!currentUser || userType !== UserType.SELLER) return;
    const seller = currentUser as Seller;
    const updatedSeller: Seller = { ...seller, payoutUpiId: upiId };
    setCurrentUserState(updatedSeller);
    console.log(`[AppContext] UPI ID Updated: ${upiId}`);
  };

  const updateSubscription = async (planId: string) => {
    if (!currentUser || userType !== UserType.SELLER) return;
    const seller = currentUser as Seller;
    
    try {
        const subscription = await razorpayService.createSubscription(planId, seller.id, seller.email);
        
        const options = {
            key: RAZORPAY_KEY_ID,
            subscription_id: subscription.razorpaySubscriptionId,
            name: "EbookStudio Pro",
            description: "Monthly Agentic AI Subscription",
            image: "https://ebookstudio.vercel.app/logo.png",
            handler: function (response: any) {
                // Verification will be handled by webhook
                const updatedSeller: Seller = { ...seller, subscription: subscription };
                setCurrentUserState(updatedSeller);
                alert("Subscription activated successfully!");
            },
            prefill: {
                name: seller.name,
                email: seller.email,
            },
            theme: {
                color: "#09090b",
            },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
    } catch (error: any) {
        alert("Subscription failed: " + error.message);
    }
  };

  const theme = 'dark';

  return (
    <AppContext.Provider value={{ currentUser, userType, setCurrentUser, cart, addToCart, removeFromCart, clearCart, theme, geminiChat, initializeChat, isChatbotOpen, toggleChatbot, updateSellerCreatorSite, allBooks, addCreatedBook, updateEBook, handleGoogleLogin, handleEmailLogin, upgradeToSeller, verifyUser, isInitialAuthCheck, isAuthenticating, logout, finalizePurchase, updatePayoutUpi, updateSubscription, isSidebarCollapsed, setIsSidebarCollapsed }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);