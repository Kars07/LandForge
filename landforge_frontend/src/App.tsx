import '@mysten/dapp-kit/dist/index.css';
import { SuiClientProvider, WalletProvider, createNetworkConfig } from '@mysten/dapp-kit';

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { initMockData } from "@/lib/mock-data";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SelectRole from "./pages/auth/SelectRole";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import AppLayout from "./components/layout/AppLayout";
import LandlordDashboard from "./pages/landlord/Dashboard";
import LandlordListings from "./pages/landlord/Listings";
import NewListing from "./pages/landlord/NewListing";
import LandlordListingDetail from "./pages/landlord/ListingDetail";
import LandlordInquiries from "./pages/landlord/Inquiries";
import LandlordOffers from "./pages/landlord/Offers";
import LandlordTransactions from "./pages/landlord/Transactions";
import LandlordProfile from "./pages/landlord/Profile";
import BuyerDashboard from "./pages/buyer/Dashboard";
import BuyerProperties from "./pages/buyer/Properties";
import BuyerPropertyDetail from "./pages/buyer/PropertyDetail";
import BuyerSaved from "./pages/buyer/Saved";
import BuyerOffers from "./pages/buyer/Offers";
import BuyerTransactions from "./pages/buyer/Transactions";
import BuyerProfile from "./pages/buyer/Profile";

initMockData();

const queryClient = new QueryClient();

const { networkConfig } = createNetworkConfig({
  testnet: { url: "https://fullnode.testnet.sui.io:443" } as any,
  mainnet: { url: "https://fullnode.mainnet.sui.io:443" } as any,
  devnet: { url: "https://fullnode.devnet.sui.io:443" } as any,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider autoConnect={false}>
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth/select-role" element={<SelectRole />} />
                <Route path="/auth/signup" element={<Signup />} />
                <Route path="/auth/login" element={<Login />} />
                
                <Route element={<AppLayout />}>
                  <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
                  <Route path="/landlord/listings" element={<LandlordListings />} />
                  <Route path="/landlord/listings/new" element={<NewListing />} />
                  <Route path="/landlord/listings/:id" element={<LandlordListingDetail />} />
                  <Route path="/landlord/inquiries" element={<LandlordInquiries />} />
                  <Route path="/landlord/offers" element={<LandlordOffers />} />
                  <Route path="/landlord/transactions" element={<LandlordTransactions />} />
                  <Route path="/landlord/profile" element={<LandlordProfile />} />

                  <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
                  <Route path="/buyer/properties" element={<BuyerProperties />} />
                  <Route path="/buyer/properties/:id" element={<BuyerPropertyDetail />} />
                  <Route path="/buyer/saved" element={<BuyerSaved />} />
                  <Route path="/buyer/offers" element={<BuyerOffers />} />
                  <Route path="/buyer/transactions" element={<BuyerTransactions />} />
                  <Route path="/buyer/profile" element={<BuyerProfile />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </WalletProvider>
    </SuiClientProvider>
  </QueryClientProvider>
);

export default App;
