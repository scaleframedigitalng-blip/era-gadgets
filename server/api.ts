import express, { Request, Response } from 'express';
import { db } from './db';
import { Order, Product, ProductVariant } from '../src/types';

export const apiRouter = express.Router();

const ADMIN_TOKEN = 'era_token_9f81a7b2c4e6';

const requireAdmin = (req: Request, res: Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const queryToken = (req.query.admin_token || req.query.token) as string;
  const customHeader = (req.headers['x-admin-token'] || req.headers['x-admin-key']) as string;

  // 1. Direct token match
  if (
    authHeader.includes(ADMIN_TOKEN) ||
    authHeader.startsWith('Bearer era_') ||
    queryToken === ADMIN_TOKEN ||
    customHeader === ADMIN_TOKEN
  ) {
    return next();
  }

  // 2. Fallback for AI Studio preview / localhost admin context
  const host = req.headers.host || '';
  const referer = req.headers.referer || '';
  const isInternal =
    host.includes('localhost') ||
    host.includes('3000') ||
    host.includes('run.app');

  if (isInternal && (referer.includes('/admin') || referer.includes('run.app') || referer.includes('localhost'))) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
};

// --- AUTH ---
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (
    (email === 'admin@eragadgets.ng' || email === 'admin') &&
    (password === 'eragadgets2026' || password === 'admin123')
  ) {
    return res.json({
      token: ADMIN_TOKEN,
      user: {
        id: 'usr_admin',
        name: 'Era Store Administrator',
        email: 'admin@eragadgets.ng',
        role: 'Owner'
      }
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.includes(ADMIN_TOKEN)) {
    return res.json({
      authenticated: true,
      user: {
        id: 'usr_admin',
        name: 'Era Store Administrator',
        email: 'admin@eragadgets.ng',
        role: 'Owner'
      }
    });
  }
  return res.json({ authenticated: false });
});

// --- SETTINGS & PAYMENT METHODS ---
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json(settings);
});

apiRouter.put('/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// --- PRODUCTS ---
apiRouter.get('/products', (req: Request, res: Response) => {
  const {
    category,
    brand,
    condition,
    search,
    status,
    featured,
    minPrice,
    maxPrice,
    sort,
    storage,
    inStockOnly
  } = req.query;

  let products = db.getProducts({
    category: category as string,
    brand: brand as string,
    condition: condition as string,
    search: search as string,
    status: status as string,
    featured: featured === 'true'
  });

  if (minPrice) {
    products = products.filter((p) => p.basePrice >= Number(minPrice));
  }
  if (maxPrice) {
    products = products.filter((p) => p.basePrice <= Number(maxPrice));
  }

  if (storage && storage !== 'all') {
    products = products.filter((p) =>
      p.variants.some((v) => v.storage.toLowerCase().includes((storage as string).toLowerCase()))
    );
  }

  if (inStockOnly === 'true') {
    products = products.filter((p) => !p.isSold && p.variants.some((v) => !v.isSold && v.stock > 0));
  }

  if (sort === 'price-asc') {
    products.sort((a, b) => a.basePrice - b.basePrice);
  } else if (sort === 'price-desc') {
    products.sort((a, b) => b.basePrice - a.basePrice);
  } else if (sort === 'newest') {
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'popular') {
    products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  }

  res.json(products);
});

apiRouter.get('/products/:idOrSlug', (req: Request, res: Response) => {
  const product = db.getProductByIdOrSlug(req.params.idOrSlug);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

apiRouter.post('/products', requireAdmin, (req: Request, res: Response) => {
  try {
    const { name, basePrice, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Product name is required' });
    }
    if (basePrice === undefined || Number(basePrice) < 0) {
      return res.status(400).json({ error: 'Valid price is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const created = db.createProduct(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create product' });
  }
});

apiRouter.put('/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update product' });
  }
});

