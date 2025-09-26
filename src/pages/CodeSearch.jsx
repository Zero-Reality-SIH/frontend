import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "../components/SearchBar";
import ResultsTable from "../components/ResultsTable";
import jsPDF from 'jspdf';
import { 
  FiCode, FiDownload, FiCheckCircle, FiCopy, FiMap, FiLayers, FiCpu, FiZap, FiTrendingUp, FiUsers, FiDatabase, FiShield, FiArrowRight, FiFileText
} from 'react-icons/fi';

// ---------------- Mock Data ----------------
const mockCodes = [
  {
    id: "1",
    namaste: "A01",
    namasteTerm: "Shita Jvara",
    tm2: "TM2-001",
    tm2Term: "Cold Syndrome",
    biomed: "ICD-11-1A00",
    biomedTerm: "Common cold",
    version: "v2.1",
    consent: "consent-given",
    confidence: 95,
    lastUpdated: "2024-01-15",
    usageCount: 1247
  },
  {
    id: "2",
    namaste: "B02",
    namasteTerm: "Prameha",
    tm2: "TM2-002",
    tm2Term: "Diabetes Mellitus",
    biomed: "ICD-11-5A11",
    biomedTerm: "Type 2 diabetes mellitus",
    version: "v2.1",
    consent: "consent-given",
    confidence: 98,
    lastUpdated: "2024-01-10",
    usageCount: 2893
  },
  // ... rest of mockCodes
];

// ---------------- Stats & Features ----------------
const stats = [
  { icon: FiDatabase, value: "1000+", label: "Codes Mapped", color: "text-blue-600" },
  { icon: FiUsers, value: "3+", label: "Healthcare Providers", color: "text-green-600" },
  { icon: FiTrendingUp, value: "62.3%", label: "Accuracy Rate", color: "text-purple-600" },
  { icon: FiShield, value: "100%", label: "FHIR Compliant", color: "text-indigo-600" }
];

const features = [
  { icon: FiLayers, title: "Multi-Standard Mapping", description: "Seamlessly bridge NAMASTE, TM2, and ICD-11 standards" },
  { icon: FiZap, title: "Real-Time Validation", description: "Instant verification against latest medical standards" },
  { icon: FiMap, title: "Visual Mapping", description: "Interactive visualization of code relationships" }
];

