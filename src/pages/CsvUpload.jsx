import React, { useState } from "react";
import Papa from "papaparse";
import { FiUpload, FiDownload, FiFileText, FiCheck, FiAlertCircle } from 'react-icons/fi';

const CSVUpload = () => {
  const [data, setData] = useState([]);
  const [fhirJson, setFhirJson] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle CSV upload
  const handleFileUpload = (file) => {
    if (!file) return;
    
    setUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        generateFHIR(results.data);
        setUploading(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        setUploading(false);
      }
    });
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Convert CSV rows to FHIR CodeSystem + ProblemListEntry
  const generateFHIR = (rows) => {
    if (!rows || rows.length === 0) return;

    const codeSystem = {
      resourceType: "CodeSystem",
      id: "namaste-uploaded-codes",
      url: "http://namaste-ayush.in/fhir/CodeSystem/uploaded-codes",
      version: "1.0.0",
      name: "NAMASTEUploadedCodes",
      title: "NAMASTE Uploaded Medical Codes",
      status: "active",
      experimental: false,
      date: new Date().toISOString(),
      publisher: "NAMASTE System",
      description: "Medical codes uploaded via CSV containing NAMASTE terminology",
      content: "complete",
      count: rows.length,
      concept: rows.map((row, index) => ({
        code: row.Code || `code-${index + 1}`,
        display: row.Term || `Term ${index + 1}`,
        definition: row.Definition || undefined,
      })),
    };

    const problemList = rows.map((row, index) => ({
      resourceType: "Condition",
      id: `condition-${index + 1}`,
      meta: {
        versionId: "1",
        lastUpdated: new Date().toISOString(),
        source: "#csv-upload"
      },
      clinicalStatus: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
          display: "Active"
        }]
      },
      code: {
        coding: [
          {
            system: "http://namaste-ayush.in/fhir/CodeSystem/uploaded-codes",
            code: row.Code,
            display: row.Term,
          },
        ],
        text: row.Term
      },
      subject: { 
        reference: "Patient/example",
        display: "Patient Example"
      },
      recordedDate: new Date().toISOString(),
      extension: [
        {
          url: "http://namaste-ayush.in/fhir/extension/consent",
          valueCode: "granted"
        }
      ]
    }));

    const fhirBundle = {
      resourceType: "Bundle",
      id: "namaste-csv-upload-bundle",
      meta: {
        lastUpdated: new Date().toISOString(),
        source: "NAMASTE CSV Upload Tool"
      },
      type: "collection",
      timestamp: new Date().toISOString(),
      total: rows.length + 1,
      entry: [
        { 
          fullUrl: "http://namaste-ayush.in/fhir/CodeSystem/uploaded-codes",
          resource: codeSystem 
        },
        ...problemList.map((p, index) => ({ 
          fullUrl: `http://namaste-ayush.in/fhir/Condition/condition-${index + 1}`,
          resource: p 
        })),
      ],
    };

    setFhirJson(fhirBundle);
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(fhirJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fhir_bundle_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setData([]);
    setFhirJson(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CSV Upload & FHIR Conversion
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload CSV files containing medical codes and automatically convert them to FHIR-compliant 
          Bundle resources with CodeSystem and Condition entries.
        </p>
      </div>

      {/* Upload Area */}
      {data.length === 0 ? (
        <div className="professional-card p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <FiUpload className="w-full h-full" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {dragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              Drag and drop your CSV file here, or click to browse
            </p>
            
            <label className="btn-primary inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-medium cursor-pointer">
              <FiFileText className="w-5 h-5" />
              <span>Choose File</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
                disabled={uploading}
              />
            </label>
            
            {uploading && (
              <div className="mt-4 flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Processing CSV...</span>
              </div>
            )}
          </div>
          
          {/* Sample Format */}
          <div className="mt-6 p-4 bg-background-900 border border-background-600 rounded-lg">
            <h4 className="font-medium text-text-100 mb-2">Expected CSV Format:</h4>
            <div className="text-sm text-text-400">
              <p className="mb-2">Your CSV should contain the following columns:</p>
              <code className="bg-background-800 px-2 py-1 rounded text-xs text-secondary-300">Code, Term, Definition (optional)</code>
              <div className="mt-2 text-xs">
                <strong className="text-text-300">Example:</strong><br/>
                <span className="text-text-500">Code,Term,Definition<br/>
                A01,Common Cold,Upper respiratory tract infection<br/>
                B02,Fever,Elevated body temperature</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6">
          {/* Success Message */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FiCheck className="w-5 h-5 text-accent-600" />
              <div>
                <h3 className="font-medium text-accent-800">Upload Successful!</h3>
                <p className="text-sm text-accent-600">
                  Processed {data.length} medical codes and generated FHIR Bundle
                </p>
              </div>
              <button
                onClick={resetUpload}
                className="ml-auto px-3 py-1 text-sm text-accent-600 hover:text-accent-800 border border-accent-300 rounded hover:bg-accent-100 transition-colors"
              >
                Upload New File
              </button>
            </div>
          </div>

          {/* Data Preview */}
          <div className="bg-background-800/80 backdrop-blur-sm rounded-xl shadow-elegant border border-background-600/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-background-600/50">
              <h3 className="text-lg font-semibold text-text-100">Uploaded Medical Codes</h3>
              <p className="text-sm text-text-400 mt-1">{data.length} codes processed</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-background-700 border-b border-background-600/50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-300">Code</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-text-300">Term</th>
                    {data[0]?.Definition && (
                      <th className="px-6 py-3 text-left text-sm font-semibold text-text-300">Definition</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-background-600/50">
                  {data.slice(0, 10).map((row, i) => (
                    <tr key={i} className="hover:bg-background-700/50">
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {row.Code}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-text-100">{row.Term}</td>
                      {data[0]?.Definition && (
                        <td className="px-6 py-3 text-sm text-text-400">{row.Definition || '-'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {data.length > 10 && (
              <div className="px-6 py-3 bg-background-700 text-center text-sm text-text-400">
                Showing first 10 of {data.length} codes
              </div>
            )}
          </div>

          {/* FHIR Output */}
          {fhirJson && (
            <div className="bg-background-800/80 backdrop-blur-sm rounded-xl shadow-elegant border border-background-600/50">
              <div className="flex items-center justify-between p-6 border-b border-background-600/50">
                <div>
                  <h3 className="text-lg font-semibold text-text-100">Generated FHIR Bundle</h3>
                  <p className="text-sm text-text-400 mt-1">
                    Bundle Type: Collection • Resources: {fhirJson.total} • Standard: FHIR R4
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors"
                >
                  <FiDownload className="w-4 h-4" />
                  <span>Download Bundle</span>
                </button>
              </div>
              
              <div className="p-6">
                <pre className="bg-background-900 border border-background-600 rounded-lg p-4 text-sm overflow-x-auto font-mono text-text-200 max-h-96">
                  {JSON.stringify(fhirJson, null, 2)}
                </pre>
              </div>
              
              {/* Bundle Summary */}
              <div className="px-6 pb-6">
                <div className="bg-primary-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-primary-300 mb-2">Bundle Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-primary-400 font-medium">Type:</span>
                      <span className="ml-2 text-text-300">{fhirJson.resourceType}</span>
                    </div>
                    <div>
                      <span className="text-primary-400 font-medium">Total Resources:</span>
                      <span className="ml-2 text-text-300">{fhirJson.total}</span>
                    </div>
                    <div>
                      <span className="text-primary-400 font-medium">Conditions:</span>
                      <span className="ml-2 text-text-300">{data.length}</span>
                    </div>
                    <div>
                      <span className="text-primary-400 font-medium">Generated:</span>
                      <span className="ml-2 text-text-300">{new Date(fhirJson.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-800/60 backdrop-blur-sm rounded-lg p-6 border border-background-600/50">
          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
            <FiFileText className="w-4 h-4 text-primary-600" />
          </div>
          <h3 className="font-semibold text-text-100 mb-2">CSV Processing</h3>
          <p className="text-text-300 text-sm">
            Upload CSV files with medical codes and automatically parse them into structured data.
          </p>
        </div>
        
        <div className="bg-background-800/60 backdrop-blur-sm rounded-lg p-6 border border-background-600/50">
          <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center mb-3">
            <FiCheck className="w-4 h-4 text-secondary-600" />
          </div>
          <h3 className="font-semibold text-text-100 mb-2">FHIR Compliance</h3>
          <p className="text-text-300 text-sm">
            Generated resources are fully compliant with FHIR R4 standards for healthcare interoperability.
          </p>
        </div>
        
        <div className="bg-background-800/60 backdrop-blur-sm rounded-lg p-6 border border-background-600/50">
          <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center mb-3">
            <FiDownload className="w-4 h-4 text-accent-600" />
          </div>
          <h3 className="font-semibold text-text-100 mb-2">Export Ready</h3>
          <p className="text-text-300 text-sm">
            Download generated FHIR Bundles as JSON files ready for integration with EHR systems.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;
