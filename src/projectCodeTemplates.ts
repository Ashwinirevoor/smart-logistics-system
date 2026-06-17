/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SQL_SCHEMA = `-- =========================================================================
-- SYSTEM DIAGRAM: SMART GOODS TRANSPORTATION AND DELIVERY MANAGEMENT SYSTEM
-- TARGET DATABASE: MySQL 8.0+
-- AUTHOR: Final Year Engineering Student
-- =========================================================================

CREATE DATABASE IF NOT EXISTS smart_transport_db;
USE smart_transport_db;

-- 1. ADMIN TABLE
CREATE TABLE IF NOT EXISTS Admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SELLER TABLE
CREATE TABLE IF NOT EXISTS Seller (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    company_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TRANSPORTER TABLE
CREATE TABLE IF NOT EXISTS Transporter (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    agency_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_no VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. DRIVER TABLE
CREATE TABLE IF NOT EXISTS Driver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    license_no VARCHAR(100) NOT NULL,
    transporter_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'offline'
    current_lat DECIMAL(10, 8) DEFAULT 12.971598, -- Default to Bangalore Coordinates
    current_lng DECIMAL(11, 8) DEFAULT 77.594562,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (transporter_id) REFERENCES Transporter(id) ON DELETE CASCADE
);

-- 5. RECEIVER TABLE
CREATE TABLE IF NOT EXISTS Receiver (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. GOODS TABLE
CREATE TABLE IF NOT EXISTS Goods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    image_url VARCHAR(255),
    seller_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES Seller(id) ON DELETE CASCADE
);

-- 7. ORDERS TABLE
CREATE TABLE IF NOT EXISTS Orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    goods_id INT NOT NULL,
    seller_id INT NOT NULL,
    receiver_id INT NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'ordered', 
    -- 'ordered', 'accepted', 'rejected', 'vehicle-requested', 'assigned', 'shipping', 'completed'
    shipping_address TEXT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (goods_id) REFERENCES Goods(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES Seller(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES Receiver(id) ON DELETE CASCADE
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS Payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(100) NOT NULL, -- 'goods_payment' or 'transport_service_payment'
    payment_method VARCHAR(100) DEFAULT 'Online UPI/Card',
    status VARCHAR(50) DEFAULT 'completed', -- 'pending', 'completed', 'failed'
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
);

-- 9. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS Vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transporter_id INT NOT NULL,
    vehicle_no VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL, -- 'Mini Truck', 'Heavy Trailer', 'Container, 'Cargo Van'
    capacity VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'busy', 'maintenance'
    FOREIGN KEY (transporter_id) REFERENCES Transporter(id) ON DELETE CASCADE
);

-- 10. VEHICLE REQUESTS TABLE
CREATE TABLE IF NOT EXISTS Vehicle_Requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    seller_id INT NOT NULL,
    transporter_id INT NOT NULL,
    budget DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid'
    assigned_driver_id INT,
    assigned_vehicle_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES Seller(id) ON DELETE CASCADE,
    FOREIGN KEY (transporter_id) REFERENCES Transporter(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_driver_id) REFERENCES Driver(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_vehicle_id) REFERENCES Vehicles(id) ON DELETE SET NULL
);

-- 11. DELIVERY DETAILS TABLE
CREATE TABLE IF NOT EXISTS Delivery_Details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    expected_delivery DATETIME,
    actual_delivery DATETIME,
    status VARCHAR(50) DEFAULT 'assigned', -- 'assigned', 'picked-up', 'in-transit', 'delivered'
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES Driver(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id) ON DELETE CASCADE
);

-- 12. TRACKING TABLE
CREATE TABLE IF NOT EXISTS Tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    current_lat DECIMAL(10, 8) NOT NULL,
    current_lng DECIMAL(11, 8) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    route_status TEXT,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES Driver(id) ON DELETE CASCADE
);

-- 13. COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS Complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_role VARCHAR(50) NOT NULL, -- 'receiver', 'driver', 'seller'
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved'
    resolution TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE
);

-- 14. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS Activity_Logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    user_role VARCHAR(50) NOT NULL, -- 'admin', 'seller', 'transporter', 'driver', 'receiver'
    action VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================================================
-- INITIAL MOCK DATA SEED FILES FOR DEVELOPMENT & TESTING
-- =========================================================================

-- Seed Admins
INSERT INTO Admin (username, email, password_hash, full_name, phone) VALUES
('sysadmin', 'admin@smarttrans.com', 'pbkdf2_sha256$260000$argon2hashplaceholder...', 'System Administrator', '+1-987-654-3210');

-- Seed Sellers
INSERT INTO Seller (username, email, password_hash, company_name, phone, address, status) VALUES
('apex_goods', 'sales@apex.com', 'pbkdf2_sha256$', 'Apex Manufacturing Ltd', '7700223344', 'Sector 4, Industrial Area, Bangalore', 'approved'),
('global_furnish', 'info@furnishings.com', 'pbkdf2_sha256$', 'Global Furnishings Inc', '9911223344', 'Outer Ring Rd, Marathahalli, Bangalore', 'pending');

-- Seed Transporters
INSERT INTO Transporter (username, email, password_hash, agency_name, phone, license_no, status) VALUES
('super_logistics', 'fleet@superlogistics.com', 'pbkdf2_sha256$', 'Super Fast Logistics Cargo', '8844556677', 'LIC-IND-9988-XY', 'approved'),
('eco_freight', 'dispatch@ecofreight.com', 'pbkdf2_sha256$', 'EcoFreight Shippers', '9988776655', 'LIC-IND-1122-AB', 'pending');

-- Seed Drivers
INSERT INTO Driver (username, email, password_hash, full_name, phone, license_no, transporter_id, status) VALUES
('driver_raj', 'raj@cargo.com', 'pbkdf2_sha256$', 'Rajesh Kumar', '8811223344', 'DL-BANG-2023-01', 1, 'available'),
('driver_amit', 'amit@cargo.com', 'pbkdf2_sha256$', 'Amit Singh', '9922001155', 'DL-BANG-2023-02', 1, 'available');

-- Seed Receivers
INSERT INTO Receiver (username, email, password_hash, full_name, phone, address, is_verified) VALUES
('receiver_john', 'buyer_john@gmail.com', 'pbkdf2_sha256$', 'John Doe', '9000111222', 'Block C, Electronic City Phase 1, Bangalore', TRUE),
('receiver_priya', 'priya_m@yahoo.com', 'pbkdf2_sha256$', 'Priya Sharma', '9111222333', 'Villa 45, Sterling Residency, Whitefield', TRUE);

-- Seed Goods
INSERT INTO Goods (name, description, category, price, quantity, image_url, seller_id) VALUES
('Industrial Drill Press', 'Heavy-duty vertical electronic steel drill press 750W', 'Machinery', 12450.00, 10, 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400', 1),
('Ergonomic Office Chair', 'Breathable mesh revolving premium computer chair', 'Furniture', 4500.00, 150, 'https://images.unsplash.com/photo-1505797149-43c0069ec26b?auto=format&fit=crop&q=80&w=400', 1);

-- Seed Vehicles
INSERT INTO Vehicles (transporter_id, vehicle_no, vehicle_type, capacity, status) VALUES
(1, 'KA-03-HA-8842', 'Container Truck', '10 Tons', 'available'),
(1, 'KA-51-MD-9915', 'Flatbed Trailer', '25 Tons', 'available');
`;

