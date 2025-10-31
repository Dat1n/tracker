import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import useVhFix from "./hooks/useVhFix";

import Index from "./pages/Index";
import AddTransaction from "./pages/AddTransaction";
import Wallets from "./pages/Wallets";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import SavingDetails from "./pages/SavingDetails";
import HistoryTransactions from "./pages/HistoryTransaction";
import AnalyticsHistory from "./pages/AnalyticsHistory";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import ProtectedLayout from "./pages/ProtectedLayout";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isLoggedIn = !!localStorage.getItem("loggedInUser");
  return isLoggedIn ? (
    <ProtectedLayout>{children}</ProtectedLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

const App = () => {
  useVhFix(); // dynamically fix viewport height for iOS

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AddTransaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallets"
                element={
                  <ProtectedRoute>
                    <Wallets />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/savings/:id"
                element={
                  <ProtectedRoute>
                    <SavingDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <HistoryTransactions />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics-history"
                element={
                  <ProtectedRoute>
                    <AnalyticsHistory />
                  </ProtectedRoute>
                }
              />

              {/* 404 fallback */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
