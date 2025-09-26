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
  const [user, setUser] = useState(null); // Authentication state
  const [historyItems, setHistoryItems] = useState([]); // Download history
  const [selectedPatient, setSelectedPatient] = useState(null); // Selected patient for viewing

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedPatient(null); // Clear selected patient on logout
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  const handleBackToDoctor = () => {
    setSelectedPatient(null);
  };

  const addToHistory = (item) => {
    const historyItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      user: selectedPatient ? `${user?.name} (for patient: ${selectedPatient.name})` : user?.name || 'Unknown User',
      patient: selectedPatient ? selectedPatient.name : null,
      ...item
    };
    setHistoryItems(prev => [historyItem, ...prev]);
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
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>  
                <Route path="/login" element={
                  user ? <Navigate to="/" replace /> : <Auth onLogin={handleLogin} />
                } />
                <Route path="/" element={<CodeSearch user={user} selectedPatient={selectedPatient} onAddToHistory={addToHistory} />} />
                <Route path="/search" element={<CodeSearch user={user} selectedPatient={selectedPatient} onAddToHistory={addToHistory} />} />
                <Route path="/history" element={
                  user ? (
                    <History 
                      historyItems={historyItems} 
                      onDownloadAgain={handleDownloadAgain} 
                      onClearHistory={clearHistory} 
                    />
                  ) : <Navigate to="/login" replace />
                } />
                <Route path="/fhir" element={
                  user ? <FHIRSection onAddToHistory={addToHistory} user={user} /> : <Navigate to="/login" replace />
                } />
                <Route path="/upload" element={
                  user ? <CSVUpload /> : <Navigate to="/login" replace />
                } />
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