export const DJANGO_MODELS = `## Models.py (Django ORM Implementation using MySQL connection)
# Location: smart_transport_system/models.py
# File generated for: Final Year Engineering Submission

from django.db import models
from django.contrib.auth.models import AbstractUser

# Custom Authentication User Base
# In production, roles are handled elegantly via a single or divided profile system.

class Seller(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    company_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    address = models.TextField(blank=True, null=True)
    status_choices = [('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    status = models.CharField(max_length=50, choices=status_choices, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name

class Transporter(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    agency_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    license_no = models.CharField(max_length=100)
    status_choices = [('pending', 'Pending Approval'), ('approved', 'Approved'), ('rejected', 'Rejected')]
    status = models.CharField(max_length=50, choices=status_choices, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.agency_name

class Driver(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    license_no = models.CharField(max_length=100)
    transporter = models.ForeignKey(Transporter, on_delete=models.CASCADE, related_name='drivers')
    status = models.CharField(max_length=50, default='available') # available, busy, offline
    current_lat = models.DecimalField(max_digits=10, decimal_places=8, default=12.9715987)
    current_lng = models.DecimalField(max_digits=11, decimal_places=8, default=77.5945627)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

class Receiver(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=100, unique=True)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

class Goods(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    image_url = models.CharField(max_length=255, blank=True, null=True)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE, related_name='goods')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Orders(models.Model):
    id = models.AutoField(primary_key=True)
    goods = models.ForeignKey(Goods, on_delete=models.CASCADE)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
    receiver = models.ForeignKey(Receiver, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    order_status_choices = [
        ('ordered', 'Ordered'),
        ('accepted', 'Accepted by Seller'),
        ('rejected', 'Rejected by Seller'),
        ('paid', 'Order Paid'),
        ('assigned', 'Vehicle Assigned'),
        ('shipping', 'In Transit'),
        ('completed', 'Delivered & Completed'),
    ]
    order_status = models.CharField(max_length=50, choices=order_status_choices, default='ordered')
    shipping_address = models.TextField()
    order_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} for {self.goods.name}"

class Payments(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(max_length=100) # goods_payment, transport_payment
    status = models.CharField(max_length=50, default='completed') # pending, completed, failed
    payment_date = models.DateTimeField(auto_now_add=True)

class Vehicles(models.Model):
    id = models.AutoField(primary_key=True)
    transporter = models.ForeignKey(Transporter, on_delete=models.CASCADE)
    vehicle_no = models.CharField(max_length=50, unique=True)
    vehicle_type = models.CharField(max_length=100)
    capacity = models.CharField(max_length=100)
    status = models.CharField(max_length=50, default='available') # available, busy, maintenance

    def __str__(self):
        return f"{self.vehicle_type} - {self.vehicle_no}"

class VehicleRequests(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
    transporter = models.ForeignKey(Transporter, on_delete=models.CASCADE)
    budget = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='pending') # pending, accepted, rejected, paid
    assigned_driver = models.ForeignKey(Driver, on_delete=models.SET_NULL, null=True, blank=True)
    assigned_vehicle = models.ForeignKey(Vehicles, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class DeliveryDetails(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    vehicle = models.ForeignKey(Vehicles, on_delete=models.CASCADE)
    expected_delivery = models.DateTimeField(null=True, blank=True)
    actual_delivery = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, default='assigned') # assigned, picked-up, in-transit, delivered
    notes = models.TextField(null=True, blank=True)

class Tracking(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE)
    driver = models.ForeignKey(Driver, on_delete=models.CASCADE)
    current_lat = models.DecimalField(max_digits=10, decimal_places=8)
    current_lng = models.DecimalField(max_digits=11, decimal_places=8)
    last_updated = models.DateTimeField(auto_now=True)
    route_status = models.TextField(null=True, blank=True)

class Complaints(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Orders, on_delete=models.CASCADE)
    sender_id = models.IntegerField()
    sender_role = models.CharField(max_length=50) # driver, receiver, seller
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=50, default='pending') # pending, resolved
    resolution = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class ActivityLogs(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    user_role = models.CharField(max_length=50)
    action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
`;

