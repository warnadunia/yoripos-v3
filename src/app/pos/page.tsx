'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
type ViewMode = 'OPERATOR' | 'BISNIS';
type OperatorRole = 'KASIR' | 'DAPUR' | 'KURIR';
type MobileTab = 'KATALOG' | 'KERANJANG' | 'AMBIL';
type FulfillmentMethod = 'AMBIL_TOKO' | 'DIKIRIM';
type BizTab = 'RINGKASAN' | 'STOK' | 'RESEP' | 'ORDERS' | 'PIUTANG' | 'RIWAYAT' | 'PENGATURAN' | 'KONSUMEN' | 'PENGELUARAN' | 'SUPPLIER';
interface Category { id: number; name: string; }
interface Product { id: number; sku: string; name: string; price_sell: string | number; category_id: number; total_stock: number; image_url?: string | null; category?: { id: number; name: string }; }
interface CartItem { product: Product; quantity: number; }
interface StoreSettings { store_name: string; store_logo: string; receipt_design: string; qris_providers: string; qris_image: string; bank_accounts: string; wa_template: string; [key: string]: string; }
const DEFAULT_WA_TEMPLATE = 'Halo [customer_name], berikut link struk belanja [invoice_no] Anda senilai [total_amount]: [receipt_url]';

const formatShortRupiah = (val: number) => {
  if (val >= 1_000_000_000) return (val / 1_000_000_000).toFixed(1) + 'M';
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'Jt';
  if (val >= 1_000) return (val / 1_000).toFixed(0) + 'Rb';
  return val.toString();
};

