import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";

import Index from "./pages/Index";
import AddTransaction from "./pages/AddTransaction";
import Wallets from "./pages/Wallets"; // This is your Savings list page
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";
import SavingDetails from './pages/SavingDetails';
import HistoryTransactions from "./pages/HistoryTransaction";
import AnalyticsHistory from "./pages/AnalyticsHistory";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/add" element={<AddTransaction />} />
            <Route path="/wallets" element={<Wallets />} /> {/* List of savings */}
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/savings/:id" element={<SavingDetails />} />
            <Route path="/history" element={<HistoryTransactions />} />
            <Route path="/analytics-history" element={<AnalyticsHistory />} />
            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
