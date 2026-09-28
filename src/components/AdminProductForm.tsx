import React, { useState, useMemo } from 'react';
import { Product, ProductVariant, ColorOption, StorageOption, StoreSettings } from '../types';
import { formatNaira } from '../lib/utils';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  Tag,
  DollarSign,
  Info,
  HardDrive,
  Palette,
  ExternalLink,
  Eye,
  RefreshCw
} from 'lucide-react';

interface AdminProductFormProps {
  initialProduct: Partial<Product> | null;
  isEditing: boolean;
  onSave: (product: Partial<Product>) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: string) => Promise<void>;
  settings?: StoreSettings | null;
}

const PRESET_POPULAR_COLORS: ColorOption[] = [
  { name: 'Space Black', hex: '#1F2022' },
  { name: 'Silver', hex: '#E8E8ED' },
  { name: 'Natural Titanium', hex: '#9E9991' },
  { name: 'Desert Titanium', hex: '#C5B097' },
  { name: 'Black Titanium', hex: '#1F2022' },
  { name: 'White Titanium', hex: '#E3E4E5' },
  { name: 'Glacier Blue', hex: '#80B3C4' },
  { name: 'Burgundy', hex: '#631826' },
  { name: 'Midnight', hex: '#1C2530' },
  { name: 'Starlight', hex: '#F0EFEA' },
  { name: 'Gold', hex: '#F5E7C8' }
];

const CATEGORIES = [
  'iPhone',
  'Samsung',
  'Mac',
  'iPad',
  'Laptops',
  'Accessories',
  'Smartwatches',
  'Audio',
  'Gaming'
];

const BRANDS = ['Apple', 'Samsung', 'Google', 'Sony', 'Dell', 'HP', 'Microsoft', 'Asus', 'Other'];

