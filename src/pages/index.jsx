import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Layout";
import Welcome from "./Welcome";
import VendorLogin from "./VendorLogin";
import VendorRegistration from "./VendorRegistration";
import VendorForgotPassword from "./VendorForgotPassword";
import VendorResetPassword from "./VendorResetPassword";
import CustomerForgotPassword from "./CustomerForgotPassword";
import CustomerResetPassword from "./CustomerResetPassword";
import Dashboard from "./Dashboard";
import MenuManagement from "./MenuManagement";
import Orders from "./Orders";
import QRGenerator from "./QRGenerator";
import Analytics from "./Analytics";
import UserRegistration from "./UserRegistration";
import UserLogin from "./UserLogin";
import QRScanner from "./QRScanner";
import CustomerMenu from "./CustomerMenu";
import CustomerAuthPage from "./CustomerAuthPage";
import CustomerLoginSelection from "./CustomerLoginSelection";
import CustomerOrder from "./CustomerOrder";
import CartCheckoutScreen from "./CartCheckoutScreen";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PagesContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/welcome" replace />} />
      <Route path="/welcome" element={<Layout currentPageName="Welcome"><Welcome /></Layout>} />
      <Route path="/vendor-login" element={<Layout currentPageName="VendorLogin"><VendorLogin /></Layout>} />
      <Route path="/vendor-registration" element={<Layout currentPageName="VendorRegistration"><VendorRegistration /></Layout>} />
      <Route path="/vendor-forgot-password" element={<VendorForgotPassword />} />
      <Route path="/vendor-reset-password" element={<VendorResetPassword />} />
      <Route path="/customer-forgot-password" element={<CustomerForgotPassword />} />
      <Route path="/customer-reset-password" element={<CustomerResetPassword />} />
      <Route path="/user-registration" element={<Layout currentPageName="UserRegistration"><UserRegistration /></Layout>} />
      <Route path="/user-login" element={<Layout currentPageName="UserLogin"><UserLogin /></Layout>} />
      <Route path="/qr-scanner" element={<Layout currentPageName="QRScanner"><QRScanner /></Layout>} />
      <Route path="/customer-login-selection" element={<CustomerLoginSelection />} />
      <Route path="/customer-menu" element={<CustomerMenu />} />
      <Route path="/customer-auth" element={<CustomerAuthPage />} />
      <Route path="/cart-checkout" element={<CartCheckoutScreen />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requireVendor={true}>
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/menu-management" element={
        <ProtectedRoute requireVendor={true}>
          <Layout currentPageName="MenuManagement">
            <MenuManagement />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute requireVendor={true}>
          <Layout currentPageName="Orders">
            <Orders />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/qr-generator" element={
        <ProtectedRoute requireVendor={true}>
          <Layout currentPageName="QRGenerator">
            <QRGenerator />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute requireVendor={true}>
          <Layout currentPageName="Analytics">
            <Analytics />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/welcome" replace />} />
    </Routes>
  );
}