export default function PosPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATOR');
  const [operatorRole, setOperatorRole] = useState<OperatorRole>('KASIR');
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>('AMBIL_TOKO');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<MobileTab>('KATALOG');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [bizTab, setBizTab] = useState<BizTab>('RINGKASAN');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({ store_name: 'YoriPOS V3', store_logo: '', receipt_design: 'mono', qris_providers: '', qris_image: '', bank_accounts: '', wa_template: DEFAULT_WA_TEMPLATE });
  const [settingsForm, setSettingsForm] = useState({ ...storeSettings });
  const [bankAccountNew, setBankAccountNew] = useState('');
  const [bankAccountError, setBankAccountError] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'MENU' | 'PESANAN' | 'LUNAS' | 'GABUNG' | 'PIUTANG'>('MENU');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [saleDate, setSaleDate] = useState(''); // VIP admin custom date
  const [selectedFulfillment, setSelectedFulfillment] = useState<FulfillmentMethod>('AMBIL_TOKO');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [paymentProofBase64, setPaymentProofBase64] = useState('');
  const [paymentProofFileName, setPaymentProofFileName] = useState('');
  const [pendingSales, setPendingSales] = useState<any[]>([]);
  const [selectedPendingSaleId, setSelectedPendingSaleId] = useState<number | null>(null);
  const [isLoadingPendingSales, setIsLoadingPendingSales] = useState(false);
  const [cashReceived, setCashReceived] = useState('');
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completingSaleId, setCompletingSaleId] = useState<number | null>(null);
  const [completePaymentMethod, setCompletePaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [completePaymentStatus, setCompletePaymentStatus] = useState<'lunas' | 'piutang'>('lunas');
  const [completePaymentProof, setCompletePaymentProof] = useState('');
  const [completePaymentProofName, setCompletePaymentProofName] = useState('');
  const [deliveryOrders, setDeliveryOrders] = useState<any[]>([]);
  const [isLoadingDelivery, setIsLoadingDelivery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completeFileRef = useRef<HTMLInputElement>(null);
  const qrisFileRef = useRef<HTMLInputElement>(null);
  // ─── Data Tables: Orders, Piutang, Riwayat ───
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersType, setOrdersType] = useState<'pesanan' | 'piutang' | 'riwayat'>('pesanan');
  const [ordersYear, setOrdersYear] = useState(new Date().getFullYear().toString());
  const [ordersMonth, setOrdersMonth] = useState((new Date().getMonth() + 1).toString());
  const [ordersSearch, setOrdersSearch] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const [processDialog, setProcessDialog] = useState<{ saleId: number; open: boolean }>({ saleId: 0, open: false });
  const [processPaymentMethod, setProcessPaymentMethod] = useState<'CASH' | 'QRIS' | 'TRANSFER'>('CASH');
  const [processPaymentStatus, setProcessPaymentStatus] = useState<'lunas' | 'piutang'>('lunas');
  const [processPaymentProof, setProcessPaymentProof] = useState('');
  const [processPaymentProofName, setProcessPaymentProofName] = useState('');
  const processFileRef = useRef<HTMLInputElement>(null);

  // ─── Recipe / BOM Management ───
  const [recipeProducts, setRecipeProducts] = useState<any[]>([]);
  const [selectedRecipeProduct, setSelectedRecipeProduct] = useState<any>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<any[]>([]);
  const [recipeHppBreakdown, setRecipeHppBreakdown] = useState<any[]>([]);
  const [recipeTotalHpp, setRecipeTotalHpp] = useState(0);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [addIngredientForm, setAddIngredientForm] = useState({ material_id: '', qty_required: '' });
  const [stockMaterials, setStockMaterials] = useState<any[]>([]);
  // ─── Tambah Menu Baru ───
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [newMenuForm, setNewMenuForm] = useState({ sku: '', name: '', price_sell: '', category_id: '', image_url: '' });
  const [categoriesForMenu, setCategoriesForMenu] = useState<any[]>([]);
  // ─── Edit modals (CRUD) ───
  const [showAddBahanModal, setShowAddBahanModal] = useState(false);
  const [addBahanForm, setAddBahanForm] = useState({ sku: '', name: '', unit: 'gram' });
  const [showEditStockModal, setShowEditStockModal] = useState(false);
  const [editStockForm, setEditStockForm] = useState({ id: 0, sku: '', name: '', unit: '' });
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [editMenuForm, setEditMenuForm] = useState({ id: 0, sku: '', name: '', price_sell: '', category_id: '', image_url: '' });
  // ─── Availability ───
  const [availabilityMap, setAvailabilityMap] = useState<Record<number, { max_portions: number; has_recipe: boolean }>>({});
  const [isLoadingAvail, setIsLoadingAvail] = useState(false);

  // ─── Tambahan Fitur Baru: Dashboard, Expenses, & Auto-Suggestions ───
  const [ordersMonthlySummary, setOrdersMonthlySummary] = useState<any[]>([]);
  const [canBackdate, setCanBackdate] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ expense_date: new Date().toISOString().split('T')[0], category: '', amount: '', description: '' });
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const menuPhotoFileRef = useRef<HTMLInputElement>(null);
  const editMenuPhotoFileRef = useRef<HTMLInputElement>(null);

  // ─── Supplier & Price History Statistics States ───
  const [supplierList, setSupplierList] = useState<any[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ id: null as number | null, name: '', phone: '', email: '', address: '' });
  
  const [priceHistoryList, setPriceHistoryList] = useState<any[]>([]);
  const [isLoadingPriceHistory, setIsLoadingPriceHistory] = useState(false);
  const [priceHistoryProductFilter, setPriceHistoryProductFilter] = useState('');
  const [priceHistorySupplierFilter, setPriceHistorySupplierFilter] = useState('');

  // Sesi Shift & Riwayat
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftOpeningBalance, setShiftOpeningBalance] = useState(0);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [openShiftForm, setOpenShiftForm] = useState({ opening_balance: '', cashier_name: '' });
  const [operatorTab, setOperatorTab] = useState<'POS' | 'RIWAYAT'>('POS');

  const fetchAvailability = useCallback(async () => {
    try { setIsLoadingAvail(true); const res = await fetch('/api/products/availability'); const r = await res.json(); if (r.success) { const map: Record<number, any> = {}; r.data.forEach((d: any) => { map[d.product_id] = d; }); setAvailabilityMap(map); } } catch {}
    finally { setIsLoadingAvail(false); }
  }, []);

  const fetchRecipeProducts = useCallback(async () => {
    try { setIsLoadingRecipe(true); const res = await fetch('/api/products?all=true'); const r = await res.json(); if (r.success) setRecipeProducts(r.data.filter((p: any) => p.type === 'produk_jual')); } catch {}
    finally { setIsLoadingRecipe(false); }
  }, []);

  const fetchRecipeIngredients = useCallback(async (menuId: number) => {
    try { setIsLoadingRecipe(true); const res = await fetch('/api/recipes?menu_id=' + menuId); const r = await res.json(); if (r.success) { setRecipeIngredients(r.data.ingredients); setRecipeHppBreakdown(r.data.hppBreakdown); setRecipeTotalHpp(r.data.totalHpp); } else { setRecipeIngredients([]); setRecipeHppBreakdown([]); setRecipeTotalHpp(0); } } catch { setRecipeIngredients([]); }
    finally { setIsLoadingRecipe(false); }
  }, []);

  const fetchStockMaterials = useCallback(async () => {
    try { const res = await fetch('/api/products?all=true'); const r = await res.json(); if (r.success) setStockMaterials(r.data.filter((p: any) => p.type === 'bahan_baku')); } catch {}
  }, []);

  const handleAddIngredient = async () => {
    if (!addIngredientForm.material_id || !addIngredientForm.qty_required || Number(addIngredientForm.qty_required) <= 0) { alert('Pilih bahan & isi jumlah!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/recipes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menu_id: selectedRecipeProduct.id, material_id: addIngredientForm.material_id, qty_required: addIngredientForm.qty_required }),
      });
      const result = await res.json();
      if (result.success) { alert(result.message); setShowAddIngredient(false); setAddIngredientForm({ material_id: '', qty_required: '' }); await fetchRecipeIngredients(selectedRecipeProduct.id); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };

  const handleRemoveIngredient = async (recipeId: number) => {
    if (!confirm('Hapus bahan dari resep ini?')) return;
    try {
      const res = await fetch('/api/recipes?id=' + recipeId, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) { alert(result.message); await fetchRecipeIngredients(selectedRecipeProduct.id); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
  };

  const fetchOrders = useCallback(async (type: string, year: string, month: string, search: string) => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      const params = new URLSearchParams({ type });
      if (year) params.set('year', year);
      if (month) params.set('month', month);
      if (search) params.set('search', search);
      const res = await fetch('/api/orders?' + params.toString());
      const result = await res.json();
      if (result.success) {
        setOrdersData(result.data);
        setOrdersMonthlySummary(result.monthlySummary || []);
      }
      else setOrdersError(result.error || 'Gagal memuat.');
    } catch { setOrdersError('Gagal koneksi.'); }
    finally { setOrdersLoading(false); }
  }, []);

  const fetchExpenses = useCallback(async (year: string, month: string) => {
    try {
      setIsLoadingExpenses(true);
      const params = new URLSearchParams();
      if (year) params.set('year', year);
      if (month) params.set('month', month);
      const res = await fetch('/api/expenses?' + params.toString());
      const result = await res.json();
      if (result.success) setExpensesData(result.data);
    } catch {}
    finally { setIsLoadingExpenses(false); }
  }, []);

  const handleDeleteExpense = async (id: number, category: string) => {
    if (!confirm(`Hapus pengeluaran "${category}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        await fetchExpenses(ordersYear, ordersMonth);
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch {
      alert('Gagal.');
    }
  };

  const handleAddExpense = async () => {
    const { expense_date, category, amount, description } = expenseForm;
    if (!expense_date || !category.trim() || !amount || Number(amount) <= 0) {
      alert('Tanggal, Kategori, dan Jumlah wajib diisi.');
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expense_date, category, amount, description }),
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message);
        setShowAddExpenseModal(false);
        setExpenseForm({
          expense_date: new Date().toISOString().split('T')[0],
          category: '',
          amount: '',
          description: '',
        });
        await fetchExpenses(ordersYear, ordersMonth);
      } else {
        alert('Gagal: ' + result.error);
      }
    } catch {
      alert('Gagal mencatat pengeluaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchDashboardData = useCallback(async (year: string) => {
    try {
      setIsLoadingDashboard(true);
      const res = await fetch('/api/dashboard?year=' + year);
      const result = await res.json();
      if (result.success) setDashboardData(result);
    } catch {}
    finally { setIsLoadingDashboard(false); }
  }, []);


  const handleProcessPayment = async () => {
    if (!processDialog.saleId) return;
    if ((processPaymentMethod === 'QRIS' || processPaymentMethod === 'TRANSFER') && !processPaymentProof) {
      alert('Bukti bayar wajib!'); return;
    }
    try {
      const res = await fetch('/api/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: processDialog.saleId,
          action: 'kasir_pickup',
          payment_status: processPaymentStatus,
          payment_method: processPaymentMethod,
          payment_proof: (processPaymentMethod === 'QRIS' || processPaymentMethod === 'TRANSFER') ? processPaymentProof : null,
        }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.message);
        setProcessDialog({ saleId: 0, open: false });
        setProcessPaymentProof('');
        setProcessPaymentProofName('');
        await fetchOrders(ordersType, ordersYear, ordersMonth, ordersSearch);
        await fetchReadyOrders();
      } else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
  };

  const handleDeleteSale = async (saleId: number, invoiceNo: string) => {
    if (!confirm(`Hapus ${invoiceNo}? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch('/api/sales/' + saleId, { method: 'DELETE' });
      if (res.ok) { alert('Dihapus.'); await fetchOrders(ordersType, ordersYear, ordersMonth, ordersSearch); }
      else alert('Gagal menghapus.');
    } catch { alert('Gagal.'); }
  };

  const [piutangList, setPiutangList] = useState<any[]>([]);
  const [isLoadingPiutang, setIsLoadingPiutang] = useState(false);
  // Stock management
  const [stockProducts, setStockProducts] = useState<any[]>([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<any>(null);
  const [stockBatches, setStockBatches] = useState<any[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(false);
  const [showStockInForm, setShowStockInForm] = useState(false);
  const [stockInForm, setStockInForm] = useState({ product_id: 0, qty: '', price_buy: '', batch_no: '', supplier: '', supplier_id: '' });
  const [showStockAdjustForm, setShowStockAdjustForm] = useState(false);
  const [stockAdjustForm, setStockAdjustForm] = useState({ product_id: 0, qty_adjusted: '', type: 'waste', reason: '' });
  const [stockMessage, setStockMessage] = useState('');
  // Customer management
  const [customerList, setCustomerList] = useState<any[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerForm, setCustomerForm] = useState({ id: null as number | null, name: '', phone: '', address: '' });
  const [showAddCustomerCheckout, setShowAddCustomerCheckout] = useState(false);
  const [checkoutCustomerForm, setCheckoutCustomerForm] = useState({ name: '', phone: '', address: '' });
  useEffect(() => {
    const saved = localStorage.getItem('yoripos_dark_mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const t = setTimeout(() => {
      setIsDarkMode(saved !== null ? saved === 'true' : prefersDark);
      setHasMounted(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!hasMounted) return;
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('yoripos_dark_mode', String(isDarkMode));
  }, [isDarkMode, hasMounted]);
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        const merged: StoreSettings = {
          store_name: data.data.store_name || 'YoriPOS V3',
          store_logo: data.data.store_logo || '',
          receipt_design: data.data.receipt_design || 'mono',
          qris_providers: data.data.qris_providers || '',
          qris_image: data.data.qris_image || '',
          bank_accounts: data.data.bank_accounts || '',
          wa_template: data.data.wa_template || DEFAULT_WA_TEMPLATE,
        };
        setStoreSettings(merged); setSettingsForm(merged);
      }
    } catch { /* silent */ }
  }, []);
  async function loadInitialData() {
    try {
      setLoading(true);
      const [catRes, prodRes] = await Promise.all([fetch('/api/categories?exclude_bahan=true'), fetch('/api/products')]);
      const catData = await catRes.json();
      const prodData = await prodRes.json();
      if (catData.success) setCategories(catData.data);
      if (prodData.success) setProducts(prodData.data);
    } catch (error) { console.error('Gagal memuat data POS:', error); } finally { setLoading(false); }
  }
  useEffect(() => {
    if (hasMounted) {
      const t = setTimeout(() => {
        loadInitialData();
        loadSettings();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [hasMounted, loadSettings]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (products.length > 0 && !isLoadingAvail) {
      const t = setTimeout(() => {
        fetchAvailability();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [products.length]);
  // Filter Products
  useEffect(() => {
    if (!hasMounted) return;
    async function filterProducts() {
      let url = '/api/products?';
      if (selectedCategory) url += 'category_id=' + selectedCategory + '&';
      if (searchQuery) url += 'search=' + encodeURIComponent(searchQuery);
      try { const res = await fetch(url); const result = await res.json(); if (result.success) setProducts(result.data); } catch { /* silent */ }
    }
    const delay = setTimeout(filterProducts, 300);
    return () => clearTimeout(delay);
  }, [selectedCategory, searchQuery, hasMounted]);
  const fetchDeliveryOrders = useCallback(async () => {
    try { setIsLoadingDelivery(true); const res = await fetch('/api/checkout'); const result = await res.json(); if (result.success) setDeliveryOrders(result.data); } catch { /* silent */ }
    finally { setIsLoadingDelivery(false); }
  }, []);
  const addToCart = (product: Product) => {
    setCart(prev => { const existing = prev.find(i => i.product.id === product.id); if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i); return [...prev, { product, quantity: 1 }]; });
  };
  const updateQuantity = (productId: number, amount: number) => { setCart(prev => prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + amount } : i).filter(i => i.quantity > 0)); };
  const calculateTotal = () => cart.reduce((t, i) => t + Number(i.product.price_sell) * i.quantity, 0);
  const totalCartItems = cart.reduce((s, i) => s + i.quantity, 0);
  const calculateChange = () => { const total = calculateTotal(); const received = Number(cashReceived); if (!received || received < total) return 0; return received - total; };
  const handlePaymentProofFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setPaymentProofFileName(file.name); const reader = new FileReader(); reader.onload = () => setPaymentProofBase64(reader.result as string); reader.readAsDataURL(file); };
  const handleCompleteProofFile = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return; setCompletePaymentProofName(file.name); const reader = new FileReader(); reader.onload = () => setCompletePaymentProof(reader.result as string); reader.readAsDataURL(file); };
  const compressImage = (file: File, maxW: number, quality: number): Promise<string> => {
    return new Promise((resolve) => {
      if (file.size > 5 * 1024 * 1024) { alert('File > 5MB!'); resolve(''); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        img.onload = () => {
          let w = img.width, h = img.height;
          if (w > maxW || h > maxW) { const r = Math.min(maxW / w, maxW / h); w *= r; h *= r; }
          const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d'); ctx?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };
  const handleQrisImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const compressed = await compressImage(file, 400, 0.8);
    if (compressed) { setSettingsForm(p => ({ ...p, qris_image: compressed })); setSettingsDirty(true); }
  };
  const handleStoreLogoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const compressed = await compressImage(file, 200, 0.7);
    if (compressed) { setSettingsForm(p => ({ ...p, store_logo: compressed })); setSettingsDirty(true); }
  };
  const fetchPiutang = useCallback(async () => {
    try { setIsLoadingPiutang(true); const res = await fetch('/api/piutang'); const result = await res.json(); if (result.success) setPiutangList(result.data); } catch { /* silent */ }
    finally { setIsLoadingPiutang(false); }
  }, []);
  const fetchPendingSales = async () => {
    try { setIsLoadingPendingSales(true); const res = await fetch('/api/checkout'); const result = await res.json(); if (result.success) setPendingSales(result.data); } catch { /* silent */ }
    finally { setIsLoadingPendingSales(false); }
  };
  // ─── Kitchen: Mark order as READY ───
  const handleMarkReady = async (saleId: number) => {
    try {
      const res = await fetch('/api/kitchen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: saleId }),
      });
      const result = await res.json();
      if (res.ok && result.success) { alert(result.message); await fetchReadyOrders(); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal koneksi.'); }
  };

  // ─── VIP: check if admin/owner/backdate permission ───
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    fetch('/api/auth/user')
      .then(r => r.json())
      .then(d => {
        setCurrentUser(d);
        const role = d.role ? d.role.toLowerCase() : '';
        const hasBackdatePermission = d.permissions?.includes('backdate') || false;
        const adminOrOwner = role === 'admin' || role === 'owner';
        setIsAdmin(adminOrOwner);
        setCanBackdate(adminOrOwner || hasBackdatePermission);
      })
      .catch(() => {});
  }, []);

  // Sync Shift Session from LocalStorage
  useEffect(() => {
    if (hasMounted && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        const active = localStorage.getItem('yoripos_shift_active') === 'true';
        setIsShiftActive(active);
        const bal = Number(localStorage.getItem('yoripos_shift_opening_balance') || '0');
        setShiftOpeningBalance(bal);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [hasMounted]);

  // Read URL query parameters for direct tab/action execution
  useEffect(() => {
    if (!hasMounted) return;
    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as BizTab | null;
      const actionParam = params.get('action');

      if (tabParam) {
        setViewMode('BISNIS');
        setBizTab(tabParam);
      }

      if (actionParam === 'open_kasir') {
        setViewMode('OPERATOR');
        setOperatorRole('KASIR');
        setOpenShiftForm(f => ({ ...f, cashier_name: currentUser?.username || 'Kasir' }));
        setShowOpenShiftModal(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [hasMounted, currentUser]);

  const handleOpenShift = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yoripos_shift_active', 'true');
      localStorage.setItem('yoripos_shift_opening_balance', openShiftForm.opening_balance || '0');
      localStorage.setItem('yoripos_shift_cashier', openShiftForm.cashier_name || currentUser?.username || 'Kasir');
      localStorage.setItem('yoripos_shift_start_time', new Date().toISOString());
      setIsShiftActive(true);
      setShiftOpeningBalance(Number(openShiftForm.opening_balance || '0'));
      setShowOpenShiftModal(false);
      alert('Shift kasir berhasil dibuka!');
    }
  };

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0 || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const payload: any = { cart, fulfillment_method: selectedFulfillment };
      if (customerName.trim()) payload.customer_name = customerName;
      if (customerPhone.trim()) payload.customer_phone = customerPhone;
      if (deliveryAddress.trim()) payload.delivery_address = deliveryAddress;
      if (saleDate.trim() && canBackdate) payload.sale_date = saleDate;
      const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json();
      if (res.ok && result.success) {
        alert('Pesanan diterima! ' + result.data.invoice_no);
        setCart([]); setIsCheckoutModalOpen(false); setCheckoutStep('MENU');
        setCustomerName(''); setCustomerPhone(''); setDeliveryAddress(''); setSaleDate('');
        setSelectedPendingSaleId(null); setMobileActiveTab('KATALOG');
        await loadInitialData();
      } else { alert('Gagal: ' + result.error); }
    } catch (error) { console.error(error); alert('Kendala jaringan.'); }
    finally { setIsSubmitting(false); }
  };

  // ─── Kasir Pickup: mark ready order as picked up + payment ───
  const handleKasirPickup = async (saleId: number, pStatus: 'lunas' | 'piutang', pMethod: string, pProof: string) => {
    if ((pMethod === 'QRIS' || pMethod === 'TRANSFER') && !pProof) { alert('Bukti bayar wajib!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: saleId, action: 'kasir_pickup', payment_status: pStatus, payment_method: pMethod, payment_proof: pProof }),
      });
      const result = await res.json();
      if (res.ok && result.success) { alert(result.message); await fetchReadyOrders(); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };

  // ─── Kurir Delivery Complete ───
  const handleKurirComplete = async () => {
    if (!completingSaleId) return;
    if ((completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') && !completePaymentProof) { alert('Bukti bayar wajib!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: completingSaleId, action: 'kurir_deliver', payment_status: completePaymentStatus, payment_method: completePaymentMethod === 'QRIS' ? 'QRIS' : completePaymentMethod === 'TRANSFER' ? 'TRANSFER' : 'CASH', payment_proof: (completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') ? completePaymentProof : null }),
      });
      const result = await res.json();
      if (res.ok && result.success) { alert(result.message); setIsCompleteDialogOpen(false); setCompletingSaleId(null); setCompletePaymentProof(''); setCompletePaymentProofName(''); await fetchReadyOrders(); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };
  const handleCompleteDelivery = async () => {
    if (!completingSaleId) return;
    if ((completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') && !completePaymentProof) { alert('Bukti bayar wajib!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/checkout', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sale_id: completingSaleId, payment_status: completePaymentStatus, payment_method: completePaymentMethod, payment_proof: (completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') ? completePaymentProof : null }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.message); setIsCompleteDialogOpen(false); setCompletingSaleId(null);
        setCompletePaymentProof(''); setCompletePaymentProofName('');
        await fetchDeliveryOrders();
      } else { alert('Gagal: ' + result.error); }
    } catch (error) { console.error(error); alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };
  // ─── Supplier & Price History Statistics Hooks ───
  const fetchSuppliers = useCallback(async (search: string = '') => {
    try {
      setIsLoadingSuppliers(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch('/api/suppliers?' + params.toString());
      const r = await res.json();
      if (r.success) {
        setSupplierList(r.data);
      }
    } catch {
      /* silent */
    } finally {
      setIsLoadingSuppliers(false);
    }
  }, []);

  const fetchPriceHistory = useCallback(async (productId?: string, supplierId?: string) => {
    try {
      setIsLoadingPriceHistory(true);
      const params = new URLSearchParams();
      if (productId) params.set('product_id', productId);
      if (supplierId) params.set('supplier_id', supplierId);
      const res = await fetch('/api/suppliers/price-history?' + params.toString());
      const r = await res.json();
      if (r.success) {
        setPriceHistoryList(r.data);
      }
    } catch {
      /* silent */
    } finally {
      setIsLoadingPriceHistory(false);
    }
  }, []);

  const handleSupplierFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierForm.name.trim()) { alert('Nama supplier wajib diisi!'); return; }
    try {
      setIsSubmitting(true);
      const isEdit = supplierForm.id !== null;
      const url = '/api/suppliers';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: supplierForm.id,
          name: supplierForm.name.trim(),
          phone: supplierForm.phone || null,
          email: supplierForm.email || null,
          address: supplierForm.address || null
        }),
      });
      const r = await res.json();
      if (r.success) {
        alert(r.message);
        setShowSupplierForm(false);
        setSupplierForm({ id: null, name: '', phone: '', email: '', address: '' });
        fetchSuppliers(supplierSearchQuery);
      } else {
        alert('Gagal: ' + r.error);
      }
    } catch {
      alert('Gagal memproses supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus supplier ini? Semua riwayat stok masuk terkait tetap dipertahankan.')) return;
    try {
      setIsLoadingSuppliers(true);
      const res = await fetch(`/api/suppliers?id=${id}`, { method: 'DELETE' });
      const r = await res.json();
      if (r.success) {
        alert(r.message);
        fetchSuppliers(supplierSearchQuery);
      } else {
        alert('Gagal: ' + r.error);
      }
    } catch {
      alert('Gagal menghapus supplier.');
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // ─── Stock Management ───
  const fetchStockProducts = useCallback(async () => {
    try { setIsLoadingStock(true); const res = await fetch('/api/products?all=true'); const result = await res.json(); if (result.success) setStockProducts(result.data.filter((p: any) => p.type === 'bahan_baku')); } catch { /* silent */ }
    finally { setIsLoadingStock(false); }
  }, []);
  const fetchStockBatches = useCallback(async (productId: number) => {
    try { setIsLoadingBatches(true); const res = await fetch('/api/stock/batches?product_id=' + productId); const result = await res.json(); if (result.success) setStockBatches(result.data); } catch { /* silent */ }
    finally { setIsLoadingBatches(false); }
  }, []);
  const handleStockIn = async () => {
    if (!stockInForm.qty || parseInt(stockInForm.qty) < 1) { alert('Jumlah wajib diisi!'); return; }
    try {
      setIsSubmitting(true); setStockMessage('');
      const res = await fetch('/api/stock/in', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: stockInForm.product_id, qty: parseInt(stockInForm.qty), price_buy: stockInForm.price_buy ? parseFloat(stockInForm.price_buy) : 0, batch_no: stockInForm.batch_no, supplier: stockInForm.supplier, supplier_id: (stockInForm.supplier_id && stockInForm.supplier_id !== 'manual') ? parseInt(stockInForm.supplier_id, 10) : undefined }) });
      const result = await res.json();
      if (result.success) { setStockMessage('Stok berhasil ditambahkan!'); setShowStockInForm(false); setStockInForm({ product_id: 0, qty: '', price_buy: '', batch_no: '', supplier: '', supplier_id: '' }); await fetchStockProducts(); if (selectedStockProduct) await fetchStockBatches(selectedStockProduct.id); }
      else { alert('Gagal: ' + result.error); }
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };
  const handleStockAdjust = async () => {
    if (!stockAdjustForm.qty_adjusted || parseInt(stockAdjustForm.qty_adjusted) < 1) { alert('Jumlah wajib diisi!'); return; }
    try {
      setIsSubmitting(true); setStockMessage('');
      const res = await fetch('/api/stock/adjust', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: stockAdjustForm.product_id, qty_adjusted: parseInt(stockAdjustForm.qty_adjusted), type: stockAdjustForm.type, reason: stockAdjustForm.reason }) });
      const result = await res.json();
      if (result.success) { setStockMessage('Penyesuaian berhasil!'); setShowStockAdjustForm(false); setStockAdjustForm({ product_id: 0, qty_adjusted: '', type: 'waste', reason: '' }); await fetchStockProducts(); if (selectedStockProduct) await fetchStockBatches(selectedStockProduct.id); }
      else { alert('Gagal: ' + result.error); }
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };
  // ─── CRUD Handlers for STOK & RESEP ───
  const handleAddBahanBaku = async () => {
    if (!addBahanForm.sku.trim() || !addBahanForm.name.trim()) { alert('SKU & Nama wajib diisi!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: addBahanForm.sku.toUpperCase(), name: addBahanForm.name, type: 'bahan_baku', unit: addBahanForm.unit, price_sell: 0 }),
      });
      const result = await res.json();
      if (result.success) { alert(result.message); setShowAddBahanModal(false); setAddBahanForm({ sku: '', name: '', unit: 'gram' }); await fetchStockProducts(); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };

  const handleEditStockProduct = async () => {
    if (!editStockForm.name.trim() || !editStockForm.sku.trim()) { alert('Nama & SKU wajib diisi!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editStockForm.id, sku: editStockForm.sku, name: editStockForm.name, unit: editStockForm.unit }),
      });
      const result = await res.json();
      if (result.success) { alert(result.message); setShowEditStockModal(false); await fetchStockProducts(); if (selectedStockProduct?.id === editStockForm.id) setSelectedStockProduct({ ...selectedStockProduct, ...editStockForm }); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteStockProduct = async (productId: number, productName: string) => {
    if (!confirm('Hapus bahan baku "' + productName + '" dan semua batch stoknya? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch('/api/products?id=' + productId, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) { alert(result.message); await fetchStockProducts(); if (selectedStockProduct?.id === productId) setSelectedStockProduct(null); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
  };

  const handleEditMenuProduct = async () => {
    if (!editMenuForm.name.trim() || !editMenuForm.sku.trim() || !editMenuForm.price_sell) { alert('Nama, SKU & Harga wajib diisi!'); return; }
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/products', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editMenuForm.id, sku: editMenuForm.sku, name: editMenuForm.name,
          price_sell: parseFloat(editMenuForm.price_sell),
          category_id: editMenuForm.category_id ? parseInt(editMenuForm.category_id, 10) : null,
        }),
      });
      const result = await res.json();
      if (result.success) { alert(result.message); setShowEditMenuModal(false); await fetchRecipeProducts(); }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteMenuProduct = async (productId: number, productName: string) => {
    if (!confirm('Hapus menu "' + productName + '" dan resepnya? Tindakan ini tidak bisa dibatalkan.')) return;
    try {
      const res = await fetch('/api/products?id=' + productId, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) { alert(result.message); await fetchRecipeProducts(); if (selectedRecipeProduct?.id === productId) { setSelectedRecipeProduct(null); setRecipeIngredients([]); setRecipeHppBreakdown([]); setRecipeTotalHpp(0); } }
      else alert('Gagal: ' + result.error);
    } catch { alert('Gagal.'); }
  };

  // ─── Customer Management ───
  const fetchCustomers = useCallback(async (search = '') => {
    try { setIsLoadingCustomers(true); const res = await fetch('/api/customers' + (search ? '?search=' + encodeURIComponent(search) : '')); const result = await res.json(); if (result.success) setCustomerList(result.data); } catch { /* silent */ }
    finally { setIsLoadingCustomers(false); }
  }, []);
  const handleCustomerFormSubmit = async () => {
    if (!customerForm.name.trim()) { alert('Nama wajib diisi!'); return; }
    try {
      setIsSubmitting(true);
      let res;
      if (customerForm.id) {
        // Update existing
        res = await fetch('/api/customers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: customerForm.id, name: customerForm.name, phone: customerForm.phone, address: customerForm.address }) });
      } else {
        // Create new
        res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: customerForm.name, phone: customerForm.phone, address: customerForm.address }) });
      }
      const result = await res.json();
      if (result.success) { alert(result.message); setShowCustomerForm(false); setCustomerForm({ id: null, name: '', phone: '', address: '' }); await fetchCustomers(customerSearch); }
      else { alert('Gagal: ' + result.error); }
    } catch { alert('Gagal.'); }
    finally { setIsSubmitting(false); }
  };
  const handleCheckoutAddCustomer = async () => {
    if (!checkoutCustomerForm.name.trim()) { alert('Nama wajib diisi!'); return; }
    try {
      const res = await fetch('/api/customers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(checkoutCustomerForm) });
      const result = await res.json();
      if (result.success) { setCustomerName(checkoutCustomerForm.name.trim()); setCustomerPhone(checkoutCustomerForm.phone || ''); setCustomerAddress(checkoutCustomerForm.address || ''); setShowAddCustomerCheckout(false); setCheckoutCustomerForm({ name: '', phone: '', address: '' }); }
      else { alert('Gagal: ' + result.error); }
    } catch { alert('Gagal.'); }
  };
  const handleAddBankAccount = () => {
    const trimmed = bankAccountNew.trim();
    if (!trimmed) return;
    const currentAccounts = settingsForm.bank_accounts.split('\n').filter(Boolean);
    const exists = currentAccounts.some(acc => acc.trim().toLowerCase() === trimmed.toLowerCase());
    if (exists) { setBankAccountError('Rekening ini sudah ada!'); return; }
    setBankAccountError('');
    setSettingsForm(p => ({ ...p, bank_accounts: (currentAccounts.length ? currentAccounts.join('\n') + '\n' : '') + trimmed }));
    setBankAccountNew('');
    setSettingsDirty(true);
  };
  const handleRemoveBankAccount = (index: number) => {
    const currentAccounts = settingsForm.bank_accounts.split('\n').filter(Boolean);
    currentAccounts.splice(index, 1);
    setSettingsForm(p => ({ ...p, bank_accounts: currentAccounts.join('\n') }));
    setSettingsDirty(true);
  };
  const handleSaveSettings = async () => {
    try {
      setIsSavingSettings(true);
      // Validate bank accounts: no duplicates
      const accounts = settingsForm.bank_accounts.split('\n').filter(Boolean);
      const lower = accounts.map(a => a.trim().toLowerCase());
      const unique = new Set(lower);
      if (unique.size !== lower.length) {
        setBankAccountError('Terdapat rekening ganda! Hapus duplikat terlebih dahulu.');
        setIsSavingSettings(false); return;
      }
      setBankAccountError('');
      const res = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(settingsForm) });
      const result = await res.json();
      if (result.success) { setStoreSettings({ ...settingsForm }); setSettingsDirty(false); alert('Tersimpan!'); }
      else { alert('Gagal: ' + result.error); }
    } catch { alert('Gagal menyimpan.'); }
    finally { setIsSavingSettings(false); }
  };
  // ─── Ready Orders (for Kasir Pickup & Kurir) ───
  const [readyOrders, setReadyOrders] = useState<any[]>([]);
  const [isLoadingReady, setIsLoadingReady] = useState(false);
  const [pickupSaleId, setPickupSaleId] = useState<number | null>(null);
  const fetchReadyOrders = useCallback(async () => {
    try { setIsLoadingReady(true); const res = await fetch('/api/orders?type=pesanan'); const result = await res.json(); if (result.success) setReadyOrders(result.data); } catch {}
    finally { setIsLoadingReady(false); }
  }, []);
  // Fetch orders data when tab is selected
  useEffect(() => {
    const t = setTimeout(() => {
      if (bizTab === 'ORDERS') { setOrdersType('pesanan'); fetchOrders('pesanan', ordersYear, ordersMonth, ordersSearch); }
      else if (bizTab === 'PIUTANG') { setOrdersType('piutang'); fetchOrders('piutang', ordersYear, ordersMonth, ordersSearch); }
      else if (bizTab === 'RIWAYAT') { setOrdersType('riwayat'); fetchOrders('riwayat', ordersYear, ordersMonth, ordersSearch); }
      else if (bizTab === 'RINGKASAN') { fetchDashboardData(ordersYear); }
      else if (bizTab === 'PENGELUARAN') { fetchExpenses(ordersYear, ordersMonth); }
    }, 0);
    return () => clearTimeout(t);
  }, [bizTab, ordersYear, ordersMonth, ordersSearch, fetchOrders, fetchDashboardData, fetchExpenses]);

  // Customer suggestion hook
  useEffect(() => {
    if (!customerName.trim()) {
      const t = setTimeout(() => {
        setCustomerSuggestions([]);
        setShowSuggestionsDropdown(false);
      }, 0);
      return () => clearTimeout(t);
    }
    const delay = setTimeout(async () => {
      try {
        const res = await fetch('/api/customers?search=' + encodeURIComponent(customerName));
        const r = await res.json();
        if (r.success) {
          const filtered = r.data.filter((c: any) => c.name.toLowerCase() !== customerName.toLowerCase());
          setCustomerSuggestions(filtered);
          setShowSuggestionsDropdown(true);
        }
      } catch {}
    }, 200);
    return () => clearTimeout(delay);
  }, [customerName]);

  // Fetch stock products when STOK tab is selected
  useEffect(() => {
    if (bizTab === 'STOK') {
      const t = setTimeout(() => {
        fetchStockProducts();
        fetchSuppliers();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [bizTab, fetchStockProducts, fetchSuppliers]);

  // Fetch suppliers & price histories when SUPPLIER tab is selected
  useEffect(() => {
    if (bizTab === 'SUPPLIER') {
      const t = setTimeout(() => {
        fetchSuppliers(supplierSearchQuery);
        fetchPriceHistory(priceHistoryProductFilter, priceHistorySupplierFilter);
        fetchStockMaterials();
      }, 0);
      return () => clearTimeout(t);
    }
  }, [bizTab, supplierSearchQuery, priceHistoryProductFilter, priceHistorySupplierFilter, fetchSuppliers, fetchPriceHistory, fetchStockMaterials]);
  // Fetch recipes when RESEP tab is selected
  useEffect(() => {
    if (bizTab === 'RESEP') {
      const t = setTimeout(() => {
        fetchRecipeProducts();
        fetchStockMaterials();
        fetch('/api/categories').then(r => r.json()).then(d => { if (d.success) setCategoriesForMenu(d.data.filter((c: any) => c.name !== 'Bahan Baku')); }).catch(() => {});
      }, 0);
      return () => clearTimeout(t);
    }
  }, [bizTab, fetchRecipeProducts, fetchStockMaterials]);
  // Fetch customers when KONSUMEN tab is selected
  useEffect(() => {
    if (bizTab === 'KONSUMEN') {
      const t = setTimeout(() => fetchCustomers(customerSearch), 0);
      return () => clearTimeout(t);
    }
  }, [bizTab, customerSearch, fetchCustomers]);
  // Fetch ready orders when KASIR or KURIR
  useEffect(() => {
    if (operatorRole === 'KASIR' || operatorRole === 'KURIR') {
      const t = setTimeout(() => fetchReadyOrders(), 0);
      return () => clearTimeout(t);
    }
  }, [operatorRole, fetchReadyOrders]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (bizTab === 'KONSUMEN' && customerSearch) { const t = setTimeout(() => fetchCustomers(customerSearch), 300); return () => clearTimeout(t); } }, [customerSearch]);
  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  const buildWaUrl = (phone: string, invoiceNo: string, totalAmount: number, customerName: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const receiptUrl = baseUrl + '/struk/' + invoiceNo;
    const template = storeSettings.wa_template || DEFAULT_WA_TEMPLATE;
    const msg = template.replace('[customer_name]', customerName).replace('[invoice_no]', invoiceNo).replace('[total_amount]', formatRupiah(totalAmount)).replace('[receipt_url]', receiptUrl);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    return 'https://wa.me/' + (cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone.replace(/^0/, '')) + '?text=' + encodeURIComponent(msg);
  };
  if (!hasMounted) { return <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950"><p className="text-xs text-stone-400 animate-pulse">Menyiapkan...</p></div>; }
  return (
    <div className="min-h-screen flex flex-col overflow-hidden h-screen select-none transition-colors duration-200 bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 font-sans">
      <header className="flex items-center justify-between sticky top-0 z-40 shrink-0 px-5 py-2.5 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-lg bg-stone-950 dark:bg-stone-800 text-stone-50 shadow-inner font-black">YoriPOS <span className="text-emerald-500">V3</span></div>
          {viewMode === 'OPERATOR' && (
            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={operatorRole} onChange={e => { setOperatorRole(e.target.value as OperatorRole); setMobileActiveTab('KATALOG'); }}
                  className="appearance-none text-xs font-semibold cursor-pointer rounded-xl pl-3 pr-8 py-1.5 border focus:outline-none transition bg-stone-100 dark:bg-stone-800 hover:bg-stone-200/80 dark:hover:bg-stone-700 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">
                  <option value="KASIR">Kasir</option><option value="DAPUR">Dapur</option><option value="KURIR">Kurir</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none text-stone-400">▼</span>
              </div>
              {operatorRole === 'KASIR' && (
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200/50 dark:border-stone-700/50">
                  <button onClick={() => setOperatorTab('POS')} className={'px-3 py-1 text-[10px] font-bold rounded-lg transition-all ' + (operatorTab === 'POS' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300')}>POS</button>
                  <button onClick={() => { setOperatorTab('RIWAYAT'); setOrdersType('riwayat'); fetchOrders('riwayat', ordersYear, ordersMonth, ordersSearch); }} className={'px-3 py-1 text-[10px] font-bold rounded-lg transition-all ' + (operatorTab === 'RIWAYAT' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300')}>Riwayat</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {viewMode === 'OPERATOR' && operatorRole === 'KASIR' && isShiftActive && (
            <div className="flex items-center gap-1.5 mr-2">
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-100 dark:border-emerald-900/60 font-bold">🟢 Rp {formatShortRupiah(shiftOpeningBalance)}</span>
              <button onClick={() => {
                if (confirm('Tutup Shift Kasir sekarang? Ini akan menutup laci kas Anda.')) {
                  localStorage.removeItem('yoripos_shift_active');
                  setIsShiftActive(false);
                  alert('Shift kasir berhasil ditutup.');
                }
              }} className="text-[10px] bg-stone-50 dark:bg-stone-800/80 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-900 text-stone-500 px-2.5 py-1 rounded-xl border border-stone-200 dark:border-stone-750 transition font-bold">Tutup Shift</button>
            </div>
          )}
          <button onClick={() => setIsDarkMode(!isDarkMode)} title={isDarkMode ? 'Terang' : 'Gelap'}
            className="p-2 rounded-xl text-sm transition bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">{isDarkMode ? '☀️' : '🌙'}</button>
          <div className="flex items-center p-1 rounded-xl border shadow-inner bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700/40">
            <button onClick={() => setViewMode('OPERATOR')} className={'px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ' + (viewMode === 'OPERATOR' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300')}>Operator</button>
            <button onClick={() => setViewMode('BISNIS')} className={'px-4 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ' + (viewMode === 'BISNIS' ? 'bg-emerald-600 text-white shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300')}>Bisnis</button>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-row overflow-hidden relative">
        {(viewMode === 'BISNIS' || (viewMode === 'OPERATOR' && operatorRole === 'KASIR')) && (
          <aside className={'hidden md:flex flex-col shrink-0 transition-all duration-300 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 shadow-sm ' + (isSidebarMinimized ? 'w-20' : 'w-64')}>
            <div className="flex items-center justify-between p-4 border-b border-stone-100 dark:border-stone-800">
              {!isSidebarMinimized && <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-stone-400 dark:text-stone-500">{viewMode === 'BISNIS' ? 'Business Center' : 'Kasir System'}</span>}
              <button onClick={() => setIsSidebarMinimized(!isSidebarMinimized)} className="p-1.5 rounded-xl mx-auto transition bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200">{isSidebarMinimized ? '❯' : '❮'}</button>
            </div>
            <nav className="flex-1 p-3 space-y-1.5">
              {viewMode === 'BISNIS' ? (
                <><SidebarItem icon="📈" label="Ringkasan" minimized={isSidebarMinimized} active={bizTab === 'RINGKASAN'} onClick={() => setBizTab('RINGKASAN')} /><SidebarItem icon="📦" label="Stok FIFO" minimized={isSidebarMinimized} active={bizTab === 'STOK'} onClick={() => setBizTab('STOK')} /><SidebarItem icon="📖" label="Resep & HPP" minimized={isSidebarMinimized} active={bizTab === 'RESEP'} onClick={() => setBizTab('RESEP')} /><SidebarItem icon="📋" label="Pesanan" minimized={isSidebarMinimized} active={bizTab === 'ORDERS'} onClick={() => setBizTab('ORDERS')} /><SidebarItem icon="🧾" label="Piutang" minimized={isSidebarMinimized} active={bizTab === 'PIUTANG'} onClick={() => setBizTab('PIUTANG')} /><SidebarItem icon="📜" label="Riwayat" minimized={isSidebarMinimized} active={bizTab === 'RIWAYAT'} onClick={() => setBizTab('RIWAYAT')} /><SidebarItem icon="💸" label="Pengeluaran" minimized={isSidebarMinimized} active={bizTab === 'PENGELUARAN'} onClick={() => setBizTab('PENGELUARAN')} /><SidebarItem icon="👥" label="Konsumen" minimized={isSidebarMinimized} active={bizTab === 'KONSUMEN'} onClick={() => setBizTab('KONSUMEN')} /><SidebarItem icon="🚚" label="Supplier" minimized={isSidebarMinimized} active={bizTab === 'SUPPLIER'} onClick={() => setBizTab('SUPPLIER')} /><SidebarItem icon="⚙️" label="Pengaturan" minimized={isSidebarMinimized} active={bizTab === 'PENGATURAN'} onClick={() => setBizTab('PENGATURAN')} /></>
              ) : (
                <>
                  <SidebarItem icon="🛒" label="POS" minimized={isSidebarMinimized} active={operatorTab === 'POS'} onClick={() => setOperatorTab('POS')} />
                  <SidebarItem icon="⏱️" label="Riwayat" minimized={isSidebarMinimized} active={operatorTab === 'RIWAYAT'} onClick={() => { setOperatorTab('RIWAYAT'); setOrdersType('riwayat'); fetchOrders('riwayat', ordersYear, ordersMonth, ordersSearch); }} />
                </>
              )}
            </nav>
          </aside>
        )}
        <main className="flex-1 flex flex-col overflow-hidden bg-stone-50/50 dark:bg-stone-950/50 relative">
          {viewMode === 'BISNIS' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {bizTab === 'RINGKASAN' && (
                <div className="space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 rounded-2xl shadow-sm">
                    <div>
                      <h1 className="text-base font-bold text-stone-900 dark:text-stone-100">Ringkasan Analitik</h1>
                      <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">Visualisasi performa bisnis tahun {ordersYear}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select value={ordersYear} onChange={e => { setOrdersYear(e.target.value); fetchDashboardData(e.target.value); }} className="rounded-xl px-3 py-1.5 text-[10px] font-bold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 focus:outline-none">
                        {Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString()).map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <button onClick={() => fetchDashboardData(ordersYear)} disabled={isLoadingDashboard} className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-stone-700 disabled:opacity-50">
                        {isLoadingDashboard ? '⋯' : '↻'}
                      </button>
                    </div>
                  </div>

                  {isLoadingDashboard ? (
                    <div className="rounded-2xl p-16 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-400 animate-pulse shadow-sm">Memuat Ringkasan...</div>
                  ) : (
                    <>
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Omset Card */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm border-l-4 border-l-emerald-500">
                          <p className="text-[9px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">Omset Penjualan</p>
                          <p className="text-base font-black font-mono mt-1.5 text-stone-900 dark:text-stone-100">{formatRupiah(dashboardData?.summary?.totalSales || 0)}</p>
                          <span className="text-[9px] text-stone-400 mt-1 block">{dashboardData?.summary?.transactionCount || 0} transaksi lunas/piutang</span>
                        </div>

                        {/* Laba Kotor Card */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm border-l-4 border-l-blue-500">
                          <p className="text-[9px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">Laba Kotor (Gross)</p>
                          <p className="text-base font-black font-mono mt-1.5 text-blue-600 dark:text-blue-400">{formatRupiah(dashboardData?.summary?.totalGrossProfit || 0)}</p>
                          <span className="text-[9px] text-stone-400 mt-1 block">Margin kotor kumulatif resep</span>
                        </div>

                        {/* Pengeluaran Card */}
                        <div onClick={() => setBizTab('PENGELUARAN')} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer shadow-sm border-l-4 border-l-rose-500 transition">
                          <p className="text-[9px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">Pengeluaran Operasional 💸</p>
                          <p className="text-base font-black font-mono mt-1.5 text-rose-600 dark:text-rose-400">{formatRupiah(dashboardData?.summary?.totalExpenses || 0)}</p>
                          <span className="text-[9px] text-stone-400 mt-1 block hover:underline">Kelola pengeluaran operasional →</span>
                        </div>

                        {/* Laba Bersih Card */}
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm border-l-4 border-l-purple-500">
                          <p className="text-[9px] font-bold tracking-wider uppercase text-stone-400 dark:text-stone-500">Laba Bersih (Net)</p>
                          <p className={`text-base font-black font-mono mt-1.5 ${((dashboardData?.summary?.netProfit || 0) >= 0) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {formatRupiah(dashboardData?.summary?.netProfit || 0)}
                          </p>
                          <span className="text-[9px] text-stone-400 mt-1 block">Laba kotor dikurangi pengeluaran</span>
                        </div>
                      </div>

                      {/* Small details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-500">Piutang Pelanggan Terutang:</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{formatRupiah(dashboardData?.summary?.totalPiutang || 0)}</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-500">Bahan Baku dengan Batch FIFO Aktif:</span>
                          <span className="font-mono font-bold text-stone-700 dark:text-stone-300">{dashboardData?.summary?.batchesCount || 0} batch</span>
                        </div>
                      </div>

                      {/* Monthly Chart (Sales vs Expenses) */}
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Grafik Komparasi Bulanan</h3>
                          <div className="flex items-center gap-4 text-[10px]">
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 block"></span><span className="font-medium text-stone-600 dark:text-stone-400">Penjualan</span></div>
                            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-rose-500 block"></span><span className="font-medium text-stone-600 dark:text-stone-400">Pengeluaran</span></div>
                          </div>
                        </div>

                        {/* Responsive SVG Bar Chart */}
                        <div className="relative w-full overflow-x-auto">
                          <div className="min-w-[550px] h-[240px]">
                            <svg className="w-full h-full" viewBox="0 0 600 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                              {(() => {
                                const salesArr = dashboardData?.chart?.sales || Array(12).fill(0);
                                const expensesArr = dashboardData?.chart?.expenses || Array(12).fill(0);
                                const maxVal = Math.max(...salesArr, ...expensesArr, 1000000);
                                const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
                                const heightMultiplier = 160 / maxVal;

                                return (
                                  <>
                                    {/* Grid Lines */}
                                    {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                                      const yVal = maxVal * pct;
                                      const yPos = 180 - pct * 160;
                                      return (
                                        <g key={idx}>
                                          <line x1="55" y1={yPos} x2="580" y2={yPos} stroke="currentColor" className="text-stone-100 dark:text-stone-800/60" strokeDasharray="4 4" strokeWidth="1" />
                                          <text x="45" y={yPos + 3} textAnchor="end" className="text-[9px] font-mono font-medium fill-stone-400 dark:fill-stone-600">
                                            {idx === 0 ? 'Rp 0' : formatShortRupiah(yVal)}
                                          </text>
                                        </g>
                                      );
                                    })}

                                    {/* Month Columns */}
                                    {months.map((m, idx) => {
                                      const sVal = salesArr[idx] || 0;
                                      const eVal = expensesArr[idx] || 0;
                                      const sHeight = sVal * heightMultiplier;
                                      const eHeight = eVal * heightMultiplier;

                                      const colWidth = (600 - 60 - 20) / 12;
                                      const colCenter = 60 + idx * colWidth + colWidth / 2;

                                      return (
                                        <g key={idx} className="group">
                                          {/* Sales Bar */}
                                          {sVal > 0 && (
                                            <rect x={colCenter - 13} y={180 - sHeight} width="11" height={sHeight} rx="3" fill="currentColor" className="text-emerald-500 hover:text-emerald-600 dark:text-emerald-600 dark:hover:text-emerald-500 transition-all duration-150">
                                              <title>{`Sales ${m}: ${formatRupiah(sVal)}`}</title>
                                            </rect>
                                          )}

                                          {/* Expenses Bar */}
                                          {eVal > 0 && (
                                            <rect x={colCenter + 2} y={180 - eHeight} width="11" height={eHeight} rx="3" fill="currentColor" className="text-rose-500 hover:text-rose-600 dark:text-rose-600 dark:hover:text-rose-500 transition-all duration-150">
                                              <title>{`Expense ${m}: ${formatRupiah(eVal)}`}</title>
                                            </rect>
                                          )}

                                          {/* Month Label */}
                                          <text x={colCenter} y="200" textAnchor="middle" className="text-[10px] font-bold fill-stone-500 dark:fill-stone-400">
                                            {m}
                                          </text>
                                        </g>
                                      );
                                    })}
                                  </>
                                );
                              })()}
                            </svg>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {bizTab === 'PENGELUARAN' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-sans">Pencatatan Pengeluaran (Expenses)</h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Catat biaya operasional bulanan toko terpisah dari pengeluaran stok bahan baku.</p>
                    </div>
                    <button onClick={() => { setExpenseForm({ expense_date: new Date().toISOString().split('T')[0], category: 'Operasional', amount: '', description: '' }); setShowAddExpenseModal(true); }} className="text-xs px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                      + Catat Pengeluaran
                    </button>
                  </div>

                  {isLoadingExpenses ? (
                    <div className="rounded-2xl p-12 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-400 shadow-sm animate-pulse">Memuat...</div>
                  ) : expensesData.length === 0 ? (
                    <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Belum ada pengeluaran dicatat untuk periode ini.</div>
                  ) : (
                    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50">
                              <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Tanggal</th>
                              <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Kategori</th>
                              <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Keterangan</th>
                              <th className="text-right px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Jumlah</th>
                              <th className="text-center px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            {expensesData.map((e: any) => (
                              <tr key={e.id} className="border-b border-stone-50 dark:border-stone-800/50 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition">
                                <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                  {new Date(e.expense_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="px-4 py-3 font-semibold text-stone-800 dark:text-stone-200">{e.category}</td>
                                <td className="px-4 py-3 text-stone-500 dark:text-stone-400">{e.description || '—'}</td>
                                <td className="px-4 py-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100">{formatRupiah(Number(e.amount))}</td>
                                <td className="px-4 py-3 text-center">
                                  <button onClick={() => handleDeleteExpense(e.id, e.category)} className="text-[10px] text-rose-500 font-bold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40">Hapus</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/30">
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total Pengeluaran</span>
                        <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                          {formatRupiah(expensesData.reduce((s: number, e: any) => s + Number(e.amount), 0))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Add Expense Form Modal */}
                  {showAddExpenseModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Catat Pengeluaran Baru</h3>
                          <button onClick={() => setShowAddExpenseModal(false)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs">✕</button>
                        </div>
                        <div>
                          <label className="text-[9px] font-medium text-stone-400 block mb-1">Tanggal *</label>
                          <input type="date" value={expenseForm.expense_date} onChange={e => setExpenseForm(f => ({ ...f, expense_date: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" />
                        </div>
                        <div>
                          <label className="text-[9px] font-medium text-stone-400 block mb-1">Kategori *</label>
                          <select value={expenseForm.category} onChange={e => setExpenseForm(f => ({ ...f, category: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none">
                            <option value="Operasional">Operasional</option>
                            <option value="Gaji Karyawan">Gaji Karyawan</option>
                            <option value="Sewa Tempat">Sewa Tempat</option>
                            <option value="Listrik & Air">Listrik & Air</option>
                            <option value="Pemasaran">Pemasaran</option>
                            <option value="Lainnya">Lainnya</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-medium text-stone-400 block mb-1">Jumlah Rp *</label>
                          <input type="number" placeholder="Contoh: 150000" value={expenseForm.amount} onChange={e => setExpenseForm(f => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" />
                        </div>
                        <div>
                          <label className="text-[9px] font-medium text-stone-400 block mb-1">Keterangan / Deskripsi</label>
                          <textarea placeholder="Masukkan keterangan (opsional)" value={expenseForm.description} onChange={e => setExpenseForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddExpenseModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                          <button onClick={handleAddExpense} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">{isSubmitting ? '...' : 'Simpan'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {bizTab === 'PENGATURAN' && (
                <div className="max-w-2xl mx-auto w-full space-y-6">
                  <div><h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Pengaturan Toko</h2><p className="text-xs mt-1 text-stone-500 dark:text-stone-400">Konfigurasi metode pembayaran dan template komunikasi</p></div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">Penyedia QRIS</label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Pisahkan dengan koma (contoh: DANA, GoPay, ShopeePay)</p>
                    <input type="text" value={settingsForm.qris_providers} onChange={e => { setSettingsForm(p => ({ ...p, qris_providers: e.target.value })); setSettingsDirty(true); }} placeholder="DANA, GoPay, ShopeePay" className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600/40" />
                  </div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">QRIS Image <span className="text-rose-500 text-[9px]">(Upload oleh Admin/Owner)</span></label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Upload gambar QR code QRIS untuk ditampilkan di struk digital</p>
                    <input ref={qrisFileRef} type="file" accept="image/*" onChange={handleQrisImageFile} className="hidden" />
                    <div className="flex items-center gap-2">
                      <button onClick={() => qrisFileRef.current?.click()} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-emerald-500 hover:text-stone-700 dark:hover:text-stone-200">
                        {settingsForm.qris_image ? 'Ganti Gambar QRIS' : '+ Upload QRIS'}
                      </button>
                      {settingsForm.qris_image && (
                        <button onClick={() => { setSettingsForm(p => ({ ...p, qris_image: '' })); setSettingsDirty(true); }} className="p-2.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl text-xs font-bold">✕ Hapus</button>
                      )}
                    </div>
                    {settingsForm.qris_image && (
                      <div className="w-full max-w-[200px] mx-auto mt-3 rounded-xl overflow-hidden border-2 border-emerald-200 dark:border-emerald-900 bg-white">
                        <img src={settingsForm.qris_image} alt="QRIS" className="w-full h-auto object-contain" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">Rekening Bank</label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Format: Bank - No Rek - Atas Nama. Satu rekening hanya bisa dimasukkan sekali (tidak boleh duplikat).</p>
                    {bankAccountError && <div className="px-3 py-2 rounded-xl text-[10px] font-medium bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">{bankAccountError}</div>}
                    <div className="space-y-2">
                      {settingsForm.bank_accounts.split('\n').filter(Boolean).map((acc, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
                          <span className="flex-1">{acc}</span>
                          <button onClick={() => handleRemoveBankAccount(idx)} className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950">✕ Hapus</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={bankAccountNew} onChange={e => { setBankAccountNew(e.target.value); setBankAccountError(''); }} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBankAccount(); }; }}
                        placeholder="Contoh: BCA - 1234567890 - Yori DevHouse" className="flex-1 rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20" />
                      <button onClick={handleAddBankAccount} disabled={!bankAccountNew.trim()} className="px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 shadow-sm">Tambah</button>
                    </div>
                  </div>
                  <div className="p-5 space-y-3 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                    <label className="text-xs font-bold text-stone-900 dark:text-stone-100">Template WhatsApp</label>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400">Placeholder: [customer_name], [invoice_no], [total_amount], [receipt_url]</p>
                    <textarea value={settingsForm.wa_template} onChange={e => { setSettingsForm(p => ({ ...p, wa_template: e.target.value })); setSettingsDirty(true); }} rows={3} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none font-mono bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600/40" />
                  </div>
                  <div className="flex justify-end">
                    <button onClick={handleSaveSettings} disabled={isSavingSettings || !settingsDirty}
                      className="px-6 py-2.5 rounded-xl font-bold text-xs active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 shadow-sm">{isSavingSettings ? 'Menyimpan...' : settingsDirty ? 'Simpan' : 'Tersimpan'}</button>
                  </div>
                </div>
              )}
              {bizTab === 'STOK' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Stok FIFO</h2>
                      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-lg">bahan baku</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAddBahanForm({ sku: '', name: '', unit: 'gram' }); setShowAddBahanModal(true); }} className="text-[10px] px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">+ Tambah Bahan</button>
                      <button onClick={fetchStockProducts} disabled={isLoadingStock} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">{isLoadingStock ? '...' : '↻'}</button>
                    </div>
                  </div>
                  {stockMessage && <div className="px-4 py-2 rounded-xl text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300">{stockMessage}</div>}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 space-y-2">
                      {isLoadingStock ? <div className="rounded-2xl p-12 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-400 shadow-sm">Memuat...</div>
                      : stockProducts.length === 0 ? <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Belum ada produk.</div>
                      : <div className="space-y-1.5">
                          {stockProducts.map((p: any) => (
                            <div key={p.id}
                              className={'p-3 rounded-xl flex items-center justify-between cursor-pointer text-xs border transition ' + (selectedStockProduct?.id === p.id ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600')}>
                              <div onClick={() => { setSelectedStockProduct(p); fetchStockBatches(p.id); setStockInForm(f => ({ ...f, product_id: p.id })); setStockAdjustForm(f => ({ ...f, product_id: p.id })); }} className="flex items-center gap-2.5 flex-1 min-w-0">
                                <span className="font-mono text-[9px] text-stone-400 dark:text-stone-500 w-14 truncate">{p.sku}</span>
                                <span className="font-medium truncate text-stone-800 dark:text-stone-200">{p.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); setEditStockForm({ id: p.id, sku: p.sku, name: p.name, unit: p.unit || 'pcs' }); setShowEditStockModal(true); }} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700">✎</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteStockProduct(p.id, p.name); }} className="text-[9px] px-1.5 py-0.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">✕</button>
                                <span className={'font-mono font-bold ml-1 ' + (p.total_stock > 10 ? 'text-emerald-600 dark:text-emerald-400' : p.total_stock > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500 dark:text-rose-400')}>{p.total_stock}</span>
                              </div>
                            </div>
                          ))}
                        </div>}
                    </div>
                    <div className="space-y-3">
                      {selectedStockProduct ? (
                        <>
                          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                            <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{selectedStockProduct.name}</p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">SKU: {selectedStockProduct.sku}</p>
                            <p className="text-lg font-bold font-mono text-stone-900 dark:text-stone-100 mt-2">{selectedStockProduct.total_stock}</p>
                            <p className="text-[9px] text-stone-400">Total Stok</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => { setShowStockInForm(true); setShowStockAdjustForm(false); }} className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">+ Stok In</button>
                            <button onClick={() => { setShowStockAdjustForm(true); setShowStockInForm(false); }} className="flex-1 py-2.5 rounded-xl font-bold text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-sm">Adjust</button>
                          </div>
                          {/* Stock In Form */}
                          {showStockInForm && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Tambah Stok</p>
                              <input type="text" placeholder="Batch No" value={stockInForm.batch_no} onChange={e => setStockInForm(f => ({ ...f, batch_no: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                              <input type="number" placeholder="Jumlah" value={stockInForm.qty} onChange={e => setStockInForm(f => ({ ...f, qty: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                              <input type="text" placeholder="Harga Beli" value={stockInForm.price_buy} onChange={e => setStockInForm(f => ({ ...f, price_buy: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                              <select 
                                value={stockInForm.supplier_id || ''} 
                                onChange={e => {
                                  const val = e.target.value;
                                  if (val === 'manual') {
                                    setStockInForm(f => ({ ...f, supplier_id: 'manual', supplier: '' }));
                                  } else {
                                    const selected = supplierList.find(s => s.id === parseInt(val, 10));
                                    setStockInForm(f => ({ 
                                      ...f, 
                                      supplier_id: val, 
                                      supplier: selected ? selected.name : '' 
                                    }));
                                  }
                                }} 
                                className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none"
                              >
                                <option value="">-- Pilih Supplier --</option>
                                {supplierList.map((s: any) => (
                                  <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                                <option value="manual">-- Ketik Manual / Tambah Baru --</option>
                              </select>
                              {stockInForm.supplier_id === 'manual' && (
                                <input 
                                  type="text" 
                                  placeholder="Nama Supplier Baru" 
                                  value={stockInForm.supplier} 
                                  onChange={e => setStockInForm(f => ({ ...f, supplier: e.target.value }))} 
                                  className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" 
                                />
                              )}
                              <div className="flex gap-2"><button onClick={() => setShowStockInForm(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button><button onClick={handleStockIn} disabled={isSubmitting} className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button></div>
                            </div>
                          )}
                          {/* Stock Adjust Form */}
                          {showStockAdjustForm && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Penyesuaian Stok</p>
                              <select value={stockAdjustForm.type} onChange={e => setStockAdjustForm(f => ({ ...f, type: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none"><option value="waste">Waste / Rusak</option><option value="opname">Opname / Selisih</option><option value="destruction">Destruction</option></select>
                              <input type="number" placeholder="Jumlah" value={stockAdjustForm.qty_adjusted} onChange={e => setStockAdjustForm(f => ({ ...f, qty_adjusted: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                              <textarea placeholder="Alasan" value={stockAdjustForm.reason} onChange={e => setStockAdjustForm(f => ({ ...f, reason: e.target.value }))} rows={2} className="w-full rounded-xl px-3 py-2 text-xs resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                              <div className="flex gap-2"><button onClick={() => setShowStockAdjustForm(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button><button onClick={handleStockAdjust} disabled={isSubmitting} className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button></div>
                            </div>
                          )}
                          {/* Stock Batches List — with unit price breakdown */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2">Batch FIFO & Harga Eceran</p>
                            {isLoadingBatches ? <p className="text-xs text-stone-400 animate-pulse">Memuat...</p>
                            : stockBatches.length === 0 ? <p className="text-xs text-stone-400">Belum ada batch.</p>
                            : <div className="space-y-2">{stockBatches.map((b: any) => {
                                const unit = selectedStockProduct?.unit || 'pcs';
                                const unitPrice = Number(b.price_buy) / b.qty_initial;
                                // Breakdown ke satuan terkecil
                                let smallestPrice = unitPrice;
                                let smallestLabel = '/' + unit;
                                if (unit === 'kg') { smallestPrice = unitPrice / 1000; smallestLabel = '/gram'; }
                                if (unit === 'liter') { smallestPrice = unitPrice / 1000; smallestLabel = '/ml'; }
                                if (unit === 'gram') { smallestPrice = unitPrice; smallestLabel = '/gram'; }
                                if (unit === 'ml') { smallestPrice = unitPrice; smallestLabel = '/ml'; }
                                return (
                                <div key={b.id} className="p-2 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-800/30">
                                  <div className="flex items-center justify-between text-[10px]">
                                    <span className="font-mono font-medium text-stone-700 dark:text-stone-300">{b.batch_no}</span>
                                    <span className={'font-mono font-bold ' + (b.qty_remaining > 0 ? 'text-emerald-600' : 'text-stone-400')}>{b.qty_remaining}/{b.qty_initial} {unit}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-[9px] mt-1 text-stone-400">
                                    <span>Total: {formatRupiah(Number(b.price_buy))}</span>
                                    <span className="font-mono">{formatRupiah(Math.round(unitPrice))}/{unit}</span>
                                  </div>
                                  <div className="text-[9px] mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                                    🔹 Harga eceran: {formatRupiah(Math.round(smallestPrice * 100) / 100)}{smallestLabel}
                                  </div>
                                </div>
                              );})}
                            </div>
                          }
                        </div>
                        </>
                      ) : (
                        <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Pilih produk untuk kelola stok</div>
                      )}
                    </div>
                  </div>

                  {/* ─── TAMBAH BAHAN BAKU MODAL ─── */}
                  {showAddBahanModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Tambah Bahan Baku</h3>
                          <button onClick={() => setShowAddBahanModal(false)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs">✕</button>
                        </div>
                        <input type="text" placeholder="SKU *" value={addBahanForm.sku} onChange={e => setAddBahanForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="text" placeholder="Nama Bahan *" value={addBahanForm.name} onChange={e => setAddBahanForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <div>
                          <label className="text-[9px] font-medium text-stone-400 dark:text-stone-500 block mb-1">Satuan Unit</label>
                          <select value={addBahanForm.unit} onChange={e => setAddBahanForm(f => ({ ...f, unit: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none">
                            <option value="gram">gram</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                            <option value="butir">butir</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddBahanModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                          <button onClick={handleAddBahanBaku} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── EDIT BAHAN BAKU MODAL ─── */}
                  {showEditStockModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Edit Bahan Baku</h3>
                          <button onClick={() => setShowEditStockModal(false)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs">✕</button>
                        </div>
                        <input type="text" placeholder="SKU *" value={editStockForm.sku} onChange={e => setEditStockForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="text" placeholder="Nama Bahan *" value={editStockForm.name} onChange={e => setEditStockForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <div>
                          <label className="text-[9px] font-medium text-stone-400 dark:text-stone-500 block mb-1">Satuan Unit</label>
                          <select value={editStockForm.unit} onChange={e => setEditStockForm(f => ({ ...f, unit: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none">
                            <option value="gram">gram</option>
                            <option value="ml">ml</option>
                            <option value="pcs">pcs</option>
                            <option value="butir">butir</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowEditStockModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                          <button onClick={handleEditStockProduct} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {bizTab === 'RESEP' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Resep & HPP</h2>
                      <p className="text-xs mt-1 text-stone-400 dark:text-stone-500">Atur komposisi bahan baku untuk setiap menu — HPP otomatis dari harga batch FIFO</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setNewMenuForm({ sku: '', name: '', price_sell: '', category_id: '', image_url: '' }); setShowAddMenuModal(true); }} className="text-[10px] px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">+ Tambah Menu</button>
                      <button onClick={() => { fetchRecipeProducts(); fetchStockMaterials(); }} disabled={isLoadingRecipe} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500">{isLoadingRecipe ? '...' : '↻'}</button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Product list */}
                    <div className="lg:col-span-2 space-y-2">
                      {isLoadingRecipe ? <div className="rounded-2xl p-12 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-400 shadow-sm">Memuat...</div>
                      : recipeProducts.length === 0 ? <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Belum ada produk jual.</div>
                      : <div className="space-y-1.5">
                          {recipeProducts.map((p: any) => (
                            <div key={p.id}
                              className={'p-3 rounded-xl flex items-center justify-between cursor-pointer text-xs border transition ' + (selectedRecipeProduct?.id === p.id ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-600')}>
                              <div onClick={() => { setSelectedRecipeProduct(p); fetchRecipeIngredients(p.id); setShowAddIngredient(false); }} className="flex items-center gap-2.5 flex-1 min-w-0">
                                {p.image_url ? <img src={p.image_url} alt={p.name} className="w-8 h-8 rounded-lg object-cover" /> : <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs">🍽️</div>}
                                <div>
                                  <span className="font-medium text-stone-800 dark:text-stone-200">{p.name}</span>
                                  <span className="block text-[9px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">{p.sku}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); setEditMenuForm({ id: p.id, sku: p.sku, name: p.name, price_sell: String(p.price_sell), category_id: String(p.category_id || ''), image_url: p.image_url || '' }); setShowEditMenuModal(true); }} className="text-[9px] px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700">✎</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteMenuProduct(p.id, p.name); }} className="text-[9px] px-1.5 py-0.5 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950">✕</button>
                                <span className="font-mono font-bold ml-1 text-stone-900 dark:text-stone-100">{formatRupiah(Number(p.price_sell))}</span>
                              </div>
                            </div>
                          ))}
                        </div>}
                    </div>
                    {/* Detail panel */}
                    <div className="space-y-3">
                      {selectedRecipeProduct ? (
                        <>
                          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center gap-3">
                              {selectedRecipeProduct.image_url ? <img src={selectedRecipeProduct.image_url} alt={selectedRecipeProduct.name} className="w-10 h-10 rounded-xl object-cover" /> : <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center">🍽️</div>}
                              <div>
                                <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{selectedRecipeProduct.name}</p>
                                <p className="text-[10px] text-stone-400 dark:text-stone-500">{selectedRecipeProduct.sku}</p>
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-stone-400">Harga Jual</span>
                                <span className="font-bold text-stone-900 dark:text-stone-100">{formatRupiah(Number(selectedRecipeProduct.price_sell))}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-stone-400">HPP (Resep)</span>
                                <span className={'font-bold ' + (recipeTotalHpp > 0 && recipeTotalHpp < Number(selectedRecipeProduct.price_sell) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400')}>{formatRupiah(recipeTotalHpp)}</span>
                              </div>
                              <div className="flex justify-between text-[10px]">
                                <span className="text-stone-400">Margin</span>
                                <span className={'font-bold ' + (recipeTotalHpp > 0 ? (recipeTotalHpp < Number(selectedRecipeProduct.price_sell) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400') : 'text-stone-400')}>
                                  {recipeTotalHpp > 0 ? formatRupiah(Number(selectedRecipeProduct.price_sell) - recipeTotalHpp) + ' (' + Math.round((Number(selectedRecipeProduct.price_sell) - recipeTotalHpp) / Number(selectedRecipeProduct.price_sell) * 100) + '%)' : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Ingredients list */}
                          <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Komposisi</p>
                              <button onClick={() => { setShowAddIngredient(true); }} className="text-[9px] px-2 py-1 rounded-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white">+ Tambah</button>
                            </div>
                            {recipeIngredients.length === 0 ? (
                              <p className="text-[10px] text-stone-400 text-center py-4">Belum ada resep. Tambahkan bahan baku!</p>
                            ) : (
                              <div className="space-y-2">
                                {recipeIngredients.map((ing: any) => {
                                  const hppItem = recipeHppBreakdown.find((h: any) => h.materialId === ing.material_id);
                                  return (
                                    <div key={ing.id} className="flex items-center justify-between py-1.5 border-b last:border-0 border-stone-100 dark:border-stone-800">
                                      <div className="flex-1">
                                        <span className="text-[10px] font-medium text-stone-700 dark:text-stone-300">{ing.material.name}</span>
                                        <span className="text-[9px] text-stone-400 dark:text-stone-500 ml-1">({Number(ing.qty_required)} {ing.material.unit})</span>
                                      </div>
                                      <div className="flex items-center gap-2 ml-2">
                                        {hppItem && <span className="text-[9px] font-mono text-stone-500">{formatRupiah(hppItem.subTotal)}</span>}
                                        <button onClick={() => handleRemoveIngredient(ing.id)} className="text-[9px] px-1.5 py-0.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">✕ Hapus</button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          {/* Add Ingredient Form */}
                          {showAddIngredient && (
                            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-sm">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Tambah Bahan</p>
                              <select value={addIngredientForm.material_id} onChange={e => setAddIngredientForm(f => ({ ...f, material_id: e.target.value }))}
                                className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none">
                                <option value="">Pilih bahan baku...</option>
                                {stockMaterials.map((m: any) => (
                                  <option key={m.id} value={m.id}>{m.name} ({m.sku}) — stok: {m.total_stock} {m.unit}</option>
                                ))}
                              </select>
                              <div>
                                <label className="text-[9px] font-medium text-stone-400 dark:text-stone-500 block mb-1">Jumlah yang dibutuhkan</label>
                                <input type="number" step="0.01" min="0" placeholder="Contoh: 4 (gram)" value={addIngredientForm.qty_required} onChange={e => setAddIngredientForm(f => ({ ...f, qty_required: e.target.value }))}
                                  className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setShowAddIngredient(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                                <button onClick={handleAddIngredient} disabled={isSubmitting} className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Pilih produk jual untuk atur resep & HPP</div>
                      )}
                    </div>
                  </div>

                  {/* ─── TAMBAH MENU MODAL ─── */}
                  {showAddMenuModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Tambah Menu Baru</h3>
                          <button onClick={() => setShowAddMenuModal(false)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs">✕</button>
                        </div>
                        <input type="text" placeholder="SKU *" value={newMenuForm.sku} onChange={e => setNewMenuForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="text" placeholder="Nama Menu *" value={newMenuForm.name} onChange={e => setNewMenuForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="number" placeholder="Harga Jual *" value={newMenuForm.price_sell} onChange={e => setNewMenuForm(f => ({ ...f, price_sell: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <select value={newMenuForm.category_id} onChange={e => setNewMenuForm(f => ({ ...f, category_id: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none">
                          <option value="">Pilih Kategori...</option>
                          {categoriesForMenu.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-stone-900 dark:text-stone-100">Foto Menu</label>
                          <input ref={menuPhotoFileRef} type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const compressed = await compressImage(file, 400, 0.7);
                            if (compressed) setNewMenuForm(p => ({ ...p, image_url: compressed }));
                          }} className="hidden" />
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => menuPhotoFileRef.current?.click()} className="flex-1 py-2 rounded-xl text-xs font-medium text-center bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-emerald-500 hover:text-stone-700 dark:hover:text-stone-200">
                              {newMenuForm.image_url ? 'Ganti Foto' : '+ Unggah Foto'}
                            </button>
                            {newMenuForm.image_url && (
                              <button type="button" onClick={() => setNewMenuForm(p => ({ ...p, image_url: '' }))} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl text-xs font-bold">✕ Hapus</button>
                            )}
                          </div>
                          {newMenuForm.image_url && (
                            <div className="w-24 h-24 mx-auto mt-2 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                              <img src={newMenuForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="text-[9px] text-stone-400 dark:text-stone-500">Setelah menu dibuat, atur komposisi bahan baku di panel detail.</div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddMenuModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                          <button onClick={async () => {
                            if (!newMenuForm.sku.trim() || !newMenuForm.name.trim() || !newMenuForm.price_sell || !newMenuForm.category_id) { alert('Isi semua field!'); return; }
                            try {
                              setIsSubmitting(true);
                              const res = await fetch('/api/products', {
                                method: 'POST', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  sku: newMenuForm.sku, name: newMenuForm.name,
                                  price_sell: parseFloat(newMenuForm.price_sell),
                                  category_id: parseInt(newMenuForm.category_id),
                                  type: 'produk_jual', unit: 'pcs',
                                  image_url: newMenuForm.image_url || null
                                }),
                              });
                              const result = await res.json();
                              if (result.success) {
                                alert('Menu berhasil dibuat!'); setShowAddMenuModal(false);
                                await fetchRecipeProducts();
                              } else alert('Gagal: ' + (result.error || ''));
                            } catch { alert('Gagal.'); }
                            finally { setIsSubmitting(false);
                          }}} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── EDIT MENU MODAL ─── */}
                  {showEditMenuModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Edit Menu</h3>
                          <button onClick={() => setShowEditMenuModal(false)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs">✕</button>
                        </div>
                        <input type="text" placeholder="SKU *" value={editMenuForm.sku} onChange={e => setEditMenuForm(f => ({ ...f, sku: e.target.value.toUpperCase() }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="text" placeholder="Nama Menu *" value={editMenuForm.name} onChange={e => setEditMenuForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="number" placeholder="Harga Jual *" value={editMenuForm.price_sell} onChange={e => setEditMenuForm(f => ({ ...f, price_sell: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <select value={editMenuForm.category_id} onChange={e => setEditMenuForm(f => ({ ...f, category_id: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none">
                          <option value="">Pilih Kategori...</option>
                          {categoriesForMenu.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-stone-900 dark:text-stone-100">Foto Menu</label>
                          <input ref={editMenuPhotoFileRef} type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0]; if (!file) return;
                            const compressed = await compressImage(file, 400, 0.7);
                            if (compressed) setEditMenuForm(p => ({ ...p, image_url: compressed }));
                          }} className="hidden" />
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => editMenuPhotoFileRef.current?.click()} className="flex-1 py-2 rounded-xl text-xs font-medium text-center bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-emerald-500 hover:text-stone-700 dark:hover:text-stone-200">
                              {editMenuForm.image_url ? 'Ganti Foto' : '+ Unggah Foto'}
                            </button>
                            {editMenuForm.image_url && (
                              <button type="button" onClick={() => setEditMenuForm(p => ({ ...p, image_url: '' }))} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-xl text-xs font-bold">✕ Hapus</button>
                            )}
                          </div>
                          {editMenuForm.image_url && (
                            <div className="w-24 h-24 mx-auto mt-2 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                              <img src={editMenuForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setShowEditMenuModal(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                          <button onClick={async () => {
                            if (!editMenuForm.name.trim() || !editMenuForm.sku.trim() || !editMenuForm.price_sell) { alert('Nama, SKU & Harga wajib diisi!'); return; }
                            try {
                              setIsSubmitting(true);
                              const res = await fetch('/api/products', {
                                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  id: editMenuForm.id, sku: editMenuForm.sku, name: editMenuForm.name,
                                  price_sell: parseFloat(editMenuForm.price_sell),
                                  category_id: editMenuForm.category_id ? parseInt(editMenuForm.category_id, 10) : null,
                                  image_url: editMenuForm.image_url || null
                                }),
                              });
                              const result = await res.json();
                              if (result.success) { alert(result.message); setShowEditMenuModal(false); await fetchRecipeProducts(); }
                              else alert('Gagal: ' + result.error);
                            } catch { alert('Gagal.'); }
                            finally { setIsSubmitting(false); }
                          }} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {bizTab === 'KONSUMEN' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Data Konsumen</h2>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowCustomerForm(true); setCustomerForm({ id: null, name: '', phone: '', address: '' }); }} className="text-[10px] px-3 py-1.5 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">+ Tambah</button>
                      <button onClick={() => fetchCustomers(customerSearch)} disabled={isLoadingCustomers} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{isLoadingCustomers ? '...' : '↻'}</button>
                    </div>
                  </div>
                  <input type="text" placeholder="Cari nama/telepon..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="w-full max-w-xs rounded-xl px-4 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10" />
                  {/* Customer Form Modal */}
                  {showCustomerForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{customerForm.name ? 'Edit' : 'Tambah'} Konsumen</h3>
                        <input type="text" placeholder="Nama *" value={customerForm.name} onChange={e => setCustomerForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <input type="text" placeholder="Telepon" value={customerForm.phone} onChange={e => setCustomerForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <textarea placeholder="Alamat" value={customerForm.address} onChange={e => setCustomerForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                        <div className="flex gap-2"><button onClick={() => setShowCustomerForm(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button><button onClick={handleCustomerFormSubmit} disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">{isSubmitting ? '...' : 'Simpan'}</button></div>
                      </div>
                    </div>
                  )}
                  {isLoadingCustomers ? <div className="rounded-2xl p-12 text-center text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-400 shadow-sm">Memuat...</div>
                  : customerList.length === 0 ? <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Belum ada konsumen.</div>
                  : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {customerList.map((c: any) => (
                        <div key={c.id} className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{c.name}</h4>
                            <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500">{c._count?.sales || 0} transaksi</span>
                          </div>
                          {c.phone && <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1">{c.phone}</p>}
                          {c.address && <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-0.5 line-clamp-1">{c.address}</p>}
                          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-800 flex gap-1.5">                              <button onClick={() => { setCustomerForm({ id: c.id, name: c.name, phone: c.phone || '', address: c.address || '' }); setShowCustomerForm(true); }} className="text-[9px] px-2 py-1 rounded-lg font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700">Edit</button>
                            <button onClick={async () => { if (confirm('Hapus ' + c.name + '?')) { await fetch('/api/customers?id=' + c.id, { method: 'DELETE' }); fetchCustomers(customerSearch); } }} className="text-[9px] px-2 py-1 rounded-lg font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950">Hapus</button>
                          </div>
                        </div>
                      ))}
                    </div>}
                </div>
              )}
              {bizTab === 'SUPPLIER' && (
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 font-sans">Manajemen Supplier & Histori Harga</h2>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Kelola data vendor pemasok dan pantau statistik tren harga beli bahan baku.</p>
                    </div>
                    <button 
                      onClick={() => { 
                        setSupplierForm({ id: null, name: '', phone: '', email: '', address: '' }); 
                        setShowSupplierForm(true); 
                      }} 
                      className="text-xs px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                    >
                      + Tambah Supplier
                    </button>
                  </div>

                  {/* Supplier Form Modal */}
                  {showSupplierForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80 animate-fade-in">
                      <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">{supplierForm.id ? 'Edit' : 'Tambah'} Supplier</h3>
                          <button onClick={() => setShowSupplierForm(false)} className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs">✕</button>
                        </div>
                        <form onSubmit={handleSupplierFormSubmit} className="space-y-4">
                          <div>
                            <label className="text-[9px] font-medium text-stone-400 block mb-1">Nama Supplier *</label>
                            <input 
                              type="text" 
                              required 
                              value={supplierForm.name} 
                              onChange={e => setSupplierForm(f => ({ ...f, name: e.target.value }))} 
                              className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" 
                              placeholder="Nama PT / CV / Toko"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-stone-400 block mb-1">Nomor Telepon</label>
                            <input 
                              type="text" 
                              value={supplierForm.phone} 
                              onChange={e => setSupplierForm(f => ({ ...f, phone: e.target.value }))} 
                              className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" 
                              placeholder="Contoh: 08123456789"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-stone-400 block mb-1">Email</label>
                            <input 
                              type="email" 
                              value={supplierForm.email} 
                              onChange={e => setSupplierForm(f => ({ ...f, email: e.target.value }))} 
                              className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" 
                              placeholder="email@supplier.com"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-stone-400 block mb-1">Alamat Lengkap</label>
                            <textarea 
                              value={supplierForm.address} 
                              onChange={e => setSupplierForm(f => ({ ...f, address: e.target.value }))} 
                              rows={3} 
                              className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40" 
                              placeholder="Alamat kantor / gudang supplier"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => setShowSupplierForm(false)} className="flex-1 py-3 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button>
                            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50">{isSubmitting ? '...' : 'Simpan'}</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Main Grid: Left Column Suppliers list, Right Column Price History Stats & Chart */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column: Suppliers */}
                    <div className="xl:col-span-1 space-y-3">
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Daftar Supplier</span>
                          <button 
                            onClick={() => fetchSuppliers(supplierSearchQuery)} 
                            disabled={isLoadingSuppliers} 
                            className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                          >
                            {isLoadingSuppliers ? '...' : 'Refresh'}
                          </button>
                        </div>
                        <input 
                          type="text" 
                          placeholder="Cari nama / telepon / email..." 
                          value={supplierSearchQuery} 
                          onChange={e => {
                            setSupplierSearchQuery(e.target.value);
                            fetchSuppliers(e.target.value);
                          }} 
                          className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10"
                        />
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                          {isLoadingSuppliers ? (
                            <div className="text-center text-xs text-stone-400 py-6 animate-pulse">Memuat supplier...</div>
                          ) : supplierList.length === 0 ? (
                            <div className="text-center text-xs text-stone-400 py-6 border border-dashed border-stone-200 dark:border-stone-800 rounded-xl">Belum ada data supplier.</div>
                          ) : (
                            supplierList.map((sup: any) => (
                              <div 
                                key={sup.id} 
                                className="p-3 rounded-xl border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/20 hover:border-stone-200 dark:hover:border-stone-700 transition space-y-2 animate-fade-in"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{sup.name}</h4>
                                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold inline-block mt-0.5">
                                      {sup._count?.stock_ins || 0} Pembelian Stok
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => {
                                        setSupplierForm({ id: sup.id, name: sup.name, phone: sup.phone || '', email: sup.email || '', address: sup.address || '' });
                                        setShowSupplierForm(true);
                                      }} 
                                      className="text-[9px] px-2 py-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSupplier(sup.id)} 
                                      className="text-[9px] px-2 py-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                    >
                                      Hapus
                                    </button>
                                  </div>
                                </div>
                                {(sup.phone || sup.email || sup.address) && (
                                  <div className="text-[10px] text-stone-500 dark:text-stone-400 space-y-0.5 border-t border-stone-100 dark:border-stone-800/50 pt-1.5">
                                    {sup.phone && <p>📞 {sup.phone}</p>}
                                    {sup.email && <p>✉️ {sup.email}</p>}
                                    {sup.address && <p className="line-clamp-2">📍 {sup.address}</p>}
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Statistics & SVG Chart */}
                    <div className="xl:col-span-2 space-y-4">
                      {/* Filter Bar */}
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-3">
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Filter Harga Beli</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] font-medium text-stone-400 block mb-1">Bahan Baku / Produk</label>
                            <select 
                              value={priceHistoryProductFilter} 
                              onChange={e => setPriceHistoryProductFilter(e.target.value)} 
                              className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none"
                            >
                              <option value="">Semua Bahan Baku</option>
                              {stockMaterials.map((p: any) => (
                                <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-medium text-stone-400 block mb-1">Supplier</label>
                            <select 
                              value={priceHistorySupplierFilter} 
                              onChange={e => setPriceHistorySupplierFilter(e.target.value)} 
                              className="w-full rounded-xl px-3 py-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none"
                            >
                              <option value="">Semua Supplier</option>
                              {supplierList.map((s: any) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* SVG Trend Line Chart */}
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm space-y-4">
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider block">Tren Harga Pembelian</span>
                        
                        {(() => {
                          const plotData = [...priceHistoryList].reverse(); // oldest first
                          if (isLoadingPriceHistory) {
                            return <div className="h-48 flex items-center justify-center text-xs text-stone-400 animate-pulse">Memuat diagram tren harga...</div>;
                          }
                          if (plotData.length < 2) {
                            return (
                              <div className="h-48 flex flex-col items-center justify-center text-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl p-6 text-stone-400">
                                <span className="text-xl mb-1">📈</span>
                                <p className="text-[11px]">Masukkan minimal 2 transaksi pembelian untuk bahan/produk dan supplier yang dipilih untuk memplot tren grafik.</p>
                              </div>
                            );
                          }

                          // Compute coordinates
                          const width = 600;
                          const height = 180;
                          const paddingX = 40;
                          const paddingY = 25;
                          
                          const prices = plotData.map(d => d.price_buy);
                          const minPrice = Math.min(...prices);
                          const maxPrice = Math.max(...prices);
                          const priceDiff = maxPrice - minPrice;
                          const priceRange = priceDiff === 0 ? minPrice * 0.2 || 1000 : priceDiff;
                          
                          const chartMin = priceDiff === 0 ? minPrice - priceRange : minPrice - (priceRange * 0.1);
                          const chartMax = priceDiff === 0 ? minPrice + priceRange : maxPrice + (priceRange * 0.1);
                          
                          const points = plotData.map((d, i) => {
                            const x = paddingX + (i / (plotData.length - 1)) * (width - paddingX * 2);
                            const y = height - paddingY - ((d.price_buy - chartMin) / (chartMax - chartMin)) * (height - paddingY * 2);
                            return { x, y, data: d };
                          });

                          const pathD = points.reduce((acc, p, idx) => {
                            return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
                          }, '');

                          const areaD = pathD + ` L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

                          return (
                            <div className="space-y-2">
                              <div className="w-full overflow-x-auto select-none">
                                <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px] h-auto overflow-visible">
                                  <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feGaussianBlur stdDeviation="3" result="blur" />
                                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                  </defs>

                                  {/* Gridlines horizontal */}
                                  {[0, 0.5, 1].map((ratio, i) => {
                                    const y = paddingY + ratio * (height - paddingY * 2);
                                    const priceLabel = chartMax - ratio * (chartMax - chartMin);
                                    return (
                                      <g key={i}>
                                        <line 
                                          x1={paddingX} 
                                          y1={y} 
                                          x2={width - paddingX} 
                                          y2={y} 
                                          className="stroke-stone-100 dark:stroke-stone-800/60" 
                                          strokeDasharray="4 4"
                                        />
                                        <text 
                                          x={paddingX - 6} 
                                          y={y + 3} 
                                          textAnchor="end" 
                                          className="fill-stone-400 text-[8px] font-mono"
                                        >
                                          {formatShortRupiah(priceLabel)}
                                        </text>
                                      </g>
                                    );
                                  })}

                                  {/* X Axis Dates */}
                                  {points.map((p, idx) => {
                                    if (idx === 0 || idx === points.length - 1 || (points.length > 5 && idx === Math.floor(points.length / 2))) {
                                      const d = new Date(p.data.change_date);
                                      const dateStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
                                      return (
                                        <text 
                                          key={idx}
                                          x={p.x} 
                                          y={height - 6} 
                                          textAnchor="middle" 
                                          className="fill-stone-400 text-[8px] font-semibold"
                                        >
                                          {dateStr}
                                        </text>
                                      );
                                    }
                                    return null;
                                  })}

                                  {/* Area chart */}
                                  <path d={areaD} fill="url(#chartGradient)" />

                                  {/* Line path */}
                                  <path 
                                    d={pathD} 
                                    fill="none" 
                                    className="stroke-emerald-500 dark:stroke-emerald-400" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    filter="url(#glow)"
                                  />

                                  {/* Dots */}
                                  {points.map((p, idx) => (
                                    <g key={idx} className="group cursor-pointer">
                                      <circle 
                                        cx={p.x} 
                                        cy={p.y} 
                                        r="4" 
                                        className="fill-white dark:fill-stone-900 stroke-emerald-500 dark:stroke-emerald-400" 
                                        strokeWidth="2"
                                      />
                                      <text 
                                        x={p.x} 
                                        y={p.y - 8} 
                                        textAnchor="middle" 
                                        className="fill-stone-800 dark:fill-stone-200 text-[8px] font-mono font-bold"
                                      >
                                        {formatShortRupiah(p.data.price_buy)}
                                      </text>
                                    </g>
                                  ))}
                                </svg>
                              </div>
                              <p className="text-[9px] text-center text-stone-400">Diagram sumbu X mewakili urutan log transaksi stok masuk</p>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Log Table */}
                      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/30 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Log Perubahan Harga Beli</span>
                          <span className="text-[10px] font-mono text-stone-400">{priceHistoryList.length} Transaksi</span>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50">
                                <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Tanggal</th>
                                <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Bahan/Produk</th>
                                <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Supplier</th>
                                <th className="text-right px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Harga Beli</th>
                                <th className="text-center px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Delta %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {isLoadingPriceHistory ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-8 text-stone-400 animate-pulse">Memuat riwayat...</td>
                                </tr>
                              ) : priceHistoryList.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-8 text-stone-400">Tidak ada riwayat harga yang cocok.</td>
                                </tr>
                              ) : (
                                priceHistoryList.map((hist: any) => {
                                  const delta = hist.delta_percent;
                                  let badgeClass = "text-stone-500 bg-stone-100 dark:bg-stone-800/80 dark:text-stone-400";
                                  let badgeText = "0%";
                                  if (delta > 0) {
                                    badgeClass = "text-rose-600 bg-rose-50 dark:bg-rose-950/30 dark:text-rose-400 font-bold";
                                    badgeText = `▲ ${delta.toFixed(1)}%`;
                                  } else if (delta < 0) {
                                    badgeClass = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold";
                                    badgeText = `▼ ${Math.abs(delta).toFixed(1)}%`;
                                  }

                                  return (
                                    <tr key={hist.id} className="border-b border-stone-100 dark:border-stone-800/50 hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition">
                                      <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-400 whitespace-nowrap">
                                        {new Date(hist.change_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="px-4 py-3 font-semibold text-stone-800 dark:text-stone-200">
                                        {hist.product_name}
                                        <span className="block text-[8px] font-mono font-normal text-stone-400">SKU: {hist.product_sku} ({hist.product_unit})</span>
                                      </td>
                                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300 font-medium">{hist.supplier_name}</td>
                                      <td className="px-4 py-3 text-right font-mono font-bold text-stone-900 dark:text-stone-100">{formatRupiah(Number(hist.price_buy))}</td>
                                      <td className="px-4 py-3 text-center whitespace-nowrap">
                                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full ${badgeClass}`}>
                                          {badgeText}
                                        </span>
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
                  </div>
                </div>
              )}
              {(bizTab === 'ORDERS' || bizTab === 'PIUTANG' || bizTab === 'RIWAYAT') && (
                <OrdersDataTable
                  title={bizTab === 'ORDERS' ? 'Daftar Pesanan' : bizTab === 'PIUTANG' ? 'Daftar Piutang' : 'Riwayat Transaksi'}
                  type={ordersType}
                  data={ordersData}
                  loading={ordersLoading}
                  error={ordersError}
                  year={ordersYear}
                  month={ordersMonth}
                  search={ordersSearch}
                  expandedRowId={expandedRowId}
                  onYearChange={setOrdersYear}
                  onMonthChange={(m) => { setOrdersMonth(m); fetchOrders(ordersType, ordersYear, m, ordersSearch); }}
                  onSearchChange={setOrdersSearch}
                  onSearch={(s) => fetchOrders(ordersType, ordersYear, ordersMonth, s)}
                  onRefresh={() => fetchOrders(ordersType, ordersYear, ordersMonth, ordersSearch)}
                  onToggleExpand={setExpandedRowId}
                  onProcess={(id) => { setProcessDialog({ saleId: id, open: true }); setProcessPaymentMethod('CASH'); setProcessPaymentStatus('lunas'); setProcessPaymentProof(''); setProcessPaymentProofName(''); }}
                  onDelete={handleDeleteSale}
                  formatRupiah={formatRupiah}
                  buildWaUrl={(phone, inv, total, name) => buildWaUrl(phone, inv, total, name)}
                  monthlySummary={ordersMonthlySummary}
                />
              )}
            </div>
          )}
          {viewMode === 'OPERATOR' && operatorRole === 'KASIR' && (
            <>
              {operatorTab === 'RIWAYAT' ? (
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <OrdersDataTable
                    title="Riwayat Transaksi (Kasir)"
                    type="riwayat"
                    data={ordersData}
                    loading={ordersLoading}
                    error={ordersError}
                    year={ordersYear}
                    month={ordersMonth}
                    search={ordersSearch}
                    expandedRowId={expandedRowId}
                    onYearChange={setOrdersYear}
                    onMonthChange={(m) => { setOrdersMonth(m); fetchOrders('riwayat', ordersYear, m, ordersSearch); }}
                    onSearchChange={setOrdersSearch}
                    onSearch={(s) => fetchOrders('riwayat', ordersYear, ordersMonth, s)}
                    onRefresh={() => fetchOrders('riwayat', ordersYear, ordersMonth, ordersSearch)}
                    onToggleExpand={setExpandedRowId}
                    onProcess={(id) => { setProcessDialog({ saleId: id, open: true }); setProcessPaymentMethod('CASH'); setProcessPaymentStatus('lunas'); setProcessPaymentProof(''); setProcessPaymentProofName(''); }}
                    onDelete={handleDeleteSale}
                    formatRupiah={formatRupiah}
                    buildWaUrl={(phone, inv, total, name) => buildWaUrl(phone, inv, total, name)}
                    monthlySummary={ordersMonthlySummary}
                  />
                </div>
              ) : (
                <>
                  {/* Sub-tab bar: Katalog | Ambil */}
              <div className="flex items-center gap-1 px-5 pt-3 pb-0 shrink-0 bg-stone-50/50 dark:bg-stone-950/50">
                <button onClick={() => setMobileActiveTab('KATALOG')} className={'px-4 py-2 text-xs font-bold rounded-t-xl transition ' + (mobileActiveTab !== 'AMBIL' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 border-b-white dark:border-b-stone-900 shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400')}>🛒 Katalog</button>
                <button onClick={() => { setMobileActiveTab('AMBIL'); fetchReadyOrders(); }} className={'px-4 py-2 text-xs font-bold rounded-t-xl transition ' + (mobileActiveTab === 'AMBIL' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-800 border-b-white dark:border-b-stone-900 shadow-sm' : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-400')}>
                  📦 Ambil{' '}
                  <span className={'ml-1 px-1.5 py-0.5 rounded-md text-[9px] ' + (readyOrders.filter((o: any) => o.status === 'ready' && o.type === 'dine_in').length > 0 ? 'bg-emerald-500 text-white' : 'bg-stone-200 dark:bg-stone-700 text-stone-500')}>
                    {readyOrders.filter((o: any) => o.status === 'ready' && o.type === 'dine_in').length}
                  </span>
                </button>
              </div>

              {mobileActiveTab !== 'AMBIL' ? (
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full">
                  <div className={'flex-1 p-5 sm:p-6 flex flex-col space-y-4 overflow-hidden h-full ' + (mobileActiveTab === 'KERANJANG' ? 'hidden md:flex' : 'flex')}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                      <div><h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Katalog Menu</h1><p className="text-xs text-stone-400 dark:text-stone-500">Tekan item untuk ditambahkan</p></div>
                      <input type="text" placeholder="Cari / scan SKU..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-xl px-4 py-2 text-xs w-full sm:max-w-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40 shadow-sm" />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 shrink-0">
                      <button onClick={() => setSelectedCategory(null)} className={'px-4 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition shadow-sm ' + (selectedCategory === null ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800')}>Semua</button>
                      {categories.map(cat => (<button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={'px-4 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition shadow-sm ' + (selectedCategory === cat.id ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900' : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800')}>{cat.name}</button>))}
                    </div>
                    <div className="flex-1 overflow-y-auto pr-1">
                      {loading ? <div className="text-center py-16 text-xs text-stone-400 animate-pulse">Memuat...</div>
                      : products.length === 0 ? <div className="text-center py-16 text-xs text-stone-400">Menu belum tersedia.</div>
                      : <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-24 md:pb-6">
                          {products.map(product => (
                            <div key={product.id} onClick={() => addToCart(product)} className="p-0 rounded-2xl flex flex-col justify-between cursor-pointer transition duration-200 group active:scale-[0.97] bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-700/70 hover:border-emerald-600/40 dark:hover:border-emerald-500/40 hover:shadow-md overflow-hidden">
                              {/* Product Image */}
                              {product.image_url ? (
                                <div className="w-full aspect-[4/3] overflow-hidden bg-stone-100 dark:bg-stone-800">
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={(e) => { const t = e.currentTarget; t.onerror = null; t.style.display = 'none'; (t.parentElement!).classList.add('flex', 'items-center', 'justify-center'); t.parentElement!.innerHTML += '<span class="text-2xl opacity-30">🍽️</span>'; }} />
                                </div>
                              ) : (
                                <div className="w-full aspect-[4/3] flex items-center justify-center bg-stone-50 dark:bg-stone-800/50">
                                  <span className="text-2xl opacity-30">🍽️</span>
                                </div>
                              )}
                              <div className="p-3">
                                <span className="text-[9px] font-mono font-bold block tracking-wider uppercase text-stone-400 dark:text-stone-500">{product.sku}</span>
                                <h3 className="font-semibold text-xs line-clamp-2 mt-0.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition text-stone-800 dark:text-stone-200">{product.name}</h3>
                                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800">
                                  <span className="font-bold text-xs font-mono text-stone-900 dark:text-stone-100">{formatRupiah(Number(product.price_sell))}</span>
                                  <div className="flex items-center gap-1">
                                    {(() => {
                                      const avail = availabilityMap[product.id];
                                      const portions = avail?.max_portions ?? 0;
                                      const hasRecipe = avail?.has_recipe ?? false;
                                      if (hasRecipe) {
                                        return (
                                          <span className={'text-[9px] font-bold px-1.5 py-0.5 rounded-md ' + (portions > 5 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : portions > 0 ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-950 text-rose-500 dark:text-rose-400')}>{portions > 0 ? portions + ' porsi' : '0'}</span>
                                        );
                                      }
                                      return (
                                        <span className={'text-[9px] font-bold px-1.5 py-0.5 rounded-md ' + ((product.total_stock ?? 0) > 5 ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' : (product.total_stock ?? 0) > 0 ? 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-950 text-rose-500 dark:text-rose-400')}>{product.total_stock ?? 0}</span>
                                      );
                                    })()}
                                    <span className="text-[10px] font-bold rounded-lg px-2 py-0.5 opacity-0 sm:group-hover:opacity-100 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950">+ ADD</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>}
                    </div>
                    {totalCartItems > 0 && (
                      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
                        <button onClick={() => setMobileActiveTab('KERANJANG')} className="w-full p-3.5 rounded-2xl flex items-center justify-between shadow-xl font-semibold text-xs active:scale-[0.98] bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/10">
                          <span className="px-2 py-0.5 rounded-md font-mono bg-white/20">Cart {totalCartItems}</span>
                          <span className="font-mono text-sm font-bold">{formatRupiah(calculateTotal())} →</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className={'w-full md:w-96 flex flex-col h-full shrink-0 bg-white dark:bg-stone-900 border-t md:border-t-0 md:border-l border-stone-200 dark:border-stone-800 ' + (mobileActiveTab === 'KERANJANG' ? 'flex' : 'hidden md:flex')}>
                    <div className="flex items-center justify-between p-4 border-b shrink-0 bg-stone-50/40 dark:bg-stone-800/40 border-stone-100 dark:border-stone-800">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setMobileActiveTab('KATALOG')} className="md:hidden p-1.5 rounded-xl text-xs font-bold mr-1 active:scale-95 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">Katalog</button>
                        <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100">Keranjang</h2>
                      </div>
                      {cart.length > 0 && <button onClick={() => setCart([])} className="text-xs font-medium text-stone-400 hover:text-red-500">Kosongkan</button>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center py-20 text-stone-300 dark:text-stone-700"><span className="text-3xl">🛒</span><p className="text-xs text-stone-400 dark:text-stone-500 mt-2">Keranjang kosong</p></div>
                      : cart.map(item => (
                          <div key={item.product.id} className="flex items-center justify-between gap-3 pb-3 border-b last:border-0 border-stone-50 dark:border-stone-800">
                            <div className="flex-1"><h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200">{item.product.name}</h4><p className="text-[10px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">{formatRupiah(Number(item.product.price_sell))}</p></div>
                            <div className="flex items-center overflow-hidden rounded-xl border shrink-0 bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 shadow-sm">
                              <button onClick={() => updateQuantity(item.product.id, -1)} className="px-2.5 py-1 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400">-</button>
                              <span className="px-1 text-xs font-bold font-mono w-6 text-center text-stone-800 dark:text-stone-200">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, 1)} className="px-2.5 py-1 text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400">+</button>
                            </div>
                          </div>
                        ))}
                    </div>
                    <div className="p-4 space-y-4 shrink-0 border-t bg-stone-50 dark:bg-stone-800/30 border-stone-200/60 dark:border-stone-800/60">
                      <div className="flex items-center justify-between font-semibold text-xs text-stone-900 dark:text-stone-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">Total</span>
                        <span className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400">{formatRupiah(calculateTotal())}</span>
                      </div>
                      {!isShiftActive ? (
                        <button onClick={() => { setOpenShiftForm(f => ({ ...f, cashier_name: currentUser?.username || 'Kasir' })); setShowOpenShiftModal(true); }}
                          className="w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-sm bg-amber-500 hover:bg-amber-600 text-white cursor-pointer active:scale-[0.99]">
                          🔑 Buka Kasir untuk Transaksi
                        </button>
                      ) : (
                        <button disabled={cart.length === 0} onClick={() => { setSelectedFulfillment(fulfillmentMethod); setIsCheckoutModalOpen(true); setCheckoutStep('MENU'); }}
                          className={'w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase shadow-sm ' + (cart.length > 0 ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.99]' : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 cursor-not-allowed')}>Proses</button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── KASIR AMBIL VIEW: READY dine_in orders → pickup + payment ─── */
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">🛍️ SIAP DIAMBIL</h2>
                    <button onClick={fetchReadyOrders} disabled={isLoadingReady} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{isLoadingReady ? '...' : '↻ Refresh'}</button>
                  </div>
                  {isLoadingReady ? (
                    <div className="text-center py-16 text-xs text-stone-400 animate-pulse">Memuat...</div>
                  ) : readyOrders.filter((o: any) => o.status === 'ready' && o.type === 'dine_in').length === 0 ? (
                    <div className="rounded-2xl p-16 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 bg-white dark:bg-stone-900">✅ Tidak ada pesanan siap ambil</div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {readyOrders.filter((o: any) => o.status === 'ready' && o.type === 'dine_in').map((order: any) => (
                        <div key={order.id} className="p-4 rounded-2xl border-l-4 border-l-emerald-500 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                          <div className="flex justify-between items-start pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                            <div>
                              <span className="font-mono font-bold text-xs text-emerald-700 dark:text-emerald-400">{order.invoice_no}</span>
                              {order.customer?.name && <p className="text-[10px] mt-0.5 text-stone-500 dark:text-stone-400 font-medium">{order.customer.name}</p>}
                            </div>
                            <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">SIAP</span>
                          </div>
                          <div className="text-[10px] leading-relaxed mb-3 text-stone-700 dark:text-stone-300">
                            {order.sale_details?.map((sd: any) => (
                              <span key={sd.id} className="block">{sd.qty}x {sd.product?.name}</span>
                            ))}
                          </div>
                          <div className="flex justify-between items-center text-xs pb-3 mb-3 border-b border-stone-100 dark:border-stone-800">
                            <span className="text-stone-400 dark:text-stone-500">Total:</span>
                            <span className="font-bold font-mono text-stone-900 dark:text-stone-100">{formatRupiah(Number(order.total_amount))}</span>
                          </div>
                          {/* Payment selection */}
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-1.5">
                              <button onClick={() => handleKasirPickup(order.id, 'lunas', 'CASH', '')}
                                disabled={isSubmitting}
                                className="py-2 rounded-xl text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.97] disabled:opacity-50">💵 Lunas Cash</button>
                              <button onClick={() => { setProcessPaymentMethod('QRIS'); setProcessPaymentStatus('lunas'); setProcessDialog({ saleId: order.id, open: true }); }}
                                className="py-2 rounded-xl text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white active:scale-[0.97]">📱 Lunas QRIS</button>
                              <button onClick={() => { setProcessPaymentMethod('TRANSFER'); setProcessPaymentStatus('lunas'); setProcessDialog({ saleId: order.id, open: true }); }}
                                className="py-2 rounded-xl text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.97]">🏦 Lunas Transfer</button>
                              <button onClick={() => handleKasirPickup(order.id, 'piutang', 'CASH', '')}
                                disabled={isSubmitting}
                                className="py-2 rounded-xl text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white active:scale-[0.97] disabled:opacity-50">📒 Piutang</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
          {viewMode === 'OPERATOR' && operatorRole === 'DAPUR' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">🍳 DAPUR</h2>
                <button onClick={fetchReadyOrders} disabled={isLoadingReady} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{isLoadingReady ? '...' : '↻'}</button>
              </div>
              {isLoadingReady ? <div className="p-12 text-center text-xs text-stone-400 animate-pulse">Memuat...</div>
              : readyOrders.filter((o: any) => o.status === 'proses').length === 0 ? <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 bg-white dark:bg-stone-900">✅ Semua pesanan sudah siap</div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyOrders.filter((o: any) => o.status === 'proses').map((order: any) => (
                    <div key={order.id} className="p-4 rounded-2xl border-l-4 border-l-amber-500 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                      <div className="flex justify-between items-start pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                        <div>
                          <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">{order.invoice_no}</span>
                          {order.customer?.name && <p className="text-[10px] mt-0.5 text-stone-400">{order.customer.name}</p>}
                        </div>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">{order.type === 'delivery' ? 'KIRIM' : 'AMBIL'}</span>
                      </div>
                      <div className="text-[10px] leading-relaxed mb-3 line-clamp-3 text-stone-700 dark:text-stone-300">
                        {order.sale_details?.map((sd: any) => <span key={sd.id} className="block">{sd.qty}x {sd.product?.name}</span>)}
                      </div>
                      <div className="flex justify-between items-center text-xs mb-3">
                        <span className="text-stone-400">Total:</span>
                        <span className="font-bold font-mono text-stone-900 dark:text-stone-100">{formatRupiah(Number(order.total_amount))}</span>
                      </div>
                      <button onClick={() => handleMarkReady(order.id)} disabled={isSubmitting}
                        className="w-full py-2.5 rounded-xl text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white active:scale-[0.98] disabled:bg-stone-200">{isSubmitting ? '...' : '✅ Siap'}</button>
                    </div>
                  ))}
                </div>}
              {/* Ready items */}
              {readyOrders.filter((o: any) => o.status === 'ready').length > 0 && (
                <>
                  <h3 className="text-[10px] uppercase tracking-widest font-bold text-emerald-600 dark:text-emerald-400 mt-6">✅ SUDAH SIAP</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readyOrders.filter((o: any) => o.status === 'ready').map((order: any) => (
                      <div key={order.id} className="p-4 rounded-2xl border-l-4 border-l-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                        <div className="flex justify-between items-start pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                          <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">{order.invoice_no}</span>
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">SIAP</span>
                        </div>
                        <div className="text-[10px] leading-relaxed text-stone-600 dark:text-stone-400">
                          {order.sale_details?.map((sd: any) => <span key={sd.id} className="block">{sd.qty}x {sd.product?.name}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {viewMode === 'OPERATOR' && operatorRole === 'KURIR' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-20">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500">🏍️ KURIR</h2>
                <button onClick={fetchReadyOrders} disabled={isLoadingReady} className="text-[10px] px-3 py-1.5 rounded-xl font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{isLoadingReady ? '...' : '↻'}</button>
              </div>
              {isLoadingReady ? <div className="p-12 text-center text-xs text-stone-400 animate-pulse">Memuat...</div>
              : readyOrders.filter((o: any) => o.status === 'ready' && o.type === 'delivery').length === 0 ? <div className="rounded-2xl p-12 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 text-stone-400 bg-white dark:bg-stone-900">Tidak ada pengiriman.</div>
              : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {readyOrders.filter((o: any) => o.status === 'ready' && o.type === 'delivery').map((order: any) => (
                    <div key={order.id} className="p-4 rounded-2xl border-l-4 border-l-amber-500 dark:border-l-amber-400 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm">
                      <div className="flex justify-between items-start pb-2 mb-2 border-b border-stone-100 dark:border-stone-800">
                        <div>
                          <span className="font-mono font-bold text-xs text-stone-900 dark:text-stone-100">{order.invoice_no}</span>
                          {order.customer?.name && <p className="text-[10px] mt-0.5 text-stone-400 dark:text-stone-500">{order.customer.name}</p>}
                        </div>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">SIAP KIRIM</span>
                      </div>
                      <div className="text-[10px] leading-relaxed mb-3 line-clamp-2 text-stone-700 dark:text-stone-300">{order.sale_details?.map((sd: any) => sd.qty + 'x ' + sd.product?.name).join(', ')}</div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-stone-400 dark:text-stone-500">Total:</span>
                        <span className="font-bold font-mono text-stone-900 dark:text-stone-100">{formatRupiah(Number(order.total_amount))}</span>
                      </div>
                      {order.delivery_address && (
                        <a href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(order.delivery_address)} target="_blank" rel="noopener noreferrer"
                          className="block mt-2 py-2 rounded-xl text-[10px] font-bold text-center bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 hover:bg-blue-100">
                          📍 Google Maps
                        </a>
                      )}
                      {order.customer?.phone && (
                        <a href={buildWaUrl(order.customer.phone, order.invoice_no, Number(order.total_amount), order.customer?.name || 'Pelanggan')} target="_blank" rel="noopener noreferrer"
                          className="block mt-1.5 py-2 rounded-xl text-[10px] font-bold text-center bg-emerald-500 hover:bg-emerald-600 text-white">
                          💬 WhatsApp
                        </a>
                      )}
                      <button onClick={() => { setCompletingSaleId(order.id); setCompletePaymentMethod('CASH'); setCompletePaymentStatus('lunas'); setCompletePaymentProof(''); setCompletePaymentProofName(''); setIsCompleteDialogOpen(true); }}
                        className="w-full mt-1.5 py-2.5 rounded-xl text-[10px] font-bold bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 active:scale-[0.98]">Selesai</button>
                    </div>
                  ))}
                </div>}
            </div>
          )}
        </main>
      </div>
      {/* CHECKOUT MODAL */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200">
            <div className="flex items-center justify-between p-5 shrink-0 border-b bg-stone-50/50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800">
              <div><h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Pilih Pembayaran</h3><p className="text-[10px] text-stone-400 dark:text-stone-500">Selesaikan transaksi</p></div>
              <button onClick={() => { setIsCheckoutModalOpen(false); setCheckoutStep('MENU'); setCashReceived(''); setPaymentProofBase64(''); setPaymentProofFileName(''); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200">✕</button>
            </div>
            <div className="p-6 text-center shrink-0 bg-stone-950"><span className="text-[10px] font-mono tracking-widest font-bold uppercase text-emerald-400">TOTAL</span><p className="text-3xl font-black font-mono text-white mt-1">{formatRupiah(calculateTotal())}</p></div>
            <div className="flex-1 overflow-y-auto p-6">
              {checkoutStep === 'MENU' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setSelectedFulfillment(fulfillmentMethod); setCheckoutStep('PESANAN'); }} className="p-5 rounded-2xl border border-amber-200 dark:border-amber-900 hover:border-amber-400 dark:hover:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20 hover:bg-amber-50/60 dark:hover:bg-amber-950/40 text-center group active:scale-[0.97]">
                    <span className="text-3xl group-hover:scale-110 transition block mb-2">📝</span><span className="font-bold text-xs text-stone-900 dark:text-stone-100">Pesanan</span></button>
                  <button onClick={() => { setCheckoutStep('GABUNG'); fetchPendingSales(); }} className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900 hover:border-indigo-400 dark:hover:border-indigo-700 bg-indigo-50/20 dark:bg-indigo-950/20 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 text-center group active:scale-[0.97]">
                    <span className="text-3xl group-hover:scale-110 transition block mb-2">🔗</span><span className="font-bold text-xs text-stone-900 dark:text-stone-100">Gabung</span></button>
                </div>
              )}
              {checkoutStep === 'PESANAN' && (
                <div className="space-y-5">
                  <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Penyerahan</label>
                    <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                      <button onClick={() => setSelectedFulfillment('AMBIL_TOKO')} className={'py-2 text-xs font-bold rounded-lg ' + (selectedFulfillment === 'AMBIL_TOKO' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Ambil Toko</button>
                      <button onClick={() => setSelectedFulfillment('DIKIRIM')} className={'py-2 text-xs font-bold rounded-lg ' + (selectedFulfillment === 'DIKIRIM' ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Kirim</button>
                    </div>
                  </div>
                  {selectedFulfillment === 'DIKIRIM' && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <p className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Detail Pengiriman</p>
                      <input type="text" placeholder="Telepon" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" />
                      <textarea placeholder="Alamat / Patokan Google Place" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} rows={2} className="w-full rounded-xl px-4 py-2.5 text-xs resize-none bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" />
                    </div>
                  )}
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="Nama Pelanggan" value={customerName} onChange={e => { setCustomerName(e.target.value); setShowSuggestionsDropdown(true); }} className="flex-1 rounded-xl px-4 py-2.5 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500/10" />
                      <button onClick={() => { setShowAddCustomerCheckout(true); setCheckoutCustomerForm({ name: customerName, phone: '', address: '' }); }} className="p-2.5 rounded-xl text-xs font-bold shrink-0 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200 dark:hover:bg-stone-700" title="Tambah Konsumen Baru">+</button>
                    </div>

                    {/* Suggestions dropdown */}
                    {showSuggestionsDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                        {customerSuggestions.length > 0 ? (
                          customerSuggestions.map((c: any) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setCustomerName(c.name);
                                setCustomerPhone(c.phone || '');
                                setCustomerAddress(c.address || '');
                                setDeliveryAddress(c.address || '');
                                setShowSuggestionsDropdown(false);
                              }}
                              className="px-4 py-2 text-xs hover:bg-stone-100 dark:hover:bg-stone-800 cursor-pointer flex justify-between items-center border-b last:border-b-0 border-stone-50 dark:border-stone-800"
                            >
                              <div>
                                <span className="font-semibold text-stone-800 dark:text-stone-200">{c.name}</span>
                                {c.phone && <span className="text-[10px] text-stone-400 dark:text-stone-500 ml-2">({c.phone})</span>}
                              </div>
                              <span className="text-[9px] text-stone-400 font-mono">{c.address ? '📍 Ada alamat' : ''}</span>
                            </div>
                          ))
                        ) : (
                          customerName.trim() && (
                            <div className="p-3 text-center">
                              <p className="text-[11px] text-stone-500">&ldquo;{customerName}&rdquo; belum terdaftar.</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setCheckoutCustomerForm({ name: customerName, phone: '', address: '' });
                                  setShowAddCustomerCheckout(true);
                                  setShowSuggestionsDropdown(false);
                                }}
                                className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                              >
                                + Buat Akun Baru
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                  {/* VIP: Input Tanggal Penjualan (Backdate) */}
                  {canBackdate && (
                    <div className="p-3 rounded-2xl border border-dashed border-amber-200 dark:border-amber-950 bg-amber-50/30 dark:bg-amber-950/30">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Tanggal Penjualan (Backdate)</label>
                      <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="w-full mt-1 rounded-xl px-4 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                    </div>
                  )}
                  {/* Add Customer from Checkout */}
                  {showAddCustomerCheckout && (
                    <div className="p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700 space-y-3">
                      <p className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Konsumen Baru</p>
                      <input type="text" placeholder="Nama *" value={checkoutCustomerForm.name} onChange={e => setCheckoutCustomerForm(f => ({ ...f, name: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                      <input type="text" placeholder="Telepon" value={checkoutCustomerForm.phone} onChange={e => setCheckoutCustomerForm(f => ({ ...f, phone: e.target.value }))} className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                      <textarea placeholder="Alamat" value={checkoutCustomerForm.address} onChange={e => setCheckoutCustomerForm(f => ({ ...f, address: e.target.value }))} rows={2} className="w-full rounded-xl px-3 py-2 text-xs resize-none bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 focus:outline-none" />
                      <div className="flex gap-2"><button onClick={() => setShowAddCustomerCheckout(false)} className="flex-1 py-2 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500">Batal</button><button onClick={handleCheckoutAddCustomer} className="flex-1 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white">Simpan & Pakai</button></div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => setCheckoutStep('MENU')} className="flex-1 py-3 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800">Kembali</button>
                    <button onClick={() => handleCheckoutSubmit()} disabled={isSubmitting} className="flex-1 py-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400">{isSubmitting ? '...' : 'Simpan → Dapur'}</button>
                  </div>
                </div>
              )}
              {checkoutStep === 'LUNAS' && (
                <div className="p-6 text-center space-y-3">
                  <span className="text-3xl">✅</span>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Pesanan ORD- sudah masuk ke Dapur!</p>
                  <p className="text-[10px] text-stone-400">Pembayaran akan dilakukan setelah dapur menyelesaikan pesanan. Lihat tab Kasir / Kurir untuk proses selanjutnya.</p>
                </div>
              )}
              {checkoutStep === 'GABUNG' && (
                <div className="space-y-5">
                  <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Pilih Nota</label>
                  {isLoadingPendingSales ? <div className="text-center py-8 text-xs text-stone-400 animate-pulse">Memuat...</div>
                  : pendingSales.length === 0 ? <div className="rounded-2xl p-8 text-center text-xs border border-dashed border-stone-200 dark:border-stone-700 text-stone-400">Kosong</div>
                  : <div className="space-y-2 max-h-60 overflow-y-auto">{pendingSales.map((s: any) => (
                      <div key={s.id} onClick={() => setSelectedPendingSaleId(s.id)} className={'p-3.5 rounded-2xl cursor-pointer border ' + (selectedPendingSaleId === s.id ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/30' : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900')}>
                        <div className="flex justify-between text-xs font-bold"><span className="font-mono text-stone-900 dark:text-stone-100">{s.invoice_no}</span><span className="text-indigo-700 dark:text-indigo-400 font-mono">{formatRupiah(Number(s.total_amount))}</span></div>
                        <div className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">{s.customer?.name || '-'}</div>
                      </div>
                    ))}</div>}
                  <div className="flex gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
                    <button onClick={() => setCheckoutStep('MENU')} className="flex-1 py-3 rounded-xl font-bold text-xs border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400">Kembali</button>
                    <button onClick={async () => { try { setIsSubmitting(true); const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cart, merge_sale_id: selectedPendingSaleId }) }); const result = await res.json(); if (res.ok && result.success) { alert(result.message); setCart([]); setIsCheckoutModalOpen(false); setCheckoutStep('MENU'); setSelectedPendingSaleId(null); await loadInitialData(); } else alert('Gagal: ' + result.error); } catch { alert('Gagal.'); } finally { setIsSubmitting(false); } }} disabled={isSubmitting || !selectedPendingSaleId} className="flex-1 py-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-stone-200 dark:disabled:bg-stone-800">{isSubmitting ? '...' : 'Gabung'}</button>
                  </div>
                </div>
              )}
              {checkoutStep === 'PIUTANG' && (
                <div className="p-6 text-center space-y-3">
                  <span className="text-3xl">✅</span>
                  <p className="text-xs font-bold text-stone-900 dark:text-stone-100">Semua pesanan baru dibuat sebagai ORD-</p>
                  <p className="text-[10px] text-stone-400">Untuk transaksi langsung Lunas / Piutang, gunakan tab Kasir setelah dapur menyelesaikan pesanan.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* PROCESS PAYMENT DIALOG (from data table) */}
      {processDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between p-5 border-b bg-stone-50/50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Proses Pembayaran</h3>
              <button onClick={() => { setProcessDialog({ saleId: 0, open: false }); setProcessPaymentProof(''); setProcessPaymentProofName(''); }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs font-bold">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Status</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                  <button onClick={() => setProcessPaymentStatus('lunas')} className={'py-2 text-xs font-bold rounded-lg ' + (processPaymentStatus === 'lunas' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Lunas</button>
                  <button onClick={() => setProcessPaymentStatus('piutang')} className={'py-2 text-xs font-bold rounded-lg ' + (processPaymentStatus === 'piutang' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Piutang</button>
                </div>
              </div>
              {processPaymentStatus === 'lunas' && (
                <><div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Metode</label>
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                    {(['CASH', 'QRIS', 'TRANSFER'] as const).map(m => (<button key={m} onClick={() => setProcessPaymentMethod(m)} className={'py-2 text-[10px] font-bold rounded-lg ' + (processPaymentMethod === m ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>{m === 'CASH' ? 'Tunai' : m === 'QRIS' ? 'QRIS' : 'Transfer'}</button>))}
                  </div></div>
                  {(processPaymentMethod === 'QRIS' || processPaymentMethod === 'TRANSFER') && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Bukti *</label>
                      <div className="flex gap-2"><input ref={processFileRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; setProcessPaymentProofName(f.name); const r = new FileReader(); r.onload = () => setProcessPaymentProof(r.result as string); r.readAsDataURL(f); }} className="hidden" />
                        <button onClick={() => processFileRef.current?.click()} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{processPaymentProofName || '+ Unggah'}</button>
                        {processPaymentProof && <button onClick={() => { setProcessPaymentProof(''); setProcessPaymentProofName(''); }} className="p-2.5 text-red-500">✕</button>}
                      </div>
                      {processPaymentProof && <div className="w-full h-32 rounded-xl overflow-hidden border bg-stone-100 dark:bg-stone-800"><img src={processPaymentProof} alt="Bukti" className="w-full h-full object-contain" /></div>}
                    </div>
                  )}
                </>
              )}
              {processPaymentStatus === 'piutang' && <div className="p-4 rounded-2xl text-[10px] border bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-300">Dicatat sebagai Piutang (INV-)</div>}
              <button onClick={handleProcessPayment} disabled={isSubmitting} className="w-full py-3 rounded-xl font-bold text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 shadow-sm">{isSubmitting ? '...' : 'Proses'}</button>
            </div>
          </div>
        </div>
      )}

      {/* COURIER COMPLETE */}
      {isCompleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between p-5 border-b bg-stone-50/50 dark:bg-stone-800/50 border-stone-100 dark:border-stone-800">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">Selesaikan</h3>
              <button onClick={() => { setIsCompleteDialogOpen(false); setCompletingSaleId(null); setCompletePaymentProof(''); setCompletePaymentProofName(''); }} className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs font-bold">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Status</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                  <button onClick={() => setCompletePaymentStatus('lunas')} className={'py-2 text-xs font-bold rounded-lg ' + (completePaymentStatus === 'lunas' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Lunas</button>
                  <button onClick={() => setCompletePaymentStatus('piutang')} className={'py-2 text-xs font-bold rounded-lg ' + (completePaymentStatus === 'piutang' ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>Piutang</button>
                </div>
              </div>
              {completePaymentStatus === 'lunas' && (
                <><div><label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Metode</label>
                  <div className="grid grid-cols-3 gap-2 p-1 rounded-xl border bg-stone-100 dark:bg-stone-800 border-stone-200/50 dark:border-stone-700/50 mt-1">
                    {(['CASH', 'QRIS', 'TRANSFER'] as const).map(m => (<button key={m} onClick={() => setCompletePaymentMethod(m)} className={'py-2 text-[10px] font-bold rounded-lg ' + (completePaymentMethod === m ? 'bg-white dark:bg-stone-700 text-stone-950 dark:text-stone-100 shadow-sm' : 'text-stone-400 dark:text-stone-500')}>{m === 'CASH' ? 'Tunai' : m === 'QRIS' ? 'QRIS' : 'Transfer'}</button>))}
                  </div></div>
                  {(completePaymentMethod === 'QRIS' || completePaymentMethod === 'TRANSFER') && (
                    <div className="space-y-3 p-4 rounded-2xl border bg-stone-50 dark:bg-stone-800/30 border-stone-200 dark:border-stone-700">
                      <label className="text-[9px] uppercase font-mono tracking-widest font-bold text-stone-400 dark:text-stone-500">Bukti *</label>
                      <div className="flex gap-2"><input ref={completeFileRef} type="file" accept="image/*" onChange={handleCompleteProofFile} className="hidden" />
                        <button onClick={() => completeFileRef.current?.click()} className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400">{completePaymentProofName || '+ Unggah'}</button>
                        {completePaymentProof && <button onClick={() => { setCompletePaymentProof(''); setCompletePaymentProofName(''); }} className="p-2.5 text-red-500">✕</button>}
                      </div>
                      {completePaymentProof && <div className="w-full h-32 rounded-xl overflow-hidden border bg-stone-100 dark:bg-stone-800"><img src={completePaymentProof} alt="Bukti" className="w-full h-full object-contain" /></div>}
                    </div>
                  )}
                </>
              )}
              {completePaymentStatus === 'piutang' && <div className="p-4 rounded-2xl text-[10px] border bg-rose-50/50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900 text-rose-800 dark:text-rose-300">Dicatat sebagai Piutang</div>}
              <button onClick={handleCompleteDelivery} disabled={isSubmitting} className="w-full py-3 rounded-xl font-bold text-xs bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-900 disabled:bg-stone-200 dark:disabled:bg-stone-800 disabled:text-stone-400 shadow-sm">{isSubmitting ? '...' : 'Selesaikan'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUKA SHIFT / BUKA KASIR */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-stone-900/50 dark:bg-stone-950/80">
          <div className="w-full max-w-md rounded-3xl border shadow-2xl bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <span>🔑</span> Buka Kasir / Mulai Shift
              </h3>
              <button
                onClick={() => setShowOpenShiftModal(false)}
                className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500 dark:text-stone-400 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Silakan masukkan nama kasir dan saldo awal di laci kas untuk mulai mencatat transaksi penjualan.
            </p>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Nama Kasir *</label>
              <input
                type="text"
                placeholder="Nama Kasir"
                value={openShiftForm.cashier_name}
                onChange={e => setOpenShiftForm(f => ({ ...f, cashier_name: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40"
              />
            </div>
            <div>
              <label className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Saldo Awal Laci Kas (Rp) *</label>
              <input
                type="number"
                placeholder="Contoh: 100000"
                value={openShiftForm.opening_balance}
                onChange={e => setOpenShiftForm(f => ({ ...f, opening_balance: e.target.value }))}
                className="w-full rounded-xl px-4 py-2.5 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600/40"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowOpenShiftModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400"
              >
                Batal
              </button>
              <button
                onClick={handleOpenShift}
                disabled={!openShiftForm.cashier_name.trim()}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                Mulai Shift
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── Unified Data Table Component ───
function OrdersDataTable({ title, type, data, loading, error, year, month, search, expandedRowId, onYearChange, onMonthChange, onSearchChange, onSearch, onRefresh, onToggleExpand, onProcess, onDelete, formatRupiah, buildWaUrl, monthlySummary = [] }: {
  title: string; type: string; data: any[]; loading: boolean; error: string;
  year: string; month: string; search: string;
  expandedRowId: number | null;
  onYearChange: (y: string) => void;
  onMonthChange: (m: string) => void;
  onSearchChange: (s: string) => void;
  onSearch: (s: string) => void;
  onRefresh: () => void;
  onToggleExpand: (id: number | null) => void;
  onProcess: (id: number) => void;
  onDelete: (id: number, inv: string) => void;
  formatRupiah: (v: number) => string;
  buildWaUrl: (phone: string, inv: string, total: number, name: string) => string;
  monthlySummary?: any[];
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const currentMonth = new Date().getMonth() + 1;

  const prefixLabel = (inv: string) => inv.startsWith('ORD') ? 'ORD' : inv.startsWith('INV') ? 'INV' : inv.startsWith('KWI') ? 'KWI' : '—';
  const badgeColor = (inv: string) => {
    if (inv.startsWith('ORD')) return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    if (inv.startsWith('INV')) return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300';
    if (inv.startsWith('KWI')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    return 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400';
  };
  const statusLabel = (s: string) => {
    const map: Record<string, string> = { proses: 'Proses', ready: 'Siap', lunas: 'Lunas', piutang: 'Piutang', terkirim: 'Terkirim', voided: 'Void' };
    return map[s] || s;
  };
  const statusColor = (s: string) => {
    const map: Record<string, string> = {
      proses: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      ready: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      lunas: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
      piutang: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
      terkirim: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      voided: 'bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400',
    };
    return map[s] || 'bg-stone-100 text-stone-600 dark:bg-stone-800';
  };

  const totals = data.reduce((s: number, r: any) => s + Number(r.total_amount), 0);

  return (
    <div className="space-y-5">
      {/* Header: Title + Year Filter + Search + Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h2>
        <div className="flex items-center gap-2">
          <select value={year} onChange={e => { onYearChange(e.target.value); }} className="rounded-xl px-3 py-1.5 text-[10px] font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <input type="text" placeholder="Cari invoice/nama..." value={search} onChange={e => onSearchChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSearch(search); }}
            className="w-40 rounded-xl px-3 py-1.5 text-[10px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 focus:outline-none" />
          <button onClick={onRefresh} disabled={loading} className="px-3 py-1.5 rounded-xl text-[10px] font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-50">
            {loading ? '⋯' : '↻'}
          </button>
        </div>
      </div>

      {/* Month Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pb-1">
        {months.map((m, i) => {
          const monthNum = (i + 1).toString();
          const isActive = month === monthNum;
          const monthData = monthlySummary.find((s: any) => s.month === (i + 1)) || { count: 0, total: 0 };
          return (
            <button key={i} onClick={() => onMonthChange(monthNum)}
              className={'p-3 rounded-2xl text-left border transition relative active:scale-[0.98] ' +
                (isActive
                  ? 'bg-stone-900 border-stone-900 text-white dark:bg-stone-100 dark:border-stone-100 dark:text-stone-950 shadow-md'
                  : 'bg-white border-stone-200 dark:bg-stone-900 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800')
              }>
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span>{m === 'Jan' ? 'Januari' : m === 'Feb' ? 'Februari' : m === 'Mar' ? 'Maret' : m === 'Apr' ? 'April' : m === 'Mei' ? 'Mei' : m === 'Jun' ? 'Juni' : m === 'Jul' ? 'Juli' : m === 'Agu' ? 'Agustus' : m === 'Sep' ? 'September' : m === 'Okt' ? 'Oktober' : m === 'Nov' ? 'November' : 'Desember'}</span>
                <span className={isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-stone-400'}>{monthData.count} trans</span>
              </div>
              <div className="text-[11px] font-bold font-mono mt-1.5 whitespace-nowrap">
                {formatRupiah(monthData.total)}
              </div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && <div className="px-4 py-2 rounded-xl text-[10px] font-medium bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">{error}</div>}

      {/* Data Table */}
      {loading ? (
        <div className="rounded-2xl p-16 text-center text-xs text-stone-400 animate-pulse bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm">Memuat...</div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl p-16 text-center text-xs border border-dashed border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-400 shadow-sm">Belum ada data.</div>
      ) : (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/50">
                  <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Tanggal</th>
                  <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Nama</th>
                  <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Bukti</th>
                  <th className="text-right px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Nominal</th>
                  <th className="text-center px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">WA</th>
                  <th className="text-left px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Alamat</th>
                  <th className="text-center px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Status</th>
                  <th className="text-center px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Proses</th>
                  <th className="text-center px-4 py-3 font-bold text-[9px] uppercase tracking-wider text-stone-400 dark:text-stone-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row: any) => {
                  const isExpanded = expandedRowId === row.id;
                  const invPrefix = prefixLabel(row.invoice_no);
                  return (
                    <>
                      <tr key={row.id}
                        onClick={() => onToggleExpand(isExpanded ? null : row.id)}
                        className={'border-b border-stone-50 dark:border-stone-800/50 cursor-pointer hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition ' + (isExpanded ? 'bg-stone-50/30 dark:bg-stone-800/20' : '')}>
                        <td className="px-4 py-3 font-mono text-stone-600 dark:text-stone-400 whitespace-nowrap">
                          {new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                        </td>
                        <td className="px-4 py-3 font-medium text-stone-800 dark:text-stone-200">{row.customer?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={'text-[9px] font-bold px-1.5 py-0.5 rounded-md ' + badgeColor(row.invoice_no)}>
                            {invPrefix}
                          </span>
                          <span className="ml-1 font-mono text-[9px] text-stone-400">{row.invoice_no.slice(0, 15)}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                          {formatRupiah(Number(row.total_amount))}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.customer?.phone ? (
                            <a href={buildWaUrl(row.customer.phone, row.invoice_no, Number(row.total_amount), row.customer?.name || 'Pelanggan')}
                              target="_blank" rel="noopener noreferrer"
                              className="inline-block px-2 py-1 rounded-lg text-[9px] font-bold bg-emerald-500 hover:bg-emerald-600 text-white">WA</a>
                          ) : <span className="text-[9px] text-stone-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-stone-500 dark:text-stone-400 max-w-[120px] truncate text-[10px]">
                          {row.delivery_address || row.customer?.address || '—'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={'text-[9px] font-bold px-1.5 py-0.5 rounded-md ' + statusColor(row.status)}>{statusLabel(row.status)}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {row.status === 'piutang' ? (
                            <button onClick={(e) => { e.stopPropagation(); onProcess(row.id); }}
                              className="px-2 py-1 rounded-lg text-[9px] font-bold bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:opacity-80">Bayar</button>
                          ) : row.status === 'proses' ? (
                            <span className="text-[9px] text-stone-400">—</span>
                          ) : row.status === 'ready' ? (
                            <span className="text-[9px] text-stone-400">—</span>
                          ) : (
                            <span className="text-[9px] text-stone-400">✓</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <a href={'/struk/' + row.invoice_no} target="_blank" rel="noopener noreferrer"
                              className="px-1.5 py-1 rounded-lg text-[9px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-200">📄</a>
                            {row.customer?.phone && (
                              <a href={buildWaUrl(row.customer.phone, row.invoice_no, Number(row.total_amount), row.customer?.name || 'Pelanggan')}
                                target="_blank" rel="noopener noreferrer"
                                className="px-1.5 py-1 rounded-lg text-[9px] font-medium bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:text-emerald-800">💬</a>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); onDelete(row.id, row.invoice_no); }}
                              className="px-1.5 py-1 rounded-lg text-[9px] font-medium text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950">🗑</button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr key={row.id + '-detail'}>
                          <td colSpan={9} className="px-6 py-4 bg-stone-50/50 dark:bg-stone-800/30">
                            <div className="space-y-2">
                              <p className="text-[10px] font-bold text-stone-700 dark:text-stone-300">Detail Pesanan</p>
                              <div className="space-y-1">
                                {row.sale_details?.map((sd: any) => (
                                  <div key={sd.id} className="flex items-center justify-between text-[10px] text-stone-600 dark:text-stone-400 pl-3 border-l-2 border-stone-200 dark:border-stone-700">
                                    <span>{sd.qty}x {sd.product?.name || '—'}</span>
                                    <span className="font-mono">{formatRupiah(Number(sd.price_sell_at_sale) * sd.qty)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="flex justify-between text-xs font-bold pt-2 border-t border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                                <span>Total</span>
                                <span className="font-mono">{formatRupiah(Number(row.total_amount))}</span>
                              </div>
                              {row.customer?.latitude && row.customer?.longitude && (
                                <a href={'https://www.google.com/maps/search/?api=1&query=' + row.customer.latitude + ',' + row.customer.longitude}
                                  target="_blank" rel="noopener noreferrer"
                                  className="inline-block mt-1 py-1.5 px-3 rounded-lg text-[9px] font-medium bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">📍 Google Maps</a>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Totals Footer */}
          <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-800/30">
            <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Total {data.length} transaksi</span>
            <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">{formatRupiah(totals)}</span>
          </div>
        </div>
      )}

      {/* Process Dialog */}
    </div>
  );
}

function SidebarItem({ icon, label, minimized, active = false, onClick }: { icon: string; label: string; minimized: boolean; active?: boolean; onClick: () => void }) {
  return (<button onClick={onClick} className={'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all duration-150 ' + (active ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-200 active:scale-[0.98]')}><span className="text-sm shrink-0">{icon}</span>{!minimized && <span className="truncate tracking-wide font-medium">{label}</span>}</button>);
}
function BottomNavItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (<button className="flex flex-col items-center justify-center py-1 px-3 text-center active:scale-95"><span className="text-base">{icon}</span><span className={'text-[9px] font-bold tracking-tight mt-1 ' + (active ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-400 dark:text-stone-500')}>{label}</span></button>);
}
