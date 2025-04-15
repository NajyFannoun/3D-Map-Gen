/**
 * Project: 3D Map Generator
 * Description: A web app for creating and exporting 3D maps with customizable objects and a payment system.
 * Author: Najy Fannoun
 * Developed By: Najy Fannoun
 * Version: 1.0.0
 * Date: April 2025
 * Copyright: © 2025 Najy Fannoun. All rights reserved.
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/login/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ExportPage from "./pages/ExportPage";
import RoadEditor from "./pages/roadrunner/RoadEditor";
import ProtectedRoute from '../src/components/ProtectedRoute';  // Import ProtectedRoute

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        
        {/* Use ProtectedRoute for protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/road-editor" element={
          <ProtectedRoute>
            <RoadEditor />
          </ProtectedRoute>
        } />
        
        <Route path="/export" element={
          <ProtectedRoute>
            <ExportPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
