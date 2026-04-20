// TravelKit - Smart Travel Planner
import React, { Suspense } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { TripProvider } from "@/context/TripContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const Login = React.lazy(() => import("@/pages/Login"));
const Register = React.lazy(() => import("@/pages/Register"));
const Dashboard = React.lazy(() => import("@/pages/Dashboard"));
const TripNew = React.lazy(() => import("@/pages/TripNew"));
const TripDetail = React.lazy(() => import("@/pages/TripDetail"));
const TripEdit = React.lazy(() => import("@/pages/TripEdit"));
const NotFound = React.lazy(() => import("@/pages/not-found"));

function App() {
  return (
    <TooltipProvider>
      <HashRouter>
        <AuthProvider>
          <TripProvider>
            <Suspense fallback={<div className="h-screen w-full flex items-center justify-center">Loading...</div>}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/trips/new" element={<ProtectedRoute><TripNew /></ProtectedRoute>} />
                <Route path="/trips/:id" element={<ProtectedRoute><TripDetail /></ProtectedRoute>} />
                <Route path="/trips/:id/edit" element={<ProtectedRoute><TripEdit /></ProtectedRoute>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </TripProvider>
        </AuthProvider>
      </HashRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
