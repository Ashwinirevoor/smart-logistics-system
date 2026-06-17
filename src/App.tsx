import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { 
  Shield, 
  Store, 
  Truck, 
  MapPin, 
  UserCheck, 
  Database, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  XSquare, 
  Search, 
  Filter, 
  AlertOctagon, 
  Compass, 
  FileText, 
  Copy, 
  Loader2, 
  Menu, 
  Activity, 
  DollarSign, 
  Map, 
  ArrowRight,
  ChevronRight,
  Download,
  AlertTriangle,
  Sun,
  Moon,
  QrCode,
  Camera,
  X,
  Clock,
  Star,
  Users
} from 'lucide-react';

const DELIVERY_STAGES = [
  { key: 'assigned', label: 'Assigned', remarks: 'Assigned driver and vehicle.', iconName: 'UserCheck' },
  { key: 'picked-up', label: 'Picked-up', remarks: 'Cargo loaded. Gate cleared.', iconName: 'Truck' },
  { key: 'in-transit', label: 'In-transit', remarks: 'Cruising National Highway bypass.', iconName: 'Compass' },
  { key: 'delivered', label: 'Delivered', remarks: 'Goods handed over directly to client.', iconName: 'CheckCircle' }
];

const getStageIndex = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'assigned': return 0;
    case 'picked-up': return 1;
    case 'in-transit': return 2;
    case 'delivered': return 3;
    default: return 0;
  }
};

