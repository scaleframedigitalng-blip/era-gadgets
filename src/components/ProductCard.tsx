import React from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatNaira, calculateDiscountPercentage } from '../lib/utils';
import { ArrowUpRight, Image as ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { openProduct } = useStore();

  const discount = calculateDiscountPercentage(product.basePrice, product.compareAtPrice);

  // Collect distinct colors from colorOptions or variants
  const distinctColors = React.useMemo(() => {
    if (product.colorOptions && product.colorOptions.length > 0) {
      return product.colorOptions;
    }
    return Array.from(
      new Map(product.variants.map((v) => [v.color.name, v.color])).values()
    );
  }, [product]);

  // Collect available storages
  const distinctStorages = React.useMemo(() => {
    if (product.storageOptions && product.storageOptions.length > 0) {
      return product.storageOptions.map((s) => s.capacity);
    }
    return Array.from(
      new Set(
        product.variants
          .map((v) => v.storage)
          .filter((s) => s && s !== 'None' && s !== 'Default')
      )
    );
  }, [product]);

  const validImages = React.useMemo(() => {
    if (!product.images) return [];
    return product.images.filter(
      (img) => Boolean(img && typeof img === 'string' && img.trim() && !img.startsWith('/src/assets/images/'))
    );
  }, [product.images]);

  const [activeCardImage, setActiveCardImage] = React.useState<string>(
    validImages[0] || ''
  );

  React.useEffect(() => {
    if (validImages.length > 0) {
      setActiveCardImage(validImages[0]);
    } else {
      setActiveCardImage('');
    }
  }, [validImages]);

  const displayImage = activeCardImage || validImages[0] || '';

  // Compute overall stock status
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const isOutOfStock = product.isSold || totalStock === 0;
  const isLowStock = !isOutOfStock && totalStock <= 3;

  return (
    <div
      onClick={() => openProduct(product.slug)}
      className="group cursor-pointer flex flex-col justify-between bg-white rounded-2xl p-4 sm:p-5 border border-neutral-100 hover:border-neutral-200/80 transition-all duration-300 hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-1 relative"
    >
      {/* Product Image Stage */}
      <div className="relative w-full aspect-square rounded-xl bg-[#F6F6F6] p-4 flex items-center justify-center overflow-hidden mb-4">
        {/* Subtle Badge (at most one quiet tag) */}
        {discount && !isOutOfStock ? (
          <span className="absolute top-3 left-3 text-[11px] font-semibold text-neutral-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded shadow-xs z-10">
            Save {discount}%
          </span>
        ) : product.badge && !isOutOfStock ? (
          <span className="absolute top-3 left-3 text-[11px] font-medium text-neutral-700 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded shadow-xs z-10">
            {product.badge}
          </span>
        ) : null}

        {isOutOfStock && (
          <span className="absolute top-3 left-3 text-[11px] font-medium text-rose-700 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded shadow-xs z-10">
            Sold Out
          </span>
        )}

        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-1.5 p-4 text-center">
            <ImageIcon className="w-8 h-8 text-neutral-300 stroke-[1.5]" />
            <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
              Image unavailable
            </span>
          </div>
        )}
      </div>

      {/* Product Meta */}
      <div className="flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Unboxed clean metadata */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1">
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.condition}</span>
          </div>

          <h3 className="text-sm sm:text-base font-semibold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Storages summary */}
          {distinctStorages.length > 0 && (
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {distinctStorages.join(' · ')}
            </p>
          )}
        </div>

        {/* Swatches & Availability */}
        <div className="flex items-center justify-between pt-1">
          {/* Color Dots with Hover/Click Switch */}
          <div className="flex items-center gap-1.5">
            {distinctColors.slice(0, 5).map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (c.image) setActiveCardImage(c.image);
                }}
                onMouseEnter={() => {
                  if (c.image) setActiveCardImage(c.image);
                }}
                title={`${c.name} (Click or hover to preview)`}
                className="w-3.5 h-3.5 rounded-full border border-black/20 hover:scale-125 transition-transform p-0"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            {distinctColors.length > 5 && (
              <span className="text-[10px] text-neutral-400">+{distinctColors.length - 5}</span>
            )}
          </div>

          {/* Stock Indicator */}
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              isOutOfStock
                ? 'text-rose-600'
                : isLowStock
                ? 'text-amber-600'
                : 'text-emerald-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOutOfStock
                  ? 'bg-rose-500'
                  : isLowStock
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
            {isOutOfStock ? 'Sold Out' : isLowStock ? 'Low Stock' : 'In Stock'}
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            <div className="text-sm sm:text-base font-bold text-neutral-950 tabular-nums">
              {formatNaira(product.basePrice)}
            </div>
            {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
              <div className="text-xs text-neutral-400 line-through tabular-nums">
                {formatNaira(product.compareAtPrice)}
              </div>
            )}
          </div>

          <button
            type="button"
            className="p-1.5 text-neutral-500 group-hover:text-neutral-950 group-hover:bg-neutral-100 rounded-full transition-colors"
            title="View Details"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