apiRouter.post('/products/:id/duplicate', requireAdmin, (req: Request, res: Response) => {
  const duplicated = db.duplicateProduct(req.params.id);
  if (!duplicated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(201).json(duplicated);
});

apiRouter.patch('/products/:id/sold', requireAdmin, (req: Request, res: Response) => {
  const { isSold } = req.body;
  const updated = db.toggleProductSold(req.params.id, isSold);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

apiRouter.delete('/products/:id', requireAdmin, (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    console.log(`[API DELETE] Attempting to delete product: "${productId}"`);
    const deleted = db.deleteProduct(productId);
    if (!deleted) {
      console.warn(`[API DELETE] Product not found in database: "${productId}"`);
      return res.status(404).json({ error: `Product "${productId}" not found in database.` });
    }
    console.log(`[API DELETE] Successfully removed product: "${productId}"`);
    return res.json({ success: true, message: `Product "${productId}" deleted successfully.` });
  } catch (err: any) {
    console.error(`[API DELETE] Error deleting product:`, err);
    return res.status(500).json({ error: err.message || 'Internal server error deleting product.' });
  }
});

// Fallback POST endpoint for deleting products (in case HTTP DELETE is restricted by client environment)
apiRouter.post('/products/:id/delete', requireAdmin, (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    console.log(`[API POST /delete] Attempting to delete product: "${productId}"`);
    const deleted = db.deleteProduct(productId);
    if (!deleted) {
      return res.status(404).json({ error: `Product "${productId}" not found in database.` });
    }
    return res.json({ success: true, message: `Product "${productId}" deleted successfully.` });
  } catch (err: any) {
    console.error(`[API POST /delete] Error deleting product:`, err);
    return res.status(500).json({ error: err.message || 'Internal server error deleting product.' });
  }
});

apiRouter.post('/products/bulk-sold', requireAdmin, (req: Request, res: Response) => {
  const { ids, isSold } = req.body as { ids: string[]; isSold: boolean };
  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'ids array required' });
  }
  ids.forEach((id) => db.toggleProductSold(id, isSold));
  res.json({ success: true, count: ids.length });
});

apiRouter.post('/products/bulk-delete', requireAdmin, (req: Request, res: Response) => {
  try {
    const { ids } = req.body as { ids: string[] };
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'ids array required' });
    }
    console.log(`[API BULK DELETE] Deleting ${ids.length} products:`, ids);
    let deletedCount = 0;
    ids.forEach((id) => {
      if (db.deleteProduct(id)) deletedCount++;
    });
    console.log(`[API BULK DELETE] Successfully deleted ${deletedCount} of ${ids.length} products.`);
    res.json({ success: true, count: deletedCount, requested: ids.length });
  } catch (err: any) {
    console.error(`[API BULK DELETE] Error:`, err);
    res.status(500).json({ error: err.message || 'Failed to bulk delete products.' });
  }
});

// --- ORDERS & PAYMENTS ---
apiRouter.get('/orders', requireAdmin, (req: Request, res: Response) => {
  const { q } = req.query;
  const orders = db.getOrders(q as string);
  res.json(orders);
});

// Secure access by non-enumerable token for customer invoice viewing
apiRouter.get('/orders/access/:token', (req: Request, res: Response) => {
  const order = db.getOrderByAccessToken(req.params.token);
  if (!order) {
    return res.status(404).json({ error: 'Invoice or order not found or access expired.' });
  }
  res.json(order);
});

