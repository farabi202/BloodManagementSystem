import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import EmergencyModal from "@/components/EmergencyModal";
import { useState } from "react";

// Pages
import Home from "@/pages/Home";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/Dashboard";
import Search from "@/pages/Search";
import SimpleProfile from "@/pages/SimpleProfile";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function Router() {
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);

  return (
    <Layout onEmergencyClick={() => setEmergencyModalOpen(true)}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/register" component={Register} />
        <Route path="/login" component={Login} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/search" component={Search} />
        <Route path="/profile" component={SimpleProfile} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
      
      <EmergencyModal 
        open={emergencyModalOpen}
        onOpenChange={setEmergencyModalOpen}
      />
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
