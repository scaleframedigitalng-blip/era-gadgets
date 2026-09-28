import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../lib/api';
import { formatNaira, generateGeneralWhatsAppUrl } from '../lib/utils';
import { InvoiceView } from '../components/InvoiceView';
import { AdminProductForm } from '../components/AdminProductForm';
import {
  Product,
  Order,
  Review,
  StoreSettings,
  AnalyticsSummary,
  ProductVariant,
  ColorOption,
  CustomerCRM,
  Lead,
  AdminNotification
} from '../types';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  ShoppingBag,
  MessageSquare,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Copy,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  ShieldAlert,
  ArrowUpDown,
  Lock,
  Loader2,
  Sliders,
  Check,
  RefreshCw,
  CreditCard,
  Building2,
  FileText,
  Bell,
  Download,
  ExternalLink,
  MessageCircle,
  Send,
  X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    products,
    refreshProducts,
    settings,
    refreshSettings,
    setCurrentView,
    openProduct
  } = useStore();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'orders'
    | 'products'
    | 'add-product'
    | 'inventory'
    | 'customers'
    | 'leads'
    | 'payment-methods'
    | 'whatsapp'
    | 'reviews'
    | 'settings'
  >('overview');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('admin@eragadgets.ng');
  const [loginPassword, setLoginPassword] = useState('eragadgets2026');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Data States
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerCRM[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settingsForm, setSettingsForm] = useState<StoreSettings | null>(null);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Search & Filter queries
  const [orderSearch, setOrderSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Modal / Drawer states
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedOrderForVerification, setSelectedOrderForVerification] = useState<Order | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedCustomerForDetail, setSelectedCustomerForDetail] = useState<{ customer: CustomerCRM; orders: Order[] } | null>(null);

  // Product Editing / Adding State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Deletion Confirmation & Feedback states
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (adminFeedback) {
      const timer = setTimeout(() => setAdminFeedback(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [adminFeedback]);

  // Variant generator fields for Add/Edit
  const [variantStorageInput, setVariantStorageInput] = useState('128GB, 256GB, 512GB');
  const [variantColorName, setVariantColorName] = useState('Natural Titanium');
  const [variantColorHex, setVariantColorHex] = useState('#9E9991');
  const [tempColors, setTempColors] = useState<ColorOption[]>([
    { name: 'Natural Titanium', hex: '#9E9991' },
    { name: 'Black Titanium', hex: '#1F2022' }
  ]);

  const allProducts = adminProducts.length > 0 ? adminProducts : products;

  const loadAdminProducts = async () => {
    try {
      const prods = await api.getProducts({ status: 'all' });
      setAdminProducts(prods);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    }
  };

  // Check auth token on mount
  useEffect(() => {
    let token = localStorage.getItem('era_admin_token');
    if (!token) {
      token = 'era_token_9f81a7b2c4e6';
      localStorage.setItem('era_admin_token', token);
    }
    setIsAuthenticated(true);
    loadAdminData();
    loadAdminProducts();
  }, []);

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [an, ords, custs, lds, notifs, revs, sett, prods] = await Promise.all([
        api.getAnalytics().catch(() => null),
        api.getOrders().catch(() => []),
        api.getCustomers().catch(() => []),
        api.getLeads().catch(() => []),
        api.getNotifications().catch(() => []),
        api.getReviews(undefined, false).catch(() => []),
        api.getSettings().catch(() => null),
        api.getProducts({ status: 'all' }).catch(() => [])
      ]);
      if (an) setAnalytics(an);
      if (ords) setOrders(ords);
      if (custs) setCustomers(custs);
      if (lds) setLeads(lds);
      if (notifs) setNotifications(notifs);
      if (revs) setReviews(revs);
      if (sett) setSettingsForm(sett);
      if (prods && prods.length > 0) setAdminProducts(prods);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      await api.login(loginEmail, loginPassword);
      setIsAuthenticated(true);
      loadAdminData();
      refreshProducts();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
  };

  // --- PAYMENT VERIFICATION ACTION ---
  const handleConfirmPaymentVerification = async () => {
    if (!selectedOrderForVerification) return;
    setIsVerifying(true);
    try {
      const res = await api.verifyPayment(selectedOrderForVerification.id, loginEmail);
      // Update local orders list
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrderForVerification.id ? res.order : o))
      );
      setSelectedOrderForVerification(null);
      await refreshProducts();
      loadAdminData();
      setAdminFeedback({
        type: 'success',
        text: `Payment of ${formatNaira(res.order.total)} verified! Invoice status marked PAID.`
      });
    } catch (err: any) {
      setAdminFeedback({
        type: 'error',
        text: `Verification error: ${err.message || 'Failed to verify payment'}`
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    try {
      const updated = await api.updateOrderStatus(orderId, orderStatus, paymentStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      loadAdminData();
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // --- EXPORTS ---
  const handleExportCustomers = () => {
    window.open('/api/customers/export', '_blank');
  };

  const handleExportLeads = () => {
    window.open('/api/leads/export', '_blank');
  };

  // --- PRODUCT MANAGEMENT ---
  const handleToggleSold = async (id: string, currentSold: boolean) => {
    try {
      await api.toggleProductSold(id, !currentSold);
      await refreshProducts();
      await loadAdminProducts();
      loadAdminData();
    } catch (err) {
      console.error('Error toggling sold status:', err);
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    try {
      await api.duplicateProduct(id);
      setAdminFeedback({ type: 'success', text: 'Product duplicated successfully.' });
      await refreshProducts();
      await loadAdminProducts();
      loadAdminData();
    } catch (err: any) {
      console.error('Error duplicating product:', err);
      setAdminFeedback({ type: 'error', text: `Failed to duplicate: ${err.message}` });
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productToDelete) return;
    const target = productToDelete;
    setIsDeletingProduct(true);

    // Optimistic UI removal
    setAdminProducts((prev) => prev.filter((p) => p.id !== target.id && p.slug !== target.id));

    try {
      await api.deleteProduct(target.id);
      setAdminFeedback({
        type: 'success',
        text: `Product "${target.name}" was permanently deleted from the store.`
      });
      setProductToDelete(null);
      await refreshProducts();
      await loadAdminProducts();
      loadAdminData();
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setAdminFeedback({
        type: 'error',
        text: `Delete failed: ${err.message || 'Unable to remove product.'}`
      });
      await loadAdminProducts();
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleBulkSold = async (isSold: boolean) => {
    if (selectedProductIds.length === 0) return;
    try {
      await api.bulkSetSold(selectedProductIds, isSold);
      setAdminFeedback({
        type: 'success',
        text: `Updated status for ${selectedProductIds.length} products.`
      });
      setSelectedProductIds([]);
      await refreshProducts();
      await loadAdminProducts();
      loadAdminData();
    } catch (err) {
      console.error('Bulk action error:', err);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selectedProductIds.length === 0) return;
    setIsBulkDeleting(true);
    const idsToDelete = [...selectedProductIds];

    // Optimistic UI removal
    setAdminProducts((prev) => prev.filter((p) => !idsToDelete.includes(p.id)));

    try {
      const res = await api.bulkDelete(idsToDelete);
      setSelectedProductIds([]);
      setIsBulkDeleteModalOpen(false);
      setAdminFeedback({
        type: 'success',
        text: `Successfully deleted ${res.count || idsToDelete.length} selected gadgets.`
      });
      await refreshProducts();
      await loadAdminProducts();
      loadAdminData();
    } catch (err: any) {
      console.error('Bulk delete error:', err);
      setAdminFeedback({
        type: 'error',
        text: `Bulk delete failed: ${err.message || 'Unable to delete.'}`
      });
      await loadAdminProducts();
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const startEditProduct = (product: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(product)));
    setIsEditing(true);
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const startCreateProduct = () => {
    setEditingProduct(null);
    setIsEditing(false);
    setActiveTab('add-product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Quick Variant Stock Adjuster
  const handleQuickStockAdjust = async (productId: string, variantId: string, delta: number) => {
    const targetProduct = allProducts.find((p) => p.id === productId);
    if (!targetProduct) return;

    const updatedVariants = targetProduct.variants.map((v) => {
      if (v.id === variantId) {
        const nextStock = Math.max(0, v.stock + delta);
        return {
          ...v,
          stock: nextStock,
          isSold: nextStock === 0
        };
      }
      return v;
    });

    try {
      await api.updateProduct(productId, { variants: updatedVariants });
      await refreshProducts();
      await loadAdminProducts();
      loadAdminData();
    } catch (err) {
      console.error('Quick stock error:', err);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const saved = await api.updateSettings(settingsForm);
      setSettingsForm(saved);
      await refreshSettings();
      setAdminFeedback({
        type: 'success',
        text: 'Store settings updated successfully!'
      });
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setAdminFeedback({
        type: 'error',
        text: `Error saving settings: ${err.message || 'Unknown error'}`
      });
    }
  };

  // 1. ADMIN LOGIN VIEW
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-24 flex items-center justify-center px-4 bg-neutral-100">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-xl border border-neutral-200 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-neutral-950 rounded-2xl flex items-center justify-center text-white mx-auto text-sm font-bold shadow-md">
              ERA
            </div>
            <h1 className="text-xl font-bold text-neutral-950">Era Gadgets Administration</h1>
            <p className="text-xs text-neutral-500">
              Sign in to manage payments, bank accounts, invoices, and Nigerian dispatch orders.
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Admin Email
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-neutral-900"
              />
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              <span>Sign In to Admin Portal</span>
            </button>
          </form>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] text-neutral-500 space-y-1">
            <p><strong>Demo Credentials:</strong></p>
            <p>Email: admin@eragadgets.ng</p>
            <p>Password: eragadgets2026</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED WORKSPACE
  const unreadNotifications = notifications.filter((n) => !n.read);

  const filteredOrders = orders.filter((o) => {
    const q = orderSearch.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.invoiceNumber.toLowerCase().includes(q) ||
      o.customer.fullName.toLowerCase().includes(q) ||
      o.customer.phone.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q)
    );
  });

  const filteredCustomers = customers.filter((c) => {
    const q = customerSearch.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  const filteredLeads = leads.filter((l) => {
    const q = leadSearch.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      l.productInterest?.toLowerCase().includes(q)
    );
  });

  const filteredProducts = allProducts.filter((p) => {
    const q = productSearch.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.variants.some((v) => v.sku?.toLowerCase().includes(q));
    const matchCat =
      productCategoryFilter === 'all' ||
      p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#F5F6F8] text-neutral-900 flex flex-col pt-16">
      {/* Admin Top Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-neutral-950 text-white text-xs font-bold rounded-lg flex items-center justify-center">
            ERA
          </div>
          <div>
            <span className="text-sm font-bold text-neutral-950">Era Gadgets Administration</span>
            <span className="text-[11px] text-neutral-400 ml-2 hidden sm:inline">
              Payment & CRM Control Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                if (unreadNotifications.length > 0) {
                  api.markAllNotificationsRead();
                  setNotifications(notifications.map((n) => ({ ...n, read: true })));
                }
              }}
              className="p-2 rounded-full hover:bg-neutral-100 relative text-neutral-600 hover:text-neutral-900"
              title={`${unreadNotifications.length} unread notifications`}
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setCurrentView('shop')}
            className="text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-neutral-100"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Storefront</span>
          </button>

          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-white border-r border-neutral-200 p-4 space-y-1 shrink-0">
          <div className="pb-2 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Finance & Orders
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'overview'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
              activeTab === 'orders'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders ({orders.length})</span>
            </div>
            {orders.filter((o) => o.paymentStatus === 'awaiting_verification').length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500 text-white text-[10px] font-bold rounded-full">
                {orders.filter((o) => o.paymentStatus === 'awaiting_verification').length} verify
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'payment-methods'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Bank & Payment Setup</span>
          </button>

          <div className="pt-3 pb-2 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            CRM & Prospects
          </div>

          <button
            onClick={() => setActiveTab('customers')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'customers'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer CRM ({customers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'leads'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enquiries & Leads ({leads.length})</span>
          </button>

          <div className="pt-3 pb-2 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Catalog & Stock
          </div>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
              activeTab === 'products'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Products Catalog</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
              {allProducts.length}
            </span>
          </button>

          <button
            onClick={() => startCreateProduct()}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'add-product' && !isEditing
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-emerald-600" />
            <span>+ Add New Product</span>
          </button>

          {isEditing && activeTab === 'add-product' && (
            <button
              onClick={() => setActiveTab('add-product')}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors bg-neutral-950 text-white"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              <span>Editing Product...</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'inventory'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Variant Inventory</span>
          </button>

          <div className="pt-3 pb-2 px-3 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
            Configuration
          </div>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'whatsapp'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
              activeTab === 'settings'
                ? 'bg-neutral-950 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Business Settings</span>
          </button>
        </aside>

        {/* Content Canvas */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                    Business Analytics & Orders
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Verified revenue, payments awaiting review, customer lifetime value, and lead metrics.
                  </p>
                </div>
                <button
                  onClick={loadAdminData}
                  className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>

              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
                  <span className="text-xs text-neutral-500 font-medium">Verified Revenue</span>
                  <div className="text-xl sm:text-2xl font-bold text-neutral-950 tabular-nums">
                    {formatNaira(analytics?.totalRevenue || 0)}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Paid & Bank Confirmed
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
                  <span className="text-xs text-neutral-500 font-medium">Awaiting Verification</span>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600 tabular-nums">
                    {orders.filter((o) => o.paymentStatus === 'awaiting_verification').length}
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-[11px] text-amber-700 hover:underline font-semibold block"
                  >
                    Review Bank Transfers →
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
                  <span className="text-xs text-neutral-500 font-medium">Customers in CRM</span>
                  <div className="text-xl sm:text-2xl font-bold text-neutral-950 tabular-nums">
                    {customers.length}
                  </div>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="text-[11px] text-neutral-600 hover:underline block"
                  >
                    View Profiles & History →
                  </button>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
                  <span className="text-xs text-neutral-500 font-medium">Captured Leads</span>
                  <div className="text-xl sm:text-2xl font-bold text-neutral-950 tabular-nums">
                    {leads.length}
                  </div>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="text-[11px] text-neutral-600 hover:underline block"
                  >
                    Enquiries & Contact Leads →
                  </button>
                </div>
              </div>

              {/* Second Row: Recent Orders Awaiting Review */}
              <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-950">
                    Pending & Awaiting Verification Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    View All Orders ({orders.length})
                  </button>
                </div>

                <div className="divide-y divide-neutral-100">
                  {orders
                    .filter((o) => o.paymentStatus === 'awaiting_verification' || o.paymentStatus === 'pending')
                    .slice(0, 5)
                    .map((ord) => (
                      <div key={ord.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-950 font-mono">{ord.orderNumber}</span>
                            <span className="text-[11px] text-neutral-400 font-mono">({ord.invoiceNumber})</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ord.paymentStatus === 'awaiting_verification'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}
                            >
                              {ord.paymentStatus === 'awaiting_verification' ? 'Awaiting Bank Verification' : ord.paymentStatus}
                            </span>
                          </div>
                          <p className="text-neutral-600 mt-0.5">
                            Customer: <strong>{ord.customer.fullName}</strong> ({ord.customer.phone}) · {ord.customer.city}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-bold text-neutral-950 tabular-nums">
                            {formatNaira(ord.total)}
                          </span>

                          {ord.paymentStatus === 'awaiting_verification' && (
                            <button
                              onClick={() => setSelectedOrderForVerification(ord)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                            >
                              Verify Payment
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedOrderForInvoice(ord)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded"
                            title="View Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">Order Management</h2>
                  <p className="text-xs text-neutral-500">
                    Verify manual bank transfers, inspect uploaded proofs, generate invoices, and send WhatsApp updates.
                  </p>
                </div>
              </div>

              {/* Order Search Bar */}
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search orders by order number, invoice number, customer name, phone, or payment ref..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full text-xs text-neutral-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5 pl-4">Order / Invoice</th>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">Payment Status</th>
                        <th className="p-3.5">Fulfillment</th>
                        <th className="p-3.5 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredOrders.map((ord) => {
                        const isVerified = ord.paymentStatus === 'verified';
                        const isAwaiting = ord.paymentStatus === 'awaiting_verification';

                        return (
                          <tr key={ord.id} className="hover:bg-neutral-50/70">
                            <td className="p-3.5 pl-4">
                              <span className="font-bold text-neutral-900 font-mono block">
                                {ord.orderNumber}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                {ord.invoiceNumber}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <span className="font-semibold text-neutral-900 block">
                                {ord.customer.fullName}
                              </span>
                              <span className="text-[11px] text-neutral-500">
                                {ord.customer.phone} · {ord.customer.city}
                              </span>
                            </td>

                            <td className="p-3.5 font-bold text-neutral-950 tabular-nums">
                              {formatNaira(ord.total)}
                            </td>

                            <td className="p-3.5">
                              <span className="uppercase text-[11px] font-semibold text-neutral-700">
                                {ord.paymentMethod.replace(/_/g, ' ')}
                              </span>
                              {ord.paymentProofFileName && (
                                <span className="block text-[10px] text-emerald-600 font-medium mt-0.5">
                                  ✓ Receipt Attached
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                                  isVerified
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isAwaiting
                                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                                    : 'bg-neutral-100 text-neutral-700'
                                }`}
                              >
                                {isVerified
                                  ? 'PAID'
                                  : isAwaiting
                                  ? 'Awaiting Verification'
                                  : 'Pending'}
                              </span>
                            </td>

                            <td className="p-3.5">
                              <select
                                value={ord.orderStatus}
                                onChange={(e) =>
                                  handleOrderStatusUpdate(ord.id, e.target.value as any)
                                }
                                className="p-1 border border-neutral-300 rounded-lg text-xs bg-white font-medium"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Ready for Delivery">Ready for Delivery</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="p-3.5 text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                {!isVerified && (
                                  <button
                                    onClick={() => setSelectedOrderForVerification(ord)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow-2xs"
                                    title="Verify Bank Transfer Funds"
                                  >
                                    Verify Payment
                                  </button>
                                )}

                                <button
                                  onClick={() => setSelectedOrderForInvoice(ord)}
                                  className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded hover:bg-neutral-100"
                                  title="View Official Invoice"
                                >
                                  <FileText className="w-4 h-4" />
                                </button>

                                <a
                                  href={generateGeneralWhatsAppUrl(
                                    ord.customer.whatsapp || ord.customer.phone,
                                    `Hello ${ord.customer.fullName}, Era Gadgets concierge here regarding order ${ord.orderNumber}.`
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                                  title="Message Customer on WhatsApp"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT METHODS & BANK DETAILS SETUP */}
          {activeTab === 'payment-methods' && settingsForm && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                  Payment Methods Configuration
                </h2>
                <p className="text-xs text-neutral-500">
                  Configure the official bank account details and toggle customer payment gateways. Changes apply immediately to checkout.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* 1. Bank Transfer Config */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-5 h-5 text-neutral-900" />
                      <div>
                        <h3 className="text-sm font-bold text-neutral-950">Manual Bank Transfer</h3>
                        <p className="text-[11px] text-neutral-500">Primary payment channel for Era Gadgets in Nigeria.</p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                      <span>{settingsForm.paymentMethods.bankTransfer.enabled ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={settingsForm.paymentMethods.bankTransfer.enabled}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            paymentMethods: {
                              ...settingsForm.paymentMethods,
                              bankTransfer: {
                                ...settingsForm.paymentMethods.bankTransfer,
                                enabled: e.target.checked
                              }
                            }
                          })
                        }
                        className="w-4 h-4 rounded text-neutral-900"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Bank Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentMethods.bankTransfer.bankName}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            paymentMethods: {
                              ...settingsForm.paymentMethods,
                              bankTransfer: {
                                ...settingsForm.paymentMethods.bankTransfer,
                                bankName: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="e.g. Guaranty Trust Bank (GTBank)"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Account Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentMethods.bankTransfer.accountName}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            paymentMethods: {
                              ...settingsForm.paymentMethods,
                              bankTransfer: {
                                ...settingsForm.paymentMethods.bankTransfer,
                                accountName: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="e.g. Era Gadgets Limited"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Account Number (NUBAN) *
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.paymentMethods.bankTransfer.accountNumber}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            paymentMethods: {
                              ...settingsForm.paymentMethods,
                              bankTransfer: {
                                ...settingsForm.paymentMethods.bankTransfer,
                                accountNumber: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="0123456789"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Sort Code / Branch Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.paymentMethods.bankTransfer.sortCode || ''}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            paymentMethods: {
                              ...settingsForm.paymentMethods,
                              bankTransfer: {
                                ...settingsForm.paymentMethods.bankTransfer,
                                sortCode: e.target.value
                              }
                            }
                          })
                        }
                        placeholder="058152062"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Payment Instructions for Customers
                      </label>
                      <textarea
                        rows={2}
                        value={settingsForm.paymentMethods.bankTransfer.instructions}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            paymentMethods: {
                              ...settingsForm.paymentMethods,
                              bankTransfer: {
                                ...settingsForm.paymentMethods.bankTransfer,
                                instructions: e.target.value
                              }
                            }
                          })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Additional Payment Methods Toggles */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <h3 className="text-sm font-bold text-neutral-950 pb-2 border-b border-neutral-100">
                    Additional Payment Channels
                  </h3>

                  {/* Paystack Toggle */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-neutral-900" />
                        <span className="text-xs font-bold text-neutral-900">Paystack Gateway</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                        <input
                          type="checkbox"
                          checked={settingsForm.paymentMethods.paystack.enabled}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              paymentMethods: {
                                ...settingsForm.paymentMethods,
                                paystack: {
                                  ...settingsForm.paymentMethods.paystack,
                                  enabled: e.target.checked
                                }
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-neutral-900"
                        />
                      </label>
                    </div>

                    {settingsForm.paymentMethods.paystack.enabled && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                            Paystack Public Key
                          </label>
                          <input
                            type="text"
                            value={settingsForm.paymentMethods.paystack.publicKey}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                paymentMethods: {
                                  ...settingsForm.paymentMethods,
                                  paystack: {
                                    ...settingsForm.paymentMethods.paystack,
                                    publicKey: e.target.value
                                  }
                                }
                              })
                            }
                            className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                            Secret Key (Server-side Only)
                          </label>
                          <input
                            type="password"
                            value={settingsForm.paymentMethods.paystack.secretKey || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                paymentMethods: {
                                  ...settingsForm.paymentMethods,
                                  paystack: {
                                    ...settingsForm.paymentMethods.paystack,
                                    secretKey: e.target.value
                                  }
                                }
                              })
                            }
                            className="w-full p-2 border border-neutral-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pay at Pickup Toggle */}
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-neutral-900 block">
                        Pay at Showroom Pickup
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Allow customers to inspect their gadget in Victoria Island before card/POS payment.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settingsForm.paymentMethods.payAtPickup.enabled}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          paymentMethods: {
                            ...settingsForm.paymentMethods,
                            payAtPickup: {
                              ...settingsForm.paymentMethods.payAtPickup,
                              enabled: e.target.checked
                            }
                          }
                        })
                      }
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 shadow-sm"
                  >
                    Save & Deploy Payment Methods
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: CUSTOMER CRM */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">Customer CRM</h2>
                  <p className="text-xs text-neutral-500">
                    Registered buyers, order history, lifetime value, and private account notes.
                  </p>
                </div>
                <button
                  onClick={handleExportCustomers}
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold hover:bg-neutral-50 flex items-center gap-2 self-start"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Customers (CSV)</span>
                </button>
              </div>

              {/* Customer Search */}
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, WhatsApp number, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full text-xs text-neutral-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Customers Table */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5 pl-4">Customer Name</th>
                        <th className="p-3.5">Contact</th>
                        <th className="p-3.5">Location</th>
                        <th className="p-3.5">Orders</th>
                        <th className="p-3.5">Total Spent</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredCustomers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-neutral-50/70">
                          <td className="p-3.5 pl-4 font-bold text-neutral-900">
                            {cust.fullName}
                          </td>
                          <td className="p-3.5">
                            <div>Tel: {cust.phone}</div>
                            {cust.whatsapp && (
                              <div className="text-[11px] text-emerald-600">WA: {cust.whatsapp}</div>
                            )}
                            <div className="text-[11px] text-neutral-400">{cust.email}</div>
                          </td>
                          <td className="p-3.5 text-neutral-700">
                            {cust.city}, {cust.state}
                          </td>
                          <td className="p-3.5 font-bold tabular-nums">
                            {cust.totalOrders} orders
                          </td>
                          <td className="p-3.5 font-bold text-neutral-950 tabular-nums">
                            {formatNaira(cust.totalSpent)}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cust.status === 'VIP'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {cust.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right pr-4">
                            <div className="flex items-center justify-end gap-1.5">
                              <a
                                href={generateGeneralWhatsAppUrl(
                                  cust.whatsapp || cust.phone,
                                  `Hello ${cust.fullName}, Era Gadgets concierge here.`
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded hover:bg-emerald-50"
                                title="Message on WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ENQUIRIES & LEADS */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                    Product Enquiries & Captured Leads
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Every customer inquiry from "Ask About This Product", contact submissions, and newsletter leads.
                  </p>
                </div>
                <button
                  onClick={handleExportLeads}
                  className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold hover:bg-neutral-50 flex items-center gap-2 self-start"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Leads (CSV)</span>
                </button>
              </div>

              {/* Leads Search */}
              <div className="bg-white p-3.5 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
                <Search className="w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search leads by prospect name, phone, product interest..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full text-xs text-neutral-900 bg-transparent focus:outline-none"
                />
              </div>

              {/* Leads List */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5 pl-4">Prospect</th>
                        <th className="p-3.5">Source / Origin</th>
                        <th className="p-3.5">Product of Interest</th>
                        <th className="p-3.5">Message / Inquiry</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-4">Direct Contact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredLeads.map((ld) => (
                        <tr key={ld.id} className="hover:bg-neutral-50/70">
                          <td className="p-3.5 pl-4">
                            <span className="font-bold text-neutral-900 block">{ld.name}</span>
                            <span className="text-[11px] text-neutral-500">{ld.phone}</span>
                            {ld.email && <span className="text-[11px] text-neutral-400 block">{ld.email}</span>}
                          </td>
                          <td className="p-3.5 font-medium text-neutral-700">
                            {ld.source}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-neutral-900 block">{ld.productInterest}</span>
                            {ld.variantDetails && (
                              <span className="text-[10px] text-neutral-500">{ld.variantDetails}</span>
                            )}
                          </td>
                          <td className="p-3.5 max-w-xs text-neutral-600 line-clamp-2">
                            {ld.message}
                          </td>
                          <td className="p-3.5">
                            <select
                              value={ld.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as any;
                                await api.updateLead(ld.id, { status: newStatus });
                                setLeads(leads.map((item) => (item.id === ld.id ? { ...item, status: newStatus } : item)));
                              }}
                              className="p-1 border border-neutral-300 rounded text-xs bg-white font-medium"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Interested">Interested</option>
                              <option value="Converted">Converted</option>
                              <option value="Follow Up Later">Follow Up Later</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right pr-4">
                            <a
                              href={generateGeneralWhatsAppUrl(
                                ld.whatsapp || ld.phone,
                                `Hello ${ld.name}, regarding your Era Gadgets inquiry for ${ld.productInterest}...`
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-[#128C7E] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: WHATSAPP CONFIGURATION & TEMPLATES */}
          {activeTab === 'whatsapp' && settingsForm && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                  WhatsApp Messaging & Cloud API
                </h2>
                <p className="text-xs text-neutral-500">
                  Configure automatic order notification formats for the owner and verified dispatch updates for customers.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Owner Phone & API Provider
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Owner's WhatsApp Number (international format)
                      </label>
                      <input
                        type="text"
                        required
                        value={settingsForm.whatsappConfig.ownerWhatsApp}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            whatsappConfig: {
                              ...settingsForm.whatsappConfig,
                              ownerWhatsApp: e.target.value
                            }
                          })
                        }
                        placeholder="2348145550192"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Notification Mode
                      </label>
                      <select
                        value={settingsForm.whatsappConfig.provider}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            whatsappConfig: {
                              ...settingsForm.whatsappConfig,
                              provider: e.target.value as any
                            }
                          })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs bg-white font-medium"
                      >
                        <option value="link_fallback">Standard Direct Link Fallback (wa.me)</option>
                        <option value="cloud_api">WhatsApp Business Cloud API (Meta)</option>
                      </select>
                    </div>
                  </div>

                  {settingsForm.whatsappConfig.provider === 'cloud_api' && (
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
                      <p className="text-xs text-neutral-600">
                        Enter your Meta WhatsApp Cloud API credentials to dispatch direct WhatsApp messages automatically from your backend.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                            Phone Number ID
                          </label>
                          <input
                            type="text"
                            value={settingsForm.whatsappConfig.phoneNumberId || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                whatsappConfig: {
                                  ...settingsForm.whatsappConfig,
                                  phoneNumberId: e.target.value
                                }
                              })
                            }
                            className="w-full p-2 border border-neutral-300 rounded-lg text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-neutral-700 block mb-1">
                            System User Access Token
                          </label>
                          <input
                            type="password"
                            value={settingsForm.whatsappConfig.apiKey || ''}
                            onChange={(e) =>
                              setSettingsForm({
                                ...settingsForm,
                                whatsappConfig: {
                                  ...settingsForm.whatsappConfig,
                                  apiKey: e.target.value
                                }
                              })
                            }
                            className="w-full p-2 border border-neutral-300 rounded-lg text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Templates */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Message Templates with Dynamic Variables
                  </h3>
                  <div className="text-[11px] text-neutral-500">
                    Supported tags: <code className="bg-neutral-100 p-0.5 rounded">{'{{customer_name}}'}</code>, <code className="bg-neutral-100 p-0.5 rounded">{'{{order_number}}'}</code>, <code className="bg-neutral-100 p-0.5 rounded">{'{{invoice_number}}'}</code>, <code className="bg-neutral-100 p-0.5 rounded">{'{{total}}'}</code>, <code className="bg-neutral-100 p-0.5 rounded">{'{{invoice_link}}'}</code>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      New Order Notification (Sent to Owner)
                    </label>
                    <textarea
                      rows={5}
                      value={settingsForm.whatsappConfig.templates.newOrderOwner}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappConfig: {
                            ...settingsForm.whatsappConfig,
                            templates: {
                              ...settingsForm.whatsappConfig.templates,
                              newOrderOwner: e.target.value
                            }
                          }
                        })
                      }
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-700 block mb-1">
                      Payment Verified Template (Sent to Customer)
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.whatsappConfig.templates.paymentVerifiedCustomer}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappConfig: {
                            ...settingsForm.whatsappConfig,
                            templates: {
                              ...settingsForm.whatsappConfig.templates,
                              paymentVerifiedCustomer: e.target.value
                            }
                          }
                        })
                      }
                      className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
                  >
                    Save WhatsApp Templates
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: ADD OR EDIT PRODUCT */}
          {activeTab === 'add-product' && (
            <AdminProductForm
              initialProduct={editingProduct}
              isEditing={isEditing}
              onSave={async (productPayload) => {
                if (isEditing && productPayload.id) {
                  await api.updateProduct(productPayload.id, productPayload);
                  setAdminFeedback({
                    type: 'success',
                    text: `Updated "${productPayload.name || 'product'}" successfully.`
                  });
                } else {
                  await api.createProduct(productPayload);
                  setAdminFeedback({
                    type: 'success',
                    text: `Published "${productPayload.name || 'new gadget'}" to store.`
                  });
                }
                await refreshProducts();
                await loadAdminProducts();
                await loadAdminData();
                setEditingProduct(null);
                setIsEditing(false);
                setActiveTab('products');
              }}
              onDelete={async (idToDelete) => {
                // Optimistic UI update
                setAdminProducts((prev) => prev.filter((p) => p.id !== idToDelete && p.slug !== idToDelete));
                await api.deleteProduct(idToDelete);
                setAdminFeedback({
                  type: 'success',
                  text: 'Product deleted from store successfully.'
                });
                await refreshProducts();
                await loadAdminProducts();
                await loadAdminData();
                setEditingProduct(null);
                setIsEditing(false);
                setActiveTab('products');
              }}
              onCancel={() => {
                setEditingProduct(null);
                setIsEditing(false);
                setActiveTab('products');
              }}
              settings={settingsForm}
            />
          )}

          {/* TAB 7: PRODUCTS TABLE */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">Product Management</h2>
                  <p className="text-xs text-neutral-500">Edit prices, duplicate devices, mark sold, and update inventory.</p>
                </div>
                <button
                  onClick={startCreateProduct}
                  className="px-4 py-2 bg-neutral-950 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 flex items-center gap-1.5 self-start"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Add Product</span>
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search by gadget name, brand, SKU..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full text-xs text-neutral-900 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="p-1.5 text-xs font-medium border border-neutral-200 rounded-lg bg-white"
                  >
                    <option value="all">All Categories</option>
                    <option value="iPhone">iPhone</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Mac">Mac</option>
                    <option value="iPad">iPad</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Laptops">Laptops</option>
                  </select>

                  {selectedProductIds.length > 0 && (
                    <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-lg">
                      <span className="text-[11px] font-bold px-2 text-neutral-700">
                        {selectedProductIds.length} selected
                      </span>
                      <button
                        onClick={() => handleBulkSold(true)}
                        className="px-2 py-1 text-[11px] font-semibold bg-white rounded text-rose-700"
                      >
                        Mark Sold
                      </button>
                      <button
                        onClick={() => handleBulkSold(false)}
                        className="px-2 py-1 text-[11px] font-semibold bg-white rounded text-emerald-700"
                      >
                        Mark In Stock
                      </button>
                      <button
                        onClick={() => setIsBulkDeleteModalOpen(true)}
                        className="p-1 text-rose-600 rounded hover:bg-rose-50 transition-colors"
                        title="Delete selected"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5 pl-4 w-8">
                          <input
                            type="checkbox"
                            checked={
                              selectedProductIds.length === filteredProducts.length &&
                              filteredProducts.length > 0
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(filteredProducts.map((p) => p.id));
                              } else {
                                setSelectedProductIds([]);
                              }
                            }}
                            className="rounded"
                          />
                        </th>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Condition</th>
                        <th className="p-3.5">Base Price</th>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {filteredProducts.map((p) => {
                        const totalUnits = p.variants.reduce((sum, v) => sum + v.stock, 0);
                        const isSelected = selectedProductIds.includes(p.id);

                        return (
                          <tr key={p.id} className="hover:bg-neutral-50/70">
                            <td className="p-3.5 pl-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds([...selectedProductIds, p.id]);
                                  } else {
                                    setSelectedProductIds(selectedProductIds.filter((id) => id !== p.id));
                                  }
                                }}
                                className="rounded"
                              />
                            </td>
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-neutral-100 p-1 shrink-0 flex items-center justify-center">
                                  <img
                                    src={p.images[0]}
                                    alt=""
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-contain mix-blend-multiply"
                                  />
                                </div>
                                <div>
                                  <div className="font-bold text-neutral-900">{p.name}</div>
                                  <div className="text-[11px] text-neutral-400">
                                    {p.brand} · {p.variants.length} variants
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-neutral-700 font-medium">{p.category}</td>
                            <td className="p-3.5 font-medium">{p.condition}</td>
                            <td className="p-3.5 font-bold text-neutral-950 tabular-nums">
                              {formatNaira(p.basePrice)}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`font-semibold tabular-nums ${
                                  p.isSold || totalUnits === 0
                                    ? 'text-rose-600'
                                    : totalUnits <= 3
                                    ? 'text-amber-600'
                                    : 'text-emerald-700'
                                }`}
                              >
                                {p.isSold ? 'Sold' : `${totalUnits} units`}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                  p.isSold
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {p.isSold ? 'Sold Out' : p.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right pr-4">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleToggleSold(p.id, p.isSold)}
                                  className={`px-2 py-1 text-[11px] font-semibold rounded ${
                                    p.isSold ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}
                                >
                                  {p.isSold ? 'Relist' : 'Mark Sold'}
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p.id)}
                                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded"
                                  title="Duplicate"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => startEditProduct(p)}
                                  className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded"
                                  title="Edit"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p)}
                                  className="p-1.5 text-neutral-400 hover:text-rose-600 rounded"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: VARIANT INVENTORY VIEW */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">
                  Granular Variant Inventory
                </h2>
                <p className="text-xs text-neutral-500">
                  Manage stock quantities directly at the variant level.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[11px]">
                      <tr>
                        <th className="p-3.5 pl-4">Product & Variant</th>
                        <th className="p-3.5">SKU</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Current Stock</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right pr-4">Quick Adjust Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {allProducts.flatMap((p) =>
                        p.variants.map((v) => {
                          const isOut = v.isSold || v.stock === 0;
                          const isLow = !isOut && v.stock <= v.lowStockThreshold;

                          return (
                            <tr key={v.id} className="hover:bg-neutral-50/70">
                              <td className="p-3.5 pl-4">
                                <div className="flex items-center gap-2.5">
                                  <span
                                    className="w-3 h-3 rounded-full border border-black/20"
                                    style={{ backgroundColor: v.color.hex }}
                                  />
                                  <div>
                                    <span className="font-bold text-neutral-900">{p.name}</span>
                                    <span className="text-[11px] text-neutral-500 ml-1.5">
                                      ({v.storage} · {v.color.name})
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3.5 font-mono text-[11px] text-neutral-500">
                                {v.sku}
                              </td>
                              <td className="p-3.5 font-bold text-neutral-950 tabular-nums">
                                {formatNaira(v.price)}
                              </td>
                              <td className="p-3.5 font-bold tabular-nums">
                                {v.stock} units
                              </td>
                              <td className="p-3.5">
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isOut
                                      ? 'bg-rose-100 text-rose-800'
                                      : isLow
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {isOut ? 'Sold Out' : isLow ? 'Low Stock' : 'In Stock'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right pr-4">
                                <div className="inline-flex items-center gap-1">
                                  <button
                                    onClick={() => handleQuickStockAdjust(p.id, v.id, -1)}
                                    disabled={v.stock === 0}
                                    className="w-7 h-7 rounded bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold disabled:opacity-40"
                                  >
                                    -1
                                  </button>
                                  <button
                                    onClick={() => handleQuickStockAdjust(p.id, v.id, 1)}
                                    className="w-7 h-7 rounded bg-neutral-950 hover:bg-neutral-800 text-white font-bold"
                                  >
                                    +1
                                  </button>
                                  <button
                                    onClick={() => handleQuickStockAdjust(p.id, v.id, 5)}
                                    className="px-2 h-7 rounded bg-neutral-100 hover:bg-neutral-200 text-[11px] font-semibold text-neutral-800"
                                  >
                                    +5
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SETTINGS PANEL */}
          {activeTab === 'settings' && settingsForm && (
            <div className="max-w-3xl space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-950">Business Settings</h2>
                <p className="text-xs text-neutral-500">
                  Update brand details, prefixes, showroom hours, delivery fees, and maintenance mode.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Store Identity & Numbering
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Business Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.brandName}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, brandName: e.target.value })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        value={settingsForm.tagline}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, tagline: e.target.value })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Order Number Prefix
                      </label>
                      <input
                        type="text"
                        value={settingsForm.orderPrefix}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, orderPrefix: e.target.value })
                        }
                        placeholder="EG-2026-"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Invoice Number Prefix
                      </label>
                      <input
                        type="text"
                        value={settingsForm.invoicePrefix}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, invoicePrefix: e.target.value })
                        }
                        placeholder="INV-EG-"
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Showroom Address
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, address: e.target.value })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    Logistics & Free Delivery Threshold
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Lagos Delivery (₦)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.lagosDeliveryFee}
                        onChange={(e) =>
                          setSettingsForm({ ...settingsForm, lagosDeliveryFee: Number(e.target.value) })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Outside Lagos Fee (₦)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.outsideLagosDeliveryFee}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            outsideLagosDeliveryFee: Number(e.target.value)
                          })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-700 block mb-1">
                        Free Delivery Threshold (₦)
                      </label>
                      <input
                        type="number"
                        value={settingsForm.freeDeliveryThreshold}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            freeDeliveryThreshold: Number(e.target.value)
                          })
                        }
                        className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-neutral-950 text-white rounded-xl text-xs font-bold hover:bg-neutral-800"
                  >
                    Save Business Settings
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: VERIFY PAYMENT MODAL */}
      {selectedOrderForVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-950">Verify Bank Transfer Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedOrderForVerification(null)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600">
              <p className="text-neutral-800">
                Please confirm that you have inspected your corporate bank account and verified the incoming funds for this order.
              </p>

              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order Number:</span>
                  <strong className="text-neutral-950 font-mono">{selectedOrderForVerification.orderNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Invoice Number:</span>
                  <strong className="text-neutral-950 font-mono">{selectedOrderForVerification.invoiceNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Customer:</span>
                  <strong className="text-neutral-950">{selectedOrderForVerification.customer.fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Phone:</span>
                  <span className="text-neutral-950">{selectedOrderForVerification.customer.phone}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-200">
                  <span>Transfer Amount to Verify:</span>
                  <span className="tabular-nums text-emerald-700">
                    {formatNaira(selectedOrderForVerification.total)}
                  </span>
                </div>
              </div>

              {/* Uploaded Payment Proof */}
              {selectedOrderForVerification.paymentProofUrl ? (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-neutral-900 block">Customer Payment Proof:</span>
                  <div className="max-h-48 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center p-2">
                    {selectedOrderForVerification.paymentProofUrl.startsWith('data:application/pdf') ? (
                      <div className="p-4 text-center">
                        <FileText className="w-8 h-8 text-neutral-500 mx-auto" />
                        <span className="text-xs font-semibold block mt-1">PDF Receipt Document</span>
                        <a
                          href={selectedOrderForVerification.paymentProofUrl}
                          download={selectedOrderForVerification.paymentProofFileName || 'receipt.pdf'}
                          className="text-xs text-blue-600 underline mt-1 block"
                        >
                          Download & View PDF
                        </a>
                      </div>
                    ) : (
                      <img
                        src={selectedOrderForVerification.paymentProofUrl}
                        alt="Payment Proof"
                        className="max-h-44 object-contain rounded"
                      />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-400 italic">
                  Note: Customer did not upload a screenshot receipt. Check bank narration with customer name or order number.
                </p>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedOrderForVerification(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPaymentVerification}
                disabled={isVerifying}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm Payment Received ({formatNaira(selectedOrderForVerification.total)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: FULL INVOICE MODAL */}
      {selectedOrderForInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-10 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrderForInvoice(null)}
              className="absolute top-6 right-6 p-2 text-neutral-400 hover:text-neutral-900 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <InvoiceView
              order={selectedOrderForInvoice}
              settings={settings}
              onBack={() => setSelectedOrderForInvoice(null)}
            />
          </div>
        </div>
      )}

      {/* FLOATING ACTION FEEDBACK TOAST */}
      {adminFeedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-semibold ${
              adminFeedback.type === 'success'
                ? 'bg-neutral-950 text-white border-neutral-800'
                : 'bg-rose-950 text-white border-rose-800'
            }`}
          >
            {adminFeedback.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{adminFeedback.text}</span>
            <button
              onClick={() => setAdminFeedback(null)}
              className="ml-2 p-0.5 text-neutral-400 hover:text-white rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SINGLE PRODUCT DELETE CONFIRMATION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950">Delete Gadget from Store</h3>
                <p className="text-xs text-neutral-500">Permanent database deletion</p>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center gap-3">
              {productToDelete.images && productToDelete.images[0] && (
                <img
                  src={productToDelete.images[0]}
                  alt=""
                  className="w-12 h-12 object-contain rounded bg-white p-1 shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-neutral-900 truncate">{productToDelete.name}</div>
                <div className="text-[11px] text-neutral-500">
                  {productToDelete.brand} · {productToDelete.category} · {formatNaira(productToDelete.basePrice)}
                </div>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-neutral-950">{productToDelete.name}</strong>? This action will erase it from the online store, remove all variant inventory, and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProduct}
                onClick={handleConfirmDeleteProduct}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isDeletingProduct ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Gadget</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BULK DELETE CONFIRMATION */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950">Bulk Delete Gadgets</h3>
                <p className="text-xs text-neutral-500">{selectedProductIds.length} items selected</p>
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-neutral-950">{selectedProductIds.length} selected gadgets</strong> from the store database? All associated stock variants and specifications will be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isBulkDeleting}
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting {selectedProductIds.length}...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete {selectedProductIds.length} Gadgets</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
