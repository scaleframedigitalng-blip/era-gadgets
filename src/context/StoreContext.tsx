import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, StoreSettings, Order } from '../types';
import { api } from '../lib/api';

interface StoreContextType {
  products: Product[];
  settings: StoreSettings | null;
  loading: boolean;
  cart: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  refreshProducts: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  currentView: string;
  setCurrentView: (view: string) => void;
  selectedProductSlug: string | null;
  openProduct: (slugOrId: string) => void;
  currentCategoryFilter: string;
  setCurrentCategoryFilter: (cat: string) => void;
  completedOrder: Order | null;
  setCompletedOrder: (order: Order | null) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  adminToken: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('era_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState('all');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('era_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cart]);

  // Check initial admin token & load initial products/settings
  useEffect(() => {
    const token = localStorage.getItem('era_admin_token');
    if (token) {
      setAdminToken(token);
      setIsAdmin(true);
    }
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [fetchedProducts, fetchedSettings] = await Promise.all([
        api.getProducts(),
        api.getSettings()
      ]);
      setProducts(fetchedProducts);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      const fetched = await api.getProducts();
      setProducts(fetched);
    } catch (err) {
      console.error('Failed to refresh products:', err);
    }
  };

  const refreshSettings = async () => {
    try {
      const fetched = await api.getSettings();
      setSettings(fetched);
    } catch (err) {
      console.error('Failed to refresh settings:', err);
    }
  };

  const openProduct = (slugOrId: string) => {
    setSelectedProductSlug(slugOrId);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.variantId === variant.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(variant.stock, next[existingIndex].quantity + quantity);
        next[existingIndex] = { ...next[existingIndex], quantity: newQty };
        return next;
      } else {
        const newItem: CartItem = {
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          brand: product.brand,
          variantId: variant.id,
          storage: variant.storage,
          color: variant.color,
          condition: product.condition,
          price: variant.price,
          image: variant.image || product.images[0] || '',
          quantity: Math.min(variant.stock, quantity),
          maxStock: variant.stock
        };
        return [...prev, newItem];
      }
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(item.maxStock, quantity) }
          : item
      )
    );
  };

  const removeFromCart = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        settings,
        loading,
        cart,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        refreshProducts,
        refreshSettings,
        currentView,
        setCurrentView,
        selectedProductSlug,
        openProduct,
        currentCategoryFilter,
        setCurrentCategoryFilter,
        completedOrder,
        setCompletedOrder,
        isAdmin,
        setIsAdmin,
        adminToken
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
