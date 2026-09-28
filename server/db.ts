import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  Product,
  Order,
  Review,
  StoreSettings,
  CustomerCRM,
  Lead,
  AdminNotification,
  PaymentAuditLog
} from '../src/types';

const DATA_FILE = path.resolve(process.cwd(), 'store_data.json');

const DEFAULT_SETTINGS: StoreSettings = {
  brandName: 'Era Gadgets',
  tagline: 'The technology you actually want.',
  phone: '+234 814 555 0192',
  whatsappNumber: '2348145550192',
  email: 'concierge@eragadgets.ng',
  address: 'Victoria Island Flagship Showroom, Lagos, Nigeria',
  openingHours: 'Mon – Sat: 9:00 AM – 7:30 PM WAT',
  currency: 'NGN',
  currencySymbol: '₦',
  lagosDeliveryFee: 3500,
  outsideLagosDeliveryFee: 8500,
  pickupFee: 0,
  freeDeliveryThreshold: 3500000,
  showSoldProductsOnWebsite: true,
  storeMaintenanceMode: false,
  maintenanceMessage: "We're currently performing a scheduled inventory audit. Ordering will resume shortly.",
  invoicePrefix: 'INV-EG-',
  orderPrefix: 'EG-2026-',
  reservationMinutes: 60,
  paymentMethods: {
    bankTransfer: {
      enabled: true,
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountName: 'Era Gadgets Limited',
      accountNumber: '0123456789',
      sortCode: '058152062',
      instructions: 'Please transfer the exact amount shown to the account above. Use your order reference or full name as narration.',
      notes: 'Payment verification takes 5 to 15 minutes during showroom operating hours.'
    },
    paystack: {
      enabled: true,
      publicKey: 'pk_test_eragadgets_live_prep',
      secretKey: 'sk_test_eragadgets_secret_key'
    },
    flutterwave: {
      enabled: false,
      publicKey: 'flw_pub_test_eragadgets'
    },
    cashOnDelivery: {
      enabled: false,
      notes: 'Available for verified repeat corporate clients within Victoria Island & Ikoyi only.'
    },
    payAtPickup: {
      enabled: true,
      notes: 'Inspect and test your gadget at our Victoria Island showroom before completing card or POS payment.'
    }
  },
  whatsappConfig: {
    ownerWhatsApp: '2348145550192',
    provider: 'link_fallback',
    autoNotifyOwnerOnOrder: true,
    autoNotifyCustomerOnStatus: true,
    templates: {
      newOrderOwner: `*NEW ERA GADGETS ORDER*
Order: {{order_number}}
Invoice: {{invoice_number}}
Customer: {{customer_name}}
Phone: {{customer_phone}}
WhatsApp: {{customer_whatsapp}}
Product: {{product_name}}
Storage: {{storage}}
Color: {{color}}
Condition: {{condition}}
Quantity: {{quantity}}
Order Total: {{total}}
Payment Method: {{payment_method}}
Payment Status: {{payment_status}}
Delivery: {{delivery_address}}
Invoice Link: {{invoice_link}}`,
      orderConfirmedCustomer: `Hello {{customer_name}}, your Era Gadgets order {{order_number}} (Invoice: {{invoice_number}}) has been confirmed! We are preparing your gadget for dispatch. Track your invoice here: {{invoice_link}}`,
      paymentVerifiedCustomer: `Hello {{customer_name}}, your payment of {{total}} for order {{order_number}} has been officially VERIFIED by our accounts team. Your official stamped invoice is available here: {{invoice_link}}`,
      readyForDeliveryCustomer: `Hello {{customer_name}}, order {{order_number}} is packed and ready for delivery to {{delivery_address}}. Our dispatch rider will contact you upon departure.`
    }
  },
  instagramUrl: 'https://instagram.com/eragadgets.ng',
  twitterUrl: 'https://twitter.com/eragadgetsng'
};

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  reviews: Review[];
  settings: StoreSettings;
  customers: CustomerCRM[];
  leads: Lead[];
  notifications: AdminNotification[];
  invoiceCounter: number;
  orderCounter: number;
}