export const DJANGO_VIEWS = `## Views.py (Django Controller & Endpoint Logic)
# Location: smart_transport_system/views.py

from django.shortcuts import render, get_object_or_400, redirect
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.db.models import Sum, Count, F
from django.contrib.auth.hashers import make_password, check_password
from .models import *
import json

# 1. ADMIN MODULE LOGIC
def admin_dashboard(request):
    """Fetch global statistics for the overview dashboard"""
    total_sales = Payments.objects.filter(payment_type='goods_payment').aggregate(Sum('amount'))['amount__sum'] or 0
    total_orders = Orders.objects.count()
    active_drivers = Driver.objects.filter(status='busy').count()
    pending_approvals = Seller.objects.filter(status='pending').count() + Transporter.objects.filter(status='pending').count()
    
    # Growth or distribution charts mock data
    category_analytics = Goods.objects.values('category').annotate(count=Count('id'))
    recent_logs = ActivityLogs.objects.order_by('-timestamp')[:10]
    
    context = {
        'total_sales': total_sales,
        'total_orders': total_orders,
        'active_drivers': active_drivers,
        'pending_approvals': pending_approvals,
        'recent_logs': recent_logs,
        'categories': list(category_analytics)
    }
    return render(request, 'admin/dashboard.html', context)

def verify_seller(request, seller_id, status):
    """Approve or Reject registered sellers"""
    seller = get_object_or_400(Seller, id=seller_id)
    seller.status = status
    seller.save()
    
    # Log Action
    ActivityLogs.objects.create(
        user_id=1, 
        user_role='admin', 
        action=f"Changed Seller '{seller.company_name}' status to '{status}'"
    )
    messages.success(request, f"Seller '{seller.company_name}' updated successfully.")
    return redirect('admin_sellers')


# 2. SELLER MODULE CONTROLLER
def add_goods(request):
    """Handle adding goods to Catalog (Seller scope)"""
    if request.method == "POST":
        name = request.POST.get('name')
        category = request.POST.get('category')
        price = request.POST.get('price')
        qty = request.POST.get('quantity')
        desc = request.POST.get('description')
        img_url = request.POST.get('image_url')
        
        # Get active seller from Session (Mocking ID 1)
        seller = get_object_or_400(Seller, id=1)
        
        goods = Goods.objects.create(
            name=name, category=category, price=price, 
            quantity=qty, description=desc, image_url=img_url, 
            seller=seller
        )
        
        # Audit Log
        ActivityLogs.objects.create(
            user_id=seller.id, user_role='seller',
            action=f"Added new goods catalog: {name}"
        )
        messages.success(request, f"Goods '{name}' has been added to listing.")
        return redirect('seller_goods')
        
    return render(request, 'seller/add_goods.html')


# 3. TRANSPORTER CONTROLLER
def transportation_requests(request):
    """Get vehicle requests, assign vehicles and drivers"""
    transporter = get_object_or_400(Transporter, id=1)
    requests = VehicleRequests.objects.filter(transporter=transporter)
    drivers = Driver.objects.filter(transporter=transporter, status='available')
    vehicles = Vehicles.objects.filter(transporter=transporter, status='available')
    
    if request.method == "POST":
        req_id = request.POST.get('request_id')
        driver_id = request.POST.get('driver_id')
        veh_id = request.POST.get('vehicle_id')
        
        vr = get_object_or_400(VehicleRequests, id=req_id)
        driver = get_object_or_400(Driver, id=driver_id)
        veh = get_object_or_400(Vehicles, id=veh_id)
        
        # Update Request Status
        vr.assigned_driver = driver
        vr.assigned_vehicle = veh
        vr.status = 'approved'
        vr.save()
        
        # Trigger Route assignment
        order = vr.order
        order.order_status = 'assigned'
        order.save()
        
        # Block vehicle & driver
        driver.status = 'busy'
        driver.save()
        veh.status = 'busy'
        veh.save()
        
        # Log delivery detail record
        DeliveryDetails.objects.create(
            order=order, driver=driver, vehicle=veh, status='assigned'
        )
        
        # Log tracking entry
        Tracking.objects.create(
            order=order, driver=driver, current_lat=12.971598, current_lng=77.594562, route_status="Awaiting dispatch"
        )
        
        messages.success(request, "Dispatched driver and vehicle successfully.")
        return redirect('transporter_dashboard')
        
    return render(request, 'transporter/requests.html', {
        'requests': requests, 'drivers': drivers, 'vehicles': vehicles
    })


# 4. DRIVER & REAL-TIME RE-ROUTE GPS
def update_gps_location(request):
    """API endpoint called via AJAX by Driver mobile web simulation to update tracking coordinates"""
    if request.method == "POST":
        data = json.loads(request.body)
        driver_id = data.get('driver_id')
        order_id = data.get('order_id')
        lat = data.get('lat')
        lng = data.get('lng')
        route_status = data.get('route_status', 'In Route')
        
        # Update Driver table
        driver = get_object_or_400(Driver, id=driver_id)
        driver.current_lat = lat
        driver.current_lng = lng
        driver.save()
        
        # Update Tracking node
        track_obj, created = Tracking.objects.get_or_create(
            order_id=order_id, driver_id=driver_id,
            defaults={'current_lat': lat, 'current_lng': lng, 'route_status': route_status}
        )
        if not created:
            track_obj.current_lat = lat
            track_obj.current_lng = lng
            track_obj.route_status = route_status
            track_obj.save()
            
        return JsonResponse({'status': 'success', 'lat': lat, 'lng': lng})
    return JsonResponse({'status': 'only_post_allowed'}, status=400)


# 5. RECEIVER PLACE ORDER & SIMULATED payment
def place_order(request):
    """Enable product purchase, billing updates and auto payments"""
    if request.method == "POST":
        receiver_id = request.POST.get('receiver_id')
        goods_id = request.POST.get('goods_id')
        qty = int(request.POST.get('quantity'))
        address = request.POST.get('shipping_address')
        
        goods = get_object_or_400(Goods, id=goods_id)
        receiver = get_object_or_400(Receiver, id=receiver_id)
        
        if goods.quantity < qty:
            messages.error(request, "Requested quantity exceeds available inventory.")
            return redirect('goods_detail', goods_id=goods_id)
            
        total = goods.price * qty
        goods.quantity -= qty
        goods.save()
        
        order = Orders.objects.create(
            goods=goods, seller=goods.seller, receiver=receiver,
            quantity=qty, total_price=total, shipping_address=address,
            order_status='ordered'
        )
        
        # Log successful checkout payment immediately
        Payments.objects.create(
            order=order, amount=total, payment_type='goods_payment', status='completed'
        )
        
        ActivityLogs.objects.create(
            user_id=receiver.id, user_role='receiver',
            action=f"Placed Order #{order.id} for product '{goods.name}'"
        )
        
        messages.success(request, f"Order #{order.id} placed and paid successfully!")
        return redirect('receiver_orders')
`;