// ---------------- Component ----------------
export default function CodeSearch({ user, selectedPatient, onAddToHistory }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
  const [fhirOutput, setFhirOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or visual
  const searchRef = useRef(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 0) {
      try {
        // Use the same autocomplete API but with higher limit for full search results
        const response = await fetch(`http://localhost:3001/autocomplete?q=${encodeURIComponent(value)}&limit=50`);
        const data = await response.json();
        
        if (data.success && data.suggestions) {
          // Transform API response to match expected table format
          const transformedResults = data.suggestions.map((item, index) => ({
            id: item.id || `result-${index}`,
            namaste: item.code || '',
            namasteTerm: item.term || '',
            tm2: item.code || '', // You can map this differently if you have TM2 data
            tm2Term: item.englishName || item.term || '',
            biomed: item.code || '', // You can map this differently if you have ICD-11 data
            biomedTerm: item.englishName || '',
            version: "v2.1",
            consent: "consent-given",
            confidence: 95,
            lastUpdated: new Date().toISOString().split('T')[0],
            usageCount: Math.floor(Math.random() * 1000) + 100
          }));
          
          // Remove duplicates based on id and term
          const uniqueResults = transformedResults.filter((item, index, self) => 
            index === self.findIndex(t => t.id === item.id && t.namasteTerm === item.namasteTerm)
          );
          
          setResults(uniqueResults);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      }
    } else {
      setResults([]);
    }
    setSelected([]);
    setFhirOutput("");
  };

  const toggleSelect = (code) => {
    if (selected.find(c => c.id === code.id)) {
      setSelected(selected.filter((c) => c.id !== code.id));
    } else {
      setSelected([...selected, code]);
    }
  };

  const handleGenerateFHIR = () => {
    if (!selected.length) return;

    const patientReference = selectedPatient ? {
      reference: `Patient/${selectedPatient.id}`,
      display: `${selectedPatient.name} (Age: ${selectedPatient.age})`
    } : {
      reference: "Patient/example",
      display: "Example Patient"
    };

    const fhirJSON = {
      resourceType: "Bundle",
      type: "transaction",
      timestamp: new Date().toISOString(),
      entry: [
        // Add Patient resource if a specific patient is selected
        ...(selectedPatient ? [{
          resource: {
            resourceType: "Patient",
            id: selectedPatient.id.toString(),
            name: [{
              family: selectedPatient.name.split(' ').slice(-1)[0],
              given: selectedPatient.name.split(' ').slice(0, -1)
            }],
            birthDate: new Date(new Date().getFullYear() - selectedPatient.age, 0, 1).toISOString().split('T')[0],
            telecom: [
              {
                system: "phone",
                value: selectedPatient.phone,
                use: "mobile"
              },
              {
                system: "email",
                value: selectedPatient.email,
                use: "home"
              }
            ],
            meta: {
              lastUpdated: selectedPatient.lastVisit + 'T00:00:00Z',
              source: "BridgeHealth Patient Management"
            }
          },
          request: { method: "POST", url: "Patient" }
        }] : []),
        // Add Condition resources
        ...selected.map((code) => ({
          resource: {
            resourceType: "Condition",
            clinicalStatus: {
              coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active", display: "Active" }]
            },
            code: {
              coding: [
                { system: "urn:oid:1.2.3.4.5", code: code.namaste, display: code.namasteTerm },
                { system: "http://id.who.int/icd/release/11/2024-01", code: code.tm2, display: code.tm2Term },
                { system: "http://id.who.int/icd/release/11/2024-01", code: code.biomed, display: code.biomedTerm }
              ],
              text: code.namasteTerm
            },
            subject: patientReference,
            recordedDate: new Date().toISOString(),
            meta: { versionId: code.version, lastUpdated: code.lastUpdated }
          },
          request: { method: "POST", url: "Condition" }
        }))
      ]
    };

    setFhirOutput(JSON.stringify(fhirJSON, null, 2));
  };

  const handleDownload = () => {
    const blob = new Blob([fhirOutput], { type: "application/json" });
    const patientSuffix = selectedPatient ? `_${selectedPatient.name.replace(/\s+/g, '_')}` : '';
    const filename = `BridgeHealth_FHIR${patientSuffix}_${Date.now()}.json`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    // Add to history if user is logged in and onAddToHistory is available
    if (user && onAddToHistory) {
      const fhirData = JSON.parse(fhirOutput);
      onAddToHistory({
        filename: filename,
        selectedCodes: selected,
        fhirData: fhirData,
        fileSize: `${Math.round(blob.size / 1024)} KB`,
        searchQuery: query || 'Multiple codes',
        patient: selectedPatient ? selectedPatient.name : null
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fhirOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!selected.length) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFillColor(26, 188, 156); // Teal color
    doc.rect(0, 0, pageWidth, 30, 'F');
    
    // Logo/Title area
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text('Conversion Report', 15, 12);
    doc.setFontSize(8);
    doc.text('NAMC + FHIR Integration', 15, 20);
    
    // MED badge
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - 35, 8, 25, 14, 2, 2, 'F');
    doc.setTextColor(26, 188, 156);
    doc.setFontSize(10);
    doc.text('MED', pageWidth - 27, 18);
    
    // Main title
    doc.setTextColor(26, 188, 156);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CONVERSION REPORT (Namaste -> ICD-11(TM2))', pageWidth/2, 50, { align: 'center' });
    
    // Report Information section
    let yPos = 70;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text('Report Information', 15, yPos);
    
    yPos += 10;
    doc.setFontSize(9);
    const reportId = `diag_${Math.floor(Math.random() * 10000)}`;
    const currentDate = new Date();
    const dateStr = currentDate.toLocaleDateString('en-GB');
    const timeStr = currentDate.toLocaleTimeString('en-GB', { hour12: false });
    
    doc.text(`Report ID: ${reportId}`, 15, yPos);
    doc.text('Status: FHIR Uploaded [OK]', 120, yPos);
    yPos += 8;
    doc.text(`Generated: ${dateStr} at ${timeStr}`, 15, yPos);
    doc.text(`Date: ${dateStr} at ${timeStr}`, 120, yPos);
    
    // Patient Information section
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(26, 188, 156);
    doc.text('Patient Information', 15, yPos);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    
    if (selectedPatient) {
      doc.text(`Name: ${selectedPatient.name}`, 15, yPos);
      doc.text(`Patient ID: pat${selectedPatient.id}`, 120, yPos);
      yPos += 8;
      doc.text(`Date of Birth: ${new Date(new Date().getFullYear() - selectedPatient.age, 0, 1).toLocaleDateString('en-GB')}`, 15, yPos);
      doc.text(`Phone: +${selectedPatient.phone.replace(/\D/g, '')}`, 120, yPos);
      yPos += 8;
      doc.text(`Gender: N/A`, 15, yPos);
      doc.text(`Email: ${selectedPatient.email}`, 120, yPos);
    } else {
      doc.text('Name: Patient Example', 15, yPos);
      doc.text('Patient ID: pat001', 120, yPos);
      yPos += 8;
      doc.text('Date of Birth: 01/01/1980', 15, yPos);
      doc.text('Phone: +1234567890', 120, yPos);
      yPos += 8;
      doc.text('Gender: N/A', 15, yPos);
      doc.text('Email: patient@example.com', 120, yPos);
    }
    
    // Attending Physician section
    yPos += 20;
    doc.setFontSize(12);
    doc.setTextColor(26, 188, 156);
    doc.text('Attending Physician', 15, yPos);
    
    yPos += 10;
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Name: ${user?.name || 'Dr. System User'}`, 15, yPos);
    doc.text('Doctor ID: doc001', 120, yPos);
    yPos += 8;
    doc.text(`Specialty: ${user?.specialty || 'General Medicine'}`, 15, yPos);
    doc.text('License: MD12345', 120, yPos);
    
    // Clinical Assessment section
    yPos += 20;
    doc.setFillColor(255, 240, 240);
    doc.rect(15, yPos - 5, pageWidth - 30, 20, 'F');
    doc.setFontSize(12);
    doc.setTextColor(220, 20, 60);
    doc.text('Clinical Assessment', 15, yPos + 5);
    
    yPos += 15;
    doc.setFontSize(9);
    doc.setTextColor(220, 20, 60);
    const conditionsText = selected.map(code => `(${code.namaste}) ${code.namasteTerm}? (${code.tm2}) ${code.tm2Term}?`).join(' ');
    const lines = doc.splitTextToSize(conditionsText, pageWidth - 30);
    doc.text(lines, 15, yPos);
    
    // Medical Codes section
    yPos += lines.length * 5 + 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Medical Codes (${selected.length})`, 15, yPos);
    
    // Table headers
    yPos += 15;
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPos - 8, pageWidth - 30, 12, 'F');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text('Medical Term', 20, yPos);
    doc.text('NAMC Code', 80, yPos);
    doc.text('ID', 120, yPos);
    doc.text('Description', 140, yPos);
    
    // Table content
    yPos += 5;
    selected.forEach((code, index) => {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 30;
      }
      
      yPos += 12;
      doc.setFontSize(8);
      doc.text(code.namasteTerm.substring(0, 25), 20, yPos);
      doc.text(code.namaste, 80, yPos);
      doc.text(code.biomed.substring(0, 15), 120, yPos);
      doc.text(code.biomedTerm.substring(0, 25), 140, yPos);
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Medical Diagnosis System', 15, pageHeight - 15);
    doc.text('Page 1 of 1', pageWidth - 30, pageHeight - 15);
    
    // Save the PDF
    const patientSuffix = selectedPatient ? `_${selectedPatient.name.replace(/\s+/g, '_')}` : '';
    const filename = `Medical_Diagnosis_Report${patientSuffix}_${dateStr.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
    
    // Add to history if user is logged in and onAddToHistory is available
    if (user && onAddToHistory) {
      onAddToHistory({
        filename: filename,
        selectedCodes: selected,
        fileSize: 'PDF Report',
        searchQuery: query || 'Multiple codes',
        patient: selectedPatient ? selectedPatient.name : null,
        type: 'PDF Report'
      });
    }
  };

  const quickSearches = ["Prameha", "Kasa", "Jvara", "Amlapitta", "Pandu", "Shwasa"];
  const visualMappingData = selected.length > 0 ? selected : results.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Patient Context Banner */}
      {selectedPatient && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-b border-blue-200 p-4"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    Working on: {selectedPatient.name}'s Medical Records
                  </h3>
                  <p className="text-blue-700 text-sm">
                    Age: {selectedPatient.age} • Phone: {selectedPatient.phone} • Email: {selectedPatient.email}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">
                  Last Visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-500">
                  Patient since: {new Date(selectedPatient.dateAdded).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 w-full">
        <div className="w-full px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-12"
          >
            <motion.h1 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              transition={{ duration: 0.6 }} 
              className="text-5xl font-bold text-gray-900 mb-6"
            >
              Connecting Tradition 
              <span className="text-blue-600"> with Standards</span>
            </motion.h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Seamlessly bridge traditional medicine with modern medical standards. 
              Map NAMASTE, TM2, and ICD-11 codes healthcare interoperability.
            </p>
            
            {/* CTA Buttons */}
            
          </motion.div>
          
          {/* Quick Search Demo */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.3 }} 
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Try Quick Search
              </h3>
              <SearchBar query={query} onChange={handleSearch} inputRef={searchRef} hasResults={results.length > 0} />
              
              {/* Quick Search Pills */}
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {quickSearches.map((term, i) => (
                  <motion.button
                    key={term}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSearch({ target: { value: term } })}
                    className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full transition-all hover:bg-blue-100 text-sm font-medium"
                  >
                    {term}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

        {/* Results / Visual Mapping */}
        <AnimatePresence>
          {query.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.3 }}
            >
              {viewMode === "grid" ? (
                <ResultsTable results={results} selected={selected} toggleSelect={toggleSelect} loggedIn={!!user} />
              ) : (
                <div className="professional-card rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visual Code Mapping</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {visualMappingData.map((code, index) => (
                      <motion.div 
                        key={code.id} 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        transition={{ duration: 0.3, delay: index*0.1 }} 
                        className="professional-card p-4 text-center"
                      >
                        <div className="mb-3">
                          <div className="font-semibold text-gray-900 text-sm mb-1">{code.namasteTerm}</div>
                          <div className="text-xs text-blue-600">NAMASTE: {code.namaste}</div>
                        </div>
                        <div className="flex items-center justify-center my-3">
                          <FiArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm mb-1">{code.biomedTerm}</div>
                          <div className="text-xs text-green-600">ICD-11: {code.biomed}</div>
                        </div>
                        <div className="mt-3">
                          <div className="inline-flex items-center space-x-1 bg-green-50 text-green-700 text-xs px-2 py-1 rounded-md">
                            <FiTrendingUp className="w-3 h-3" />
                            <span>{code.confidence}% Confidence</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate FHIR and PDF Download */}
        {selected.length > 0 && user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="flex justify-center mt-6"
          >
            <div className="flex space-x-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="btn-primary flex items-center space-x-2 px-6 py-3 rounded-lg font-medium"
                onClick={handleGenerateFHIR}
              >
                <FiCode className="w-5 h-5" />
                <span>
                  Generate FHIR Bundle ({selected.length})
                  {selectedPatient && ` for ${selectedPatient.name}`}
                </span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                className="btn-secondary flex items-center space-x-2 px-6 py-3 rounded-lg font-medium border border-blue-600 text-blue-600 hover:bg-blue-50"
                onClick={handleDownloadPDF}
              >
                <FiFileText className="w-5 h-5" />
                <span>
                  Download PDF Report ({selected.length})
                  {selectedPatient && ` for ${selectedPatient.name}`}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Login Required Message */}
        {selected.length > 0 && !user && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex justify-center mt-6"
          >
            <div className="professional-card p-4 text-center">
              <p className="text-gray-600 mb-3">
                Please sign in to generate FHIR bundles and download results
              </p>
              <button 
                onClick={() => window.location.href = '/login'}
                className="btn-primary px-6 py-2 rounded-lg font-medium"
              >
                Sign In to Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* FHIR Output */}
        <AnimatePresence>
          {fhirOutput && user && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.4 }} className="mt-8">
              <div className="professional-card p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">FHIR Bundle Output</h3>
                  <div className="flex space-x-2">
                    <button onClick={handleCopy} className="btn-secondary flex items-center space-x-1 px-3 py-2 text-sm rounded-md">
                      {copied ? <FiCheckCircle className="text-green-600" /> : <FiCopy className="w-4 h-4" />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button onClick={handleDownload} className="btn-secondary flex items-center space-x-1 px-3 py-2 text-sm rounded-md">
                      <FiDownload className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <pre className="text-xs text-gray-700 overflow-x-auto max-h-96 bg-gray-50 rounded-md p-4 border">{fhirOutput}</pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose BridgeHealth?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced medical terminology mapping with enterprise-grade reliability
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="professional-card p-6 text-center"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
