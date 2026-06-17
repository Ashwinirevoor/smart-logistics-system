import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  SQL_SCHEMA,
  DJANGO_MODELS,
  DJANGO_VIEWS,
  DJANGO_URLS,
  DJANGO_FORMS,
  INSTALLATION_GUIDE
} from './src/projectCodeTemplates';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// IN-MEMORY COMPREHENSIVE SIMULATED DATABASE
// ==========================================

const db = {
  admin: [
    { id: 1, username: 'sysadmin', email: 'admin@smarttrans.com', password_hash: 'admin123', full_name: 'System Administrator', phone: '+1-987-654-3210' }
  ],
  sellers: [
    { id: 1, username: 'apex_goods', email: 'sales@apex.com', password_hash: 'seller123', company_name: 'Apex Manufacturing Ltd', phone: '7700223344', address: 'Sector 4, Industrial Area, Bangalore', status: 'approved', created_at: new Date().toISOString() },
    { id: 2, username: 'global_furnish', email: 'info@furnishings.com', password_hash: 'seller123', company_name: 'Global Furnishings Inc', phone: '9911223344', address: 'Outer Ring Rd, Marathahalli, Bangalore', status: 'pending', created_at: new Date().toISOString() }
  ],
  transporters: [
    { id: 1, username: 'super_logistics', email: 'fleet@superlogistics.com', password_hash: 'transporter123', agency_name: 'Super Fast Logistics Cargo', phone: '8844556677', license_no: 'LIC-IND-9988-XY', status: 'approved', created_at: new Date().toISOString() },
    { id: 2, username: 'eco_freight', email: 'dispatch@ecofreight.com', password_hash: 'transporter123', agency_name: 'EcoFreight Shippers', phone: '9988776655', license_no: 'LIC-IND-1122-AB', status: 'pending', created_at: new Date().toISOString() }
  ],
  drivers: [
    { id: 1, username: 'driver_raj', email: 'raj@cargo.com', password_hash: 'driver123', full_name: 'Rajesh Kumar', phone: '8811223344', license_no: 'DL-BANG-2023-01', transporter_id: 1, status: 'available', current_lat: 12.971598, current_lng: 77.594562 },
    { id: 2, username: 'driver_amit', email: 'amit@cargo.com', password_hash: 'driver123', full_name: 'Amit Singh', phone: '9922001155', license_no: 'DL-BANG-2023-02', transporter_id: 1, status: 'busy', current_lat: 12.9591, current_lng: 77.6978 }
  ],
  receivers: [
    { id: 1, username: 'receiver_john', email: 'buyer_john@gmail.com', password_hash: 'receiver123', full_name: 'John Doe', phone: '9000111222', address: 'Block C, Electronic City Phase 1, Bangalore', is_verified: true },
    { id: 2, username: 'receiver_priya', email: 'priya_m@yahoo.com', password_hash: 'receiver123', full_name: 'Priya Sharma', phone: '9111222333', address: 'Villa 45, Sterling Residency, Whitefield, Bangalore', is_verified: false }
  ],
  goods: [
    { id: 1, name: 'Industrial Drill Press', description: 'Heavy-duty vertical electronic steel drill press 750W power input with adjustable magnetic plate.', category: 'Machinery', price: 12450.00, quantity: 8, image_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400', seller_id: 1, created_at: new Date().toISOString() },
    { id: 2, name: 'Ergonomic Office Chair', description: 'Premium memory foam revolving ergonomic dynamic task office chair with tilt locks.', category: 'Furniture', price: 4500.00, quantity: 120, image_url: 'https://images.unsplash.com/photo-1505797149-43c0069ec26b?auto=format&fit=crop&q=80&w=400', seller_id: 1, created_at: new Date().toISOString() },
    { id: 3, name: 'Reclaimed Timber Study Desk', description: 'Handcrafted premium oak wood flat top working surface for home workspaces.', category: 'Furniture', price: 9800.00, quantity: 15, image_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400', seller_id: 2, created_at: new Date().toISOString() }
  ],
  orders: [
    { id: 101, goods_id: 2, seller_id: 1, receiver_id: 1, quantity: 2, total_price: 9000.00, order_status: 'shipping', shipping_address: 'Block C, Electronic City Phase 1, Bangalore', order_date: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 102, goods_id: 1, seller_id: 1, receiver_id: 2, quantity: 1, total_price: 12450.00, order_status: 'ordered', shipping_address: 'Villa 45, Sterling Residency, Whitefield, Bangalore', order_date: new Date().toISOString() }
  ],
  payments: [
    { id: 1, order_id: 101, amount: 9000.00, payment_type: 'goods_payment', payment_method: 'Online UPI/Card', status: 'completed', payment_date: new Date(Date.now() - 3600000 * 4).toISOString() },
    { id: 2, order_id: 102, amount: 12450.00, payment_type: 'goods_payment', payment_method: 'Online UPI/Card', status: 'completed', payment_date: new Date().toISOString() },
    { id: 3, order_id: 101, amount: 550.00, payment_type: 'transport_service_payment', payment_method: 'Seller Wallet Checkout', status: 'completed', payment_date: new Date(Date.now() - 3600000 * 3).toISOString() }
  ],
  vehicles: [
    { id: 1, transporter_id: 1, vehicle_no: 'KA-03-HA-8842', vehicle_type: 'Container Truck', capacity: '10 Tons', status: 'busy' },
    { id: 2, transporter_id: 1, vehicle_no: 'KA-51-MD-9915', vehicle_type: 'Flatbed Trailer', capacity: '25 Tons', status: 'available' },
    { id: 3, transporter_id: 2, vehicle_no: 'MH-12-QQ-7040', vehicle_type: 'Cargo Van', capacity: '2 Tons', status: 'available' }
  ],
  vehicle_requests: [
    { id: 1, order_id: 101, seller_id: 1, transporter_id: 1, budget: 550.00, status: 'approved', assigned_driver_id: 1, assigned_vehicle_id: 1, created_at: new Date(Date.now() - 3600000 * 3.5).toISOString() }
  ],
  delivery_details: [
    { id: 1, order_id: 101, driver_id: 1, vehicle_id: 1, expected_delivery: new Date(Date.now() + 3600000 * 2).toISOString(), actual_delivery: null, status: 'in-transit', notes: 'Fragile handling instructions' }
  ],
  tracking: [
    { id: 1, order_id: 101, driver_id: 1, current_lat: 12.971598, current_lng: 77.594562, route_status: 'Dispatched from hub. Heading East.', last_updated: new Date().toISOString() }
  ],
  complaints: [
    { id: 1, order_id: 101, sender_id: 1, sender_role: 'receiver', subject: 'Customized handles missing', description: 'I expected silver steel hand braces on the chair.', status: 'pending', resolution: null, created_at: new Date().toISOString() }
  ],
  activity_logs: [
    { id: 1, user_id: 1, user_role: 'admin', action: 'Bootstrapped core node. Standard parameters loaded.', ip_address: '127.0.0.1', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
    { id: 2, user_id: 1, user_role: 'seller', action: 'Catalog configured. Items live for trade.', ip_address: '172.16.54.1', timestamp: new Date(Date.now() - 3600000 * 11).toISOString() },
    { id: 3, user_id: 1, user_role: 'receiver', action: 'Placed Order #101.', ip_address: '192.168.1.5', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
  ]
};

// Logger utility
function logActivity(userId: number, role: string, action: string, req: express.Request) {
  const logId = db.activity_logs.length > 0 ? Math.max(...db.activity_logs.map(l => l.id)) + 1 : 1;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  db.activity_logs.unshift({
    id: logId,
    user_id: userId,
    user_role: role,
    action,
    ip_address: typeof ip === 'string' ? ip : String(ip),
    timestamp: new Date().toISOString()
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // API ROUTING: Auth
  app.post('/api/auth/login', (req, res) => {
    const { username, password, role } = req.body;
    
    if (role === 'admin') {
      const u = db.admin.find(x => x.username === username && x.password_hash === password);
      if (u) {
        logActivity(u.id, 'admin', `Authenticated account: ${u.username}`, req);
        return res.json({ success: true, user: { ...u, role } });
      }
    } else if (role === 'seller') {
      const u = db.sellers.find(x => x.username === username && x.password_hash === password);
      if (u) {
        if (u.status !== 'approved') {
          return res.status(403).json({ error: 'Your seller account registration status is currently PENDING review by the system administrator.' });
        }
        logActivity(u.id, 'seller', `Logged in seller: ${u.company_name}`, req);
        return res.json({ success: true, user: { ...u, role } });
      }
    } else if (role === 'transporter') {
      const u = db.transporters.find(x => x.username === username && x.password_hash === password);
      if (u) {
        if (u.status !== 'approved') {
          return res.status(403).json({ error: 'Your logistics handler account is currently PENDING review.' });
        }
        logActivity(u.id, 'transporter', `Logistics hub active: ${u.agency_name}`, req);
        return res.json({ success: true, user: { ...u, role } });
      }
    } else if (role === 'driver') {
      const u = db.drivers.find(x => x.username === username && x.password_hash === password);
      if (u) {
        logActivity(u.id, 'driver', `Driver console active: ${u.full_name}`, req);
        return res.json({ success: true, user: { ...u, role } });
      }
    } else if (role === 'receiver') {
      const u = db.receivers.find(x => x.username === username && x.password_hash === password);
      if (u) {
        logActivity(u.id, 'receiver', `Buyer access authorized: ${u.full_name}`, req);
        return res.json({ success: true, user: { ...u, role } });
      }
    }
    
    return res.status(401).json({ error: 'Invalid portal credentials. Check role selection or user login details.' });
  });

  app.post('/api/auth/register', (req, res) => {
    const { role, username, email, password, extraField1, extraField2, extraField3 } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, Email and Password fields are strictly required.' });
    }

    if (role === 'seller') {
      const exists = db.sellers.some(x => x.username === username || x.email === email);
      if (exists) return res.status(409).json({ error: 'Username or Email is already registered in the system.' });
      
      const newSeller = {
        id: db.sellers.length + 1,
        username,
        email,
        password_hash: password,
        company_name: extraField1 || 'Standard Freight Ltd',
        phone: extraField2 || '555-0199',
        address: extraField3 || 'Industrial Hub, Zone B',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      db.sellers.push(newSeller);
      logActivity(newSeller.id, 'seller', `Registered new seller account: ${newSeller.company_name}`, req);
      return res.json({ success: true, message: 'Seller registration submitted for Administrator review.' });
      
    } else if (role === 'transporter') {
      const exists = db.transporters.some(x => x.username === username || x.email === email);
      if (exists) return res.status(409).json({ error: 'Username or email credentials conflict.' });

      const newTransporter = {
        id: db.transporters.length + 1,
        username,
        email,
        password_hash: password,
        agency_name: extraField1 || 'Global Shippers Core',
        phone: extraField2 || '444-0129',
        license_no: extraField3 || 'LIC-GBL-8800',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      db.transporters.push(newTransporter);
      logActivity(newTransporter.id, 'transporter', `Registered new transporter vehicle agency: ${newTransporter.agency_name}`, req);
      return res.json({ success: true, message: 'Logistics Agency profile registered. Processing verification.' });

    } else if (role === 'receiver') {
      const exists = db.receivers.some(x => x.username === username || x.email === email);
      if (exists) return res.status(409).json({ error: 'Receiver credentials already exist.' });

      const newReceiver = {
        id: db.receivers.length + 1,
        username,
        email,
        password_hash: password,
        full_name: extraField1 || 'General Client',
        phone: extraField2 || '999-777-666',
        address: extraField3 || 'Residential Main St',
        is_verified: false,
        created_at: new Date().toISOString()
      };
      db.receivers.push(newReceiver);
      logActivity(newReceiver.id, 'receiver', `Registered receiver account: ${newReceiver.full_name}`, req);
      return res.json({ success: true, message: 'Receiver account created successfully. Ready for login.' });
    }

    return res.status(400).json({ error: 'Direct Driver or Admin registration restricted.' });
  });

  // API ROUTING: Admin Management Panel
  app.get('/api/admin/sellers', (req, res) => res.json(db.sellers));
  app.post('/api/admin/sellers/:id/approve', (req, res) => {
    const s = db.sellers.find(x => x.id === parseInt(req.params.id));
    if (s) {
      s.status = 'approved';
      logActivity(1, 'admin', `Approved Seller registration: ${s.company_name}`, req);
      return res.json({ success: true, seller: s });
    }
    return res.status(404).json({ error: 'Seller not found.' });
  });
  app.post('/api/admin/sellers/:id/reject', (req, res) => {
    const s = db.sellers.find(x => x.id === parseInt(req.params.id));
    if (s) {
      s.status = 'rejected';
      logActivity(1, 'admin', `Rejected Seller registration: ${s.company_name}`, req);
      return res.json({ success: true, seller: s });
    }
    return res.status(404).json({ error: 'Seller not found.' });
  });
  app.delete('/api/admin/sellers/:id', (req, res) => {
    const idx = db.sellers.findIndex(x => x.id === parseInt(req.params.id));
    if (idx !== -1) {
      const s = db.sellers[idx];
      db.sellers.splice(idx, 1);
      logActivity(1, 'admin', `Perm_Delete Seller account catalog: ${s.company_name}`, req);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Seller not found.' });
  });

  app.get('/api/admin/transporters', (req, res) => res.json(db.transporters));
  app.post('/api/admin/transporters/:id/approve', (req, res) => {
    const t = db.transporters.find(x => x.id === parseInt(req.params.id));
    if (t) {
      t.status = 'approved';
      logActivity(1, 'admin', `Approved logistics agency: ${t.agency_name}`, req);
      return res.json({ success: true, transporter: t });
    }
    return res.status(404).json({ error: 'Agency not found.' });
  });
  app.post('/api/admin/transporters/:id/reject', (req, res) => {
    const t = db.transporters.find(x => x.id === parseInt(req.params.id));
    if (t) {
      t.status = 'rejected';
      logActivity(1, 'admin', `Rejected agency: ${t.agency_name}`, req);
      return res.json({ success: true, transporter: t });
    }
    return res.status(404).json({ error: 'Agency not found.' });
  });
  app.delete('/api/admin/transporters/:id', (req, res) => {
    const idx = db.transporters.findIndex(x => x.id === parseInt(req.params.id));
    if (idx !== -1) {
      const t = db.transporters[idx];
      db.transporters.splice(idx, 1);
      logActivity(1, 'admin', `Deleted logistics fleet entity: ${t.agency_name}`, req);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Transporter not found' });
  });

  app.get('/api/admin/receivers', (req, res) => res.json(db.receivers));
  app.post('/api/admin/receivers/:id/verify', (req, res) => {
    const r = db.receivers.find(x => x.id === parseInt(req.params.id));
    if (r) {
      r.is_verified = !r.is_verified;
      logActivity(1, 'admin', `Toggle Receiver verified badge: ${r.full_name} (${r.is_verified})`, req);
      return res.json({ success: true, receiver: r });
    }
    return res.status(404).json({ error: 'Receiver not found' });
  });
  app.delete('/api/admin/receivers/:id', (req, res) => {
    const idx = db.receivers.findIndex(x => x.id === parseInt(req.params.id));
    if (idx !== -1) {
      const r = db.receivers[idx];
      db.receivers.splice(idx, 1);
      logActivity(1, 'admin', `Deleted receiver profile: ${r.full_name}`, req);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Receiver not found' });
  });

  app.get('/api/admin/logs', (req, res) => res.json(db.activity_logs));
  app.get('/api/admin/stats', (req, res) => {
    const totalSales = db.payments.filter(p => p.payment_type === 'goods_payment' && p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const activeDrivers = db.drivers.filter(d => d.status === 'busy').length;
    const pendingSecured = db.sellers.filter(s => s.status === 'pending').length + db.transporters.filter(t => t.status === 'pending').length;
    
    // Calculate last 7 days of daily cargo volume and revenue trends
    const dailyAnalytics: Array<{ date: string; volume: number; revenue: number }> = [];
    const today = new Date();
    
    // Baseline simulated values so chart shows healthy historical curves
    const baseCargo = [14, 22, 18, 31, 25, 38, 0];
    const baseRevenue = [9800, 15400, 12600, 21700, 17500, 26600, 0];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      
      const realVolume = db.orders
        .filter(o => {
          const oDate = new Date(o.order_date);
          return oDate >= startOfDay && oDate <= endOfDay;
        })
        .reduce((sum, o) => sum + o.quantity, 0);
        
      const realRevenue = db.payments
        .filter(p => {
          const pDate = new Date(p.payment_date);
          return p.payment_type === 'goods_payment' && p.status === 'completed' && pDate >= startOfDay && pDate <= endOfDay;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      dailyAnalytics.push({
        date: dateStr,
        volume: baseCargo[6 - i] + realVolume,
        revenue: baseRevenue[6 - i] + realRevenue
      });
    }

    return res.json({
      activeShipments: db.orders.filter(o => ['shipping', 'assigned', 'vehicle-requested'].includes(o.order_status)).length,
      approvalRequests: pendingSecured,
      totalRevenue: totalSales,
      systemAlertedIssues: db.complaints.filter(c => c.status === 'pending').length,
      dailyAnalytics
    });
  });

  // API ROUTING: Seller catalog & workflow
  app.get('/api/seller/:id/goods', (req, res) => {
    const sellerId = parseInt(req.params.id);
    res.json(db.goods.filter(g => g.seller_id === sellerId));
  });

  app.post('/api/goods', (req, res) => {
    const { name, description, category, price, quantity, image_url, seller_id } = req.body;
    if (!name || !price || !quantity) return res.status(400).json({ error: 'Required attributes: name, price, quantity.' });

    const newAdd = {
      id: db.goods.length > 0 ? Math.max(...db.goods.map(g => g.id)) + 1 : 1,
      name,
      description: description || '',
      category: category || 'General',
      price: parseFloat(price),
      quantity: parseInt(quantity),
      image_url: image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
      seller_id: parseInt(seller_id),
      created_at: new Date().toISOString()
    };
    db.goods.push(newAdd);
    logActivity(parseInt(seller_id), 'seller', `Added new product to catalog listing: ${name}`, req);
    res.json({ success: true, item: newAdd });
  });

  app.put('/api/goods/:id', (req, res) => {
    const g = db.goods.find(x => x.id === parseInt(req.params.id));
    if (g) {
      const { name, description, category, price, quantity, image_url } = req.body;
      g.name = name !== undefined ? name : g.name;
      g.description = description !== undefined ? description : g.description;
      g.category = category !== undefined ? category : g.category;
      g.price = price !== undefined ? parseFloat(price) : g.price;
      g.quantity = quantity !== undefined ? parseInt(quantity) : g.quantity;
      g.image_url = image_url !== undefined ? image_url : g.image_url;

      logActivity(g.seller_id, 'seller', `Updated goods catalog attributes: ${g.name}`, req);
      return res.json({ success: true, item: g });
    }
    return res.status(404).json({ error: 'Item not found in database.' });
  });

  app.delete('/api/goods/:id', (req, res) => {
    const idx = db.goods.findIndex(x => x.id === parseInt(req.params.id));
    if (idx !== -1) {
      const g = db.goods[idx];
      db.goods.splice(idx, 1);
      logActivity(g.seller_id, 'seller', `Withdrew product catalog: ${g.name}`, req);
      return res.json({ success: true });
    }
    return res.status(404).json({ error: 'Catalog item not found.' });
  });

  app.get('/api/seller/:id/orders', (req, res) => {
    const sellerId = parseInt(req.params.id);
    const sOrders = db.orders.filter(o => o.seller_id === sellerId);
    
    // Enrich details
    const result = sOrders.map(o => {
      const item = db.goods.find(g => g.id === o.goods_id);
      const buyer = db.receivers.find(r => r.id === o.receiver_id);
      const transportReq = db.vehicle_requests.find(vr => vr.order_id === o.id);
      return {
        ...o,
        goodsName: item?.name || 'Deleted Product Spec',
        receiverName: buyer?.full_name || 'Anonymous User',
        receiverPhone: buyer?.phone || '',
        transportStatus: transportReq?.status || 'none',
        assignedDriver: transportReq?.assigned_driver_id ? db.drivers.find(d => d.id === transportReq.assigned_driver_id) : null,
        assignedVehicle: transportReq?.assigned_vehicle_id ? db.vehicles.find(v => v.id === transportReq.assigned_vehicle_id) : null
      };
    });
    res.json(result);
  });

  app.post('/api/orders/:id/status', (req, res) => {
    const { status, sellerId } = req.body;
    const o = db.orders.find(x => x.id === parseInt(req.params.id));
    if (o) {
      o.order_status = status;
      logActivity(parseInt(sellerId), 'seller', `Modified Order Status for ORD-${o.id} to [${status}]`, req);
      return res.json({ success: true, order: o });
    }
    return res.status(404).json({ error: 'Order not found.' });
  });

  // Request transport for order items
  app.post('/api/transport/requests', (req, res) => {
    const { orderId, sellerId, transporterId, budget } = req.body;
    
    // Check existing
    const exists = db.vehicle_requests.find(x => x.order_id === parseInt(orderId));
    if (exists) return res.status(409).json({ error: 'Transportation service vehicle already dispatched/requested for this order ID.' });

    const newReq = {
      id: db.vehicle_requests.length + 1,
      order_id: parseInt(orderId),
      seller_id: parseInt(sellerId),
      transporter_id: parseInt(transporterId),
      budget: parseFloat(budget || 500),
      status: 'pending',
      assigned_driver_id: null,
      assigned_vehicle_id: null,
      created_at: new Date().toISOString()
    };
    db.vehicle_requests.push(newReq);

    // Update order status
    const o = db.orders.find(x => x.id === parseInt(orderId));
    if (o) o.order_status = 'vehicle-requested';

    logActivity(parseInt(sellerId), 'seller', `Requested fleet payload dispatch from agency ID: ${transporterId}`, req);
    res.json({ success: true, request: newReq });
  });

  app.post('/api/orders/:id/pay-transport', (req, res) => {
    const orderId = parseInt(req.params.id);
    const { sellerId, budget } = req.body;

    const vr = db.vehicle_requests.find(x => x.order_id === orderId);
    if (!vr) return res.status(404).json({ error: 'Transport request not found.' });

    vr.status = 'paid';
    
    // Add payment entry
    db.payments.push({
      id: db.payments.length + 1,
      order_id: orderId,
      amount: parseFloat(budget || 500),
      payment_type: 'transport_service_payment',
      payment_method: 'Seller Wallet Checkout',
      status: 'completed',
      payment_date: new Date().toISOString()
    });

    logActivity(parseInt(sellerId), 'seller', `Settled transportation carrier invoice for Order ORD-${orderId}, Sum: ${budget}`, req);
    res.json({ success: true, request: vr });
  });

  // API ROUTING: Transporter operations
  app.get('/api/transporter/:id/vehicles', (req, res) => {
    const tid = parseInt(req.params.id);
    res.json(db.vehicles.filter(v => v.transporter_id === tid));
  });

  app.post('/api/vehicles', (req, res) => {
    const { transporter_id, vehicle_no, vehicle_type, capacity } = req.body;
    if (!vehicle_no || !vehicle_type || !capacity) {
      return res.status(400).json({ error: 'Fields vehicle_no, vehicle_type, and capacity are mandatory.' });
    }

    const exists = db.vehicles.some(x => x.vehicle_no.toLowerCase() === vehicle_no.toLowerCase());
    if (exists) return res.status(409).json({ error: 'Vehicle license number plates registered elsewhere.' });

    const newV = {
      id: db.vehicles.length + 1,
      transporter_id: parseInt(transporter_id),
      vehicle_no,
      vehicle_type,
      capacity,
      status: 'available'
    };
    db.vehicles.push(newV);
    logActivity(parseInt(transporter_id), 'transporter', `Added heavy vehicle to depot fleet: ${vehicle_no} (${vehicle_type})`, req);
    res.json({ success: true, vehicle: newV });
  });

  app.delete('/api/vehicles/:id', (req, res) => {
    const idx = db.vehicles.findIndex(x => x.id === parseInt(req.params.id));
    if (idx !== -1) {
      const v = db.vehicles[idx];
      db.vehicles.splice(idx, 1);
      logActivity(v.transporter_id, 'transporter', `Withdrew vehicle fleet from database: ${v.vehicle_no}`, req);
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Vehicle profile not found.' });
  });

  app.get('/api/transporter/:id/drivers', (req, res) => {
    const tid = parseInt(req.params.id);
    res.json(db.drivers.filter(d => d.transporter_id === tid));
  });

  app.post('/api/drivers', (req, res) => {
    const { transporter_id, username, email, password, full_name, phone, license_no } = req.body;
    if (!username || !password || !license_no) {
      return res.status(400).json({ error: 'Required: username, password, driver full name and driving license number.' });
    }

    const newD = {
      id: db.drivers.length + 1,
      username,
      email: email || `${username}@carrier.com`,
      password_hash: password,
      full_name: full_name || 'Assigned Driver',
      phone: phone || '111-999-222',
      license_no,
      transporter_id: parseInt(transporter_id),
      status: 'available',
      current_lat: 12.971598,
      current_lng: 77.594562
    };
    db.drivers.push(newD);
    logActivity(parseInt(transporter_id), 'transporter', `Recruited carrier driver profile: ${full_name}`, req);
    res.json({ success: true, driver: newD });
  });

  app.delete('/api/drivers/:id', (req, res) => {
    const idx = db.drivers.findIndex(x => x.id === parseInt(req.params.id));
    if (idx !== -1) {
      const d = db.drivers[idx];
      db.drivers.splice(idx, 1);
      logActivity(d.transporter_id, 'transporter', `Discharged driver terminal clearance: ${d.full_name}`, req);
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'Driver profile matches no query.' });
  });

  app.get('/api/transporter/:id/requests', (req, res) => {
    const tid = parseInt(req.params.id);
    const vReqs = db.vehicle_requests.filter(vr => vr.transporter_id === tid);
    
    const result = vReqs.map(vr => {
      const order = db.orders.find(o => o.id === vr.order_id);
      const buyer = order ? db.receivers.find(r => r.id === order.receiver_id) : null;
      const seller = db.sellers.find(s => s.id === vr.seller_id);
      const goodsObj = order ? db.goods.find(g => g.id === order.goods_id) : null;

      return {
        ...vr,
        orderDate: order?.order_date,
        goodsName: goodsObj?.name || 'Assorted Cargo',
        quantity: order?.quantity || 1,
        totalWeight: goodsObj ? `${order!.quantity * 4} kg` : 'N/A',
        sellerCompanyName: seller?.company_name || 'Partner Seller',
        destinationAddress: order?.shipping_address || 'Registered Warehouse',
        receiverName: buyer?.full_name || 'Pending Handover'
      };
    });
    res.json(result);
  });

  // Assign driver and vehicle to dispatch transportation
  app.post('/api/transport/requests/:id/assign', (req, res) => {
    const reqId = parseInt(req.params.id);
    const { driverId, vehicleId, transporterId } = req.body;

    const vr = db.vehicle_requests.find(x => x.id === reqId);
    if (!vr) return res.status(404).json({ error: 'Transportation vehicle request record not found.' });

    const driver = db.drivers.find(x => x.id === parseInt(driverId));
    const vehicle = db.vehicles.find(x => x.id === parseInt(vehicleId));

    if (!driver || !vehicle) return res.status(400).json({ error: 'Assigned Driver or Vehicle assets do not match databases.' });

    vr.assigned_driver_id = driver.id;
    vr.assigned_vehicle_id = vehicle.id;
    vr.status = 'approved';

    driver.status = 'busy';
    vehicle.status = 'busy';

    // Upgrade Order index
    const o = db.orders.find(x => x.id === vr.order_id);
    if (o) o.order_status = 'assigned';

    // Create tracking nodes
    const exists = db.tracking.find(x => x.order_id === vr.order_id);
    if (!exists) {
      db.tracking.push({
        id: db.tracking.length + 1,
        order_id: vr.order_id,
        driver_id: driver.id,
        current_lat: 12.971598,
        current_lng: 77.594562,
        route_status: 'Payload catalog received. Route mapped out by Transporter.',
        last_updated: new Date().toISOString()
      });
    }

    const isDeliveryDetailsExist = db.delivery_details.some(x => x.order_id === vr.order_id);
    if (!isDeliveryDetailsExist) {
       db.delivery_details.push({
          id: db.delivery_details.length + 1,
          order_id: vr.order_id,
          driver_id: driver.id,
          vehicle_id: vehicle.id,
          expected_delivery: new Date(Date.now() + 3600000 * 6).toISOString(),
          actual_delivery: null,
          status: 'assigned',
          notes: 'Standard transport cargo routes assigned.'
       });
    }

    logActivity(parseInt(transporterId), 'transporter', `Dispatched Payload shipment with Driver: ${driver.full_name}, Vehicle ${vehicle.vehicle_no}`, req);
    res.json({ success: true, request: vr });
  });

  // API ROUTING: Driver workspace
  app.get('/api/driver/:id/deliveries', (req, res) => {
    const driverId = parseInt(req.params.id);
    const deliveries = db.delivery_details.filter(dd => dd.driver_id === driverId);

    const result = deliveries.map(d => {
      const order = db.orders.find(o => o.id === d.order_id);
      const item = order ? db.goods.find(g => g.id === order.goods_id) : null;
      const buyer = order ? db.receivers.find(r => r.id === order.receiver_id) : null;
      const vehicleObj = db.vehicles.find(v => v.id === d.vehicle_id);

      return {
        ...d,
        orderId: d.order_id,
        goodsName: item?.name || 'Cargo Package',
        quantity: order?.quantity || 1,
        totalPrice: order?.total_price || 0,
        shippingAddress: order?.shipping_address || 'Warehouse loading ramp',
        receiverName: buyer?.full_name || 'Buyer',
        receiverPhone: buyer?.phone || '',
        vehicleNo: vehicleObj?.vehicle_no || 'KA-03-HA-8842',
        vehicleType: vehicleObj?.vehicle_type || 'Medium Van'
      };
    });
    res.json(result);
  });

  // Driver GPS Update Simulated Link
  app.post('/api/driver/gps', (req, res) => {
    const { driverId, orderId, lat, lng, route_status } = req.body;
    
    const driver = db.drivers.find(x => x.id === parseInt(driverId));
    if (driver) {
      driver.current_lat = parseFloat(lat);
      driver.current_lng = parseFloat(lng);
    }

    const t = db.tracking.find(x => x.order_id === parseInt(orderId));
    if (t) {
      t.current_lat = parseFloat(lat);
      t.current_lng = parseFloat(lng);
      t.route_status = route_status || 'In Transit';
      t.last_updated = new Date().toISOString();
    } else {
      db.tracking.push({
        id: db.tracking.length + 1,
        order_id: parseInt(orderId),
        driver_id: parseInt(driverId),
        current_lat: parseFloat(lat),
        current_lng: parseFloat(lng),
        route_status: route_status || 'In Transit',
        last_updated: new Date().toISOString()
      });
    }

    res.json({ success: true, tracking: t });
  });

  app.post('/api/driver/delivery/:orderId/status', (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const { status, remarks, driverId } = req.body;

    const dd = db.delivery_details.find(x => x.order_id === orderId);
    if (dd) {
      dd.status = status; // picked-up, in-transit, delivered
      if (remarks) dd.notes = remarks;
      if (status === 'delivered') {
        dd.actual_delivery = new Date().toISOString();
      }
    }

    const o = db.orders.find(x => x.id === orderId);
    if (o) {
      if (status === 'picked-up') {
        o.order_status = 'shipping';
      } else if (status === 'delivered') {
        o.order_status = 'completed';
        // Free driver & vehicle
        const driver = db.drivers.find(d => d.id === parseInt(driverId));
        if (driver) driver.status = 'available';

        if (dd) {
          const vehicle = db.vehicles.find(v => v.id === dd.vehicle_id);
          if (vehicle) vehicle.status = 'available';
        }
      }
    }

    logActivity(parseInt(driverId), 'driver', `Updated Delivery Status for Order ORD-${orderId} to: ${status}`, req);
    res.json({ success: true });
  });

  app.post('/api/driver/sos', (req, res) => {
    const { orderId, driverId, message } = req.body;
    
    // Auto-create a System Complaint as SOS log
    db.complaints.push({
      id: db.complaints.length + 1,
      order_id: parseInt(orderId),
      sender_id: parseInt(driverId),
      sender_role: 'driver',
      subject: '🛑 SOS CRITICAL EMERGENCY SIGNAL',
      description: message || 'Driver triggered SOS alert. Vehicle broken down or accident reported. Action required.',
      status: 'pending',
      resolution: null,
      created_at: new Date().toISOString()
    });

    logActivity(parseInt(driverId), 'driver', `TRIGGERED CRITICAL SOS GPS BEACON: ${message}`, req);
    res.json({ success: true });
  });

  // API ROUTING: Receiver Marketplace, placement, tracking
  app.get('/api/receiver/marketplace', (req, res) => {
    // Return approved goods catalog
    res.json(db.goods.map(g => {
      const seller = db.sellers.find(s => s.id === g.seller_id);
      return {
        ...g,
        sellerCompanyName: seller?.company_name || 'Apex Manufacturing Ltd'
      };
    }));
  });

  app.get('/api/receiver/:id/orders', (req, res) => {
    const receiverId = parseInt(req.params.id);
    const rOrders = db.orders.filter(o => o.receiver_id === receiverId);

    const result = rOrders.map(o => {
      const g = db.goods.find(item => item.id === o.goods_id);
      const sellerObj = db.sellers.find(s => s.id === o.seller_id);
      const trackingNode = db.tracking.find(t => t.order_id === o.id);

      return {
        ...o,
        goodsName: g?.name || 'Deleted Product Catalog',
        category: g?.category || 'Utility',
        imageUrl: g?.image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=400',
        sellerCompanyName: sellerObj?.company_name || 'Direct Wholesale Shippers',
        tracking: trackingNode || null
      };
    });
    res.json(result);
  });

  app.post('/api/orders', (req, res) => {
    const { receiver_id, goods_id, quantity, shipping_address } = req.body;
    const goodsObj = db.goods.find(x => x.id === parseInt(goods_id));

    if (!goodsObj) return res.status(404).json({ error: 'Selected items do not exist.' });
    if (goodsObj.quantity < parseInt(quantity)) {
      return res.status(400).json({ error: 'Available stock count exceeded.' });
    }

    // Deduct quantity
    goodsObj.quantity -= parseInt(quantity);

    const total = goodsObj.price * parseInt(quantity);
    const newOrd = {
      id: db.orders.length > 0 ? Math.max(...db.orders.map(o => o.id)) + 1 : 101,
      goods_id: parseInt(goods_id),
      seller_id: goodsObj.seller_id,
      receiver_id: parseInt(receiver_id),
      quantity: parseInt(quantity),
      total_price: total,
      order_status: 'ordered',
      shipping_address: shipping_address || 'Buyer main gate address 1',
      order_date: new Date().toISOString()
    };
    db.orders.push(newOrd);

    // Capture payment node immediately
    db.payments.push({
      id: db.payments.length + 1,
      order_id: newOrd.id,
      amount: total,
      payment_type: 'goods_payment',
      payment_method: 'Online UPI/Credit Card Payment',
      status: 'completed',
      payment_date: new Date().toISOString()
    });

    logActivity(parseInt(receiver_id), 'receiver', `Successfully checked out order ORD-${newOrd.id}. Total: ₹${total}`, req);
    res.json({ success: true, order: newOrd });
  });

  // Complaint log submitting
  app.post('/api/complaints', (req, res) => {
    const { orderId, senderId, senderRole, subject, description } = req.body;
    if (!orderId || !subject || !description) {
      return res.status(400).json({ error: 'Please submit a subject and description details.' });
    }

    const newComp = {
      id: db.complaints.length + 1,
      order_id: parseInt(orderId),
      sender_id: parseInt(senderId),
      sender_role: senderRole || 'receiver',
      subject,
      description,
      status: 'pending',
      resolution: null,
      created_at: new Date().toISOString()
    };
    db.complaints.push(newComp);
    logActivity(parseInt(senderId), senderRole, `Lodged dispute claim or alert on Order ORD-${orderId}: ${subject}`, req);
    res.json({ success: true, complaint: newComp });
  });

  app.get('/api/transporter/:id/complaints', (req, res) => {
    // Return all complaints linked to system or deliveries
    res.json(db.complaints);
  });

  app.post('/api/complaints/:id/resolve', (req, res) => {
    const comp = db.complaints.find(x => x.id === parseInt(req.params.id));
    if (comp) {
      const { resolution, userId, userRole } = req.body;
      comp.status = 'resolved';
      comp.resolution = resolution || 'Closed by central operator.';
      
      logActivity(parseInt(userId || 1), userRole || 'admin', `Resolved system/driver complaint ID-${comp.id}`, req);
      return res.json({ success: true, complaint: comp });
    }
    res.status(404).json({ error: 'Complaint log not found' });
  });

  // DRIVER PERFORMANCE STATISTICS API ENDPOINT
  app.get('/api/transporter/:id/driver-performance', (req, res) => {
    const tid = parseInt(req.params.id);
    const transporterDrivers = db.drivers.filter(d => d.transporter_id === tid);
    
    const performance = transporterDrivers.map(d => {
      // Real-time completed deliveries
      const realCompleted = db.delivery_details.filter(dd => dd.driver_id === d.id && dd.status === 'delivered').length;
      
      const baselineCompletedMap: Record<number, number> = {
        1: 24, // Rajesh Kumar
        2: 18  // Amit Singh
      };
      const totalCompleted = (baselineCompletedMap[d.id] || 0) + realCompleted;

      // Real status updates & tracking logs
      const driverLogs = db.activity_logs.filter(l => l.user_role === 'driver' && l.user_id === d.id);
      
      const baselineResponseMap: Record<number, number> = {
        1: 7.5,
        2: 11.2
      };
      
      let avgResponseTime = baselineResponseMap[d.id] || 9.5;
      if (driverLogs.length > 0) {
        avgResponseTime = Math.max(4.2, avgResponseTime - (driverLogs.length * 0.15));
      }

      const satisfactionRate = d.id === 1 ? 98 : 94;

      return {
        driverId: d.id,
        fullName: d.full_name,
        phone: d.phone,
        status: d.status,
        completedDeliveries: totalCompleted,
        avgResponseMinutes: parseFloat(avgResponseTime.toFixed(1)),
        satisfactionRate,
        onTimeRate: d.id === 1 ? 96.8 : 91.5
      };
    });

    res.json({
      transporterId: tid,
      summary: {
        totalFleetDrivers: transporterDrivers.length,
        totalCompletedDeliveries: performance.reduce((sum, p) => sum + p.completedDeliveries, 0),
        averageFleetResponseTime: parseFloat((performance.reduce((sum, p) => sum + p.avgResponseMinutes, 0) / (performance.length || 1)).toFixed(1)),
        averageSatisfactionRate: parseFloat((performance.reduce((sum, p) => sum + p.satisfactionRate, 0) / (performance.length || 1)).toFixed(1))
      },
      drivers: performance
    });
  });

  // EXPORT PIPELINE: Download items for academic presentation
  app.get('/api/student/exports', (req, res) => {
    res.json({
      sqlSchema: SQL_SCHEMA,
      djangoModels: DJANGO_MODELS,
      djangoViews: DJANGO_VIEWS,
      djangoUrls: DJANGO_URLS,
      djangoForms: DJANGO_FORMS,
      installationGuide: INSTALLATION_GUIDE
    });
  });

  // Integrations flow
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Smart Goods Transportation backend active on port ${port}`);
  });
}

startServer().catch(err => {
  console.error("Critical boot failure for backend:", err);
});
