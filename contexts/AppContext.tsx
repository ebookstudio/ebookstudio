
import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Seller, UserType, EBook, CartItem, AppContextType, CreatorSiteConfig } from '../types';
import { mockEBooks, mockUsers } from '../services/mockData';
import { initializeGeminiChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import { auth, googleProvider, signInWithPopup, signOut, db } from '../services/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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
  handleGoogleLogin: () => {},
  handleEmailLogin: async () => ({ success: false }),
  upgradeToSeller: () => {},
  verifyUser: () => {},
  isInitialAuthCheck: true,
  logout: async () => {},
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

  const [geminiChat, setGeminiChat] = useState<Chat | null>(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);

  // 2. Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
            console.log("Firebase Auth State: Logged In", firebaseUser.email);
            
            // Try to load full profile from Firestore
            try {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setCurrentUserState(userData as User | Seller);
                    setUserTypeState(userData.uploadedBooks ? UserType.SELLER : UserType.USER);
                } else {
                    // New user or missing profile, create a basic one
                    const newUser: User = {
                        id: firebaseUser.uid,
                        name: firebaseUser.displayName || 'Unknown User',
                        email: firebaseUser.email || '',
                        purchaseHistory: [],
                        wishlist: [],
                        isVerified: firebaseUser.emailVerified,
                        profileImageUrl: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`
                    };
                    setCurrentUser(newUser, UserType.USER);
                    // Optionally save to Firestore here if needed
                }
            } catch (e) {
                console.error("Failed to fetch user profile", e);
                // Fallback to basic info from firebaseUser
                const fallbackUser: User = {
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email || '',
                    purchaseHistory: [],
                    wishlist: [],
                    isVerified: firebaseUser.emailVerified,
                };
                setCurrentUser(fallbackUser, UserType.USER);
            }
        } else {
            console.log("Firebase Auth State: Logged Out");
            setCurrentUserState(null);
            setUserTypeState(UserType.GUEST);
        }
        setIsInitialAuthCheck(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Persistence Effect: Save state on any change (excluding sensitive auth)
  useEffect(() => {
      const stateToSave = {
          cart,
          allBooks
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  }, [cart, allBooks]);

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
        const result = await signInWithPopup(auth, googleProvider);
        console.log("Google Login Success:", result.user.displayName);
        return true;
    } catch (e) {
        console.error("Google Login Failed", e);
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
      try {
          await signInWithEmailAndPassword(auth, email, password);
          return { success: true };
      } catch (e: any) {
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

  const theme = 'dark';

  return (
    <AppContext.Provider value={{ currentUser, userType, setCurrentUser, cart, addToCart, removeFromCart, clearCart, theme, geminiChat, initializeChat, isChatbotOpen, toggleChatbot, updateSellerCreatorSite, allBooks, addCreatedBook, updateEBook, handleGoogleLogin, handleEmailLogin, upgradeToSeller, verifyUser, isInitialAuthCheck, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);