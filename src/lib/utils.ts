import { Product, ProductVariant } from '../types';

export function formatNaira(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0
  }).format(amount).replace('NGN', '₦').trim();
}

export function generateWhatsAppOrderUrl(params: {
  phone: string;
  productName: string;
  storage?: string;
  color?: string;
  condition: string;
  price: number;
}): string {
  const cleanPhone = params.phone.replace(/[^0-9]/g, '');
  const details = [
    params.productName,
    params.storage && params.storage !== 'None' && params.storage !== 'Default' ? params.storage : null,
    params.color,
    params.condition,
    `listed at ${formatNaira(params.price)}`
  ]
    .filter(Boolean)
    .join(', ');

  const text = `Hello Era Gadgets, I'm interested in buying the ${details}. Please confirm availability and delivery to my location.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateGeneralWhatsAppUrl(phone: string, message = 'Hello Era Gadgets, I have an inquiry regarding your available devices.'): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function calculateDiscountPercentage(price: number, compareAtPrice?: number | null): number | null {
  if (!compareAtPrice || compareAtPrice <= price) return null;
  const discount = Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
  return discount > 0 ? discount : null;
}
