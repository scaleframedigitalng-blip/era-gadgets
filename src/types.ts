export type ProductCondition = 'Brand New' | 'UK Used' | 'US Used' | 'Refurbished' | 'Open Box';
export type ProductStatus = 'Published' | 'Draft' | 'Archived' | 'Sold Out';
export type ProductBadge = 'New' | 'Best Seller' | 'Limited' | 'Sale' | 'Low Stock' | 'Sold Out' | null;

export interface ColorOption {
  name: string;
  hex: string;
  image?: string;
}

export interface StorageOption {
  capacity: string;
  presetPrice: number;
  compareAtPrice?: number | null;
}

export interface ProductVariant {
  id: string;
  storage: string;
  color: ColorOption;
  ram?: string;
  processor?: string;
  size?: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  lowStockThreshold: number;
  isSold: boolean;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  condition: ProductCondition;
  shortDescription: string;
  description: string;
  basePrice: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  badge?: ProductBadge;
  status: ProductStatus;
  isSold: boolean;
  images: string[];
  specs: Record<string, string>;
  variants: ProductVariant[];
  colorOptions?: ColorOption[];
  storageOptions?: StorageOption[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productSlug: string;
  productName: string;
  brand: string;
  variantId: string;
  storage?: string;
  color?: ColorOption;
  condition: ProductCondition;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
}

export interface CustomerDetails {
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  notes?: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Processing'
  | 'Ready for Delivery'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export type PaymentStatus =
  | 'pending'
  | 'awaiting_verification'
  | 'verified'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod =
  | 'bank_transfer'
  | 'paystack'
  | 'flutterwave'
  | 'cash_on_delivery'
  | 'pay_at_pickup';

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  storage?: string;
  colorName?: string;
  condition: string;
  price: number;
  quantity: number;
  image: string;
  sku?: string;
}

export interface PaymentAuditLog {
  id: string;
  orderId: string;
  orderNumber: string;
  action: string;
  performedBy: string;
  details?: string;
  amount?: number;
  timestamp: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  accessToken: string; // Secure random token for invoice/order view
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  deliveryOption: 'lagos' | 'outside_lagos' | 'pickup';
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentReference: string;
  paymentProofUrl?: string; // Stored receipt image / document data URL
  paymentProofFileName?: string;
  paymentProofUploadedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  stockDeducted: boolean;
  auditLogs: PaymentAuditLog[];
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  approved: boolean;
  featured: boolean;
  verified: boolean;
  createdAt: string;
}

export interface BankTransferConfig {
  enabled: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode?: string;
  instructions: string;
  notes?: string;
}

export interface PaymentProviderConfig {
  enabled: boolean;
  publicKey: string;
  secretKey?: string;
}

export interface PaymentMethodsConfig {
  bankTransfer: BankTransferConfig;
  paystack: PaymentProviderConfig;
  flutterwave: PaymentProviderConfig;
  cashOnDelivery: { enabled: boolean; notes?: string };
  payAtPickup: { enabled: boolean; notes?: string };
}

export interface WhatsAppConfig {
  ownerWhatsApp: string;
  provider: 'link_fallback' | 'cloud_api';
  apiKey?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
  autoNotifyOwnerOnOrder: boolean;
  autoNotifyCustomerOnStatus: boolean;
  templates: {
    newOrderOwner: string;
    orderConfirmedCustomer: string;
    paymentVerifiedCustomer: string;
    readyForDeliveryCustomer: string;
  };
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  openingHours: string;
  currency: string;
  currencySymbol: string;
  lagosDeliveryFee: number;
  outsideLagosDeliveryFee: number;
  pickupFee: number;
  freeDeliveryThreshold: number;
  showSoldProductsOnWebsite: boolean;
  storeMaintenanceMode: boolean;
  maintenanceMessage: string;
  invoicePrefix: string;
  orderPrefix: string;
  reservationMinutes: number;
  paymentMethods: PaymentMethodsConfig;
  whatsappConfig: WhatsAppConfig;
  instagramUrl: string;
  twitterUrl: string;
}

export interface CustomerCRM {
  id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  state: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'VIP' | 'New' | 'Inactive';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  message: string;
  productInterest?: string;
  variantDetails?: string;
  source: 'Contact Form' | 'Product Enquiry' | 'Newsletter' | 'WhatsApp Click' | 'Checkout Attempt';
  status: 'New' | 'Contacted' | 'Interested' | 'Converted' | 'Not Interested' | 'Follow Up Later';
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminNotification {
  id: string;
  type: 'order' | 'payment_awaiting' | 'payment_verified' | 'lead' | 'enquiry' | 'low_stock' | 'sold_out';
  title: string;
  message: string;
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  awaitingVerificationOrders: number;
  verifiedOrders: number;
  averageOrderValue: number;
  productsSoldCount: number;
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  soldOutCount: number;
  totalCustomers: number;
  totalLeads: number;
  inventoryValue: number;
  categoryBreakdown: { category: string; count: number; value: number }[];
  recentOrders: Order[];
  recentLeads: Lead[];
}