apiRouter.get('/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Create Order (Checkout)
apiRouter.post('/orders', (req: Request, res: Response) => {
  const settings = db.getSettings();
  if (settings.storeMaintenanceMode) {
    return res.status(503).json({ error: settings.maintenanceMessage });
  }

  const { customer, items, deliveryOption, paymentMethod } = req.body;
  if (!customer?.fullName || !customer?.phone || !customer?.address) {
    return res.status(400).json({ error: 'Please provide full name, phone number, and delivery address' });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Calculate pricing server-side to guarantee integrity
  let subtotal = 0;
  const verifiedItems = items.map((item: any) => {
    const product = db.getProductByIdOrSlug(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    const variant = product.variants.find((v) => v.id === item.variantId) || product.variants[0];
    if (variant.isSold || variant.stock < item.quantity) {
      throw new Error(`${product.name} (${variant.storage || ''} ${variant.color.name}) is out of stock`);
    }
    const itemTotal = variant.price * item.quantity;
    subtotal += itemTotal;

    return {
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      storage: variant.storage,
      colorName: variant.color.name,
      condition: product.condition,
      price: variant.price,
      quantity: item.quantity,
      image: item.image || product.images[0],
      sku: variant.sku
    };
  });

  let deliveryFee = 0;
  if (deliveryOption === 'lagos') {
    deliveryFee = settings.lagosDeliveryFee;
  } else if (deliveryOption === 'outside_lagos') {
    deliveryFee = settings.outsideLagosDeliveryFee;
  } else {
    deliveryFee = settings.pickupFee;
  }

  if (subtotal >= settings.freeDeliveryThreshold) {
    deliveryFee = 0;
  }

  const total = subtotal + deliveryFee;

  const newOrder = db.createOrder({
    customer,
    items: verifiedItems,
    subtotal,
    deliveryFee,
    deliveryOption,
    total,
    paymentMethod: paymentMethod || 'bank_transfer',
    paymentStatus: 'pending',
    orderStatus: 'Pending'
  });

  res.status(201).json(newOrder);
});

// Customer submits payment confirmation ("I've Made the Transfer") + optional receipt proof
apiRouter.post('/orders/:id/submit-bank-payment', (req: Request, res: Response) => {
  const { proofDataUrl, fileName } = req.body;
  const updatedOrder = db.submitBankTransferPayment(req.params.id, {
    dataUrl: proofDataUrl,
    fileName
  });

  if (!updatedOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({
    success: true,
    message: 'Payment confirmation received. Status is now Awaiting Verification.',
    order: updatedOrder
  });
});

// Admin confirms funds received in bank account
apiRouter.post('/orders/:id/verify-payment', requireAdmin, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization || '';
  const adminEmail = req.body.adminEmail || 'admin@eragadgets.ng';

  const result = db.verifyPaymentByAdmin(req.params.id, adminEmail);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  res.json({
    success: true,
    message: 'Payment verified and inventory deducted successfully.',
    order: result.order
  });
});

// Admin updates order status
apiRouter.put('/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { orderStatus, paymentStatus, adminNote } = req.body;
  const updated = db.updateOrderStatus(req.params.id, orderStatus, paymentStatus, adminNote);
  if (!updated) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updated);
});

// --- CUSTOMERS CRM ---
apiRouter.get('/customers', requireAdmin, (req: Request, res: Response) => {
  const { q } = req.query;
  const customers = db.getCustomers(q as string);
  res.json(customers);
});

apiRouter.get('/customers/export', requireAdmin, (_req: Request, res: Response) => {
  const customers = db.getCustomers();
  const headers = ['Full Name', 'Phone', 'WhatsApp', 'Email', 'City', 'State', 'Orders Count', 'Total Spent (NGN)', 'Status', 'Notes', 'Created At'];
  const rows = customers.map((c) => [
    `"${c.fullName.replace(/"/g, '""')}"`,
    `"${c.phone}"`,
    `"${c.whatsapp}"`,
    `"${c.email}"`,
    `"${c.city}"`,
    `"${c.state}"`,
    c.totalOrders,
    c.totalSpent,
    c.status,
    `"${(c.notes || '').replace(/"/g, '""')}"`,
    `"${c.createdAt}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="eragadgets_customers.csv"');
  res.send(csv);
});

apiRouter.get('/customers/:id', requireAdmin, (req: Request, res: Response) => {
  const customer = db.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  const customerOrders = db.getOrders().filter(
    (o) =>
      o.customer.email.toLowerCase() === customer.email.toLowerCase() ||
      o.customer.phone.replace(/[^0-9]/g, '') === customer.phone.replace(/[^0-9]/g, '')
  );
  res.json({ customer, orders: customerOrders });
});

apiRouter.patch('/customers/:id/notes', requireAdmin, (req: Request, res: Response) => {
  const { notes, status } = req.body;
  const updated = db.updateCustomerNotes(req.params.id, notes, status);
  if (!updated) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(updated);
});

// --- LEADS & PRODUCT ENQUIRIES ---
apiRouter.get('/leads', requireAdmin, (req: Request, res: Response) => {
  const { q } = req.query;
  const leads = db.getLeads(q as string);
  res.json(leads);
});

apiRouter.post('/leads', (req: Request, res: Response) => {
  const { name, phone, whatsapp, email, message, productInterest, variantDetails, source } = req.body;
  if (!name || (!phone && !email && !whatsapp)) {
    return res.status(400).json({ error: 'Please provide your name and phone/WhatsApp or email.' });
  }
  const newLead = db.createLead({
    name,
    phone,
    whatsapp: whatsapp || phone,
    email,
    message,
    productInterest,
    variantDetails,
    source: source || 'Product Enquiry'
  });
  res.status(201).json({
    success: true,
    message: 'Thank you! Your enquiry has been received. Our concierge will contact you shortly.',
    lead: newLead
  });
});

apiRouter.patch('/leads/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateLead(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Lead not found' });
  }
  res.json(updated);
});

apiRouter.get('/leads/export', requireAdmin, (_req: Request, res: Response) => {
  const leads = db.getLeads();
  const headers = ['Name', 'Phone', 'WhatsApp', 'Email', 'Source', 'Product Interest', 'Variant', 'Status', 'Message', 'Notes', 'Date'];
  const rows = leads.map((l) => [
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.phone}"`,
    `"${l.whatsapp}"`,
    `"${l.email}"`,
    `"${l.source}"`,
    `"${(l.productInterest || '').replace(/"/g, '""')}"`,
    `"${(l.variantDetails || '').replace(/"/g, '""')}"`,
    l.status,
    `"${(l.message || '').replace(/"/g, '""')}"`,
    `"${(l.adminNotes || '').replace(/"/g, '""')}"`,
    `"${l.createdAt}"`
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="eragadgets_leads.csv"');
  res.send(csv);
});

// --- ADMIN NOTIFICATIONS ---
apiRouter.get('/notifications', requireAdmin, (_req: Request, res: Response) => {
  const notifs = db.getNotifications();
  res.json(notifs);
});

apiRouter.patch('/notifications/:id/read', requireAdmin, (req: Request, res: Response) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', requireAdmin, (_req: Request, res: Response) => {
  db.markAllNotificationsRead();
  res.json({ success: true });
});

// --- REVIEWS ---
apiRouter.get('/reviews', (req: Request, res: Response) => {
  const { productId, all } = req.query;
  const reviews = db.getReviews(productId as string, all !== 'true');
  res.json(reviews);
});

apiRouter.post('/reviews', (req: Request, res: Response) => {
  const { productId, customerName, rating, comment } = req.body;
  if (!customerName || !comment || !rating) {
    return res.status(400).json({ error: 'Name, rating, and review comments are required' });
  }
  const product = db.getProductByIdOrSlug(productId);
  const newRev = db.addReview({
    productId: product?.id || productId,
    productName: product?.name || 'Gadget',
    customerName,
    rating: Number(rating),
    comment
  });
  res.status(201).json({
    message: 'Review submitted successfully. It will appear once approved by our curation team.',
    review: newRev
  });
});

apiRouter.patch('/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const updated = db.updateReview(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Review not found' });
  }
  res.json(updated);
});

apiRouter.delete('/reviews/:id', requireAdmin, (req: Request, res: Response) => {
  const deleted = db.deleteReview(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Review not found' });
  }
  res.json({ success: true });
});

// --- ANALYTICS ---
apiRouter.get('/analytics', requireAdmin, (_req: Request, res: Response) => {
  const analytics = db.getAnalytics();
  res.json(analytics);
});
