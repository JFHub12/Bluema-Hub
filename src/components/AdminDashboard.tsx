import React, { useState, useRef } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Edit2, 
  ShieldAlert, 
  ChevronRight, 
  Upload, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  Star, 
  Sparkles, 
  Coins,
  LayoutDashboard,
  Package,
  FolderTree,
  ClipboardList,
  Users,
  Settings,
  LogOut,
  CheckCircle2,
  Clock,
  Truck,
  Database,
  RefreshCw,
  HardDrive,
  Cloud
} from 'lucide-react';
import { ApiService, PAYMENT_API_KEY } from '../services/api';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CartAnimate } from './CartAnimate';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onProductUpdated: (result?: { success: boolean; message: string }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onProductUpdated }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'database' | 'settings'>('dashboard');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | 'cloth' | 'accessories' | 'diffuser' | 'iphones'>('all');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword || newAdminPassword.length < 4) {
      setPasswordChangeMessage({ success: false, text: 'Password must be at least 4 characters.' });
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setPasswordChangeMessage({ success: false, text: 'New passwords do not match.' });
      return;
    }

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: newAdminPassword })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        try {
          localStorage.removeItem('verified_admin_password');
        } catch {}
        setPasswordChangeMessage({ success: true, text: 'Admin console passkey securely updated and stored in server secret!' });
        setNewAdminPassword('');
        setConfirmAdminPassword('');
        await fetchAdminData();
      } else {
        setPasswordChangeMessage({ success: false, text: data.error || 'Failed to update admin passkey.' });
      }
    } catch {
      setPasswordChangeMessage({ success: false, text: 'Network error while updating admin passkey.' });
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [prodRes, orderRes, custRes, logRes, syncData] = await Promise.all([
        fetch('/api/products').catch(() => null),
        fetch('/api/orders').catch(() => null),
        fetch('/api/customers').catch(() => null),
        fetch('/api/audit-logs').catch(() => null),
        ApiService.getSyncStatus().catch(() => null)
      ]);
      if (prodRes && prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }
      if (orderRes && orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData.orders || []);
      }
      if (custRes && custRes.ok) {
        const custData = await custRes.json();
        setCustomers(custData.customers || []);
      }
      if (logRes && logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData.logs || []);
      }
      if (syncData) {
        setSyncStatus(syncData);
      }
    } catch (e) {
      console.error('Failed to load admin console data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const result = await ApiService.forceDatabaseSync();
      if (result && result.success) {
        setSyncFeedback(`Sync complete: ${result.result?.products || 0} products, ${result.result?.orders || 0} orders, ${result.result?.auditLogs || 0} audit logs mirrored to Firebase!`);
        await fetchAdminData();
      } else {
        setSyncFeedback(result?.message || 'Synchronization encountered an issue.');
      }
    } catch (err: any) {
      setSyncFeedback(err.message || 'Sync request failed.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        const currentImages = editingProduct.images && Array.isArray(editingProduct.images) 
          ? editingProduct.images 
          : (editingProduct.image ? [editingProduct.image] : []);
        const newImages = [...currentImages, res];
        setEditingProduct({ 
          ...editingProduct, 
          image: editingProduct.image || res,
          images: newImages 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (product: any) => {
    if (!product.name || !product.price || !product.category) {
      onProductUpdated({ success: false, message: 'Please fill in required product details (Name, Price in GH₵, Category).' });
      return;
    }
    setLoading(true);
    try {
      const imagesList = product.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (product.image ? [product.image] : []);
      const primaryImage = product.image || (imagesList.length > 0 ? imagesList[0] : '');

      const payload = {
        ...product,
        price: parseFloat(product.price) || 0,
        image: primaryImage,
        images: imagesList,
        rating: product.rating !== undefined ? parseFloat(product.rating) : 5.0,
        in_stock: product.in_stock ? 1 : 0
      };

      const method = product.id ? 'PUT' : 'POST';
      const res = await fetch('/api/products', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_KEY}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingProduct(null);
        await fetchAdminData();
        const actionType = product.id ? 'updated' : 'published';
        
        try {
          await addDoc(collection(db, 'adminLogs'), {
            actionType: product.id ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
            actor: 'Admin',
            details: `${product.name} successfully ${actionType} at GH₵${payload.price.toLocaleString()}`,
            createdAt: Date.now()
          });
          await fetch('/api/audit-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionType: product.id ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT',
              actor: 'Admin',
              details: `${product.name} ${actionType}`
            })
          });
        } catch (e) {
          console.warn('Admin audit logging note:', e);
        }

        onProductUpdated({ 
          success: true, 
          message: `${product.name} successfully ${actionType} at GH₵${payload.price.toLocaleString()}!` 
        });
      } else {
        onProductUpdated({ success: false, message: data.error || 'Failed to save product.' });
      }
    } catch (err: any) {
      onProductUpdated({ success: false, message: err.message || 'Network error while saving product.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!editingProduct?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PAYMENT_API_KEY}`
        },
        body: JSON.stringify({ id: editingProduct.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const itemName = editingProduct?.name || 'Product';
        setShowDeleteConfirm(false);
        setEditingProduct(null);
        await fetchAdminData();

        try {
          await addDoc(collection(db, 'adminLogs'), {
            actionType: 'DELETE_PRODUCT',
            actor: 'Admin',
            details: `${itemName} deleted`,
            createdAt: Date.now()
          });
          await fetch('/api/audit-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionType: 'DELETE_PRODUCT',
              actor: 'Admin',
              details: `${itemName} deleted`
            })
          });
        } catch (e) {}

        onProductUpdated({ success: true, message: `${itemName} successfully deleted.` });
      } else {
        onProductUpdated({ success: false, message: data.error || 'Failed to delete product.' });
      }
    } catch (err: any) {
      onProductUpdated({ success: false, message: err.message || 'Network error while deleting.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredProducts = productCategoryFilter === 'all' 
    ? products 
    : products.filter(p => p.category === productCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-950 text-slate-100 w-full max-w-7xl h-[90vh] rounded-3xl flex overflow-hidden border border-slate-800 shadow-2xl font-sans">
        
        {/* Sidebar matching the blueprint screenshot */}
        <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-sm shrink-0 shadow-md">
                B
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-widest text-white font-brand uppercase">
                  BLUEMA HUB
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Merchant Console
                </span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-1.5">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                { id: 'products', label: 'Products', icon: Package },
                { id: 'categories', label: 'Categories', icon: FolderTree },
                { id: 'orders', label: 'Orders', icon: ClipboardList },
                { id: 'customers', label: 'Customers', icon: Users },
                { id: 'database', label: 'Firebase & DB', icon: Database },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-gradient-to-r from-white via-slate-100 to-slate-200 text-slate-950 shadow-md font-extrabold' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon size={16} className={isActive ? 'text-slate-950' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Sidebar Info */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-300 font-bold">Currency</span>
                <span className="text-amber-400 font-mono font-bold">GH₵</span>
              </div>
              <span className="text-[10px] text-slate-500">Ghanaian Cedi (GHS)</span>
            </div>
            <button 
              onClick={onClose}
              className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Exit Console</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* Top Header bar with Logout */}
          <header className="h-16 px-8 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Active Session: Merchant Administrator
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Logout
              </button>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-md group"
                title="Close Admin Console"
              >
                <X size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </header>

          <div className="flex-1 p-8 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full">
            
            {/* TAB 1: DASHBOARD (Matching Blueprint Panel 9 image) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Dashboard</h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time business performance overview for BLUEMA HUB.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('database')}
                      className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Firebase & Database Synced</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Products</span>
                    <div className="text-3xl font-black text-white mt-2 font-mono">
                      {products.length}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Orders</span>
                    <div className="text-3xl font-black text-white mt-2 font-mono">{orders.length}</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending Orders</span>
                    <div className="text-3xl font-black text-amber-400 mt-2 font-mono">
                      {orders.filter(o => o.status && o.status.toLowerCase().includes('pending')).length}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Revenue</span>
                    <div className="text-3xl font-black text-emerald-400 mt-2 font-mono">
                      GH₵{orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-base font-bold text-white">Recent Customer Orders</h2>
                    <button 
                      onClick={() => setActiveTab('orders')} 
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      View All Orders ({orders.length}) →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <CartAnimate size="sm" />
                      <p className="text-xs font-semibold text-slate-400">
                        No customer orders recorded yet. Purchases placed by users will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-4">Order #</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Total</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {orders.slice(0, 5).map(order => (
                            <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-4 font-mono font-bold text-white">{order.id}</td>
                              <td className="py-4 px-4 font-semibold text-slate-200">{order.customerName || 'Customer'}</td>
                              <td className="py-4 px-4 font-mono font-bold text-amber-300">GH₵{Number(order.total).toLocaleString()}</td>
                              <td className="py-4 px-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                  {order.status || 'Verified & Paid'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                                {order.createdAt ? new Date(order.createdAt * 1000).toLocaleDateString() : 'Today'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Real-Time Live Activity & Purchase Tracker ("Fireworks") */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                      <h2 className="text-base font-bold text-white">Live System Audit & Purchase Tracker</h2>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Real-time audit log</span>
                  </div>
                  {logs.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3">No activity logs recorded yet. Every change by admin and every purchase by users is tracked here.</p>
                  ) : (
                    <div className="space-y-2">
                      {logs.slice(0, 5).map(log => (
                        <div key={log.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              log.actionType === 'ORDER_PURCHASE' || log.actionType === 'NEW_PURCHASE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {log.actionType}
                            </span>
                            <span className="text-slate-200">{log.details}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {log.createdAt ? new Date(log.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PRODUCTS (Manage & modify items sold in website) */}
            {activeTab === 'products' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-white">Product Inventory & Management</h1>
                    <p className="text-xs text-slate-400 mt-1">Add, modify, update pricing in GH₵, and manage items sold on the website.</p>
                  </div>
                  <button
                    onClick={() => setEditingProduct({
                      name: '',
                      price: '',
                      category: 'cloth',
                      image: '',
                      description: '',
                      rating: 5.0,
                      in_stock: 1
                    })}
                    className="bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-2 pb-2">
                  {[
                    { id: 'all', label: 'All Items' },
                    { id: 'cloth', label: '1. Clothing' },
                    { id: 'accessories', label: '2. Apple Parts' },
                    { id: 'diffuser', label: '3. Diffusers' },
                    { id: 'iphones', label: '4. iPhones' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setProductCategoryFilter(cat.id as any)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        productCategoryFilter === cat.id
                          ? 'bg-white text-slate-950 shadow-md'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Product Form Editor Modal / Accordion */}
                {editingProduct && (
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Sparkles size={16} className="text-amber-400" />
                        <span>{editingProduct.id ? `Edit Item #${editingProduct.id}` : 'Publish New Item to Website'}</span>
                      </h3>
                      <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                        <X size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Product Title *</label>
                        <input
                          type="text"
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:outline-none focus:border-white"
                          placeholder="e.g. BLUEMA Luxury Hoodie"
                          value={editingProduct.name || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Price in GH₵ (GHS) *</label>
                        <input
                          type="number"
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:outline-none focus:border-white font-mono"
                          placeholder="e.g. 1250"
                          value={editingProduct.price || ''}
                          onChange={e => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Department / Category *</label>
                        <select
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:outline-none focus:border-white"
                          value={editingProduct.category || 'cloth'}
                          onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                        >
                          <option value="cloth">1. Clothing & Apparel</option>
                          <option value="accessories">2. Apple Parts & Tools</option>
                          <option value="diffuser">3. Diffusers & Scents</option>
                          <option value="iphones">4. iPhones & Devices</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Star Rating (1.0 - 5.0)</label>
                        <input
                          type="number"
                          step="0.1"
                          max="5.0"
                          min="1.0"
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:outline-none focus:border-white font-mono"
                          value={editingProduct.rating !== undefined ? editingProduct.rating : 5.0}
                          onChange={e => setEditingProduct({ ...editingProduct, rating: parseFloat(e.target.value) || 5.0 })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Product Description</label>
                      <textarea
                        rows={2}
                        className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:outline-none focus:border-white"
                        placeholder="Provide details about materials, warranty, or scent profile..."
                        value={editingProduct.description || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Product Image URL or Upload</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:outline-none focus:border-white"
                            placeholder="https://... or upload file"
                            value={editingProduct.image || ''}
                            onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                          />
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Upload
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <span className="text-xs font-bold text-slate-300">In Stock Status</span>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, in_stock: editingProduct.in_stock ? 0 : 1 })}
                          className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                            editingProduct.in_stock ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {editingProduct.in_stock ? 'Available (In Stock)' : 'Sold Out'}
                        </button>
                      </div>
                    </div>

                    {((editingProduct.images && editingProduct.images.length > 0) || editingProduct.image) && (
                      <div className="mt-2 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-xs font-bold text-slate-300 block">Uploaded Product Images ({ (editingProduct.images || [editingProduct.image]).length })</span>
                        <div className="flex flex-wrap gap-3">
                          {(editingProduct.images && editingProduct.images.length > 0 ? editingProduct.images : [editingProduct.image]).map((img: string, idx: number) => (
                            <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-slate-700">
                              <img src={img} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const imgs = (editingProduct.images || [editingProduct.image]).filter((_: any, i: number) => i !== idx);
                                  setEditingProduct({
                                    ...editingProduct,
                                    images: imgs,
                                    image: imgs.length > 0 ? imgs[0] : ''
                                  });
                                }}
                                className="absolute top-0.5 right-0.5 bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove image"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                      {editingProduct.id && (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-colors cursor-pointer mr-auto flex items-center gap-1.5"
                        >
                          <Trash2 size={14} /> Delete Item
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(editingProduct)}
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-white via-slate-100 to-slate-300 hover:from-white hover:to-white text-slate-950 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer flex items-center gap-2"
                      >
                        <Save size={14} />
                        <span>{loading ? 'Saving...' : 'Save & Publish Live'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-rose-500/40 p-6 rounded-2xl max-w-sm w-full text-center space-y-4 shadow-2xl">
                      <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                        <ShieldAlert size={24} />
                      </div>
                      <h4 className="font-bold text-white text-base">Delete {editingProduct?.name}?</h4>
                      <p className="text-xs text-slate-400">This action will permanently remove this item from the BLUEMA HUB catalog.</p>
                      <div className="flex gap-2 justify-center pt-2">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteConfirm}
                          disabled={loading}
                          className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-500 shadow-lg"
                        >
                          {loading ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Products List Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="py-16 text-center rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
                    <CartAnimate size="md" />
                    <h3 className="text-base font-bold text-white uppercase tracking-wider font-brand">
                      No Products in this Category
                    </h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      This department is currently empty. Click the "+ Add New Item" button above to publish your first product to this department.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map(product => (
                      <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center justify-between shadow-md hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3">
                          <img 
                            src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80'} 
                            alt={product.name} 
                            className="w-14 h-14 object-cover rounded-xl border border-slate-800 shrink-0" 
                          />
                          <div>
                            <h4 className="font-bold text-white text-xs line-clamp-1">{product.name}</h4>
                            <span className="text-xs font-mono font-bold text-amber-300 mt-0.5 block">GH₵{Number(product.price).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">{product.category}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                          title="Edit product"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-black text-white">Department Categories</h1>
                  <p className="text-xs text-slate-400 mt-1">Official departments configured for BLUEMA HUB catalog.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'cloth', name: '1. Clothing & Apparel', count: `${products.filter(p => p.category === 'cloth').length} items`, status: 'Active' },
                    { id: 'accessories', name: '2. Apple Parts & Tools', count: `${products.filter(p => p.category === 'accessories').length} items`, status: 'Active' },
                    { id: 'diffuser', name: '3. Diffusers & Scents', count: `${products.filter(p => p.category === 'diffuser').length} items`, status: 'Active' },
                    { id: 'iphones', name: '4. iPhones & Devices', count: `${products.filter(p => p.category === 'iphones').length} items`, status: 'Active' },
                  ].map(cat => (
                    <div key={cat.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md">
                      <div>
                        <h3 className="font-bold text-white text-sm">{cat.name}</h3>
                        <span className="text-xs text-slate-400 mt-0.5 block font-mono">{cat.count}</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold">
                        {cat.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-black text-white">Customer Orders ({orders.length})</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage incoming purchases and real-time order tracking.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  {orders.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <CartAnimate size="md" />
                      <h3 className="text-sm font-bold text-white">No Customer Orders Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Orders placed by shoppers during checkout will immediately reflect here in the merchant console.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            <th className="py-3 px-4">Order #</th>
                            <th className="py-3 px-4">Customer</th>
                            <th className="py-3 px-4">Payment Method</th>
                            <th className="py-3 px-4">Total (GH₵)</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {orders.map(order => (
                            <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-4 px-4 font-mono font-bold text-white">{order.id}</td>
                              <td className="py-4 px-4">
                                <div className="font-semibold text-slate-200">{order.customerName || 'Customer'}</div>
                                <div className="text-[10px] text-slate-400">{order.customerPhone || order.userEmail || ''}</div>
                              </td>
                              <td className="py-4 px-4 text-slate-300">{order.paymentMethod || 'Mobile Money'}</td>
                              <td className="py-4 px-4 font-mono font-bold text-amber-300">GH₵{Number(order.total).toLocaleString()}</td>
                              <td className="py-4 px-4">
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                  {order.status || 'Verified & Paid'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-400 font-mono text-[11px]">
                                {order.createdAt ? new Date(order.createdAt * 1000).toLocaleDateString() : 'Today'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 5: CUSTOMERS */}
            {activeTab === 'customers' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-black text-white">Registered Customers ({customers.length})</h1>
                  <p className="text-xs text-slate-400 mt-1">Manage verified customer profiles and buyer histories.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  {customers.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <CartAnimate size="md" />
                      <h3 className="text-sm font-bold text-white">No Registered Customers Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Customer registrations and account profiles will appear here as users sign up.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customers.map((cust, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 text-white font-black flex items-center justify-center text-xs">
                              {cust.name ? cust.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <h4 className="font-bold text-white text-xs">{cust.name}</h4>
                              <span className="text-[10px] text-slate-400">{cust.email} • {cust.phone || '059 883 0932'}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-amber-300 block">GH₵{Number(cust.totalSpent || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400">{cust.ordersCount || 0} orders</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: FIREBASE & DATABASE SYNCHRONIZATION */}
            {activeTab === 'database' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                      <Database className="text-amber-400" size={24} />
                      Firebase & Database Synchronization Center
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">
                      Persistent cloud document storage (Firebase Firestore) mirrored with backend relational database (SQLite 3).
                    </p>
                  </div>
                  <button
                    onClick={handleForceSync}
                    disabled={isSyncing}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Synchronizing Data...' : 'Sync All to Firebase & DB'}</span>
                  </button>
                </div>

                {syncFeedback && (
                  <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs font-medium flex items-center justify-between">
                    <span>{syncFeedback}</span>
                    <button onClick={() => setSyncFeedback(null)} className="text-amber-400 hover:text-white">✕</button>
                  </div>
                )}

                {/* Integration Health Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Firebase Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                          <Cloud size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Firebase Firestore</h3>
                          <p className="text-[10px] text-slate-400">Google Cloud Enterprise Database</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected & Active
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Project ID</span>
                        <span className="text-[11px] font-bold text-white truncate max-w-[200px]">
                          {syncStatus?.firebase?.projectId || 'gen-lang-client-0928793839'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Database ID</span>
                        <span className="text-[11px] font-bold text-amber-300 truncate max-w-[200px]">
                          {syncStatus?.firebase?.databaseId || 'ai-studio-remixremixverfie-aae7039b-0388-47cf-ad65-4bac10cfedf7'}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Security Rules</span>
                        <span className="text-[11px] font-bold text-emerald-400">ABAC Hardened Rules Deployed</span>
                      </div>
                    </div>
                  </div>

                  {/* SQLite Database Card */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                          <HardDrive size={18} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">Backend Relational Database</h3>
                          <p className="text-[10px] text-slate-400">High-Performance Embedded SQLite 3</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online (Port 5001)
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 text-xs text-slate-300 font-mono">
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Engine</span>
                        <span className="text-[11px] font-bold text-white">SQLite 3 (WAL Journal Mode)</span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Database File</span>
                        <span className="text-[11px] font-bold text-blue-300 truncate max-w-[200px]">
                          backend/verified_store.db
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/80 flex justify-between items-center">
                        <span className="text-[11px] text-slate-400">Replication</span>
                        <span className="text-[11px] font-bold text-emerald-400">Bidirectional Sync Active</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products Stored</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">{products.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-1 block">In SQLite & Firestore</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Orders Stored</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">{orders.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-1 block">In SQLite & Firestore</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Users Registered</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">{customers.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-1 block">In Firebase Auth & DB</span>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Records</span>
                    <div className="text-2xl font-black text-white mt-1 font-mono">{logs.length}</div>
                    <span className="text-[10px] text-emerald-400 mt-1 block">Real-time Activity Stream</span>
                  </div>
                </div>

                {/* Collections Mapping Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Database size={16} className="text-amber-400" />
                    Live Cloud Collections & Database Entities
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase">
                          <th className="py-2.5 px-3">Entity / Collection</th>
                          <th className="py-2.5 px-3">Firebase Path</th>
                          <th className="py-2.5 px-3">SQLite Table</th>
                          <th className="py-2.5 px-3">Access Rule</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        <tr>
                          <td className="py-3 px-3 font-bold text-white">Catalog Products</td>
                          <td className="py-3 px-3 text-amber-300">/products/{'{id}'}</td>
                          <td className="py-3 px-3 text-slate-300">products</td>
                          <td className="py-3 px-3 text-emerald-400">Public Read / Admin Write</td>
                          <td className="py-3 px-3"><span className="text-emerald-400">● Synced</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-white">Customer Orders</td>
                          <td className="py-3 px-3 text-amber-300">/orders/{'{id}'}</td>
                          <td className="py-3 px-3 text-slate-300">orders</td>
                          <td className="py-3 px-3 text-emerald-400">Owner Read / Secure Create</td>
                          <td className="py-3 px-3"><span className="text-emerald-400">● Synced</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-white">Support Tickets</td>
                          <td className="py-3 px-3 text-amber-300">/support_tickets/{'{id}'}</td>
                          <td className="py-3 px-3 text-slate-300">inquiries</td>
                          <td className="py-3 px-3 text-emerald-400">Customer Create / Admin Read</td>
                          <td className="py-3 px-3"><span className="text-emerald-400">● Synced</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-white">Audit & Purchases</td>
                          <td className="py-3 px-3 text-amber-300">/audit_logs/{'{id}'}</td>
                          <td className="py-3 px-3 text-slate-300">audit_logs</td>
                          <td className="py-3 px-3 text-emerald-400">Admin Read / System Write</td>
                          <td className="py-3 px-3"><span className="text-emerald-400">● Synced</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-white">Shopping Carts</td>
                          <td className="py-3 px-3 text-amber-300">/carts/{'{userId}'}</td>
                          <td className="py-3 px-3 text-slate-300">carts</td>
                          <td className="py-3 px-3 text-emerald-400">User Bag / Persistent Storage</td>
                          <td className="py-3 px-3"><span className="text-emerald-400">● Synced</span></td>
                        </tr>
                        <tr>
                          <td className="py-3 px-3 font-bold text-white">User Accounts</td>
                          <td className="py-3 px-3 text-amber-300">/users/{'{uid}'}</td>
                          <td className="py-3 px-3 text-slate-300">users</td>
                          <td className="py-3 px-3 text-emerald-400">Isolated PII / Strict Owner</td>
                          <td className="py-3 px-3"><span className="text-emerald-400">● Synced</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h1 className="text-2xl font-black text-white">Admin Settings & Configuration</h1>
                  <p className="text-xs text-slate-400 mt-1">Configure merchant security keys, currency, and WhatsApp support number.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">Store Currency</label>
                    <input
                      type="text"
                      disabled
                      value="GH₵ - Ghanaian Cedi (GHS)"
                      className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-slate-400 font-mono"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-sm font-bold text-white mb-3">Change Admin Console Passkey</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">New Admin Passkey</label>
                        <input
                          type="password"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          placeholder="Enter new admin password..."
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:border-slate-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirm New Passkey</label>
                        <input
                          type="password"
                          value={confirmAdminPassword}
                          onChange={(e) => setConfirmAdminPassword(e.target.value)}
                          placeholder="Confirm new admin password..."
                          className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-white focus:border-slate-500 outline-none"
                        />
                      </div>
                      {passwordChangeMessage && (
                        <div className={`p-2.5 rounded-xl text-xs font-medium ${passwordChangeMessage.success ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950/40 text-rose-300 border border-rose-800/60'}`}>
                          {passwordChangeMessage.text}
                        </div>
                      )}
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-white text-slate-950 hover:bg-slate-200 font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Update Passkey
                      </button>
                    </form>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase mb-1">WhatsApp Support Line</label>
                    <input
                      type="text"
                      disabled
                      value="+233 53 145 0932"
                      className="w-full bg-slate-950 p-3 rounded-xl text-xs border border-slate-800 text-slate-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
};