class StoreDB {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
          products: (parsed.products || []).map((p: Product) => ({
            ...p,
            images: Array.isArray(p.images)
              ? p.images.filter((img: string) => !img.startsWith('/src/assets/images/'))
              : []
          })),
          orders: parsed.orders || [],
          reviews: parsed.reviews || [],
          settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings || {}),
            paymentMethods: {
              ...DEFAULT_SETTINGS.paymentMethods,
              ...(parsed.settings?.paymentMethods || {})
            },
            whatsappConfig: {
              ...DEFAULT_SETTINGS.whatsappConfig,
              ...(parsed.settings?.whatsappConfig || {})
            }
          },
          customers: parsed.customers || [],
          leads: parsed.leads || [],
          notifications: parsed.notifications || [],
          invoiceCounter: parsed.invoiceCounter || 100,
          orderCounter: parsed.orderCounter || 184
        };
      }
    } catch (err) {
      console.error('Failed to load store_data.json, initializing defaults:', err);
    }

    const initial: DatabaseSchema = {
      products: [],
      orders: [],
      reviews: [],
      settings: DEFAULT_SETTINGS,
      customers: [],
      leads: [],
      notifications: [],
      invoiceCounter: 100,
      orderCounter: 184
    };
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write store_data.json:', err);
    }
  }

  private commit() {
    this.saveData(this.data);
  }

  // --- PRODUCTS ---
  getProducts(options?: {
    category?: string;
    brand?: string;
    condition?: string;
    search?: string;
    status?: string;
    includeSoldOut?: boolean;
    featured?: boolean;
  }): Product[] {
    let list = [...this.data.products];

    if (!options?.status) {
      list = list.filter((p) => p.status === 'Published');
      if (!this.data.settings.showSoldProductsOnWebsite) {
        list = list.filter((p) => !p.isSold);
      }
    } else if (options.status !== 'all') {
      list = list.filter((p) => p.status === options.status);
    }

    if (options?.category && options.category !== 'all') {
      const catLower = options.category.toLowerCase();
      list = list.filter((p) => p.category.toLowerCase() === catLower);
    }

    if (options?.brand && options.brand !== 'all') {
      const brandLower = options.brand.toLowerCase();
      list = list.filter((p) => p.brand.toLowerCase() === brandLower);
    }

    if (options?.condition && options.condition !== 'all') {
      list = list.filter((p) => p.condition === options.condition);
    }

    if (options?.featured) {
      list = list.filter((p) => p.featured);
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.variants.some(
            (v) =>
              v.storage?.toLowerCase().includes(q) ||
              v.sku?.toLowerCase().includes(q) ||
              v.color.name.toLowerCase().includes(q)
          )
      );
    }

    return list;
  }

  getProductByIdOrSlug(idOrSlug: string): Product | undefined {
    return this.data.products.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  }

  createProduct(productData: Partial<Product>): Product {
    const slug = (productData.name || 'product')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const uniqueSlug = this.generateUniqueSlug(slug);

    const newProduct: Product = {
      id: uniqueSlug,
      slug: uniqueSlug,
      name: productData.name || 'Unnamed Product',
      brand: productData.brand || 'Apple',
      category: productData.category || 'iPhone',
      condition: productData.condition || 'Brand New',
      shortDescription: productData.shortDescription || '',
      description: productData.description || '',
      basePrice: Number(productData.basePrice) || 0,
      compareAtPrice: productData.compareAtPrice ? Number(productData.compareAtPrice) : null,
      costPrice: productData.costPrice ? Number(productData.costPrice) : null,
      badge: productData.badge || null,
      status: productData.status || 'Published',
      isSold: Boolean(productData.isSold),
      featured: Boolean(productData.featured),
      images:
        productData.images && productData.images.length > 0
          ? productData.images.filter((img) => !img.startsWith('/src/assets/images/'))
          : [],
      specs: productData.specs || {},
      colorOptions: productData.colorOptions || [],
      storageOptions: productData.storageOptions || [],
      variants:
        productData.variants && productData.variants.length > 0
          ? productData.variants
          : [
              {
                id: `v-${uniqueSlug}-default`,
                storage: 'Default',
                color: { name: 'Standard', hex: '#111111' },
                sku: `ERA-${uniqueSlug.toUpperCase()}`,
                price: Number(productData.basePrice) || 0,
                stock: 5,
                lowStockThreshold: 1,
                isSold: false
              }
            ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.products.unshift(newProduct);
    this.commit();
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) return null;

    const existing = this.data.products[index];
    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updated.variants && updated.variants.length > 0) {
      const activeVariant =
        updated.variants.find((v) => !v.isSold && v.stock > 0) || updated.variants[0];
      if (activeVariant && !updates.basePrice) {
        updated.basePrice = activeVariant.price;
      }
      const hasAnyStock = updated.variants.some((v) => !v.isSold && v.stock > 0);
      if (!hasAnyStock) {
        updated.isSold = true;
      }
    }

    this.data.products[index] = updated;
    this.commit();
    return updated;
  }

  duplicateProduct(id: string): Product | null {
    const original = this.getProductByIdOrSlug(id);
    if (!original) return null;

    const baseSlug = `${original.slug}-copy`;
    const uniqueSlug = this.generateUniqueSlug(baseSlug);

    const duplicated: Product = {
      ...JSON.parse(JSON.stringify(original)),
      id: uniqueSlug,
      slug: uniqueSlug,
      name: `${original.name} (Copy)`,
      status: 'Draft',
      isSold: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: original.variants.map((v, i) => ({
        ...v,
        id: `v-${uniqueSlug}-${i}`,
        sku: `${v.sku}-COPY`,
        isSold: false
      }))
    };

    this.data.products.unshift(duplicated);
    this.commit();
    return duplicated;
  }

  toggleProductSold(id: string, isSold?: boolean): Product | null {
    const product = this.getProductByIdOrSlug(id);
    if (!product) return null;

    const targetSoldState = isSold !== undefined ? isSold : !product.isSold;
    product.isSold = targetSoldState;
    product.variants = product.variants.map((v) => ({
      ...v,
      isSold: targetSoldState,
      stock: targetSoldState ? 0 : v.stock === 0 ? 3 : v.stock
    }));
    product.updatedAt = new Date().toISOString();

    this.commit();
    return product;
  }

  deleteProduct(idOrSlugOrName: string): boolean {
    if (!idOrSlugOrName) return false;
    const rawInput = String(idOrSlugOrName).trim();
    let clean = rawInput.toLowerCase();
    try {
      clean = decodeURIComponent(rawInput).trim().toLowerCase();
    } catch (_) {}

    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => {
      const pId = (p.id || '').trim().toLowerCase();
      const pSlug = (p.slug || '').trim().toLowerCase();
      const pName = (p.name || '').trim().toLowerCase();
      
      const isMatch =
        p.id === rawInput ||
        p.slug === rawInput ||
        pId === clean ||
        pSlug === clean ||
        pName === clean;

      return !isMatch;
    });

    if (this.data.products.length !== initialLen) {
      this.commit();
      console.log(`[StoreDB] Product deleted: "${rawInput}". Total remaining products: ${this.data.products.length}`);
      return true;
    }
    console.warn(`[StoreDB] Product not found for deletion: "${rawInput}"`);
    return false;
  }

  private generateUniqueSlug(baseSlug: string): string {
    let slug = baseSlug;
    let counter = 1;
    while (this.data.products.some((p) => p.slug === slug || p.id === slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  // --- ORDERS, INVOICES & PAYMENTS ---
  getOrders(searchQuery?: string): Order[] {
    let list = [...this.data.orders];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.invoiceNumber.toLowerCase().includes(q) ||
          o.paymentReference.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getOrderById(idOrOrderNum: string): Order | undefined {
    return this.data.orders.find(
      (o) =>
        o.id === idOrOrderNum ||
        o.orderNumber === idOrOrderNum ||
        o.invoiceNumber === idOrOrderNum
    );
  }

  getOrderByAccessToken(accessToken: string): Order | undefined {
    return this.data.orders.find((o) => o.accessToken === accessToken);
  }

  createOrder(orderData: Partial<Order>): Order {
    const prefix = this.data.settings.orderPrefix || 'EG-2026-';
    this.data.orderCounter = (this.data.orderCounter || 184) + 1;
    const orderNumber = `${prefix}${String(this.data.orderCounter).padStart(6, '0')}`;

    const invPrefix = this.data.settings.invoicePrefix || 'INV-EG-';
    this.data.invoiceCounter = (this.data.invoiceCounter || 100) + 1;
    const invoiceNumber = `${invPrefix}${String(this.data.invoiceCounter).padStart(6, '0')}`;

    const accessToken = crypto.randomBytes(18).toString('hex');
    const paymentRef = orderData.paymentReference || `EG-REF-${Date.now()}`;

    const initialAudit: PaymentAuditLog = {
      id: `log-${Date.now()}-1`,
      orderId: `ord-${Date.now()}`,
      orderNumber,
      action: 'Order Placed',
      performedBy: orderData.customer?.fullName || 'Customer',
      details: `Order created via ${orderData.paymentMethod || 'bank_transfer'}. Payment status: ${orderData.paymentStatus || 'pending'}.`,
      amount: orderData.total,
      timestamp: new Date().toISOString()
    };

    const newOrder: Order = {
      id: initialAudit.orderId,
      orderNumber,
      invoiceNumber,
      accessToken,
      customer: orderData.customer || {
        fullName: 'Customer',
        email: 'customer@eragadgets.ng',
        phone: '+234 800 000 0000',
        whatsapp: '+234 800 000 0000',
        address: 'Lagos',
        city: 'Lagos',
        state: 'Lagos'
      },
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      deliveryFee: orderData.deliveryFee || 0,
      discount: orderData.discount || 0,
      deliveryOption: orderData.deliveryOption || 'lagos',
      total: orderData.total || 0,
      paymentMethod: orderData.paymentMethod || 'bank_transfer',
      paymentStatus: orderData.paymentStatus || 'pending',
      orderStatus: orderData.orderStatus || 'Pending',
      paymentReference: paymentRef,
      stockDeducted: false,
      auditLogs: [initialAudit],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.orders.unshift(newOrder);

    // Auto-upsert into Customer CRM
    this.upsertCustomer(newOrder.customer, newOrder.total);

    // Create Admin In-App Notification
    this.addNotification({
      type: 'order',
      title: `New Order ${newOrder.orderNumber}`,
      message: `${newOrder.customer.fullName} ordered ${newOrder.items.length} items (${newOrder.items[0]?.productName || 'Gadget'}) totaling ₦${newOrder.total.toLocaleString()}. Method: ${newOrder.paymentMethod}.`,
      orderId: newOrder.id
    });

    this.commit();
    return newOrder;
  }

  // Customer claims payment has been made (e.g. clicked "I've Made the Transfer")
  submitBankTransferPayment(
    orderIdOrNumber: string,
    proofData?: { dataUrl?: string; fileName?: string }
  ): Order | null {
    const order = this.data.orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );
    if (!order) return null;

    order.paymentStatus = 'awaiting_verification';
    if (proofData?.dataUrl) {
      order.paymentProofUrl = proofData.dataUrl;
      order.paymentProofFileName = proofData.fileName;
      order.paymentProofUploadedAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();

    const audit: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'Payment Claimed by Customer',
      performedBy: `${order.customer.fullName} (Customer)`,
      details: proofData?.fileName
        ? `Customer confirmed transfer and uploaded proof: ${proofData.fileName}`
        : `Customer confirmed bank transfer. Awaiting owner bank verification.`,
      amount: order.total,
      timestamp: new Date().toISOString()
    };
    order.auditLogs.push(audit);

    // Create high-priority Admin Notification
    this.addNotification({
      type: 'payment_awaiting',
      title: `Payment Awaiting Verification: ${order.orderNumber}`,
      message: `${order.customer.fullName} confirmed transfer of ₦${order.total.toLocaleString()} for ${order.orderNumber}. Please check your bank account and verify.`,
      orderId: order.id
    });

    this.commit();
    return order;
  }

  // Admin manually verifies payment
  verifyPaymentByAdmin(
    orderIdOrNumber: string,
    adminEmail: string
  ): { success: boolean; order?: Order; message?: string } {
    const order = this.data.orders.find(
      (o) => o.id === orderIdOrNumber || o.orderNumber === orderIdOrNumber
    );
    if (!order) {
      return { success: false, message: 'Order not found' };
    }

    if (order.paymentStatus === 'verified') {
      return { success: true, order, message: 'Payment already verified' };
    }

    order.paymentStatus = 'verified';
    order.orderStatus = 'Confirmed';
    order.verifiedAt = new Date().toISOString();
    order.verifiedBy = adminEmail || 'Admin';
    order.updatedAt = new Date().toISOString();

    // Deduct stock upon formal payment verification
    if (!order.stockDeducted) {
      for (const item of order.items) {
        const prod = this.getProductByIdOrSlug(item.productId);
        if (prod) {
          const variant = prod.variants.find((v) => v.id === item.variantId);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
            if (variant.stock === 0) {
              variant.isSold = true;
              this.addNotification({
                type: 'sold_out',
                title: `Variant Sold Out: ${prod.name}`,
                message: `${variant.storage} ${variant.color.name} of ${prod.name} has reached 0 stock.`
              });
            } else if (variant.stock <= variant.lowStockThreshold) {
              this.addNotification({
                type: 'low_stock',
                title: `Low Stock: ${prod.name}`,
                message: `Only ${variant.stock} units remaining for ${variant.storage} ${variant.color.name}.`
              });
            }
          }
          // Check if all variants are sold out
          const anyStockLeft = prod.variants.some((v) => !v.isSold && v.stock > 0);
          if (!anyStockLeft) {
            prod.isSold = true;
          }
        }
      }
      order.stockDeducted = true;
    }

    const audit: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'Payment Verified by Admin',
      performedBy: adminEmail || 'Administrator',
      details: `Funds of ₦${order.total.toLocaleString()} confirmed in corporate bank account. Order confirmed and inventory deducted.`,
      amount: order.total,
      timestamp: new Date().toISOString()
    };
    order.auditLogs.push(audit);

    this.addNotification({
      type: 'payment_verified',
      title: `Payment Verified for ${order.orderNumber}`,
      message: `₦${order.total.toLocaleString()} confirmed by ${adminEmail}. Invoice status set to PAID.`,
      orderId: order.id
    });

    this.commit();
    return { success: true, order };
  }

  updateOrderStatus(
    orderId: string,
    orderStatus: Order['orderStatus'],
    paymentStatus?: Order['paymentStatus'],
    adminNote?: string
  ): Order | null {
    const order = this.data.orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const prevOrder = order.orderStatus;
    const prevPayment = order.paymentStatus;

    order.orderStatus = orderStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    order.updatedAt = new Date().toISOString();

    const audit: PaymentAuditLog = {
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      action: 'Order Status Changed',
      performedBy: 'Admin',
      details: `Status changed from ${prevOrder}/${prevPayment} to ${orderStatus}/${order.paymentStatus}.${adminNote ? ` Note: ${adminNote}` : ''}`,
      timestamp: new Date().toISOString()
    };
    order.auditLogs.push(audit);

    this.commit();
    return order;
  }

  // --- CUSTOMER CRM ---
  getCustomers(searchQuery?: string): CustomerCRM[] {
    let list = [...this.data.customers];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.whatsapp.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.totalSpent - a.totalSpent);
  }

  getCustomerById(id: string): CustomerCRM | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  updateCustomerNotes(id: string, notes: string, status?: CustomerCRM['status']): CustomerCRM | null {
    const customer = this.data.customers.find((c) => c.id === id);
    if (!customer) return null;
    customer.notes = notes;
    if (status) customer.status = status;
    customer.updatedAt = new Date().toISOString();
    this.commit();
    return customer;
  }

  private upsertCustomer(details: any, orderTotal = 0): CustomerCRM {
    const emailKey = details.email?.toLowerCase().trim();
    const phoneKey = details.phone?.replace(/[^0-9]/g, '');

    let existing = this.data.customers.find(
      (c) =>
        (emailKey && c.email.toLowerCase() === emailKey) ||
        (phoneKey && c.phone.replace(/[^0-9]/g, '') === phoneKey)
    );

    if (existing) {
      existing.fullName = details.fullName || existing.fullName;
      existing.phone = details.phone || existing.phone;
      existing.whatsapp = details.whatsapp || details.phone || existing.whatsapp;
      existing.address = details.address || existing.address;
      existing.city = details.city || existing.city;
      existing.state = details.state || existing.state;
      existing.totalOrders += 1;
      existing.totalSpent += orderTotal;
      existing.lastOrderDate = new Date().toISOString();
      if (existing.totalSpent >= 4000000) {
        existing.status = 'VIP';
      }
      existing.updatedAt = new Date().toISOString();
      return existing;
    }

    const newCustomer: CustomerCRM = {
      id: `cust-${Date.now()}`,
      fullName: details.fullName || 'Customer',
      phone: details.phone || '',
      whatsapp: details.whatsapp || details.phone || '',
      email: details.email || '',
      address: details.address || '',
      city: details.city || '',
      state: details.state || 'Lagos',
      totalOrders: 1,
      totalSpent: orderTotal,
      lastOrderDate: new Date().toISOString(),
      status: orderTotal >= 4000000 ? 'VIP' : 'Active',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.customers.unshift(newCustomer);
    return newCustomer;
  }

  // --- LEADS & ENQUIRIES ---
  getLeads(searchQuery?: string): Lead[] {
    let list = [...this.data.leads];
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.productInterest?.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q)
      );
    }
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  createLead(leadData: Partial<Lead>): Lead {
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      name: leadData.name || 'Anonymous Prospect',
      phone: leadData.phone || '',
      whatsapp: leadData.whatsapp || leadData.phone || '',
      email: leadData.email || '',
      message: leadData.message || '',
      productInterest: leadData.productInterest || 'General Inquiry',
      variantDetails: leadData.variantDetails,
      source: leadData.source || 'Product Enquiry',
      status: 'New',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.leads.unshift(newLead);

    this.addNotification({
      type: 'enquiry',
      title: `New Lead: ${newLead.name}`,
      message: `${newLead.source} for "${newLead.productInterest}". Phone: ${newLead.phone}`
    });

    this.commit();
    return newLead;
  }

  updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const lead = this.data.leads.find((l) => l.id === id);
    if (!lead) return null;
    Object.assign(lead, updates);
    this.commit();
    return lead;
  }

  // --- NOTIFICATIONS ---
  getNotifications(): AdminNotification[] {
    return [...this.data.notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addNotification(notif: Omit<AdminNotification, 'id' | 'read' | 'createdAt'>): AdminNotification {
    const n: AdminNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      ...notif,
      read: false,
      createdAt: new Date().toISOString()
    };
    this.data.notifications.unshift(n);
    // Keep max 50 notifications
    if (this.data.notifications.length > 50) {
      this.data.notifications.pop();
    }
    return n;
  }

  markNotificationRead(id: string): void {
    const n = this.data.notifications.find((item) => item.id === id);
    if (n) {
      n.read = true;
      this.commit();
    }
  }

  markAllNotificationsRead(): void {
    this.data.notifications.forEach((n) => (n.read = true));
    this.commit();
  }

  // --- REVIEWS ---
  getReviews(productId?: string, onlyApproved = true): Review[] {
    let revs = [...this.data.reviews];
    if (productId) {
      revs = revs.filter((r) => r.productId === productId);
    }
    if (onlyApproved) {
      revs = revs.filter((r) => r.approved);
    }
    return revs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  addReview(reviewData: Partial<Review>): Review {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      productId: reviewData.productId || 'iphone-17-pro',
      productName: reviewData.productName || 'Era Gadget',
      customerName: reviewData.customerName || 'Verified Buyer',
      rating: reviewData.rating || 5,
      comment: reviewData.comment || '',
      approved: false,
      featured: false,
      verified: true,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.unshift(newRev);
    this.commit();
    return newRev;
  }

  updateReview(id: string, updates: Partial<Review>): Review | null {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (!rev) return null;
    Object.assign(rev, updates);
    this.commit();
    return rev;
  }

  deleteReview(id: string): boolean {
    const initialLen = this.data.reviews.length;
    this.data.reviews = this.data.reviews.filter((r) => r.id !== id);
    if (this.data.reviews.length !== initialLen) {
      this.commit();
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  getSettings(): StoreSettings {
    return { ...this.data.settings };
  }

  updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...updates,
      paymentMethods: {
        ...this.data.settings.paymentMethods,
        ...(updates.paymentMethods || {})
      },
      whatsappConfig: {
        ...this.data.settings.whatsappConfig,
        ...(updates.whatsappConfig || {})
      }
    };
    this.commit();
    return this.data.settings;
  }

  // --- ANALYTICS ---
  getAnalytics(): any {
    const totalOrders = this.data.orders.length;
    const verifiedOrders = this.data.orders.filter((o) => o.paymentStatus === 'verified');
    const awaitingVerificationOrders = this.data.orders.filter(
      (o) => o.paymentStatus === 'awaiting_verification'
    ).length;

    const totalRevenue = verifiedOrders.reduce((sum, o) => sum + o.total, 0);
    const averageOrderValue =
      verifiedOrders.length > 0 ? Math.round(totalRevenue / verifiedOrders.length) : 0;

    let productsSoldCount = 0;
    for (const order of verifiedOrders) {
      for (const item of order.items) {
        productsSoldCount += item.quantity;
      }
    }

    const totalProducts = this.data.products.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let soldOutCount = 0;
    let inventoryValue = 0;

    const categoryMap: Record<string, { count: number; value: number }> = {};

    for (const p of this.data.products) {
      let productStock = 0;
      let isProductLow = false;

      for (const v of p.variants) {
        inventoryValue += v.price * v.stock;
        productStock += v.stock;
        if (!v.isSold && v.stock > 0 && v.stock <= v.lowStockThreshold) {
          isProductLow = true;
        }
      }

      if (p.isSold || productStock === 0) {
        soldOutCount++;
      } else if (isProductLow) {
        lowStockCount++;
      } else {
        inStockCount++;
      }

      if (!categoryMap[p.category]) {
        categoryMap[p.category] = { count: 0, value: 0 };
      }
      categoryMap[p.category].count++;
      categoryMap[p.category].value += p.basePrice * (productStock || 1);
    }

    const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      count: stats.count,
      value: stats.value
    }));

    return {
      totalRevenue,
      totalOrders,
      awaitingVerificationOrders,
      verifiedOrders: verifiedOrders.length,
      averageOrderValue,
      productsSoldCount,
      totalProducts,
      inStockCount,
      lowStockCount,
      soldOutCount,
      totalCustomers: this.data.customers.length,
      totalLeads: this.data.leads.length,
      inventoryValue,
      categoryBreakdown,
      recentOrders: this.getOrders().slice(0, 5),
      recentLeads: this.getLeads().slice(0, 5)
    };
  }
}

export const db = new StoreDB();