export const DJANGO_URLS = `## Urls.py (System Routing Configuration)
# Location: smart_transport_system/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # General Routing
    path('', views.home, name='home'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/register/', views.register_user, name='register'),
    path('auth/logout/', views.logout_user, name='logout'),
    
    # 1. ADMIN MODULE
    path('admin/dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('admin/sellers/', views.manage_sellers, name='admin_sellers'),
    path('admin/sellers/<int:seller_id>/<str:status>/', views.verify_seller, name='verify_seller'),
    path('admin/transporters/', views.manage_transporters, name='admin_transporters'),
    path('admin/receivers/', views.manage_receivers, name='admin_receivers'),
    path('admin/logs/', views.view_logs, name='activity_logs'),
    
    # 2. SELLER MODULE
    path('seller/dashboard/', views.seller_dashboard, name='seller_dashboard'),
    path('seller/goods/add/', views.add_goods, name='add_goods'),
    path('seller/goods/edit/<int:goods_id>/', views.edit_goods, name='edit_goods'),
    path('seller/goods/delete/<int:goods_id>/', views.delete_goods, name='delete_goods'),
    path('seller/orders/', views.seller_orders, name='seller_orders'),
    path('seller/orders/<int:order_id>/request-transport/', views.request_transport, name='request_transport'),
    
    # 3. TRANSPORTER MODULE
    path('transporter/dashboard/', views.transporter_dashboard, name='transporter_dashboard'),
    path('transporter/vehicles/add/', views.add_vehicle, name='add_vehicle'),
    path('transporter/drivers/add/', views.add_driver, name='add_driver'),
    path('transporter/requests/', views.transportation_requests, name='transportation_requests'),
    path('transporter/complaints/', views.view_complaints, name='transporter_complaints'),
    
    # 4. DRIVER MODULE
    path('driver/dashboard/', views.driver_dashboard, name='driver_dashboard'),
    path('driver/delivery/<int:delivery_id>/status/', views.update_delivery_status, name='update_delivery_status'),
    path('driver/api/gps/', views.update_gps_location, name='api_gps'),
    
    # 5. RECEIVER MODULE
    path('receiver/marketplace/', views.receiver_marketplace, name='marketplace'),
    path('receiver/order/place/', views.place_order, name='place_order'),
    path('receiver/order/history/', views.receiver_orders, name='receiver_orders'),
    path('receiver/order/<int:order_id>/track/', views.track_order_live, name='track_order'),
    path('receiver/complaint/add/', views.submit_complaint, name='add_complaint'),
]
`;

