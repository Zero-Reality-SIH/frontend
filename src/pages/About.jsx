import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CodeSearch from "./pages/CodeSearch";
import FHIRSection from "./pages/FHIRSection";
import CSVUpload from "./pages/CSVUpload";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [systemStatus, setSystemStatus] = useState({
    namaste: 'online',
    icd11: 'online',
    fhir: 'online',
    lastSync: new Date()
  });

  // System health monitoring
  useEffect(() => {
    const checkSystemHealth = () => {
      setSystemStatus(prev => ({
        ...prev,
        lastSync: new Date()
      }));
    };

    const interval = setInterval(checkSystemHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // Track login analytics
    console.log('User logged in:', userData.email);
  };

  const handleSignUp = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    if (user) {
      console.log('User logged out:', user.email);
    }
    setUser(null);
  };

  if (!user) {
    return (
      <Router>
        <Routes>
          <Route path="/signup" element={<SignUp onSignUp={handleSignUp} />} />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          systemStatus={systemStatus}
        />
        <div className="flex-1 flex flex-col min-h-0">
          <Navbar user={user} onLogout={handleLogout} systemStatus={systemStatus} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<CodeSearch user={user} />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/fhir" element={<FHIRSection user={user} />} />
                <Route path="/upload" element={<CSVUpload user={user} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;