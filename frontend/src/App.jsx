import { Routes, Route, Navigate } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import { CrmProvider } from "./context/CrmContext";
import ToastProvider from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Customers from "./pages/Customers";
import Tasks from "./pages/Tasks";
import Pipeline from "./pages/Pipeline";
import Reports from "./pages/Reports";
import Services from "./pages/Services";
import Invoices from "./pages/Invoices";
import Settings from "./pages/Settings";
import Guide from "./pages/Guide";
import About from "./pages/About";
import { LanguageProvider } from "./context/LanguageContext";

function AppContent() {
  const { isAuthenticated } = useAuth();

  // אם לא התחברת, הצג רק את Login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // אם התחברת, הצג את היישום כרגיל
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <Sidebar />

        <main className="flex-1 w-full">
          <Header />

          <div className="p-3 md:p-6 pb-20 md:pb-6">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leads"
                element={
                  <ProtectedRoute>
                    <Leads />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/customers"
                element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute>
                    <Tasks />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pipeline"
                element={
                  <ProtectedRoute>
                    <Pipeline />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/services"
                element={
                  <ProtectedRoute>
                    <Services />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/invoices"
                element={
                  <ProtectedRoute>
                    <Invoices />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/guide"
                element={
                  <ProtectedRoute>
                    <Guide />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/about"
                element={
                  <ProtectedRoute>
                    <About />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CrmProvider>
          <ToastProvider />
          <AppContent />
        </CrmProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}