export const DJANGO_FORMS = `## Forms.py (Django Dynamic Forms Validations)
# Location: smart_transport_system/forms.py

from django import forms
from .models import Seller, Transporter, Driver, Goods, Complaints

class SellerRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class': 'form-control'}))
    
    class Meta:
        model = Seller
        fields = ['username', 'email', 'company_name', 'phone', 'address']
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Enter seller handle'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'company_name': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'address': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class GoodsForm(forms.ModelForm):
    class Meta:
        model = Goods
        fields = ['name', 'description', 'category', 'price', 'quantity', 'image_url']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'category': forms.Select(choices=[
                ('Electronics', 'Electronics'),
                ('Furniture', 'Furniture'),
                ('Machinery', 'Machinery'),
                ('Raw Materials', 'Raw Materials'),
                ('Retail Goods', 'Retail Goods'),
            ], attrs={'class': 'form-control'}),
            'price': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control', 'min':'1'}),
            'image_url': forms.URLInput(attrs={'class': 'form-control', 'placeholder': 'Optional Unsplash Web Link'}),
        }

class ComplaintForm(forms.ModelForm):
    class Meta:
        model = Complaints
        fields = ['subject', 'description']
        widgets = {
            'subject': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Short summary...'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Elaborate the problem experienced...'}),
        }
`;

