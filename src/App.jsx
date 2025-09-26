import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CodeSearch from "./pages/CodeSearch";
import FHIRSection from "./pages/FHIRSection";
import CSVUpload from "./pages/CSVUpload";
import Auth from "./pages/Auth";
import History from "./pages/History";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(() => {
    // Check localStorage for persisted user session
    const savedUser = localStorage.getItem('bridgehealth_user');
    return savedUser ? JSON.parse(savedUser) : null;
  }); // Authentication state
  const [historyItems, setHistoryItems] = useState(() => {
    // Check localStorage for persisted history
    const savedHistory = localStorage.getItem('bridgehealth_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  }); // Download history
  const [selectedPatient, setSelectedPatient] = useState(() => {
    // Check localStorage for persisted patient selection
    const savedPatient = localStorage.getItem('bridgehealth_selected_patient');
    return savedPatient ? JSON.parse(savedPatient) : null;
  }); // Selected patient for viewing

  const handleLogin = (userData) => {
    setUser(userData);
    // Persist user session in localStorage
    localStorage.setItem('bridgehealth_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPatient(null); // Clear selected patient on logout
    // Clear persisted data
    localStorage.removeItem('bridgehealth_user');
    localStorage.removeItem('bridgehealth_selected_patient');
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    // Persist selected patient in localStorage
    localStorage.setItem('bridgehealth_selected_patient', JSON.stringify(patient));
  };

  const handleBackToDoctor = () => {
    setSelectedPatient(null);
    // Clear persisted patient selection
    localStorage.removeItem('bridgehealth_selected_patient');
  };

  const addToHistory = (item) => {
    const historyItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      user: selectedPatient ? `${user?.name} (for patient: ${selectedPatient.name})` : user?.name || 'Unknown User',
      patient: selectedPatient ? selectedPatient.name : null,
      ...item
    };
    const newHistory = [historyItem, ...historyItems];
    setHistoryItems(newHistory);
    // Persist history in localStorage
    localStorage.setItem('bridgehealth_history', JSON.stringify(newHistory));
  };

  const handleDownloadAgain = (item) => {
    // Re-download the FHIR data
    if (item.fhirData) {
      const blob = new Blob([JSON.stringify(item.fhirData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = item.filename || `BridgeHealth_FHIR_${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearHistory = () => {
    setHistoryItems([]);
    // Clear persisted history
    localStorage.removeItem('bridgehealth_history');
  };

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        <div className="flex-1 flex flex-col min-h-0">
          <Navbar 
            user={user} 
            onLogout={handleLogout} 
            selectedPatient={selectedPatient}
            onPatientSelect={handlePatientSelect}
            onBackToDoctor={handleBackToDoctor}
          />
          <main className="flex-1 overflow-auto">
            <Routes>  
              <Route path="/login" element={
                user ? <Navigate to="/" replace /> : <Auth onLogin={handleLogin} />
              } />
              <Route path="/" element={<CodeSearch user={user} selectedPatient={selectedPatient} onAddToHistory={addToHistory} />} />
              <Route path="/search" element={<CodeSearch user={user} selectedPatient={selectedPatient} onAddToHistory={addToHistory} />} />
              <Route path="/history" element={
                user ? (
                  <div className="max-w-7xl mx-auto p-6">
                    <History 
                      historyItems={historyItems} 
                      onDownloadAgain={handleDownloadAgain} 
                      onClearHistory={clearHistory} 
                    />
                  </div>
                ) : <Navigate to="/login" replace />
              } />
              <Route path="/fhir" element={
                user ? (
                  <div className="max-w-7xl mx-auto p-6">
                    <FHIRSection onAddToHistory={addToHistory} user={user} />
                  </div>
                ) : <Navigate to="/login" replace />
              } />
              <Route path="/upload" element={
                user ? (
                  <div className="max-w-7xl mx-auto p-6">
                    <CSVUpload />
                  </div>
                ) : <Navigate to="/login" replace />
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