export const AdminProductForm: React.FC<AdminProductFormProps> = ({
  initialProduct,
  isEditing,
  onSave,
  onCancel,
  onDelete
}) => {
  // Main product details
  const [name, setName] = useState(initialProduct?.name || '');
  const [brand, setBrand] = useState(initialProduct?.brand || 'Apple');
  const [category, setCategory] = useState(initialProduct?.category || 'iPhone');
  const [condition, setCondition] = useState<Product['condition']>(
    initialProduct?.condition || 'Brand New'
  );
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.shortDescription || ''
  );
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [badge, setBadge] = useState<Product['badge']>(initialProduct?.badge || 'New');
  const [status, setStatus] = useState<Product['status']>(initialProduct?.status || 'Published');
  const [isSold, setIsSold] = useState<boolean>(initialProduct?.isSold || false);
  const [featured, setFeatured] = useState<boolean>(initialProduct?.featured ?? true);
  const [costPrice, setCostPrice] = useState<number | null>(initialProduct?.costPrice ?? null);

  // 1. COLOR OPTIONS (Each color has its name, hex swatch, and assigned photo!)
  const [colorOptions, setColorOptions] = useState<ColorOption[]>(() => {
    if (initialProduct?.colorOptions && initialProduct.colorOptions.length > 0) {
      return initialProduct.colorOptions.map((c) => ({
        ...c,
        image: c.image && !c.image.startsWith('/src/assets/images/') ? c.image : ''
      }));
    }
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      const map = new Map<string, ColorOption>();
      initialProduct.variants.forEach((v) => {
        if (!map.has(v.color.name)) {
          const colImg = v.color.image || v.image || '';
          map.set(v.color.name, {
            name: v.color.name,
            hex: v.color.hex,
            image: colImg && !colImg.startsWith('/src/assets/images/') ? colImg : ''
          });
        }
      });
      if (map.size > 0) return Array.from(map.values());
    }
    return [
      {
        name: 'Standard',
        hex: '#111111',
        image: ''
      }
    ];
  });

  // 2. STORAGE LISTINGS & PRESET PRICES (Each storage has its capacity & preset price)
  const [storageOptions, setStorageOptions] = useState<StorageOption[]>(() => {
    if (initialProduct?.storageOptions && initialProduct.storageOptions.length > 0) {
      return initialProduct.storageOptions;
    }
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      const storagesMap = new Map<string, StorageOption>();
      initialProduct.variants.forEach((v) => {
        if (v.storage && v.storage !== 'None' && !storagesMap.has(v.storage)) {
          storagesMap.set(v.storage, {
            capacity: v.storage,
            presetPrice: v.price || initialProduct.basePrice || 2500000,
            compareAtPrice: v.compareAtPrice || initialProduct.compareAtPrice || null
          });
        }
      });
      if (storagesMap.size > 0) return Array.from(storagesMap.values());
    }
    const base = initialProduct?.basePrice || 2500000;
    return [
      { capacity: '128GB', presetPrice: base, compareAtPrice: base + 200000 },
      { capacity: '256GB', presetPrice: base + 350000, compareAtPrice: base + 550000 }
    ];
  });

  // Base and Compare prices automatically derive from lowest storage preset price
  const basePrice = useMemo(() => {
    if (storageOptions.length > 0) {
      return storageOptions[0].presetPrice;
    }
    return initialProduct?.basePrice || 0;
  }, [storageOptions, initialProduct]);

  const compareAtPrice = useMemo(() => {
    if (storageOptions.length > 0 && storageOptions[0].compareAtPrice) {
      return storageOptions[0].compareAtPrice;
    }
    return initialProduct?.compareAtPrice ?? null;
  }, [storageOptions, initialProduct]);

  // General additional media gallery
  const [extraImages, setExtraImages] = useState<string[]>(() => {
    if (!initialProduct?.images) return [];
    return initialProduct.images.filter((img) => !img.startsWith('/src/assets/images/'));
  });
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Variants state (Granular matrix combining colors and storages)
  const [variants, setVariants] = useState<ProductVariant[]>(() => {
    if (initialProduct?.variants && initialProduct.variants.length > 0) {
      return initialProduct.variants.map((v) => ({
        ...v,
        image: v.image && !v.image.startsWith('/src/assets/images/') ? v.image : '',
        color: {
          ...v.color,
          image: v.color?.image && !v.color.image.startsWith('/src/assets/images/') ? v.color.image : ''
        }
      }));
    }
    return [];
  });

  const [initialStockPerVariant, setInitialStockPerVariant] = useState(4);

  // Technical Specs state
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>(() => {
    if (initialProduct?.specs && Object.keys(initialProduct.specs).length > 0) {
      return Object.entries(initialProduct.specs).map(([key, value]) => ({ key, value }));
    }
    return [
      { key: 'Display', value: 'High Resolution OLED HDR 120Hz ProMotion' },
      { key: 'Processor', value: 'Latest Generation High-Performance Flagship Chip' },
      { key: 'Battery', value: 'All-Day Battery Performance with Fast Charging' },
      { key: 'Warranty', value: '1 Year Era Gadgets Premium Warranty' }
    ];
  });

  // LIVE SIMULATOR STATE (Test clicking colors & storages right in the admin panel!)
  const [previewColorName, setPreviewColorName] = useState<string>(() => {
    return colorOptions[0]?.name || '';
  });
  const [previewStorageCapacity, setPreviewStorageCapacity] = useState<string>(() => {
    return storageOptions[0]?.capacity || '';
  });

  // Active preview image changes dynamically when previewColorName changes!
  const activePreviewImage = useMemo(() => {
    const matchedColor = colorOptions.find((c) => c.name.toLowerCase() === previewColorName.toLowerCase());
    if (matchedColor?.image && !matchedColor.image.startsWith('/src/assets/images/')) {
      return matchedColor.image;
    }
    if (extraImages.length > 0 && !extraImages[0].startsWith('/src/assets/images/')) {
      return extraImages[0];
    }
    return null;
  }, [previewColorName, colorOptions, extraImages]);

  // Active preview price changes dynamically when previewStorageCapacity changes!
  const activePreviewPrice = useMemo(() => {
    const matchedStorage = storageOptions.find(
      (s) => s.capacity.toLowerCase() === previewStorageCapacity.toLowerCase()
    );
    if (matchedStorage?.presetPrice) return matchedStorage.presetPrice;
    return basePrice;
  }, [previewStorageCapacity, storageOptions, basePrice]);

  // UI state
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // -------------------------------------------------------------
  // COLOR OPTIONS ACTIONS
  // -------------------------------------------------------------
  const handleAddColorOption = (preset?: ColorOption) => {
    if (preset) {
      if (colorOptions.some((c) => c.name.toLowerCase() === preset.name.toLowerCase())) {
        setSuccessToast(`Color "${preset.name}" is already in your options list.`);
        return;
      }
      const newPresetColor: ColorOption = {
        name: preset.name,
        hex: preset.hex,
        image: ''
      };
      setColorOptions((prev) => [...prev, newPresetColor]);
      setPreviewColorName(preset.name);
      return;
    }
    const newColor: ColorOption = {
      name: `Color ${colorOptions.length + 1}`,
      hex: '#2B2B2B',
      image: ''
    };
    setColorOptions((prev) => [...prev, newColor]);
    setPreviewColorName(newColor.name);
  };

  const handleUpdateColor = (index: number, updates: Partial<ColorOption>) => {
    setColorOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleRemoveColor = (index: number) => {
    if (colorOptions.length === 1) {
      setErrorMsg('A gadget must have at least one color option.');
      return;
    }
    const removed = colorOptions[index];
    setColorOptions((prev) => prev.filter((_, idx) => idx !== index));
    if (previewColorName === removed.name && colorOptions.length > 1) {
      const nextColor = colorOptions[index === 0 ? 1 : 0];
      setPreviewColorName(nextColor.name);
    }
  };

  const handleColorImageUpload = (
    colorIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Photo is larger than 8MB. Please choose a photo under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        handleUpdateColor(colorIndex, { image: dataUrl });
        setPreviewColorName(colorOptions[colorIndex].name);
        setSuccessToast(`Uploaded photo for ${colorOptions[colorIndex].name}!`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // -------------------------------------------------------------
  // STORAGE LISTING ACTIONS
  // -------------------------------------------------------------
  const handleAddStorageTier = (capacityStr?: string, customPresetPrice?: number) => {
    const cap = capacityStr || `${128 * Math.pow(2, storageOptions.length)}GB`;
    if (storageOptions.some((s) => s.capacity.toLowerCase() === cap.toLowerCase())) {
      setErrorMsg(`Storage tier "${cap}" is already added.`);
      return;
    }
    const calculatedPrice =
      customPresetPrice ||
      (storageOptions.length > 0
        ? storageOptions[storageOptions.length - 1].presetPrice + 350000
        : 2500000);

    const newTier: StorageOption = {
      capacity: cap,
      presetPrice: calculatedPrice,
      compareAtPrice: calculatedPrice + 200000
    };

    setStorageOptions((prev) => [...prev, newTier]);
    setPreviewStorageCapacity(cap);
    setSuccessToast(`Added storage tier ${cap} with preset price ${formatNaira(calculatedPrice)}`);
  };

  const handleUpdateStorage = (index: number, updates: Partial<StorageOption>) => {
    setStorageOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  const handleRemoveStorage = (index: number) => {
    if (storageOptions.length === 1) {
      setErrorMsg('A gadget must have at least one storage capacity.');
      return;
    }
    const removed = storageOptions[index];
    setStorageOptions((prev) => prev.filter((_, idx) => idx !== index));
    if (previewStorageCapacity === removed.capacity && storageOptions.length > 1) {
      const nextTier = storageOptions[index === 0 ? 1 : 0];
      setPreviewStorageCapacity(nextTier.capacity);
    }
  };

  // -------------------------------------------------------------
  // SYNCHRONIZE VARIANTS MATRIX
  // Multiplies Storage Capacities x Color Options:
  // Each storage gets its PRESET PRICE. Each color gets its PHOTO.
  // -------------------------------------------------------------
  const handleSyncVariantsMatrix = () => {
    if (storageOptions.length === 0) {
      setErrorMsg('Please specify at least one storage listing.');
      return;
    }
    if (colorOptions.length === 0) {
      setErrorMsg('Please specify at least one color option.');
      return;
    }

    const generated: ProductVariant[] = [];
    const cleanName = (name || 'GADGET')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);

    storageOptions.forEach((st) => {
      colorOptions.forEach((col) => {
        const colorSlug = col.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .slice(0, 3);
        const storageSlug = st.capacity.toUpperCase().replace(/[^A-Z0-9]/g, '');

        // Preserve stock if variant previously existed
        const existing = variants.find(
          (v) =>
            v.storage.toLowerCase() === st.capacity.toLowerCase() &&
            v.color.name.toLowerCase() === col.name.toLowerCase()
        );

        generated.push({
          id: existing?.id || `v-${cleanName}-${storageSlug}-${colorSlug}`.toLowerCase(),
          storage: st.capacity,
          color: {
            name: col.name,
            hex: col.hex,
            image: col.image
          },
          image: col.image || extraImages[0],
          sku: existing?.sku || `ERA-${cleanName}-${storageSlug}-${colorSlug}`,
          price: st.presetPrice,
          compareAtPrice: st.compareAtPrice,
          stock: existing ? existing.stock : initialStockPerVariant,
          lowStockThreshold: existing ? existing.lowStockThreshold : 1,
          isSold: existing ? existing.isSold : false
        });
      });
    });

    setVariants(generated);
    setSuccessToast(
      `Synchronized ${generated.length} variant combinations! Each storage has its preset price, and each color has its photo.`
    );
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length === 1) {
      setErrorMsg('At least one inventory variant is required.');
      return;
    }
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // SPECS ROW HELPERS
  // -------------------------------------------------------------
  const handleAddSpecRow = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleUpdateSpecRow = (index: number, field: 'key' | 'value', text: string) => {
    setSpecs((prev) => {
      const next = [...prev];
      next[index][field] = text;
      return next;
    });
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // GALLERY IMAGE ACTIONS
  // -------------------------------------------------------------
  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Photo is larger than 8MB. Please choose a photo under 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        setExtraImages((prev) => [...prev, dataUrl]);
        setSuccessToast('Uploaded additional gallery image!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setExtraImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput('');
    setSuccessToast('Added image URL to gallery!');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  // -------------------------------------------------------------
  // SUBMISSION
  // -------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessToast('');

    if (!name.trim()) {
      setErrorMsg('Product model name is required (e.g. iPhone 18 Pro Max).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (storageOptions.length === 0) {
      setErrorMsg('Please add at least one storage capacity with its preset price.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (colorOptions.length === 0) {
      setErrorMsg('Please add at least one color option.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Build specs dictionary
    const specsMap: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsMap[s.key.trim()] = s.value.trim();
      }
    });

    // Collect all unique images from color options and gallery (filtering out any unwanted defaults)
    const gatheredImages: string[] = [];
    colorOptions.forEach((c) => {
      if (c.image && c.image.trim() && !c.image.startsWith('/src/assets/images/') && !gatheredImages.includes(c.image.trim())) {
        gatheredImages.push(c.image.trim());
      }
    });
    extraImages.forEach((img) => {
      if (img && img.trim() && !img.startsWith('/src/assets/images/') && !gatheredImages.includes(img.trim())) {
        gatheredImages.push(img.trim());
      }
    });

    // Automatically sync or prepare variants
    let finalVariants = variants;
    if (finalVariants.length === 0) {
      finalVariants = [];
      const cleanName = (name || 'GADGET')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6);
      storageOptions.forEach((st) => {
        colorOptions.forEach((col) => {
          const colSlug = col.name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 3).toUpperCase();
          const stSlug = st.capacity.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          finalVariants.push({
            id: `v-${cleanName}-${stSlug}-${colSlug}`.toLowerCase(),
            storage: st.capacity,
            color: { name: col.name, hex: col.hex, image: col.image || '' },
            image: col.image || gatheredImages[0] || '',
            sku: `ERA-${cleanName}-${stSlug}-${colSlug}`,
            price: st.presetPrice,
            compareAtPrice: st.compareAtPrice,
            stock: initialStockPerVariant,
            lowStockThreshold: 1,
            isSold: false
          });
        });
      });
    }

    const payload: Partial<Product> = {
      ...(initialProduct?.id ? { id: initialProduct.id, slug: initialProduct.slug } : {}),
      name: name.trim(),
      brand: brand.trim(),
      category: category.trim(),
      condition,
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      basePrice: storageOptions[0].presetPrice,
      compareAtPrice: storageOptions[0].compareAtPrice,
      costPrice: costPrice ? Number(costPrice) : null,
      badge,
      status,
      isSold,
      featured,
      images: gatheredImages,
      specs: specsMap,
      colorOptions,
      storageOptions,
      variants: finalVariants
    };

    setSaving(true);
    try {
      await onSave(payload);
      setSuccessToast(
        isEditing
          ? `Product "${name}" updated successfully with color photos and storage preset prices!`
          : `Published "${name}" with all color images and storage preset prices!`
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save product. Please check connection and try again.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!initialProduct?.id || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(initialProduct.id);
      setShowDeleteModal(false);
    } catch (err: any) {
      setErrorMsg(`Failed to delete product: ${err.message}`);
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors"
            title="Return to Product List"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                {isEditing ? 'Editing Catalog Model' : 'New Listing'}
              </span>
              <span className="text-xs text-neutral-400">·</span>
              <span className="text-xs text-neutral-500 font-medium">{brand || 'Apple'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-950">
              {name || 'Add New Gadget'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isEditing && initialProduct?.id && onDelete && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Product</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || isDeleting}
            className="px-5 py-2 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Publish to Store'}</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{errorMsg}</div>
        </div>
      )}

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-3 shadow-2xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{successToast}</div>
        </div>
      )}

      {/* ============================================================== */}
      {/* FEATURE: INTERACTIVE STOREFRONT LIVE SIMULATOR                 */}
      {/* Test clicking colors (changes photo) and storages (preset price) */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white p-6 rounded-3xl shadow-lg border border-neutral-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Live Customer Simulator
              </span>
              <span className="text-xs text-neutral-400">Interactive Preview</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              Click a color below to see the photo change. Click a storage to see the preset price change.
            </h2>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider block">Live Price</span>
            <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums text-emerald-400">
              {formatNaira(activePreviewPrice)}
            </span>
          </div>
        </div>

        {/* Simulator Interactive Stage */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-center">
          {/* Photo Display (Switches with Color Selection!) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
              {activePreviewImage ? (
                <img
                  src={activePreviewImage}
                  alt={previewColorName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain drop-shadow-xl transition-all duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-neutral-400 gap-2 p-6 text-center">
                  <ImageIcon className="w-10 h-10 text-neutral-500" />
                  <span className="text-xs text-neutral-400 font-medium">
                    No photo uploaded for {previewColorName || 'this finish'}
                  </span>
                </div>
              )}
            </div>
            <div className="mt-3 text-center">
              <span className="text-xs font-semibold text-neutral-200">
                Current Photo:{' '}
                <span className="text-amber-400 font-bold">{previewColorName}</span>
              </span>
            </div>
          </div>

          {/* Interactive Controls Stage */}
          <div className="md:col-span-7 space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                <span className="uppercase tracking-wider font-semibold text-neutral-300">{brand}</span>
                <span>·</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-neutral-200">{condition}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {name || 'Model Name (e.g. iPhone 18 Pro Max)'}
              </h3>
            </div>

            {/* Test Color Clicking */}
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                  Select Color Finish (Changes Photo):
                </span>
                <span className="text-amber-300 font-bold">{previewColorName}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {colorOptions.map((c) => {
                  const isSelected = c.name.toLowerCase() === previewColorName.toLowerCase();
                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setPreviewColorName(c.name)}
                      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-white text-neutral-950 border-white shadow-md scale-105'
                          : 'bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/30 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-neutral-950" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Storage Clicking */}
            <div className="space-y-2 bg-white/5 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-200 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  Select Storage Capacity (Switches Preset Price):
                </span>
                <span className="text-emerald-400 font-bold tabular-nums">
                  {formatNaira(activePreviewPrice)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {storageOptions.map((s) => {
                  const isSelected =
                    s.capacity.toLowerCase() === previewStorageCapacity.toLowerCase();
                  return (
                    <button
                      key={s.capacity}
                      type="button"
                      onClick={() => setPreviewStorageCapacity(s.capacity)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center flex flex-col items-center justify-center gap-0.5 ${
                        isSelected
                          ? 'bg-emerald-500 text-neutral-950 border-emerald-400 shadow-md font-bold'
                          : 'bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <span>{s.capacity}</span>
                      <span
                        className={`text-[10px] font-normal tabular-nums ${
                          isSelected ? 'text-neutral-900 font-semibold' : 'text-neutral-400'
                        }`}
                      >
                        {formatNaira(s.presetPrice)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ============================================================== */}
        {/* SECTION 1: BASIC INFORMATION                                   */}
        {/* ============================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-900" />
              <h2 className="text-sm font-bold text-neutral-950">Basic Details & Categorization</h2>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">Step 1 of 5</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Product Title / Model Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. iPhone 18 Pro Max"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 focus:ring-1 focus:ring-neutral-950 font-bold"
              />
            </div>

            {/* Brand */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Brand <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
                <div className="flex flex-wrap gap-1.5">
                  {BRANDS.map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setBrand(b)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                        brand === b
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Store Category <span className="text-rose-500">*</span>
              </label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. iPhone"
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
                />
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                        category === cat
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Hardware Condition <span className="text-rose-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as Product['condition'])}
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 bg-white"
              >
                <option value="Brand New">Brand New (Factory Sealed)</option>
                <option value="Open Box">Open Box (Pristine 100% Battery)</option>
                <option value="UK Used">UK Used (Grade A+ Pristine)</option>
                <option value="US Used">US Used (Clean & Tested)</option>
                <option value="Refurbished">Certified Refurbished</option>
              </select>
            </div>

            {/* Status & Featured */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Product['status'])}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 bg-white"
                >
                  <option value="Published">Published (Live in Store)</option>
                  <option value="Draft">Draft (Hidden)</option>
                  <option value="Archived">Archived</option>
                  <option value="Sold Out">Sold Out</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">Badge</label>
                <select
                  value={badge || ''}
                  onChange={(e) => setBadge((e.target.value || null) as Product['badge'])}
                  className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950 bg-white"
                >
                  <option value="">No Badge</option>
                  <option value="New">New Release</option>
                  <option value="Best Seller">Best Seller</option>
                  <option value="Limited">Limited Edition</option>
                  <option value="Sale">Special Offer</option>
                  <option value="Low Stock">Low Stock</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: COLOR OPTIONS & PER-COLOR PRODUCT PHOTOS            */}
        {/* User Request: Put different color options and anytime someone  */}
        {/* clicks a color, the product image will change.                 */}
        {/* ============================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950">
                  Color Options & Color-Specific Photography ({colorOptions.length})
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Attach a showroom photo to each color. When customer or admin clicks that color, the gadget photo updates instantly.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddColorOption()}
              className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Color Option</span>
            </button>
          </div>

          {/* Quick-Pick Popular Colors */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-2">
            <span className="text-[11px] font-bold text-neutral-700 block">
              1-Click Add Popular Finishes:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_POPULAR_COLORS.map((preset) => {
                const alreadyAdded = colorOptions.some(
                  (c) => c.name.toLowerCase() === preset.name.toLowerCase()
                );
                return (
                  <button
                    type="button"
                    key={preset.name}
                    onClick={() => handleAddColorOption(preset)}
                    className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      alreadyAdded
                        ? 'bg-neutral-200 text-neutral-500 border-transparent cursor-default'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-900 shadow-2xs'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/20"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span>{preset.name}</span>
                    {alreadyAdded ? (
                      <Check className="w-3 h-3 text-neutral-400" />
                    ) : (
                      <span className="text-[10px] text-emerald-600 font-bold">+Add</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Options List with Per-Color Photos */}
          <div className="space-y-4">
            {colorOptions.map((col, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Swatch & Name */}
                <div className="flex items-center gap-3 min-w-[220px]">
                  <div className="relative">
                    <input
                      type="color"
                      value={col.hex}
                      onChange={(e) => handleUpdateColor(index, { hex: e.target.value })}
                      className="w-9 h-9 rounded-xl cursor-pointer border border-neutral-300 p-0.5 bg-white shadow-2xs"
                      title="Choose Swatch Hex"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      Finish Name
                    </label>
                    <input
                      type="text"
                      value={col.name}
                      onChange={(e) => handleUpdateColor(index, { name: e.target.value })}
                      placeholder="e.g. Desert Titanium"
                      className="p-1.5 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 bg-white w-full focus:outline-none focus:border-neutral-950"
                    />
                  </div>
                </div>

                {/* Middle: Assigned Photo for this Color */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-3 rounded-xl border border-neutral-200">
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 p-1 shrink-0 flex items-center justify-center overflow-hidden border border-neutral-200">
                    {col.image ? (
                      <img
                        src={col.image}
                        alt={col.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-300" />
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-neutral-800">
                        {col.image ? 'Photo Connected' : 'No Photo Assigned'}
                      </span>
                      {col.image && (
                        <button
                          type="button"
                          onClick={() => setPreviewColorName(col.name)}
                          className="text-[11px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Test in Live Simulator</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Device Upload */}
                      <label className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3 h-3 text-neutral-500" />
                        <span>Upload Device Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleColorImageUpload(index, e)}
                          className="hidden"
                        />
                      </label>

                      {col.image && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateColor(index, { image: '' });
                            setPreviewColorName(col.name);
                          }}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Remove Photo
                        </button>
                      )}

                      {/* Direct URL Input Toggle */}
                      <input
                        type="url"
                        placeholder="Or paste image URL"
                        value={col.image?.startsWith('http') ? col.image : ''}
                        onChange={(e) => handleUpdateColor(index, { image: e.target.value })}
                        className="p-1 border border-neutral-200 rounded-lg text-[11px] flex-1 min-w-[140px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Delete Color"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2B: ADDITIONAL PRODUCT GALLERY PHOTOS                  */}
        {/* ============================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-sky-600" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950">
                  Additional Gallery Photos ({extraImages.length})
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Upload additional product angles or unboxing photos. Only photos explicitly added here will be shown on the storefront.
                </p>
              </div>
            </div>

            <label className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto">
              <Upload className="w-3.5 h-3.5" />
              <span>+ Upload Gallery Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleGalleryImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Quick URL Input */}
          <div className="flex items-center gap-2">
            <input
              type="url"
              placeholder="Or paste an image URL (https://...)"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              className="p-2 border border-neutral-200 rounded-xl text-xs flex-1 focus:outline-none focus:border-neutral-950"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              disabled={!imageUrlInput.trim()}
              className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 text-neutral-800 rounded-xl text-xs font-semibold transition-colors"
            >
              Add URL
            </button>
          </div>

          {/* Uploaded Gallery Photos Grid */}
          {extraImages.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-neutral-200 rounded-2xl text-center">
              <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-600">No additional gallery photos</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Each color finish can also have its own specific photo in the Color section above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {extraImages.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl border border-neutral-200 p-1.5 bg-neutral-50 aspect-square flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-rose-50 text-neutral-500 hover:text-rose-600 rounded-lg shadow-xs transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* SECTION 3: STORAGE CAPACITIES & PRESET PRICES                  */}
        {/* User Request: Different storage listing and anytime someone    */}
        {/* clicks a storage, there's a preset price.                      */}
        {/* ============================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950">
                  Storage Capacities & Preset Pricing ({storageOptions.length})
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Define exact selling prices for each storage capacity. Clicking a storage on the storefront instantly sets this preset price.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAddStorageTier()}
              className="px-3.5 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Storage Tier</span>
            </button>
          </div>

          {/* Quick-Add Storage Buttons */}
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-2">
            <span className="text-[11px] font-bold text-neutral-700 block">
              1-Click Add Standard Capacity Tiers:
            </span>
            <div className="flex flex-wrap gap-2">
              {['128GB', '256GB', '512GB', '1TB', '2TB'].map((cap) => {
                const alreadyAdded = storageOptions.some(
                  (s) => s.capacity.toLowerCase() === cap.toLowerCase()
                );
                return (
                  <button
                    type="button"
                    key={cap}
                    disabled={alreadyAdded}
                    onClick={() => handleAddStorageTier(cap)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      alreadyAdded
                        ? 'bg-neutral-200 text-neutral-500 border-transparent cursor-default'
                        : 'bg-white text-neutral-800 border-neutral-200 hover:border-neutral-900 shadow-2xs'
                    }`}
                  >
                    <span>+{cap}</span>
                    {alreadyAdded && <Check className="w-3 h-3 ml-1 inline text-neutral-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage Tiers Grid */}
          <div className="space-y-3">
            {storageOptions.map((tier, index) => (
              <div
                key={index}
                className="p-4 rounded-2xl border border-neutral-200 bg-neutral-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Storage Capacity Input */}
                <div className="w-full sm:w-1/4">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Capacity
                  </label>
                  <input
                    type="text"
                    value={tier.capacity}
                    onChange={(e) => handleUpdateStorage(index, { capacity: e.target.value })}
                    placeholder="e.g. 256GB"
                    className="w-full p-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-900 bg-white focus:outline-none focus:border-neutral-950"
                  />
                </div>

                {/* Preset Selling Price */}
                <div className="w-full sm:w-1/3">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Preset Selling Price (₦) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="5000"
                      min="0"
                      value={tier.presetPrice}
                      onChange={(e) =>
                        handleUpdateStorage(index, { presetPrice: Number(e.target.value) })
                      }
                      className="w-full p-2 border border-neutral-300 rounded-xl text-xs font-bold text-neutral-950 bg-white focus:outline-none focus:border-neutral-950 tabular-nums"
                    />
                    <span className="text-[11px] font-semibold text-emerald-600 block mt-1">
                      {formatNaira(tier.presetPrice)}
                    </span>
                  </div>
                </div>

                {/* Original / Compare At Price */}
                <div className="w-full sm:w-1/3">
                  <label className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Compare-At Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    value={tier.compareAtPrice ?? ''}
                    onChange={(e) =>
                      handleUpdateStorage(index, {
                        compareAtPrice: e.target.value ? Number(e.target.value) : null
                      })
                    }
                    placeholder="e.g. 3100000"
                    className="w-full p-2 border border-neutral-300 rounded-xl text-xs text-neutral-700 bg-white focus:outline-none focus:border-neutral-950 tabular-nums"
                  />
                  {tier.compareAtPrice && tier.compareAtPrice > tier.presetPrice && (
                    <span className="text-[10px] text-neutral-400 block mt-1 line-through">
                      {formatNaira(tier.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Actions & Preview Test */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewStorageCapacity(tier.capacity)}
                    className="px-2.5 py-1.5 bg-white border border-neutral-200 hover:border-neutral-900 rounded-xl text-[11px] font-bold text-neutral-800 transition-colors shadow-2xs whitespace-nowrap"
                  >
                    Test in Simulator
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStorage(index)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    title="Delete Storage"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sync Button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-neutral-100">
            <div className="text-xs text-neutral-600">
              Total combinations:{' '}
              <strong className="text-neutral-950">
                {storageOptions.length * colorOptions.length} variants
              </strong>{' '}
              ({storageOptions.length} storages × {colorOptions.length} colors)
            </div>

            <button
              type="button"
              onClick={handleSyncVariantsMatrix}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync All Variants Matrix</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 4: GRANULAR VARIANT INVENTORY MATRIX                   */}
        {/* ============================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-neutral-900" />
              <div>
                <h2 className="text-sm font-bold text-neutral-950">
                  Granular Variant Stock Matrix ({variants.length})
                </h2>
                <p className="text-[11px] text-neutral-500">
                  Physical stock counts, individual SKUs, and variant overrides.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500">Default Stock:</span>
              <input
                type="number"
                min="0"
                value={initialStockPerVariant}
                onChange={(e) => setInitialStockPerVariant(Number(e.target.value))}
                className="w-14 p-1 border border-neutral-300 rounded-lg text-xs text-center font-bold"
              />
            </div>
          </div>

          {/* Variants Table */}
          <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase text-[10px]">
                  <tr>
                    <th className="p-3 pl-4">Color & Photo</th>
                    <th className="p-3">Storage</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Selling Price (₦)</th>
                    <th className="p-3">Stock Units</th>
                    <th className="p-3">Alert Threshold</th>
                    <th className="p-3 text-right pr-4">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {variants.map((v, vIdx) => (
                    <tr key={v.id || vIdx} className="hover:bg-neutral-50/70">
                      <td className="p-3 pl-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: v.color.hex }}
                          />
                          {v.image && (
                            <img
                              src={v.image}
                              alt=""
                              className="w-6 h-6 object-contain rounded bg-neutral-100 p-0.5 shrink-0"
                            />
                          )}
                          <span className="font-semibold text-neutral-900">{v.color.name}</span>
                        </div>
                      </td>

                      <td className="p-3 font-bold text-neutral-950">{v.storage}</td>

                      <td className="p-3 font-mono">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                          className="p-1 border border-neutral-200 rounded text-[11px] w-36 font-mono text-neutral-700 bg-white"
                        />
                      </td>

                      <td className="p-3 font-bold text-neutral-950 tabular-nums">
                        <input
                          type="number"
                          step="5000"
                          value={v.price}
                          onChange={(e) =>
                            handleUpdateVariant(vIdx, 'price', Number(e.target.value))
                          }
                          className="p-1 border border-neutral-200 rounded text-xs w-28 font-bold text-neutral-950 tabular-nums bg-white"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          value={v.stock}
                          onChange={(e) =>
                            handleUpdateVariant(vIdx, 'stock', Number(e.target.value))
                          }
                          className="p-1 border border-neutral-200 rounded text-xs w-16 font-bold tabular-nums bg-white"
                        />
                      </td>

                      <td className="p-3">
                        <input
                          type="number"
                          min="0"
                          value={v.lowStockThreshold}
                          onChange={(e) =>
                            handleUpdateVariant(vIdx, 'lowStockThreshold', Number(e.target.value))
                          }
                          className="p-1 border border-neutral-200 rounded text-xs w-14 tabular-nums bg-white"
                        />
                      </td>

                      <td className="p-3 text-right pr-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(vIdx)}
                          className="text-neutral-400 hover:text-rose-600 p-1 rounded"
                          title="Remove variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 5: DESCRIPTIONS & TECHNICAL SPECIFICATIONS             */}
        {/* ============================================================== */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-900" />
              <h2 className="text-sm font-bold text-neutral-950">Descriptions & Highlights</h2>
            </div>
            <span className="text-[11px] font-semibold text-neutral-400">Step 4 of 5</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Short Highlight / Headline Subtitle
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. A20 Pro Bionic, Aerospace Titanium, 120Hz ProMotion OLED, 48MP Triple Fusion Camera"
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Full Detailed Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed technical overview, diagnostic inspection report, battery health, accessories included..."
                className="w-full p-2.5 border border-neutral-300 rounded-xl text-xs text-neutral-900 focus:outline-none focus:border-neutral-950"
              />
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="pt-4 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-900">Technical Specifications</label>
              <button
                type="button"
                onClick={handleAddSpecRow}
                className="text-xs font-bold text-neutral-950 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Spec Row</span>
              </button>
            </div>

            <div className="space-y-2">
              {specs.map((spec, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleUpdateSpecRow(sIdx, 'key', e.target.value)}
                    placeholder="Spec (e.g. Display)"
                    className="w-1/3 p-2 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-900 bg-white"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpecRow(sIdx, 'value', e.target.value)}
                    placeholder="Value (e.g. 6.9-inch 120Hz OLED)"
                    className="flex-1 p-2 border border-neutral-300 rounded-xl text-xs text-neutral-900 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecRow(sIdx)}
                    className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg"
                    title="Remove spec"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SAVE ACTIONS */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-neutral-300 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {isEditing && initialProduct?.id && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Gadget</span>
              </button>
            )}

            <button
              type="submit"
              disabled={saving || isDeleting}
              className="px-7 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : isEditing ? 'Save Product' : 'Publish Product'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* IN-APP CONFIRMATION MODAL FOR PRODUCT DELETION */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-neutral-950">Delete Product</h3>
                <p className="text-xs text-neutral-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
              <div className="text-xs font-bold text-neutral-900">{name || 'Unnamed Product'}</div>
              <div className="text-[11px] text-neutral-500">
                {brand} · {category} · {formatNaira(basePrice)}
              </div>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              Are you sure you want to permanently delete this gadget from the catalog? It will be immediately removed from the customer storefront and cannot be restored.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
