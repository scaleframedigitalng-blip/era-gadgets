import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductVariant, Review } from '../types';
import { formatNaira, generateWhatsAppOrderUrl, calculateDiscountPercentage } from '../lib/utils';
import { api } from '../lib/api';
import { ProductEnquiryModal } from '../components/ProductEnquiryModal';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  Star,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  Share2,
  ZoomIn,
  Clock,
  Sparkles,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductSlug,
    setCurrentView,
    addToCart,
    settings,
    openProduct
  } = useStore();

  const product = useMemo(() => {
    return products.find(
      (p) => p.slug === selectedProductSlug || p.id === selectedProductSlug
    ) || products[0];
  }, [products, selectedProductSlug]);

  // Selected variant state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeColorImage, setActiveColorImage] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'delivery'>('specs');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Valid product images from database (exclude any unwanted asset paths)
  const validImages = useMemo(() => {
    if (!product?.images) return [];
    return product.images.filter(
      (img) => Boolean(img && typeof img === 'string' && img.trim() && !img.startsWith('/src/assets/images/'))
    );
  }, [product]);

  // Initialize selected variant when product changes
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Pick first in-stock variant or first variant
      const firstInStock = product.variants.find((v) => !v.isSold && v.stock > 0) || product.variants[0];
      setSelectedVariant(firstInStock);
      setSelectedImageIndex(0);
      const initialImg = firstInStock?.color?.image || firstInStock?.image || validImages[0] || null;
      setActiveColorImage(initialImg);
    } else if (validImages.length > 0) {
      setSelectedImageIndex(0);
      setActiveColorImage(validImages[0]);
    } else {
      setSelectedImageIndex(0);
      setActiveColorImage(null);
    }
  }, [product, validImages]);

  // Load reviews for this product
  useEffect(() => {
    if (product) {
      api.getReviews(product.id).then(setReviews).catch(console.error);
    }
  }, [product]);

  // Storages and colors available
  const availableStorages = useMemo(() => {
    if (!product) return [];
    if (product.storageOptions && product.storageOptions.length > 0) {
      return product.storageOptions.map((s) => s.capacity);
    }
    return Array.from(
      new Set(product.variants.map((v) => v.storage).filter((s) => s && s !== 'None' && s !== 'Default'))
    );
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product) return [];
    if (product.colorOptions && product.colorOptions.length > 0) {
      return product.colorOptions;
    }
    return Array.from(
      new Map(product.variants.map((v) => [v.color.name, v.color])).values()
    );
  }, [product]);

  // When user clicks a storage: updates selected variant and triggers preset price
  const handleStorageSelect = (storage: string) => {
    if (!product) return;
    const currentColorName = selectedVariant?.color?.name || availableColors[0]?.name;
    const match =
      product.variants.find(
        (v) => v.storage === storage && v.color.name === currentColorName
      ) ||
      product.variants.find((v) => v.storage === storage) ||
      selectedVariant;

    if (match) {
      setSelectedVariant(match);
    }
  };

  // When user clicks a color: changes product image immediately & updates variant
  const handleColorSelect = (colorName: string) => {
    if (!product) return;
    const currentStorage = selectedVariant?.storage || availableStorages[0];
    const match =
      product.variants.find(
        (v) => v.color.name === colorName && v.storage === currentStorage
      ) ||
      product.variants.find((v) => v.color.name === colorName) ||
      selectedVariant;

    if (match) {
      setSelectedVariant(match);
    }

    // Look for image for this color
    const colorOpt = availableColors.find(
      (c) => c.name.toLowerCase() === colorName.toLowerCase()
    );
    const colorImg = colorOpt?.image || match?.color?.image || match?.image;

    if (colorImg && colorImg.trim() && !colorImg.startsWith('/src/assets/images/')) {
      setActiveColorImage(colorImg);
      const foundIdx = validImages.findIndex((img) => img === colorImg);
      if (foundIdx !== -1) {
        setSelectedImageIndex(foundIdx);
      }
    } else {
      setActiveColorImage(null);
    }
  };

  // The active main image to display on the stage
  const currentMainImage = useMemo(() => {
    if (activeColorImage && activeColorImage.trim() && !activeColorImage.startsWith('/src/assets/images/')) {
      return activeColorImage;
    }
    const colorOpt = availableColors.find(
      (c) => c.name.toLowerCase() === selectedVariant?.color?.name?.toLowerCase()
    );
    if (colorOpt?.image && colorOpt.image.trim() && !colorOpt.image.startsWith('/src/assets/images/')) {
      return colorOpt.image;
    }
    if (selectedVariant?.color?.image && selectedVariant.color.image.trim() && !selectedVariant.color.image.startsWith('/src/assets/images/')) {
      return selectedVariant.color.image;
    }
    if (selectedVariant?.image && selectedVariant.image.trim() && !selectedVariant.image.startsWith('/src/assets/images/')) {
      return selectedVariant.image;
    }
    if (validImages.length > 0) {
      return validImages[selectedImageIndex] || validImages[0];
    }
    return null;
  }, [activeColorImage, availableColors, selectedVariant, validImages, selectedImageIndex]);

  // Preset price determination for storage
  const currentPrice = useMemo(() => {
    if (!product) return 0;
    if (selectedVariant?.storage && product.storageOptions && product.storageOptions.length > 0) {
      const match = product.storageOptions.find((s) => s.capacity === selectedVariant.storage);
      if (match && match.presetPrice) {
        return match.presetPrice;
      }
    }
    return selectedVariant?.price ?? product.basePrice;
  }, [selectedVariant, product]);

  const currentCompareAt = useMemo(() => {
    if (!product) return null;
    if (selectedVariant?.storage && product.storageOptions && product.storageOptions.length > 0) {
      const match = product.storageOptions.find((s) => s.capacity === selectedVariant.storage);
      if (match && match.compareAtPrice) {
        return match.compareAtPrice;
      }
    }
    return selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  }, [selectedVariant, product]);
  const isOutOfStock = Boolean(product.isSold || !selectedVariant || selectedVariant.isSold || selectedVariant.stock === 0);
  const isLowStock = Boolean(!isOutOfStock && selectedVariant && selectedVariant.stock <= selectedVariant.lowStockThreshold);
  const discount = calculateDiscountPercentage(currentPrice, currentCompareAt);

  const whatsappUrl = generateWhatsAppOrderUrl({
    phone: settings?.whatsappNumber || '2348145550192',
    productName: product.name,
    storage: selectedVariant?.storage,
    color: selectedVariant?.color.name,
    condition: product.condition,
    price: currentPrice
  });

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    try {
      await api.submitReview({
        productId: product.id,
        productName: product.name,
        customerName: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment
      });
      setReviewSubmitted(true);
      setTimeout(() => {
        setShowReviewModal(false);
        setReviewSubmitted(false);
        setNewReview({ name: '', rating: 5, comment: '' });
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  return (
    <div className="pt-24 sm:pt-28 pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentView('shop')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Catalog</span>
        </button>

        <button
          onClick={handleShare}
          className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
        </button>
      </div>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left: Product Media Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/3 rounded-3xl bg-[#F6F6F6] p-6 sm:p-12 flex items-center justify-center overflow-hidden border border-neutral-100 shadow-2xs">
            {discount && !isOutOfStock && (
              <span className="absolute top-4 left-4 bg-neutral-900 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                Save {discount}%
              </span>
            )}
            {isOutOfStock && (
              <span className="absolute top-4 left-4 bg-rose-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-xs">
                Sold Out
              </span>
            )}

            {currentMainImage ? (
              <img
                src={currentMainImage}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain mix-blend-multiply transition-all duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-neutral-400 gap-3 py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-neutral-200/50 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-700">Image unavailable</p>
                  <p className="text-xs text-neutral-400 mt-0.5">No images uploaded for this gadget</p>
                </div>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {validImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {validImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedImageIndex(i);
                    setActiveColorImage(img);
                  }}
                  className={`w-18 h-18 rounded-xl bg-neutral-100 p-2 shrink-0 border-2 transition-all ${
                    (activeColorImage === img || (!activeColorImage && selectedImageIndex === i))
                      ? 'border-neutral-950 scale-95 shadow-sm'
                      : 'border-transparent hover:border-neutral-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Diagnostic & Inspection Quality Note */}
          <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-neutral-100 text-xs text-neutral-600 space-y-2">
            <h4 className="font-semibold text-neutral-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Era Diagnostic Verification
            </h4>
            <p className="leading-relaxed">
              Every unit has passed our mandatory inspection: original True Tone display, genuine battery performance, responsive Face ID/biometrics, unblocked IMEI, and zero software bypasses.
            </p>
          </div>
        </div>

        {/* Right: Contiguous Purchase Module (Sticky on desktop) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1.5">
              <span className="font-semibold text-neutral-800 uppercase tracking-wider">{product.brand}</span>
              <span>·</span>
              <span className="font-medium text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                {product.condition}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Pricing & Stock Status */}
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-between">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-neutral-950 tabular-nums">
                {formatNaira(currentPrice)}
              </div>
              {currentCompareAt && currentCompareAt > currentPrice && (
                <div className="text-xs text-neutral-400 line-through tabular-nums mt-0.5">
                  {formatNaira(currentCompareAt)}
                </div>
              )}
            </div>

            <div className="text-right">
              <span
                className={`text-xs font-semibold flex items-center gap-1.5 justify-end ${
                  isOutOfStock
                    ? 'text-rose-600'
                    : isLowStock
                    ? 'text-amber-600'
                    : 'text-emerald-700'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOutOfStock
                      ? 'bg-rose-500'
                      : isLowStock
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-emerald-500'
                  }`}
                />
                {isOutOfStock
                  ? 'Sold Out'
                  : isLowStock
                  ? `Low Stock (${selectedVariant?.stock} left)`
                  : 'In Stock (Victoria Island)'}
              </span>
              {selectedVariant?.sku && (
                <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  SKU: {selectedVariant.sku}
                </p>
              )}
            </div>
          </div>

          {/* Storage Selection */}
          {availableStorages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                <span>Storage Capacity</span>
                <span className="text-neutral-500 font-normal">{selectedVariant?.storage}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {availableStorages.map((storage) => {
                  const isSelected = selectedVariant?.storage === storage;
                  const storageOption = product.storageOptions?.find((s) => s.capacity === storage);
                  const presetPrice = storageOption?.presetPrice;
                  return (
                    <button
                      key={storage}
                      onClick={() => handleStorageSelect(storage)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border flex flex-col items-center justify-center text-center gap-0.5 ${
                        isSelected
                          ? 'border-neutral-950 bg-neutral-950 text-white shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-800 hover:border-neutral-400'
                      }`}
                    >
                      <span className="font-bold">{storage}</span>
                      {presetPrice ? (
                        <span
                          className={`text-[10px] font-medium tabular-nums ${
                            isSelected ? 'text-neutral-300' : 'text-neutral-500'
                          }`}
                        >
                          {formatNaira(presetPrice)}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Selection (Circular swatches with active ring & photo switch) */}
          {availableColors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-900">
                <span>Finish / Color</span>
                <span className="text-neutral-500 font-normal">
                  {selectedVariant?.color?.name || availableColors[0]?.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {availableColors.map((color) => {
                  const isSelected = selectedVariant?.color?.name === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => handleColorSelect(color.name)}
                      title={`${color.name} — Click to switch photo`}
                      className={`group relative p-1 rounded-full transition-transform flex items-center justify-center ${
                        isSelected
                          ? 'ring-2 ring-neutral-950 scale-110 shadow-xs'
                          : 'hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full block border border-black/20 shadow-xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      {isSelected && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions: Add to Bag, Buy Now & WhatsApp */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                if (selectedVariant && !isOutOfStock) {
                  // Ensure currentPrice and activeColorImage are preserved on cart item
                  const cartVariant: ProductVariant = {
                    ...selectedVariant,
                    price: currentPrice,
                    compareAtPrice: currentCompareAt,
                    image: currentMainImage || ''
                  };
                  addToCart(product, cartVariant);
                }
              }}
              disabled={isOutOfStock || Boolean(settings?.storeMaintenanceMode)}
              className="w-full py-3.5 px-6 rounded-full bg-neutral-950 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-6 rounded-full bg-[#128C7E] hover:bg-[#075E54] text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Order Directly on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={() => setShowEnquiryModal(true)}
              className="w-full py-3 px-6 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-neutral-600" />
              <span>Ask About This Product</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-100 text-xs text-neutral-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>Same-Day Lagos Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>100% Genuine Guaranteed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specs, Reviews, Delivery */}
      <div className="mt-16 pt-10 border-t border-neutral-200">
        <div className="flex items-center gap-6 border-b border-neutral-200 pb-3 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'specs' ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Technical Specifications
            {activeTab === 'specs' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-950" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'reviews' ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Customer Reviews ({reviews.length})
            {activeTab === 'reviews' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-950" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('delivery')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'delivery' ? 'text-neutral-950 font-bold' : 'text-neutral-400 hover:text-neutral-800'
            }`}
          >
            Delivery & Showroom Policy
            {activeTab === 'delivery' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-950" />
            )}
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'specs' && (
            <div className="max-w-3xl">
              <dl className="divide-y divide-neutral-100">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div key={key} className="py-3.5 grid grid-cols-3 text-xs sm:text-sm">
                    <dt className="font-semibold text-neutral-500">{key}</dt>
                    <dd className="col-span-2 text-neutral-900 font-medium">{val}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-6 pt-6 border-t border-neutral-100 text-xs text-neutral-500">
                <p>{product.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-neutral-950">Verified Buyer Feedback</h3>
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-semibold hover:bg-neutral-800"
                >
                  Write a Review
                </button>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">{rev.customerName}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 stroke-amber-400' : 'text-neutral-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-700 leading-relaxed">{rev.comment}</p>
                      <span className="text-[10px] text-neutral-400 block">
                        Verified Purchase · {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-500 py-6">
                  No public reviews for this product yet. Be the first verified customer to leave feedback!
                </p>
              )}
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="max-w-3xl space-y-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
              <h4 className="text-base font-bold text-neutral-950">Nationwide Transit & Showroom Access</h4>
              <p>
                <strong>Lagos State:</strong> Instant dispatched via private motorcycle or secured van. Typical delivery within 2 to 4 hours across Victoria Island, Ikoyi, Lekki, Ikeja, Yaba, Surulere, and Magodo.
              </p>
              <p>
                <strong>Outside Lagos:</strong> Dispatched via insured express air courier (DHL Express or GIGL priority) with SMS/WhatsApp tracking number. Arrives in Abuja, Port Harcourt, Enugu, Ibadan within 24 to 48 hours.
              </p>
              <p>
                <strong>Self-Pickup:</strong> Order online and select Showroom Collection to inspect and unbox your gadget directly at our flagship showroom in Victoria Island.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-neutral-950">Review {product.name}</h3>
            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl text-center">
                Thank you! Your review has been submitted for verification.
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-xs"
                    placeholder="e.g. Babatunde Lawal"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">Rating</label>
                  <select
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-xs"
                  >
                    <option value={5}>5 Stars - Pristine / Outstanding</option>
                    <option value={4}>4 Stars - Very Good</option>
                    <option value={3}>3 Stars - Good</option>
                    <option value={2}>2 Stars - Fair</option>
                    <option value={1}>1 Star - Needs Improvement</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-800 block mb-1">Review Details</label>
                  <textarea
                    rows={3}
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full p-2.5 border border-neutral-300 rounded-lg text-xs"
                    placeholder="Share your experience regarding device condition, delivery speed, and performance..."
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold bg-neutral-950 text-white rounded-lg hover:bg-neutral-800"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Product Enquiry Modal */}
      {showEnquiryModal && (
        <ProductEnquiryModal
          product={product}
          variant={selectedVariant}
          onClose={() => setShowEnquiryModal(false)}
        />
      )}

      {/* Sticky Bottom Bar on Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-neutral-200 p-3.5 px-5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-neutral-500 uppercase font-semibold">Total</span>
          <div className="text-base font-bold text-neutral-950 tabular-nums">
            {formatNaira(currentPrice)}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectedVariant && !isOutOfStock) {
                addToCart(product, selectedVariant);
              }
            }}
            disabled={isOutOfStock}
            className="px-4 py-2.5 rounded-full bg-neutral-950 text-white text-xs font-semibold hover:bg-neutral-800 disabled:bg-neutral-300"
          >
            {isOutOfStock ? 'Sold Out' : 'Add to Bag'}
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 rounded-full bg-[#128C7E] text-white"
            title="Order on WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
