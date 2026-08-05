import { Toaster } from "react-hot-toast";

/**
 * Toast Notification System
 * Global toast provider and helper functions
 */

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: "#ffffff",
          color: "#111827",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          borderRadius: "0.75rem",
          border: "1px solid #e5e7eb",
          padding: "1rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        },
        success: {
          style: {
            background: "#10b981",
            color: "#ffffff",
            border: "none",
          },
          duration: 3000,
        },
        error: {
          style: {
            background: "#ef4444",
            color: "#ffffff",
            border: "none",
          },
          duration: 4000,
        },
        loading: {
          style: {
            background: "#3b82f6",
            color: "#ffffff",
            border: "none",
          },
        },
      }}
    />
  );
}

export default ToastProvider;