export const INSTALLATION_GUIDE = `# 🚛 INSTALLATION AND SETUP GUIDE
## Smart Goods Transportation and Delivery Management System

Follow these steps to deploy and run the system locally on your development system using Python, Django, and a MySQL relational database.

### 📋 Prerequisites
Ensure your local machine has the following files and frameworks pre-installed:
1. **Python** (version 3.10 or above)
2. **MySQL Server** (version 8.0 or above)
3. **pip** (Python package installer)
4. Standard internet browser and code editor (e.g. VS Code, PyCharm)

---

### ⚙️ Step-by-Step Deployment Instruction

#### SECTION 1: DATABASE SETUP
1. Boot your local MySQL Command Line interface, MySQL Workbench, or phpMyAdmin portal.
2. Fire the SQL Script provided in our **MySQL Schema** to create the target database schema structure:
   \`\`\`sql
   CREATE DATABASE IF NOT EXISTS smart_transport_db;
   \`\`\`
3. Import or execute the complete database tables and mock insert schema script.

#### SECTION 2: PYTHON VIRTUAL ENVIRONMENT & LIBRARIES SETUP
1. Deep navigate into the directory containing the project:
   \`\`\`bash
   cd smart_goods_transport_management
   \`\`\`
2. Spawn a local sandboxed virtual environment:
   \`\`\`bash
   # Windows
   python -m venv venv
   venv\\Scripts\\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   \`\`\`
3. Install the recommended backend dependencies including the MySQL client compiler library:
   \`\`\`bash
   pip install django mysqlclient gunicorn
   \`\`\`

#### SECTION 3: DJANGO APPLICATION PARAMETER CONFIGURATION
Inside the django settings file (\`smart_transport_system/settings.py\`), link the database connection structure to use your own local MySQL server credentials:
\`\`\`python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'smart_transport_db',
        'USER': 'root',                # Update with your MySQL local username
        'PASSWORD': 'your_mysql_password',  # Update with your MySQL local password
        'HOST': '127.0.0.1',           # Localhost bind
        'PORT': '3306',                # Standard default MySQL post port
    }
}
\`\`\`

#### SECTION 4: MIGRATIONS AND DEPLOYMENT BOOTUP
Apply the model migration mappings into your MySQL instance, generate the Django schema, and start the development server:
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
\`\`\`

Open your favorite browser and query **\`http://127.0.0.1:8000/\`** to inspect the live portal.
`;