const safeFetch = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Expected JSON but received ${contentType || 'no content-type'}. Body starts with: ${text.substring(0, 100)}`);
    }
    return await res.json() as T;
  } catch (err: any) {
    console.error(`Fetch API Error for [${url}]:`, err);
    throw err;
  }
};

export default function App() {
  // Current active role: 'admin' | 'seller' | 'transporter' | 'driver' | 'receiver' | 'codehub'
  const [activeRole, setActiveRole] = useState<string>('admin');

  // Theme support
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };
  
  // Simulated data state matching database tables
  const [sellers, setSellers] = useState<any[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [receivers, setReceivers] = useState<any[]>([]);
  const [goods, setGoods] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [vehicleRequests, setVehicleRequests] = useState<any[]>([]);
  const [deliveryDetails, setDeliveryDetails] = useState<any[]>([]);
  const [tracking, setTracking] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [sysStats, setSysStats] = useState<any>({
    activeShipments: 0,
    approvalRequests: 0,
    totalRevenue: 0,
    systemAlertedIssues: 0
  });

  // UI state managers
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // QR Scan States
  const [scanningOrderId, setScanningOrderId] = useState<number | null>(null);
  const [scanningSuccess, setScanningSuccess] = useState<boolean>(false);
  const [scanningProgress, setScanningProgress] = useState<number>(0);

  // Auth User Simulated State
  const [authAdmin, setAuthAdmin] = useState<any>({ id: 1, name: 'System Admin', email: 'admin@smarttrans.com' });
  const [authSeller, setAuthSeller] = useState<any>({ id: 1, name: 'Apex Goods Ltd', email: 'sales@apex.com' });
  const [authTransporter, setAuthTransporter] = useState<any>({ id: 1, name: 'Super Fast Logistics Cargo', email: 'fleet@superlogistics.com' });
  const [authDriver, setAuthDriver] = useState<any>({ id: 1, name: 'Rajesh Kumar', email: 'raj@cargo.com' });
  const [authReceiver, setAuthReceiver] = useState<any>({ id: 1, name: 'John Doe', email: 'buyer_john@gmail.com' });

  // Code Hub Active Code Tab
  const [codeTab, setCodeTab] = useState<string>('sql');
  const [projectTemplates, setProjectTemplates] = useState<any>(null);
  const [driverPerformance, setDriverPerformance] = useState<any>(null);

  // Form Submissions
  const [goodsForm, setGoodsForm] = useState({ name: '', description: '', category: 'Machinery', price: '', quantity: '', image_url: '' });
  const [vehicleForm, setVehicleForm] = useState({ vehicle_no: '', vehicle_type: 'Container Truck', capacity: '10 Tons' });
  const [driverForm, setDriverForm] = useState({ username: '', full_name: '', phone: '', license_no: '', password: 'driver123' });
  const [marketplaceSearch, setMarketplaceSearch] = useState('');
  const [marketplaceFilter, setMarketplaceFilter] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [checkoutQty, setCheckoutQty] = useState<number>(1);
  const [checkoutAddress, setCheckoutAddress] = useState<string>('Block C, Electronic City Phase 1, Bangalore');
  const [complaintForm, setComplaintForm] = useState({ order_id: '', subject: '', description: '' });

  // Load all databases from backend
  const refreshDatabase = async () => {
    setLoading(true);
    try {
      const resSellers = await safeFetch('/api/admin/sellers');
      const resTransporters = await safeFetch('/api/admin/transporters');
      const resReceivers = await safeFetch('/api/admin/receivers');
      const resLogs = await safeFetch('/api/admin/logs');
      const resStats = await safeFetch('/api/admin/stats');
      const resGoods = await safeFetch('/api/receiver/marketplace');
      const resComplaints = await safeFetch('/api/transporter/1/complaints');

      setSellers(resSellers);
      setTransporters(resTransporters);
      setReceivers(resReceivers);
      setLogs(resLogs);
      setSysStats(resStats);
      setGoods(resGoods);
      setComplaints(resComplaints);

      // Loaded session based roles tables
      if (activeRole === 'seller') {
        const oRes = await safeFetch(`/api/seller/${authSeller.id}/orders`);
        setOrders(oRes);
      } else if (activeRole === 'transporter') {
        const vRes = await safeFetch(`/api/transporter/${authTransporter.id}/vehicles`);
        const dRes = await safeFetch(`/api/transporter/${authTransporter.id}/drivers`);
        const rRes = await safeFetch(`/api/transporter/${authTransporter.id}/requests`);
        const pRes = await safeFetch(`/api/transporter/${authTransporter.id}/driver-performance`);
        setVehicles(vRes);
        setVehicleRequests(rRes);
        setDriverPerformance(pRes);
      } else if (activeRole === 'driver') {
        const delRes = await safeFetch(`/api/driver/${authDriver.id}/deliveries`);
        setDeliveryDetails(delRes);
      } else if (activeRole === 'receiver') {
        const roRes = await safeFetch(`/api/receiver/${authReceiver.id}/orders`);
        setOrders(roRes);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to synchronize simulated SQL databases: ${err.message || 'Check server logs.'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadCodeExports = async () => {
    try {
      const resp = await safeFetch('/api/student/exports');
      setProjectTemplates(resp);
    } catch (err: any) {
      console.error("Failed to load schema guidelines", err);
    }
  };

  useEffect(() => {
    refreshDatabase();
  }, [activeRole]);

  useEffect(() => {
    loadCodeExports();
  }, []);

  const triggerToast = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // Admin Actions
  const handleApproveSeller = async (id: number) => {
    await fetch(`/api/admin/sellers/${id}/approve`, { method: 'POST' });
    triggerToast('success', "Approved Seller company registration keys successfully.");
    refreshDatabase();
  };

  const handleRejectSeller = async (id: number) => {
    await fetch(`/api/admin/sellers/${id}/reject`, { method: 'POST' });
    triggerToast('success', "Seller registration blacklisted/rejected.");
    refreshDatabase();
  };

  const handleDeleteSeller = async (id: number) => {
    await fetch(`/api/admin/sellers/${id}`, { method: 'DELETE' });
    triggerToast('success', "Seller metadata completely deleted form system tables.");
    refreshDatabase();
  };

  const handleApproveTransporter = async (id: number) => {
    await fetch(`/api/admin/transporters/${id}/approve`, { method: 'POST' });
    triggerToast('success', "Transporter cargo license details authorized successfully.");
    refreshDatabase();
  };

  const handleRejectTransporter = async (id: number) => {
    await fetch(`/api/admin/transporters/${id}/reject`, { method: 'POST' });
    triggerToast('success', "Transporter application denied.");
    refreshDatabase();
  };

  const handleDeleteTransporter = async (id: number) => {
    await fetch(`/api/admin/transporters/${id}`, { method: 'DELETE' });
    triggerToast('success', "Transporter fleet assets dropped from SQL databases.");
    refreshDatabase();
  };

  const handleVerifyReceiver = async (id: number) => {
    await fetch(`/api/admin/receivers/${id}/verify`, { method: 'POST' });
    triggerToast('success', "Receiver home location address and verification state toggled.");
    refreshDatabase();
  };

  const handleDeleteReceiver = async (id: number) => {
    await fetch(`/api/admin/receivers/${id}`, { method: 'DELETE' });
    triggerToast('success', "Receiver account registration archived.");
    refreshDatabase();
  };

  // Seller Actions
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goodsForm.name || !goodsForm.price || !goodsForm.quantity) {
      triggerToast('error', "All product description details and values are mandatory.");
      return;
    }
    const res = await fetch('/api/goods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...goodsForm, seller_id: authSeller.id })
    }).then(r => r.json());

    if (res.success) {
      triggerToast('success', `Successfully cataloged ₹${goodsForm.price} - ${goodsForm.name}.`);
      setGoodsForm({ name: '', description: '', category: 'Furniture', price: '', quantity: '', image_url: '' });
      refreshDatabase();
    }
  };

  const handleDeleteProduct = async (id: number) => {
    await fetch(`/api/goods/${id}`, { method: 'DELETE' });
    triggerToast('success', "Product withdrawn from central e-commerce databases.");
    refreshDatabase();
  };

  const handleAcceptOrder = async (orderId: number) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted', sellerId: authSeller.id })
    });
    triggerToast('success', "Order validated and accepted by seller.");
    refreshDatabase();
  };

  const handleRejectOrder = async (orderId: number) => {
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected', sellerId: authSeller.id })
    });
    triggerToast('success', "Order rejected. Inventory quantities automatically restored.");
    refreshDatabase();
  };

  const handleBookTransport = async (orderId: number, transporterId: number, budget: number) => {
    const resp = await fetch('/api/transport/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, sellerId: authSeller.id, transporterId, budget })
    }).then(r => r.json());

    if (resp.error) {
      triggerToast('error', resp.error);
    } else {
      triggerToast('success', `Carriage dispatch requested from carrier agency. Budget Set: ₹${budget}.`);
      refreshDatabase();
    }
  };

  const handlePayCarrier = async (orderId: number, amt: number) => {
    await fetch(`/api/orders/${orderId}/pay-transport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellerId: authSeller.id, budget: amt })
    });
    triggerToast('success', `Carrier service invoice settled successfully. Payload is now assigned.`);
    refreshDatabase();
  };

  // Transporter Actions
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.vehicle_no || !vehicleForm.vehicle_type || !vehicleForm.capacity) {
      triggerToast('error', "All logistics payload parameters are required.");
      return;
    }
    const resp = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...vehicleForm, transporter_id: authTransporter.id })
    }).then(r => r.json());

    if (resp.error) {
      triggerToast('error', resp.error);
    } else {
      triggerToast('success', `Assigned vehicle plate license: ${vehicleForm.vehicle_no}.`);
      setVehicleForm({ vehicle_no: '', vehicle_type: 'Cargo Van', capacity: '2 Tons' });
      refreshDatabase();
    }
  };

  const handleDeleteVehicle = async (id: number) => {
    await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    triggerToast('success', "Vehicle decommissioned from active fleet roster.");
    refreshDatabase();
  };

  const handleAddDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverForm.username || !driverForm.full_name || !driverForm.license_no) {
      triggerToast('error', "All legal driver registration records are mandated.");
      return;
    }
    const resp = await fetch('/api/drivers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...driverForm, transporter_id: authTransporter.id })
    }).then(r => r.json());

    if (resp.error) {
      triggerToast('error', resp.error);
    } else {
      triggerToast('success', `Carrier driver authenticated: ${driverForm.full_name}.`);
      setDriverForm({ username: '', full_name: '', phone: '', license_no: '', password: 'driver123' });
      refreshDatabase();
    }
  };

  const handleDeleteDriver = async (id: number) => {
    await fetch(`/api/drivers/${id}`, { method: 'DELETE' });
    triggerToast('success', "Driver credentials revoked.");
    refreshDatabase();
  };

  const handleDispatchCarrying = async (requestId: number, driverId: number, vehicleId: number) => {
    const resp = await fetch(`/api/transport/requests/${requestId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId, vehicleId, transporterId: authTransporter.id })
    }).then(r => r.json());

    if (resp.error) {
       triggerToast('error', resp.error);
    } else {
       triggerToast('success', "Fleet asset assigned and GPS tracking initialized!");
       refreshDatabase();
    }
  };

  const handleResolveComplaint = async (id: number, resolution: string) => {
    await fetch(`/api/complaints/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resolution, userId: authAdmin.id, userRole: 'admin' })
    });
    triggerToast('success', "Dispute resolved and logged in database.");
    refreshDatabase();
  };

  // Driver Actions
  const handleUpdateDriverStatus = async (orderId: number, status: string, remarks: string) => {
    await fetch(`/api/driver/delivery/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks, driverId: authDriver.id })
    });
    triggerToast('success', `Carriage status flagged as [${status.toUpperCase()}]`);
    refreshDatabase();
  };

  const startQRScan = (orderId: number) => {
    setScanningProgress(0);
    setScanningSuccess(false);
    setScanningOrderId(orderId);
  };

  const closeQRScan = () => {
    setScanningOrderId(null);
    setScanningSuccess(false);
    setScanningProgress(0);
  };

  useEffect(() => {
    let timer: any;
    if (scanningOrderId && !scanningSuccess) {
      timer = setInterval(() => {
        setScanningProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setScanningSuccess(true);
            // Instant picked-up update!
            handleUpdateDriverStatus(scanningOrderId, 'picked-up', "Cargo loaded. Gate cleared. QR code scanned successfully via Handheld terminal.");
            return 100;
          }
          return prev + 10;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [scanningOrderId, scanningSuccess]);

  const handleTriggerSOS = async (orderId: number) => {
    const msg = prompt("State current Emergency/Breakdown location and issue details for the Admin:");
    if (!msg) return;
    await fetch('/api/driver/sos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, driverId: authDriver.id, message: msg })
    });
    triggerToast('success', "🚨 CRITICAL SOS GPS beacon activated. Admin alerted.");
    refreshDatabase();
  };

  const handleMoveGPSMock = async (orderId: number, latOffset: number, lngOffset: number) => {
    // Standard coordinates (Bangalore near center)
    const baseLat = 12.971598 + (latOffset / 1500);
    const baseLng = 77.594562 + (lngOffset / 1500);

    await fetch('/api/driver/gps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        driverId: authDriver.id, 
        orderId, 
        lat: baseLat.toFixed(6), 
        lng: baseLng.toFixed(6), 
        route_status: `Speed 45km/h. Heading past checkpoint coordinate grid.` 
      })
    });
    triggerToast('success', `Simulated coordinates updated to ${baseLat.toFixed(4)}, ${baseLng.toFixed(4)}`);
    refreshDatabase();
  };

  // Receiver Actions
  const handleOrderGoods = async () => {
    if (!selectedProduct) return;
    if (checkoutQty <= 0) {
      triggerToast('error', "Qty must be greater than zero.");
      return;
    }
    const resp = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiver_id: authReceiver.id,
        goods_id: selectedProduct.id,
        quantity: checkoutQty,
        shipping_address: checkoutAddress
      })
    }).then(r => r.json());

    if (resp.error) {
      triggerToast('error', resp.error);
    } else {
      triggerToast('success', `Simulated UPI/Visa Gateway Authorized successfully. Order ORD-${resp.order.id} is Live!`);
      setSelectedProduct(null);
      refreshDatabase();
    }
  };

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.order_id || !complaintForm.subject || !complaintForm.description) {
      triggerToast('error', "All form dispute validation items required.");
      return;
    }
    const resp = await fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: complaintForm.order_id,
        senderId: authReceiver.id,
        senderRole: 'receiver',
        subject: complaintForm.subject,
        description: complaintForm.description
      })
    }).then(r => r.json());

    if (resp.error) {
      triggerToast('error', resp.error);
    } else {
      triggerToast('success', "Dispute docket filed and assigned to transport operator desk.");
      setComplaintForm({ order_id: '', subject: '', description: '' });
      refreshDatabase();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast('success', "Code block mirrored safely to student clipboard!");
  };

  const handleDownloadFile = (fileName: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('success', `Exported ${fileName} to Downloads folder.`);
  };

  return (
    <div id="app_root" className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#090d16] text-[#e2e8f0]' : 'bg-[#F4F7F6] text-[#2D3748]'} flex flex-col font-sans selection:bg-indigo-200 transition-colors duration-300`}>
      
      {/* Toast Alert Messaging */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 bg-green-900 border-l-4 border-green-400 p-4 rounded shadow-2xl text-white max-w-sm flex items-center space-x-2 animate-bounce">
          <CheckCircle className="w-5 h-5 text-green-300" />
          <span className="text-xs font-bold font-mono uppercase">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 bg-red-950 border-l-4 border-red-500 p-4 rounded shadow-2xl text-white max-w-sm flex items-center space-x-2">
          <AlertOctagon className="w-5 h-5 text-red-400" />
          <span className="text-xs font-bold text-red-200">{errorMsg}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <header className="h-14 bg-indigo-950 text-white flex items-center justify-between px-6 border-b border-indigo-900 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-inner">
            <Truck className="w-5 h-5 text-indigo-100" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight uppercase">Smart Goods Hub</h1>
            <p className="text-[10px] text-indigo-300 font-mono tracking-widest leading-none">MySQL & Django Simulated Portal</p>
          </div>
        </div>

        {/* Global Perspective Role Selection Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">Role Perspective:</span>
          <select 
            value={activeRole} 
            onChange={(e) => setActiveRole(e.target.value)}
            className="bg-indigo-900 text-indigo-100 border border-indigo-700 text-xs rounded-md px-3 py-1.5 font-bold cursor-pointer hover:bg-indigo-850 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="admin">1. ADMIN CONSOLE Panel</option>
            <option value="seller">2. SELLER MODULE</option>
            <option value="transporter">3. TRANSPORTER FLEET Hub</option>
            <option value="driver">4. DRIVER HANDHELD Simulator</option>
            <option value="receiver">5. RECEIVER PORTAL & Tracking</option>
            <option value="codehub">🎓 SUBMISSION EXPORT (Django / MySQL)</option>
          </select>
          <button 
            onClick={toggleTheme}
            className="bg-indigo-850 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 p-1.5 rounded transition flex items-center space-x-1"
            title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode - High Contrast"}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300 font-bold" /> : <Moon className="w-4 h-4 text-slate-300" />}
            <span className="text-[10px] font-bold uppercase hidden sm:inline-block">Theme</span>
          </button>
          <button 
            onClick={refreshDatabase}
            className="bg-indigo-850 hover:bg-indigo-800 text-indigo-200 border border-indigo-700 p-1.5 rounded transition"
            title="Force SQL Schema Refresh"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main High-Density Workspace Container */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-8xl mx-auto w-full p-4 lg:p-6 gap-6">
        
        {/* LEFT COLUMN: Sidebar Navigation & Persisted MySQL/Django Academic Stats */}
        <aside className="w-full lg:w-64 flex flex-col gap-4">
          
          {/* Active Role Card */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="flex items-center space-x-2 text-indigo-600 mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase font-black tracking-widest">Active Profile</span>
            </div>
            {activeRole === 'admin' && (
              <div>
                <div className="text-sm font-bold text-gray-800">sysadmin</div>
                <div className="text-xs text-gray-400">System Administrator</div>
                <div className="mt-2 text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded font-bold font-mono">ROOT AUTH GRANTED</div>
              </div>
            )}
            {activeRole === 'seller' && (
              <div>
                <div className="text-sm font-bold text-gray-800">{authSeller.name}</div>
                <div className="text-xs text-gray-400">{authSeller.email}</div>
                <div className="mt-2 text-[10px] bg-green-50 text-green-700 px-2.5 py-1 rounded font-bold font-mono">VERIFIED SELLER</div>
              </div>
            )}
            {activeRole === 'transporter' && (
              <div>
                <div className="text-sm font-bold text-gray-800">{authTransporter.name}</div>
                <div className="text-xs text-gray-400">Fleet Operations Desk</div>
                <div className="mt-2 text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded font-bold font-mono">CARRIER ID: #0012</div>
              </div>
            )}
            {activeRole === 'driver' && (
              <div>
                <div className="text-sm font-bold text-gray-800">{authDriver.name}</div>
                <div className="text-xs text-gray-400">Roster Licence: DL-BANG-2023-01</div>
                <div className="mt-2 text-[10px] bg-amber-50 text-amber-700 px-2.5 py-1 rounded font-bold font-mono">VEHICLE ASSIGNED: MINIVAN</div>
              </div>
            )}
            {activeRole === 'receiver' && (
              <div>
                <div className="text-sm font-bold text-gray-800">{authReceiver.name}</div>
                <div className="text-xs text-gray-400">Buyer Address Confirmed</div>
                <div className="mt-2 text-[10px] bg-pink-50 text-pink-700 px-2.5 py-1 rounded font-bold font-mono">FAST CHECKOUT ACTIVE</div>
              </div>
            )}
            {activeRole === 'codehub' && (
              <div>
                <div className="text-sm font-bold text-indigo-900">Academic Code Export</div>
                <div className="text-xs text-gray-500">Submission Code Archive</div>
                <div className="mt-2 text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded font-bold font-mono">READY FOR SUBMISSION</div>
              </div>
            )}
          </div>

          {/* Academic File Architecture Map Checklist */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
              <span>SQL Tables & Django Files</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-600 font-mono">
              <li className="flex items-center space-x-2 text-indigo-700 font-semibold bg-gray-50 p-1 rounded">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span className="truncate">smart_transport_db</span>
              </li>
              <li className="pl-4 border-l border-gray-100 hover:text-indigo-600 cursor-pointer" onClick={() => {setActiveRole('codehub'); setCodeTab('sql');}}>sql_schema.sql</li>
              <li className="pl-4 border-l border-gray-100 hover:text-indigo-600 cursor-pointer text-indigo-800 font-bold" onClick={() => {setActiveRole('codehub'); setCodeTab('models');}}>models.py</li>
              <li className="pl-4 border-l border-gray-100 hover:text-indigo-600 cursor-pointer" onClick={() => {setActiveRole('codehub'); setCodeTab('views');}}>views.py</li>
              <li className="pl-4 border-l border-gray-100 hover:text-indigo-600 cursor-pointer" onClick={() => {setActiveRole('codehub'); setCodeTab('urls');}}>urls.py</li>
              <li className="pl-4 border-l border-gray-100 hover:text-indigo-600 cursor-pointer" onClick={() => {setActiveRole('codehub'); setCodeTab('forms');}}>forms.py</li>
              <li className="pl-4 border-l border-gray-100 hover:text-indigo-600 cursor-pointer text-green-700 font-bold" onClick={() => {setActiveRole('codehub'); setCodeTab('readme');}}>INSTALLATION_GUIDE.md</li>
            </ul>
          </div>

          {/* System Performance indicators */}
          <div className="bg-indigo-950 text-white p-4 rounded-xl border border-indigo-900 shadow-lg flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-[10px] text-indigo-300 font-mono uppercase tracking-wider">Live GIS Status</h4>
              <div className="flex items-center mt-1 space-x-2">
                <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping"></span>
                <span className="text-xs font-black tracking-widest font-mono text-green-300">TELEMETRY GRID LNK</span>
              </div>
            </div>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-indigo-900 pb-1">
                <span className="text-indigo-300">Pending Approvals:</span>
                <span className="font-bold text-orange-400">{sysStats.approvalRequests}</span>
              </div>
              <div className="flex justify-between border-b border-indigo-900 pb-1">
                <span className="text-indigo-300">Carrier Revenue:</span>
                <span className="font-bold text-green-400">₹{sysStats.totalRevenue}/-</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-300 text-red-300">Critical Disputes:</span>
                <span className="font-bold text-red-400">{sysStats.systemAlertedIssues}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Tab Content Display Panels */}
        <main className="flex-1 flex flex-col gap-6 overflow-y-auto">

          {/* 1. ADMIN MODULE PERSPECTIVE */}
          {activeRole === 'admin' && (
            <div className="space-y-6">
              
              {/* Bento Board Stats Bar */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Carrier Revenue (Simulated)</div>
                  <div className="text-2xl font-black text-indigo-700">₹{sysStats.totalRevenue?.toLocaleString()}/-</div>
                  <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center">
                    <DollarSign className="w-3.5 h-3.5" /> 100% Secure SSL MySQL Gateway
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Approval Queue Items</div>
                  <div className="text-2xl font-black text-orange-500">{sysStats.approvalRequests}</div>
                  <div className="mt-2 text-[10px] text-gray-500 italic">Sellers + Transporters</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Active Deliveries</div>
                  <div className="text-2xl font-black text-emerald-600">{sysStats.activeShipments}</div>
                  <div className="mt-2 text-[10px] text-gray-500">Simulated GPS Transit</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 bg-red-50">
                  <div className="text-xs font-bold text-red-500 uppercase tracking-tighter mb-1">System Complaints</div>
                  <div className="text-2xl font-black text-red-600">{sysStats.systemAlertedIssues}</div>
                  <div className="mt-2 text-[10px] text-red-600 font-bold underline cursor-pointer" onClick={() => setActiveRole('codehub')}>
                    View Code Architecture
                  </div>
                </div>
              </div>

              {/* RECHARTS DATA VISUALIZATION DASHBOARD SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart 1: Daily Cargo Volumes */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <div>
                      <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Daily Cargo Volumes (7d)</h3>
                      <p className="text-[10px] text-gray-400">Total units of physical dispatch cargo handled</p>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded font-mono">BAR CHART</span>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sysStats?.dailyAnalytics || []}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          tickLine={false}
                          axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                          cursor={{ fill: '#f1f5f9' }}
                        />
                        <Bar 
                          dataKey="volume" 
                          fill="#4F46E5" 
                          radius={[4, 4, 0, 0]} 
                          name="Units Loaded"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: 7-Day Revenue Trends */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <div>
                      <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Revenue Trends (7d)</h3>
                      <p className="text-[10px] text-gray-400">Gross transaction secure payments pipeline</p>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded font-mono">LINE CHRONO</span>
                  </div>
                  
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={sysStats?.dailyAnalytics || []}
                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <YAxis 
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          tickFormatter={(val) => `₹${val}`}
                          tickLine={false}
                          axisLine={{ stroke: '#cbd5e1' }}
                        />
                        <Tooltip
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Gross Sales']}
                          contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 1 }}
                          activeDot={{ r: 6 }}
                          name="Payments (₹)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Sellers & Transporter Approval Panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Seller validation block */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Seller Network Approval Registry</h2>
                    <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded uppercase font-mono">ADMIN DB ACCESS</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                          <th className="py-2 px-2 text-[11px]">Company Name</th>
                          <th className="py-2 px-2 text-[11px]">Category/Status</th>
                          <th className="py-2 px-2 text-[11px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {sellers.map((s) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-gray-800">{s.company_name}</span>
                              <div className="text-[10px] text-gray-400">@{s.username} • {s.phone}</div>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                                s.status === 'approved' ? 'bg-green-50 text-green-700' : 
                                s.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                              }`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              {s.status === 'pending' && (
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button onClick={() => handleApproveSeller(s.id)} className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md" title="Approve Seller">Accept</button>
                                  <button onClick={() => handleRejectSeller(s.id)} className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md" title="Reject Seller">Deny</button>
                                </div>
                              )}
                              {s.status !== 'pending' && (
                                <button onClick={() => handleDeleteSeller(s.id)} className="text-red-500 hover:text-red-700 px-1 font-bold underline text-[11px]">Drop User</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transporter Validation board */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Transporter Carrier Registration Hub</h2>
                    <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded uppercase font-mono">FIBRE CONSOLE</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                          <th className="py-2 px-2 text-[11px]">Agency</th>
                          <th className="py-2 px-2 text-[11px]">License</th>
                          <th className="py-2 px-2 text-[11px] text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transporters.map((t) => (
                          <tr key={t.id} className="hover:bg-gray-50">
                            <td className="py-2.5 px-2">
                              <span className="font-bold text-gray-800">{t.agency_name}</span>
                              <div className="text-[10px] text-gray-400">Verified: {t.phone}</div>
                            </td>
                            <td className="py-2.5 px-2">
                              <span className="font-bold uppercase text-[10px] bg-gray-100 p-1 text-gray-600 rounded">{t.license_no}</span>
                              <span className={`block mt-1 text-[9px] font-bold ${t.status === 'approved' ? 'text-green-600' : 'text-amber-500'}`}>{t.status.toUpperCase()}</span>
                            </td>
                            <td className="py-2.5 px-2 text-right">
                              {t.status === 'pending' && (
                                <div className="flex items-center justify-end space-x-1.5">
                                  <button onClick={() => handleApproveTransporter(t.id)} className="bg-green-600 hover:bg-green-700 text-white p-1 rounded-md">Verify</button>
                                  <button onClick={() => handleRejectTransporter(t.id)} className="bg-red-600 hover:bg-red-700 text-white p-1 rounded-md">Deny</button>
                                </div>
                              )}
                              {t.status !== 'pending' && (
                                <button onClick={() => handleDeleteTransporter(t.id)} className="text-red-500 hover:text-red-700 px-1 font-bold underline text-[11px]">Drop User</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Receivers Management desk */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-xs font-black text-indigo-950 uppercase tracking-wider">Receiver & buyer verification roster</h2>
                  <span className="text-[10px] text-gray-400">Total Registered: {receivers.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-500">
                        <th className="py-2 px-3 text-[11px]">Customer Profile</th>
                        <th className="py-2 px-3 text-[11px]">Shipping Destination Address</th>
                        <th className="py-2 px-3 text-[11px]">Verification status</th>
                        <th className="py-2 px-3 text-[11px] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {receivers.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-gray-800">{r.full_name}</span>
                            <div className="text-[10px] text-gray-400">@{r.username} • {r.phone}</div>
                          </td>
                          <td className="py-2.5 px-3 text-gray-500 text-[11px] italic truncate max-w-xs">{r.address}</td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded ${r.is_verified ? 'bg-green-50 text-green-700' : 'bg-gray-150 text-gray-600'}`}>
                              <UserCheck className="w-3 h-3 mr-1" /> {r.is_verified ? 'KYC VERIFIED' : 'UNVERIFIED'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button onClick={() => handleVerifyReceiver(r.id)} className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-2 py-1 rounded text-[10px] font-bold">
                                Toggle KYC
                              </button>
                              <button onClick={() => handleDeleteReceiver(r.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* MySQL Simulated Activity Logs Terminal */}
              <div className="bg-indigo-950 p-4 rounded-xl border border-indigo-900 shadow-xl flex flex-col">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-900 mb-3">
                  <span className="text-xs font-mono uppercase text-indigo-300 font-bold tracking-widest flex items-center">
                    <Activity className="w-4 h-4 text-indigo-400 mr-2" /> Live system activity logs (MySQL Log Tables Sim)
                  </span>
                  <button 
                    onClick={() => {
                      let csv = "ID,User_Role,Action,IP_Address,Timestamp\n";
                      logs.forEach(l => {
                        csv += `${l.id},"${l.user_role}","${l.action.replace(/"/g, '""')}","${l.ip_address}","${l.timestamp}"\n`;
                      });
                      handleDownloadFile("system_activity_logs.csv", csv);
                    }}
                    className="bg-indigo-805 hover:bg-indigo-800 text-indigo-200 border border-indigo-800 px-3 py-1 rounded text-[10px] font-bold font-mono flex items-center space-x-1"
                  >
                    <Download className="w-3.5 h-3.5" /> <span>GENERATE AUDIT REPORT</span>
                  </button>
                </div>
                <div className="bg-indigo-1000 p-3 rounded font-mono text-[11px] text-indigo-200 max-h-60 overflow-y-auto space-y-1.5 shadow-inner">
                  {logs.map((l) => (
                    <div key={l.id} className="flex border-b border-indigo-950 pb-1 last:border-0">
                      <span className="text-indigo-400 w-24 flex-shrink-0">[{new Date(l.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-orange-400 w-20 flex-shrink-0 uppercase font-black">[{l.user_role}]</span>
                      <span className="flex-1 text-gray-200">{l.action}</span>
                      <span className="text-indigo-500 text-[10px]">{l.ip_address}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 2. SELLER MODULE PERSPECTIVE */}
          {activeRole === 'seller' && (
            <div className="space-y-6">
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">Add New Product to MySQL Inventory</h3>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Product Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Copper Wire Coils" 
                      value={goodsForm.name}
                      onChange={(e) => setGoodsForm({...goodsForm, name: e.target.value})}
                      className="bg-gray-50 border border-gray-200 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Category</label>
                    <select 
                      value={goodsForm.category}
                      onChange={(e) => setGoodsForm({...goodsForm, category: e.target.value})}
                      className="bg-gray-50 border border-gray-200 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    >
                      <option>Machinery</option>
                      <option>Furniture</option>
                      <option>Electronics</option>
                      <option>Raw Industrial</option>
                      <option>Office Gear</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Price per unit (INR)</label>
                    <input 
                      type="number" 
                      placeholder="INR" 
                      value={goodsForm.price}
                      onChange={(e) => setGoodsForm({...goodsForm, price: e.target.value})}
                      className="bg-gray-50 border border-gray-200 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Stock Quantity Available</label>
                    <input 
                      type="number" 
                      placeholder="Units count" 
                      value={goodsForm.quantity}
                      onChange={(e) => setGoodsForm({...goodsForm, quantity: e.target.value})}
                      className="bg-gray-50 border border-gray-200 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex flex-col md:col-span-2">
                    <label className="text-[10px] font-mono text-gray-500 uppercase font-bold mb-1">Product Description</label>
                    <input 
                      type="text" 
                      placeholder="Specify material grades, model specifications..." 
                      value={goodsForm.description}
                      onChange={(e) => setGoodsForm({...goodsForm, description: e.target.value})}
                      className="bg-gray-50 border border-gray-200 text-xs rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="md:col-span-3 flex justify-end">
                    <button type="submit" className="bg-indigo-650 hover:bg-indigo-700 text-white px-5 py-2 rounded-md font-bold text-xs flex items-center space-x-1">
                      <Plus className="w-4 h-4" /> <span>PUBLISH TO CATALOG</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Goods Listed under current Seller ID */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">Active Catalog Goods Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goods.filter(g => g.seller_id === authSeller.id).map(g => (
                    <div key={g.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex space-x-3 items-center">
                      <img src={g.image_url} alt={g.name} className="w-14 h-14 object-cover rounded bg-gray-200 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-800 truncate">{g.name}</div>
                        <div className="text-[10px] text-indigo-600 font-mono">₹{g.price.toLocaleString()} • Qty: {g.quantity}</div>
                        <p className="text-[10px] text-gray-500 line-clamp-1 italic">{g.description}</p>
                      </div>
                      <button onClick={() => handleDeleteProduct(g.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  ))}
                  {goods.filter(g => g.seller_id === authSeller.id).length === 0 && (
                    <div className="md:col-span-2 text-center text-xs py-10 text-gray-400 font-mono">Your warehouse is currently empty.</div>
                  )}
                </div>
              </div>

              {/* Order Requests & Transport Carrier booking portal */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">E-Commerce Orders & Carrier dispatch controller</h3>
                
                <div className="space-y-4">
                  {orders.map(o => (
                    <div key={o.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-3">
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-150 pb-2">
                        <div>
                          <span className="font-bold text-xs text-gray-800">Order ID: #ORD-{o.id}</span>
                          <span className="text-[10px] font-mono text-gray-400 block">{new Date(o.order_date).toLocaleString()}</span>
                        </div>
                        <div className="mt-1 md:mt-0 flex items-center space-x-2">
                          <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded ${
                            o.order_status === 'completed' ? 'bg-green-150 text-green-700' :
                            o.order_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            STATUS: {o.order_status?.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono text-gray-600">
                        <div>
                          <span className="text-gray-400 block text-[9px]">Item purchased:</span>
                          <span className="font-bold text-gray-800">{o.goodsName}</span>
                          <span className="text-[10px] block">Quantity: {o.quantity} units</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px]">Consignee delivery terminal:</span>
                          <span className="text-gray-800 text-[10px] line-clamp-1">{o.shipping_address}</span>
                          <span className="text-[10px] block">{o.receiverName} ({o.receiverPhone})</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[9px]">Total Cargo value:</span>
                          <span className="font-bold text-green-700 block">₹{o.total_price?.toLocaleString()}/-</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-150 pt-2 text-xs">
                        
                        {/* 1. Accepting or denying phase */}
                        {o.order_status === 'ordered' && (
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold text-amber-600 uppercase">Awaiting Seller Review:</span>
                            <button onClick={() => handleAcceptOrder(o.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded font-bold text-[10px]">Accept Order</button>
                            <button onClick={() => handleRejectOrder(o.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-bold text-[10px]">Reject</button>
                          </div>
                        )}

                        {/* 2. Dispatch carrier setup */}
                        {o.order_status === 'accepted' && (
                          <div className="flex items-center space-x-2 w-full justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-gray-500 font-bold uppercase">Assign Transport Agency:</span>
                              <select id={`trans_picker_${o.id}`} className="bg-white border text-[11px] p-1 rounded font-bold focus:outline-none">
                                {transporters.filter(t => t.status === 'approved').map(t => (
                                  <option key={t.id} value={t.id}>{t.agency_name}</option>
                                ))}
                              </select>
                              <input id={`budget_${o.id}`} type="number" defaultValue="550" className="w-16 border text-xs p-1 rounded font-bold bg-white text-center" placeholder="Price" />
                            </div>
                            <button 
                              onClick={() => {
                                const transId = parseInt((document.getElementById(`trans_picker_${o.id}`) as HTMLSelectElement).value);
                                const budget = parseFloat((document.getElementById(`budget_${o.id}`) as HTMLInputElement).value);
                                handleBookTransport(o.id, transId, budget);
                              }}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded font-bold text-[10px]"
                            >
                              Request Vehicle Roster
                            </button>
                          </div>
                        )}

                        {/* 3. Waiting of approval key */}
                        {o.order_status === 'vehicle-requested' && (
                          <div className="flex items-center justify-between w-full text-xs">
                            <span className="text-amber-600 font-bold text-[10px] uppercase">Roster Vehicle Approved! Awaiting carrier Payment Clearance...</span>
                            <button onClick={() => handlePayCarrier(o.id, 550)} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded font-bold text-[10px]">
                              Pay Carrier invoice (₹550)
                            </button>
                          </div>
                        )}

                        {/* 4. Active Transit telemetry metadata info */}
                        {['assigned', 'shipping'].includes(o.order_status) && (
                          <div className="w-full flex justify-between items-center bg-gray-150 p-2 rounded text-[10.5px]">
                            <span className="font-mono text-emerald-800">
                              🚚 Carrier active. Assigned driver: <strong className="underline">{o.assignedDriver?.full_name || 'Rajesh Kumar'} ({o.assignedDriver?.phone})</strong>
                            </span>
                            <span className="font-mono font-bold uppercase text-gray-500">
                              Vehicle: {o.assignedVehicle?.vehicle_no} [{o.assignedVehicle?.vehicle_type}]
                            </span>
                          </div>
                        )}

                        {o.order_status === 'completed' && (
                          <div className="w-full text-center py-1 text-green-700 font-bold font-mono text-[10px]">
                            ✔️ This carriage transaction has been completed and delivery confirmed.
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center text-xs py-8 text-gray-400 font-mono">No receiver orders recorded in database.</div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* 3. TRANSPORTER FLEET Hub */}
          {activeRole === 'transporter' && (
            <div className="space-y-6">

              {/* Fleet Driver Performance Statistics */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">
                      🚚 Fleet Driver Performance & Status Ledger
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      Operational intelligence metrics synced via secure GPS and scan telemetry
                    </p>
                  </div>
                  <div className="bg-white px-2.5 py-1 rounded-md border border-indigo-100 shadow-sm text-right">
                    <span className="text-[8px] text-gray-400 font-mono block uppercase">FEED REFRESH RATE</span>
                    <span className="text-[11px] font-black text-indigo-650 font-mono">1.2s Real-time Dynamic</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Total Completed Deliveries */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] text-gray-405 uppercase font-mono font-bold tracking-wider">Total Completed</span>
                      <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
                        <CheckCircle className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-900 font-mono">
                      {driverPerformance?.summary?.totalCompletedDeliveries || 42}
                    </p>
                    <p className="text-[9px] text-emerald-600 font-mono mt-0.5">
                      ✓ 100% Securely Documented
                    </p>
                  </div>

                  {/* Average Response Time */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] text-gray-405 uppercase font-mono font-bold tracking-wider">Avg Response Time</span>
                      <div className="bg-indigo-50 text-indigo-600 p-1 rounded-md">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-900 font-mono">
                      {driverPerformance?.summary?.averageFleetResponseTime || 9.4} <span className="text-xs font-normal text-gray-400">Min</span>
                    </p>
                    <p className="text-[9px] text-indigo-650 font-mono mt-0.5">
                      ⚡ Industry SLA: &lt; 15 mins
                    </p>
                  </div>

                  {/* Customer Satisfaction */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] text-gray-405 uppercase font-mono font-bold tracking-wider">Avg Satisfaction</span>
                      <div className="bg-amber-50 text-amber-500 p-1 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-900 font-mono">
                      {driverPerformance?.summary?.averageSatisfactionRate || 96.0}%
                    </p>
                    <p className="text-[9px] text-amber-600 font-mono mt-0.5">
                      ★ High Carrier Grade Rating
                    </p>
                  </div>

                  {/* Active Registered Drivers */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] text-gray-405 uppercase font-mono font-bold tracking-wider">Active Fleet Size</span>
                      <div className="bg-blue-50 text-blue-600 p-1 rounded-md">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-900 font-mono">
                      {driverPerformance?.summary?.totalFleetDrivers || 2} <span className="text-xs font-normal text-gray-400">Drivers</span>
                    </p>
                    <p className="text-[9px] text-blue-600 font-mono mt-0.5">
                      ● Active Duty Status
                    </p>
                  </div>
                </div>

                {/* Individual Driver Stats Breakdown */}
                {driverPerformance?.drivers && (
                  <div className="bg-white p-3 rounded-lg border border-slate-205 shadow-xs">
                    <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono mb-2 border-b border-slate-100 pb-1.5 flex items-center space-x-1.5">
                      <span>👤 DRIVER ASSIGNED DISPATCH ROSTER STATUS</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {driverPerformance.drivers.map((d: any) => (
                        <div key={d.driverId} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg hover:border-indigo-200 transition">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-gray-800">{d.fullName}</span>
                              <span className={`text-[8.5px] px-1.5 py-0.2 select-none font-mono rounded font-black ${
                                d.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                                {d.status.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono block">Contact: {d.phone || '+91-8844221100'}</span>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <span className="text-[9px] text-gray-400 font-mono block uppercase">Completed</span>
                              <span className="text-[12.5px] font-black text-gray-800 font-mono">{d.completedDeliveries} delv</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-gray-400 font-mono block uppercase">Avg Response</span>
                              <span className="text-[12.5px] font-black font-mono text-indigo-600">{d.avgResponseMinutes}m</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fleet logistics setup panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. Vehicle payload management form */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">Add Fleet Transportation Vehicle</h3>
                  
                  <form onSubmit={handleAddVehicle} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">License Plate No</label>
                        <input 
                          type="text" 
                          placeholder="e.g. KA-03-HA-8842" 
                          value={vehicleForm.vehicle_no}
                          onChange={(e) => setVehicleForm({...vehicleForm, vehicle_no: e.target.value})}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Max capacity payload</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 10 Tons" 
                          value={vehicleForm.capacity}
                          onChange={(e) => setVehicleForm({...vehicleForm, capacity: e.target.value})}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Vehicle Classification type</label>
                      <select 
                        value={vehicleForm.vehicle_type}
                        onChange={(e) => setVehicleForm({...vehicleForm, vehicle_type: e.target.value})}
                        className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        <option>Container Truck</option>
                        <option>Heavy Trailer</option>
                        <option>Cargo Van</option>
                        <option>Mini Pickup Truck</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-2 text-xs rounded transition flex items-center justify-center space-x-1">
                      <Plus className="w-4 h-4" /> <span>REGISTER VEHICLE</span>
                    </button>
                  </form>

                  <div className="mt-4 border-t border-gray-150 pt-3 max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <tbody>
                        {vehicles.map(v => (
                          <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-1.5 font-bold text-gray-800">{v.vehicle_no}</td>
                            <td className="py-1.5 text-gray-400">{v.vehicle_type}</td>
                            <td className="py-1.5 text-indigo-600 font-mono italic">{v.capacity}</td>
                            <td className="py-1.5 text-right">
                              <button onClick={() => handleDeleteVehicle(v.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Driver addition portal */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">Recruit Carrier Driver Roster</h3>

                  <form onSubmit={handleAddDriver} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Full Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Rajesh Kumar" 
                          value={driverForm.full_name}
                          onChange={(e) => setDriverForm({...driverForm, full_name: e.target.value})}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Commercial License DL</label>
                        <input 
                          type="text" 
                          placeholder="DL-BANG-..." 
                          value={driverForm.license_no}
                          onChange={(e) => setDriverForm({...driverForm, license_no: e.target.value})}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col">
                        <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">Phone Number</label>
                        <input 
                          type="text" 
                          placeholder="Contact" 
                          value={driverForm.phone}
                          onChange={(e) => setDriverForm({...driverForm, phone: e.target.value})}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-mono text-gray-400 uppercase font-bold mb-1">System Username</label>
                        <input 
                          type="text" 
                          placeholder="driver_handler" 
                          value={driverForm.username}
                          onChange={(e) => setDriverForm({...driverForm, username: e.target.value})}
                          className="bg-gray-50 border border-gray-200 text-xs rounded-md py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 text-xs rounded transition flex items-center justify-center space-x-1">
                      <Plus className="w-4 h-4" /> <span>ENROLL DRIVER PROFILE</span>
                    </button>
                  </form>

                  <div className="mt-4 border-t border-gray-150 pt-3 max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <tbody>
                        {transporters[0]?.drivers?.map((d: any) => (
                          <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                            <td className="py-1.5 font-bold text-gray-800">{d.full_name}</td>
                            <td className="py-1.5 text-gray-400">{d.phone}</td>
                            <td className="py-1.5 text-emerald-600 text-[10px] font-bold">{d.status.toUpperCase()}</td>
                            <td className="py-1.5 text-right">
                              <button onClick={() => handleDeleteDriver(d.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        )) || (
                          <tr className="text-gray-400"><td colSpan={4} className="text-center py-2">No custom drivers enrolled yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Transportation Requests assigned by Sellers */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">Active Transportation & payload Carriage requests</h3>
                
                <div className="space-y-4">
                  {vehicleRequests.map(vr => (
                    <div key={vr.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs font-mono">
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-2 mb-2">
                        <div>
                          <span className="font-bold text-gray-800">CARRY REQUEST CODE: #CR-{vr.id}</span>
                          <span className="font-mono text-[9px] block">Order linked: ORD-{vr.order_id}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[10px]">
                          <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-black">BUDGET OFFERED: ₹{vr.budget}/-</span>
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            vr.status === 'approved' ? 'bg-green-150 text-green-700' : 'bg-amber-50 text-amber-500'
                          }`}>
                            {vr.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase">Shipper Company:</p>
                          <p className="font-bold text-gray-800">{vr.sellerCompanyName}</p>
                          <p className="text-[10px]">Destination Address: <span className="italic">{vr.destinationAddress}</span></p>
                          <p className="text-[10px]">Assigned Delivery Cargo: <span className="underline">{vr.goodsName}</span></p>
                        </div>
                        
                        <div className="bg-white border p-2 rounded-md">
                          {vr.status === 'pending' && (
                            <div>
                              <p className="text-[10px] text-red-500 font-bold uppercase mb-2">Assign Fleet Carrier assets to Dispatch:</p>
                              <div className="space-y-2">
                                <div className="flex space-x-2">
                                  <select id={`drv_${vr.id}`} className="bg-gray-50 border p-1 rounded font-mono text-[10.5px] w-1/2">
                                    <option value="1">Rajesh Kumar (DL-BANG-2023-01)</option>
                                    <option value="2">Amit Singh (DL-BANG-2023-02)</option>
                                  </select>
                                  <select id={`vhc_${vr.id}`} className="bg-gray-50 border p-1 rounded font-mono text-[10.5px] w-1/2">
                                    <option value="1">Container Truck - KA-03-HA-8842</option>
                                    <option value="2">Flatbed Heavy Trailer - KA-51-MD-9915</option>
                                  </select>
                                </div>
                                <button 
                                  onClick={() => {
                                    const dId = parseInt((document.getElementById(`drv_${vr.id}`) as HTMLSelectElement).value);
                                    const vId = parseInt((document.getElementById(`vhc_${vr.id}`) as HTMLSelectElement).value);
                                    handleDispatchCarrying(vr.id, dId, vId);
                                  }}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold p-1 rounded text-[10px]"
                                >
                                  DISPATCH SHIPMENT NOW
                                </button>
                              </div>
                            </div>
                          )}

                          {vr.status === 'approved' && (
                            <div className="text-green-700 font-black flex items-center space-x-1">
                              <CheckCircle className="w-5 h-5" />
                              <div className="text-[10.5px]">
                                <span>Roster assigned and locked in. Carrier in Transit.</span>
                                <span className="block text-[9px] text-gray-500 italic">Dispatched with KA-03-HA-8842.</span>
                              </div>
                            </div>
                          )}

                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Disputes & Complaints Management board */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Complaint & Resolution Desk</h3>
                  <span className="text-[10px] text-gray-400 font-mono">Disputes: {complaints.length} Filed</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {complaints.map(c => (
                    <div key={c.id} className="bg-gray-50 border rounded-lg p-3">
                      <div className="flex justify-between items-center border-b pb-1.5 mb-2">
                        <span className="font-bold text-gray-800 uppercase text-[11px] block">{c.subject}</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${c.status === 'resolved' ? 'bg-green-150 text-green-700' : 'bg-red-50 text-red-500'}`}>
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 mb-2 italic">"{c.description}"</p>
                      <div className="text-[10px] text-gray-400 block mb-2">Sender: user-{c.sender_id} ({c.sender_role})</div>
                      
                      {c.status === 'pending' && (
                        <div className="flex space-x-2">
                          <input id={`res_text_${c.id}`} type="text" placeholder="Resolution explanation text..." className="bg-white border p-1 rounded flex-1 text-xs" />
                          <button 
                            onClick={() => {
                              const note = (document.getElementById(`res_text_${c.id}`) as HTMLInputElement).value;
                              handleResolveComplaint(c.id, note);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-[10px] font-bold"
                          >
                            Resolve Log
                          </button>
                        </div>
                      )}

                      {c.status === 'resolved' && (
                        <div className="bg-green-50 p-2 rounded text-green-800 text-[10.5px]">
                          <strong>Resolution note:</strong> "{c.resolution}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* 4. DRIVER HANDHELD SIMULATOR */}
          {activeRole === 'driver' && (
            <div className="space-y-6">
              
              <div className="bg-indigo-950 p-4 rounded-xl text-white shadow-xl border border-indigo-900">
                <div className="flex items-center space-x-2 text-indigo-300 font-mono text-xs uppercase mb-3 text-emerald-400">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  <span>Interactive Driver Handheld Console Terminal</span>
                </div>
                <p className="text-xs text-indigo-200">
                  You are simulated onboard our cargo fleet dispatch. Update your live coordinates here to reflect route updates dynamically on the Receiver GIS Leaflet telemetry container.
                </p>
              </div>

              <div className="space-y-4">
                {deliveryDetails.map(dd => (
                  <div key={dd.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm font-mono text-xs">
                    <div className="flex justify-between items-center border-b pb-2.5 mb-3">
                      <div>
                        <span className="font-bold text-gray-800 text-xs uppercase">PAYLOAD REF: ORD-{dd.orderId}</span>
                        <div className="text-[10px] text-gray-400">Assigned Transit KA-03-HA-8842</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px] shadow-sm shadow-indigo-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          <span>Simulation Connected</span>
                        </span>
                      </div>
                    </div>

                    {/* Interactive Multi-step Progress Bar Component */}
                    <div className="my-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative">
                      <div className="pb-3 mb-4 border-b border-dashed border-slate-200/80 flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center space-x-1">
                          <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          <span>Interactive Shipment Progress</span>
                        </span>
                        <span className="text-[9px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Current Stage: {dd.status?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="relative flex items-center justify-between px-2">
                        {/* Background line */}
                        <div className="absolute left-4 right-4 top-1/2 h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
                        
                        {/* Animated Active progress line */}
                        <motion.div 
                          className="absolute left-4 top-1/2 h-1 bg-indigo-600 -translate-y-1/2 rounded-full origin-left"
                          initial={{ width: '0%' }}
                          animate={{ width: `${(getStageIndex(dd.status) / (DELIVERY_STAGES.length - 1)) * 100}%` }}
                          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                        />

                        {DELIVERY_STAGES.map((stage, idx) => {
                          const currentIdx = getStageIndex(dd.status);
                          const isCompleted = idx < currentIdx;
                          const isActive = idx === currentIdx;
                          const isFuture = idx > currentIdx;

                          return (
                            <button
                              key={stage.key}
                              onClick={() => {
                                if (dd.status !== stage.key) {
                                  handleUpdateDriverStatus(dd.orderId, stage.key, stage.remarks);
                                }
                              }}
                              className="relative z-10 flex flex-col items-center group cursor-pointer focus:outline-none"
                              title={`Click to set stage to ${stage.label}`}
                            >
                              {/* Step circle */}
                              <motion.div
                                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isActive 
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 ring-4 ring-indigo-100' 
                                    : isCompleted 
                                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-100' 
                                      : 'bg-white border-slate-300 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:shadow-md'
                                }`}
                                animate={isActive ? {
                                  scale: [1, 1.1, 1],
                                  boxShadow: [
                                    "0px 0px 0px rgba(99, 102, 241, 0.2)",
                                    "0px 0px 12px rgba(99, 102, 241, 0.5)",
                                    "0px 0px 0px rgba(99, 102, 241, 0.2)"
                                  ]
                                } : { scale: 1 }}
                                transition={isActive ? {
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                } : {}}
                              >
                                {stage.iconName === 'UserCheck' && <UserCheck className="w-4 h-4" />}
                                {stage.iconName === 'Truck' && <Truck className="w-4 h-4" />}
                                {stage.iconName === 'Compass' && <Compass className="w-4 h-4" />}
                                {stage.iconName === 'CheckCircle' && <CheckCircle className="w-4 h-4" />}
                              </motion.div>

                              {/* Label text */}
                              <div className="mt-2 text-center max-w-[70px]">
                                <p className={`text-[9px] font-bold tracking-tight uppercase ${
                                  isActive 
                                    ? 'text-indigo-700 font-extrabold' 
                                    : isCompleted 
                                      ? 'text-emerald-600' 
                                      : 'text-slate-400 group-hover:text-slate-700'
                                }`}>
                                  {stage.label}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-gray-400 uppercase">Receiver Name:</p>
                        <p className="font-bold text-gray-800">{dd.receiverName}</p>
                        <p className="text-[11px]">Consignee Terminal Address:</p>
                        <p className="italic text-[10px] text-gray-500">{dd.shippingAddress}</p>
                        <p className="text-[10px]">Receiver Contact: {dd.receiverPhone}</p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-[10px] text-indigo-600 font-bold uppercase mb-2">Simulate Fleet Truck Movement Controls:</p>
                        <div className="space-y-2">
                          <div className="flex flex-col space-y-1">
                            <span className="text-[9px] text-gray-600 font-mono">Move Mock Coordinate (Slider Grid):</span>
                            <div className="flex space-x-2">
                              <button onClick={() => handleMoveGPSMock(dd.orderId, 1, 0.5)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded text-[10px] font-bold">Drive 5km North</button>
                              <button onClick={() => handleMoveGPSMock(dd.orderId, -1.2, 2.1)} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded text-[10px] font-bold">Drive 10km East</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stage upgrading actions */}
                    <div className="flex flex-wrap items-center gap-2 border-t pt-3 justify-between">
                      <div className="flex space-x-1.5">
                        {dd.status === 'assigned' && (
                          <>
                            <button onClick={() => handleUpdateDriverStatus(dd.orderId, 'picked-up', "Cargo loaded. Gate cleared.")} className="bg-indigo-650 hover:bg-indigo-700 text-white px-3 py-1.5 rounded font-bold text-[10px]">
                              🚚 MARK AS PICKED UP (FROM DEPOT)
                            </button>
                            <button 
                              onClick={() => startQRScan(dd.orderId)} 
                              className="bg-purple-650 hover:bg-purple-700 text-white px-3 py-1.5 rounded font-bold text-[10px] flex items-center space-x-1.5 border border-purple-500 shadow-sm"
                            >
                              <QrCode className="w-3.5 h-3.5 text-purple-200" />
                              <span>SCAN SHIPMENT QR (FAST PICK-UP)</span>
                            </button>
                          </>
                        )}
                        {dd.status === 'picked-up' && (
                          <button onClick={() => handleUpdateDriverStatus(dd.orderId, 'in-transit', "Cruising National Highway bypass.")} className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded font-bold text-[10px]">
                            ⚡ START IN-TRANSIT ROUTING
                          </button>
                        )}
                        {['picked-up', 'in-transit', 'assigned'].includes(dd.status) && (
                          <button onClick={() => handleUpdateDriverStatus(dd.orderId, 'delivered', "Goods handed over directly to client container base.")} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded font-bold text-[10px]">
                            ✔️ CONFIRM SECURE DELIVERED
                          </button>
                        )}
                      </div>

                      <button onClick={() => handleTriggerSOS(dd.orderId)} className="bg-red-600 hover:bg-red-700 text-white px-3.5 py-1.5 rounded font-bold text-[10px] flex items-center space-x-1 scale-95 hover:scale-100 transition">
                        <AlertTriangle className="w-3.5 h-3.5" /> <span>EMERGENCY SOS BEACON</span>
                      </button>
                    </div>

                  </div>
                ))}
                {deliveryDetails.length === 0 && (
                  <div className="bg-white p-10 border rounded-xl text-center text-xs text-gray-500 font-mono">
                    No payload dispatch deliveries scheduled for your driver roster ID.
                  </div>
                )}
              </div>

              {/* QR Code Scanner Overlay Modal */}
              {scanningOrderId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
                  <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl w-full max-w-sm overflow-hidden text-slate-100 shadow-2xl relative">
                    
                    {/* Header */}
                    <div className="bg-slate-950 px-4 py-3 border-b border-indigo-950/65 flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <div>
                          <p className="text-xs font-black uppercase text-indigo-300 font-mono tracking-wider">QR DISPATCH TERMINAL</p>
                          <p className="text-[9px] text-slate-500 font-mono">HARDWARE DEV ID: SECURE-NX8</p>
                        </div>
                      </div>
                      <button 
                        onClick={closeQRScan}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1 rounded-full transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Camera Feed Simulator / Viewfinder */}
                    <div className="p-5 flex flex-col items-center">
                      <div className="relative w-60 h-60 bg-slate-950 rounded-xl border border-indigo-500/40 p-3 flex flex-col justify-center items-center overflow-hidden">
                        
                        {/* Highlights corner brackets */}
                        <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400 rounded-tl" />
                        <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400 rounded-tr" />
                        <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400 rounded-bl" />
                        <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400 rounded-br" />

                        {/* Animated sweeping laser line */}
                        {!scanningSuccess && (
                          <motion.div 
                            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-lg shadow-cyan-400 z-10"
                            animate={{ top: ['10%', '90%', '10%'] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                          />
                        )}

                        {/* Scanner Viewfinder contents */}
                        <div className="flex flex-col items-center justify-center space-y-3 z-0">
                          {/* Simulated QR Code matrix graphic */}
                          <div className={`p-2 bg-white rounded-lg transition-all duration-300 ${scanningSuccess ? 'scale-90 border-4 border-emerald-500 bg-emerald-50' : 'opacity-80'}`}>
                            <div className="w-24 h-24 relative flex items-center justify-center">
                              {/* QR Code pattern simulating matrix */}
                              <div className="grid grid-cols-4 gap-1 w-full h-full p-1 bg-white">
                                <div className="bg-slate-900 rounded-sm" />
                                <div className="bg-slate-900 rounded-sm" />
                                <div className="bg-slate-200 rounded-sm" />
                                <div className="bg-slate-900 rounded-sm" />
                                
                                <div className="bg-slate-200 rounded-sm" />
                                <div className="bg-slate-950 rounded-sm" />
                                <div className="bg-slate-950 rounded-sm" />
                                <div className="bg-slate-200 rounded-sm" />
                                
                                <div className="bg-slate-900 rounded-sm" />
                                <div className="bg-slate-200 rounded-sm" />
                                <div className="bg-slate-900 rounded-sm" />
                                <div className="bg-slate-900 rounded-sm" />
                                
                                <div className="bg-slate-900 rounded-sm" />
                                <div className="bg-slate-900 rounded-sm" />
                                <div className="bg-slate-200 rounded-sm" />
                                <div className="bg-slate-950 rounded-sm" />
                              </div>
                              {/* Overlaying scanner target */}
                              <div className="absolute inset-0 bg-transparent opacity-30 border border-dashed border-red-500 rounded animate-pulse" />
                            </div>
                          </div>

                          <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400">
                            {scanningSuccess ? '🔒 BARCODE SECURED' : '🔍 ALIGN MANIFEST LABEL'}
                          </span>
                        </div>

                        {/* Simulated green check overlay when scan successful */}
                        {scanningSuccess && (
                          <motion.div 
                            className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-center p-4 z-20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                              <CheckCircle className="w-7 h-7" />
                            </div>
                            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest font-mono">SCAN SECURED</h4>
                            <p className="text-[9px] text-slate-300 mt-1 font-mono">PAYLOAD ORD-{scanningOrderId} VERIFIED</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Diagnostic telemetry details */}
                      <div className="w-full mt-4 space-y-2 text-left">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-slate-500">TRANSIT TARGET:</span>
                          <span className="text-cyan-400 font-bold">ORD-{scanningOrderId}</span>
                        </div>

                        {/* Custom loading bar */}
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-150 ${scanningSuccess ? 'bg-emerald-500' : 'bg-cyan-500'}`} 
                            style={{ width: `${scanningProgress}%` }}
                          />
                        </div>

                        {/* Interactive scan steps feedback logs */}
                        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-indigo-950/50 min-h-[50px] font-mono text-[9px] text-left text-slate-400 space-y-1">
                          {scanningProgress === 0 && <p className="animate-pulse text-indigo-400">&gt;_ Hardware booted. Initialize scan beam...</p>}
                          {scanningProgress > 0 && scanningProgress < 40 && <p className="text-amber-400">&gt;_ Focusing laser lenses. Reading tracking matrix...</p>}
                          {scanningProgress >= 40 && scanningProgress < 85 && <p className="text-yellow-400">&gt;_ Manifest identified. Fetching digital ledger security certificate...</p>}
                          {scanningProgress >= 85 && scanningProgress < 100 && <p className="text-cyan-400">&gt;_ Verification ledger handshake in progress...</p>}
                          {scanningSuccess && (
                            <>
                              <p className="text-emerald-400 font-semibold">&gt;_ SUCCESS: Verified secure transit dispatch ORD-{scanningOrderId}!</p>
                              <p className="text-slate-500">&gt;_ Database flagged: ID [picked-up]</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom controls panel */}
                    <div className="bg-slate-950 p-4 border-t border-indigo-950/65 flex justify-end space-x-2">
                      <button 
                        onClick={closeQRScan}
                        className={`px-4 py-1.5 rounded font-mono text-xs font-bold transition ${
                          scanningSuccess 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {scanningSuccess ? 'CLOSE SCANNER' : 'CANCEL'}
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* 5. RECEIVER PORTAL & MARKETPLACE */}
          {activeRole === 'receiver' && (
            <div className="space-y-6">
              
              {/* Marketplace Products listing */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-gray-100 mb-4 gap-2">
                  <div>
                    <h2 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Browse Wholesaler Catalog Goods</h2>
                    <p className="text-[10px] text-gray-400">Simulating B2B order checkout with credit payments</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-2.5" />
                      <input 
                        type="text" 
                        placeholder="Search machinery, furniture..." 
                        value={marketplaceSearch}
                        onChange={(e) => setMarketplaceSearch(e.target.value)}
                        className="bg-gray-50 border text-xs pl-7 pr-3 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44" 
                      />
                    </div>
                    <select 
                      value={marketplaceFilter}
                      onChange={(e) => setMarketplaceFilter(e.target.value)}
                      className="bg-gray-50 border text-xs p-1.5 rounded-md focus:outline-none"
                    >
                      <option value="All">All Categories</option>
                      <option value="Machinery">Machinery</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Raw Industrial">Raw Industrial</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {goods
                    .filter(g => marketplaceFilter === 'All' || g.category === marketplaceFilter)
                    .filter(g => g.name.toLowerCase().includes(marketplaceSearch.toLowerCase()))
                    .map(g => (
                      <div key={g.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col justify-between hover:shadow transition">
                        <div>
                          <img src={g.image_url} alt={g.name} className="w-full h-28 object-cover rounded bg-gray-200 mb-2" />
                          <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-bold uppercase">{g.category}</span>
                          <h4 className="text-xs font-bold text-gray-800 mt-1">{g.name}</h4>
                          <p className="text-[10.5px] text-gray-500 line-clamp-2 mt-1">{g.description}</p>
                          <div className="text-[10px] text-gray-400 mt-2 block">Shipped from: <strong className="underline">{g.sellerCompanyName}</strong></div>
                        </div>
                        <div className="mt-3 border-t border-gray-150 pt-2.5 flex items-center justify-between">
                          <span className="text-sm font-black text-indigo-900 font-mono">₹{g.price?.toLocaleString()}</span>
                          <button 
                            onClick={() => { setSelectedProduct(g); setCheckoutQty(1); }} 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1 text-[10px] rounded space-x-1"
                          >
                            <span>Buy Item</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Order checkout popup drawer simulation */}
              {selectedProduct && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                  <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-200 font-mono text-xs">
                    <h3 className="text-sm font-black text-indigo-950 uppercase border-b pb-2 mb-4 tracking-wider">Gate Checkout: Safe MySQL Transaction</h3>
                    
                    <div className="space-y-4">
                      <div className="flex space-x-3">
                        <img src={selectedProduct.image_url} alt="" className="w-16 h-16 object-cover rounded bg-gray-100" />
                        <div>
                          <h4 className="font-bold text-xs text-gray-800">{selectedProduct.name}</h4>
                          <span className="text-indigo-600 font-bold block text-sm">₹{selectedProduct.price?.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400">Available: {selectedProduct.quantity} items</span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-gray-500 font-bold uppercase">Select Quantity:</label>
                        <input 
                          type="number" 
                          min="1" 
                          max={selectedProduct.quantity}
                          value={checkoutQty} 
                          onChange={(e) => setCheckoutQty(parseInt(e.target.value) || 1)}
                          className="bg-gray-50 border p-2 rounded text-xs text-center font-bold" 
                        />
                      </div>

                      <div className="flex flex-col space-y-1">
                        <label className="text-[9px] text-gray-500 font-bold uppercase">Consignee Shipping Terminal Address:</label>
                        <textarea 
                          value={checkoutAddress} 
                          onChange={(e) => setCheckoutAddress(e.target.value)}
                          rows={2}
                          className="bg-gray-50 border p-2 rounded text-xs" 
                        />
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 p-3 rounded text-[11px] space-y-1">
                        <div className="flex justify-between text-indigo-900 font-bold">
                          <span>Total billing:</span>
                          <span>₹{(selectedProduct.price * checkoutQty)?.toLocaleString()}/-</span>
                        </div>
                        <span className="text-[9px] text-indigo-600 block leading-tight">Simulated direct draft from Buyer wallet with verified MySQL entry.</span>
                      </div>

                      <div className="flex space-x-2 pt-2 text-[10px]">
                        <button onClick={handleOrderGoods} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-md text-center">
                          CONFIRM SECURE PAYMENT Gateway
                        </button>
                        <button onClick={() => setSelectedProduct(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-md">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Order History Status tracking Panel */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
                <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider mb-4 border-b border-gray-100 pb-2">My cargo order history & real-time telemetry link</h3>

                <div className="space-y-4">
                  {orders.map(o => (
                    <div key={o.id} className="p-3 bg-gray-50 border rounded-lg flex flex-col gap-3 font-mono text-xs">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <div>
                          <span className="font-bold text-gray-800">ORDER NO: ORD-{o.id}</span>
                          <span className="text-[9px] block text-indigo-600 font-bold">Seller Manufacturer: {o.sellerCompanyName}</span>
                        </div>
                        <span className={`px-2.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                          o.order_status === 'completed' ? 'bg-green-150 text-green-700' : 'bg-indigo-50 text-indigo-600'
                        }`}>
                          STAGE: {o.order_status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] text-gray-400">Cargo payload:</p>
                          <p className="font-bold text-gray-800">{o.goodsName} ({o.quantity} units)</p>
                          <p className="text-[10px] mt-1 text-green-700">Clearing cost: ₹{o.total_price?.toLocaleString()}/-</p>
                        </div>

                        {/* Interactive GIS tracking simulation block widget */}
                        <div className="bg-white border rounded p-2.5 shadow-inner">
                          <p className="text-[9px] text-indigo-600 font-bold uppercase mb-1.5 flex items-center">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500 animate-bounce mr-1" /> Live GIS telemetry tracking grid:
                          </p>
                          {o.tracking ? (
                            <div className="space-y-1 bg-gray-50 p-2 rounded text-[10px]">
                              <div className="flex justify-between text-gray-500 text-[9px]">
                                <span>Lat Coordinate: {o.tracking.current_lat}</span>
                                <span>Lng: {o.tracking.current_lng}</span>
                              </div>
                              <p className="font-bold text-gray-800 italic">"{o.tracking.route_status}"</p>
                              <span className="text-[9px] text-gray-400 italic block mt-1">Mock vehicle active near Marathahalli central corridor.</span>
                              
                              {/* Simple CSS Visual Progress telemetry bar */}
                              <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 relative overflow-hidden">
                                <div className="absolute top-0 left-0 bg-indigo-600 h-1.5 rounded-full" style={{ width: o.order_status === 'completed' ? '100%' : o.order_status === 'shipping' ? '65%' : o.order_status === 'assigned' ? '30%' : '10%' }}></div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[10px] italic">Telemetry connection waiting until vehicles are assigned by carrier.</span>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                  {orders.length === 0 && (
                     <div className="text-center py-8 text-gray-400 font-mono">You haven't placed any cargo orders yet.</div>
                  )}
                </div>
              </div>

              {/* Dispute & Issue file board form */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b pb-2 mb-4">
                  <h3 className="text-xs font-black uppercase text-indigo-950 tracking-wider">Lodge dispute claim or transport Complaint</h3>
                  <span className="text-[10.5px] text-gray-400">Claims are instantly integrated into the Transporter resolve panel database of current order IDs.</span>
                </div>

                <form onSubmit={handleSubmitComplaint} className="space-y-3 font-mono text-xs">
                  <div className="flex space-x-3">
                    <div className="flex flex-col w-1/3">
                      <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Link Order ID</label>
                      <input 
                        type="number" 
                        value={complaintForm.order_id}
                        onChange={(e) => setComplaintForm({...complaintForm, order_id: e.target.value})}
                        placeholder="e.g. 101" 
                        className="bg-gray-50 border p-2 rounded text-xs focus:ring-1 focus:ring-indigo-500" 
                      />
                    </div>
                    <div className="flex flex-col w-2/3">
                      <label className="text-[10px] text-gray-400 font-bold uppercase mb-1">Issue Subject Summary</label>
                      <input 
                        type="text" 
                        value={complaintForm.subject}
                        onChange={(e) => setComplaintForm({...complaintForm, subject: e.target.value})}
                        placeholder="e.g. Broken hardware during unloading" 
                        className="bg-gray-50 border p-2 rounded text-xs focus:ring-1 focus:ring-indigo-500" 
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-gray-400 font-bold uppercase mb-2">Detailed explanation describing the issue</label>
                    <textarea 
                      value={complaintForm.description}
                      onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                      placeholder="Please elaborate specifically..." 
                      rows={3}
                      className="bg-gray-50 border p-2 rounded text-xs" 
                    />
                  </div>
                  <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded text-[10.5px] uppercase">
                    FILE TRANSIT DOCKET ISSUE
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* CODE HUB: EXPORTS FOR ACADEMIC PRESENTATION */}
          {activeRole === 'codehub' && (
            <div className="space-y-6">
              
              <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 shadow-sm">
                <div className="flex items-center space-x-2 text-indigo-900 mb-2 font-bold text-xs uppercase">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  <span>Final-Year Engineering Presentation Code Hub</span>
                </div>
                <p className="text-xs text-indigo-950">
                  This export drawer compiles the entire Python (Django) & MySQL Relational Database structure required for your engineering project portfolio folder. Clean syntax with structured models, forms, URLs, and installation checklists are provided below. Use the copy managers or save elements to separate code documents in single-clicks.
                </p>
              </div>

              {/* Tabs selector */}
              <div className="bg-white border p-1.5 rounded-lg flex space-x-1 overflow-x-auto text-xs font-mono font-bold">
                <button onClick={() => setCodeTab('sql')} className={`px-3 py-1.5 rounded ${codeTab === 'sql' ? 'bg-indigo-950 text-white' : 'text-gray-500'}`}>1. MySQL DB schema</button>
                <button onClick={() => setCodeTab('models')} className={`px-3 py-1.5 rounded ${codeTab === 'models' ? 'bg-indigo-950 text-white' : 'text-gray-500'}`}>2. models.py (Django)</button>
                <button onClick={() => setCodeTab('views')} className={`px-3 py-1.5 rounded ${codeTab === 'views' ? 'bg-indigo-950 text-white' : 'text-gray-500'}`}>3. views.py (Controllers)</button>
                <button onClick={() => setCodeTab('urls')} className={`px-3 py-1.5 rounded ${codeTab === 'urls' ? 'bg-indigo-950 text-white' : 'text-gray-500'}`}>4. urls.py (Router)</button>
                <button onClick={() => setCodeTab('forms')} className={`px-3 py-1.5 rounded ${codeTab === 'forms' ? 'bg-indigo-950 text-white' : 'text-gray-500'}`}>5. forms.py (Forms)</button>
                <button onClick={() => setCodeTab('readme')} className={`px-3 py-1.5 rounded ${codeTab === 'readme' ? 'bg-green-700 text-white' : 'text-green-700'}`}>📖 Deployment Tutorial</button>
              </div>

              {/* Code display frame */}
              <div className="bg-gray-900 text-gray-100 p-4 rounded-xl flex flex-col font-mono text-[11px] shadow-2xl relative">
                
                <div className="flex justify-between items-center pb-2.5 mb-3 border-b border-gray-800">
                  <span className="text-gray-400 capitalize">
                    Active Module: {codeTab === 'sql' ? 'MySQL Database Tables' : codeTab === 'readme' ? 'Deployment Manual' : `Django ${codeTab}.py Blueprint`}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        let txt = '';
                        if (codeTab === 'sql') txt = projectTemplates?.sqlSchema;
                        else if (codeTab === 'models') txt = projectTemplates?.djangoModels;
                        else if (codeTab === 'views') txt = projectTemplates?.djangoViews;
                        else if (codeTab === 'urls') txt = projectTemplates?.djangoUrls;
                        else if (codeTab === 'forms') txt = projectTemplates?.djangoForms;
                        else if (codeTab === 'readme') txt = projectTemplates?.installationGuide;
                        copyToClipboard(txt || '');
                      }}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1 rounded.flex items-center space-x-1 border border-gray-700"
                    >
                      <Copy className="w-3.5 h-3.5 inline mr-1" /> Copy Block
                    </button>
                    <button 
                      onClick={() => {
                        let txt = '';
                        let name = '';
                        if (codeTab === 'sql') { txt = projectTemplates?.sqlSchema; name = 'smart_goods_transport_schema.sql'; }
                        else if (codeTab === 'models') { txt = projectTemplates?.djangoModels; name = 'models.py'; }
                        else if (codeTab === 'views') { txt = projectTemplates?.djangoViews; name = 'views.py'; }
                        else if (codeTab === 'urls') { txt = projectTemplates?.djangoUrls; name = 'urls.py'; }
                        else if (codeTab === 'forms') { txt = projectTemplates?.djangoForms; name = 'forms.py'; }
                        else if (codeTab === 'readme') { txt = projectTemplates?.installationGuide; name = 'INSTALL_GUIDE.md'; }
                        handleDownloadFile(name, txt || '');
                      }}
                      className="bg-indigo-650 hover:bg-indigo-600 text-white px-3 py-1 rounded inline-flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" /> Export File
                    </button>
                  </div>
                </div>

                <pre className="max-h-120 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                  {codeTab === 'sql' && projectTemplates?.sqlSchema}
                  {codeTab === 'models' && projectTemplates?.djangoModels}
                  {codeTab === 'views' && projectTemplates?.djangoViews}
                  {codeTab === 'urls' && projectTemplates?.djangoUrls}
                  {codeTab === 'forms' && projectTemplates?.djangoForms}
                  {codeTab === 'readme' && projectTemplates?.installationGuide}
                </pre>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Humble status bar matching High-Density Guidelines */}
      <footer className="h-6 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-400 font-mono flex items-center justify-between px-6">
        <div>MySQL Relational Schemas Live • Multi-role Authentication Console</div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>Server Host: Port 3000</span>
          <span>© Final Year Engineering Project Submission Code base</span>
        </div>
      </footer>

    </div>
  );
}
