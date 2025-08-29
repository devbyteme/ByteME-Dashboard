import React from 'react';

const ProjectContext = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', lineHeight: '1.6' }}>
      <h1>ByteMe Platform</h1>

      <h2>Project Overview</h2>
      <p>This application is a comprehensive QR code-based dining solution designed for restaurants, cafes, and other hospitality venues. It allows customers to view the menu, place orders, and pay directly from their table by scanning a QR code. For restaurant staff, it provides a powerful admin dashboard to manage menus, track orders in real-time, generate QR codes, and view analytics.</p>
      <p>The platform is designed to be multi-tenant, meaning a single customer profile can be used across multiple venues that adopt this system, creating a seamless experience for users.</p>

      <hr style={{ margin: '20px 0' }} />

      <h2>Key Features</h2>
      <h3>Restaurant Management (Admin View)</h3>
      <ul>
        <li><strong>Dashboard</strong>: An at-a-glance overview of the restaurant's performance, including today's revenue, total orders, average order value, and pending orders.</li>
        <li><strong>Menu Management</strong>: Admins can create, edit, and delete menu items. They can set prices, descriptions, categories, images, dietary information (e.g., vegan, gluten-free), and preparation times. They can also toggle an item's availability on the fly.</li>
        <li><strong>Order Management</strong>: A real-time view of all incoming orders, categorized by status (Pending, Confirmed, Preparing, Ready, Served, Cancelled). Staff can update the status of an order as it moves through the kitchen.</li>
        <li><strong>QR Code Generator</strong>: A simple interface to create and manage tables. For each table, a unique QR code is generated that links directly to the customer ordering menu. Admins can download individual QR codes or a printable PDF of all codes.</li>
        <li><strong>Analytics</strong>: A dashboard providing insights into sales trends, with charts for daily revenue, most popular items, and order volume over time.</li>
      </ul>

      <h3>Customer Experience (Customer View)</h3>
      <ul>
        <li><strong>QR Code Scanning</strong>: Customers scan a QR code at their table to instantly access the digital menu.</li>
        <li><strong>Seamless Authentication</strong>: Customers are prompted to log in or register, creating a profile that can be used across any venue on the platform.</li>
        <li><strong>Interactive Menu</strong>: A mobile-optimized menu where customers can browse items by category.</li>
        <li><strong>Shopping Cart</strong>: A floating cart allows customers to add items, adjust quantities, and see their running total.</li>
        <li><strong>Checkout Process</strong>: Customers can add special dietary requirements, leave a tip, and choose a payment method before placing their order. Their contact information is pre-filled from their profile.</li>
        <li><strong>Customer Profile</strong>: A dedicated page for customers to view their complete order history (across all venues), see their total spending, and access special offers and "perks" sent by restaurants.</li>
      </ul>

      <hr style={{ margin: '20px 0' }} />

      <h2>Data Models (Entities)</h2>
      <p>The application is built around a set of core data models:</p>
      <ul>
        <li><strong><code>User</code></strong>: The standard user entity for authentication (both staff and customers).</li>
        <li><strong><code>MenuItem</code></strong>: Stores all information related to a single menu item, including its name, price, category, and availability.</li>
        <li><strong><code>Table</code></strong>: Represents a physical table in the restaurant, containing its number, capacity, and the associated QR code URL.</li>
        <li><strong><code>Order</code></strong>: A detailed record of a customer's transaction, including the items ordered, table number, customer details, total amount, tip, and order status.</li>
        <li><strong><code>CustomerProfile</code></strong>: Linked to a <code>User</code> ID, this stores customer-specific data like loyalty points, total spend, and preferences.</li>
        <li><strong><code>Perk</code></strong>: Represents special offers, discounts, or rewards that can be assigned to customers.</li>
      </ul>

      <hr style={{ margin: '20px 0' }} />

      <h2>Page Structure</h2>
      <p>The application is divided into two main sections: the admin-facing management pages and the customer-facing ordering pages.</p>
      <h3>Admin Pages:</h3>
      <ul>
        <li><code>Dashboard</code></li>
        <li><code>MenuManagement</code></li>
        <li><code>Orders</code></li>
        <li><code>QRGenerator</code></li>
        <li><code>Analytics</code></li>
      </ul>

      <h3>Customer Pages:</h3>
      <ul>
        <li><code>CustomerOrder</code></li>
        <li><code>CustomerProfile</code></li>
      </ul>
    </div>
  );
};

export default ProjectContext;