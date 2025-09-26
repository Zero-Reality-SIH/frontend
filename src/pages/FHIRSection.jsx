import React, { useState } from "react";
import { FiCode, FiDownload, FiCopy, FiCheck } from 'react-icons/fi';

const FHIRSection = ({ onAddToHistory, user }) => {
  const [fhirData, setFhirData] = useState(null);
  const [copied, setCopied] = useState(false);

  const sampleFHIR = {
    resourceType: "Condition",
    id: "example-condition-001",
    meta: {
      versionId: "1",
      lastUpdated: new Date().toISOString(),
      profile: ["http://hl7.org/fhir/StructureDefinition/Condition"]
    },
    clinicalStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
        code: "active",
        display: "Active"
      }],
      text: "active"
    },
    verificationStatus: {
      coding: [{
        system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
        code: "confirmed",
        display: "Confirmed"
      }]
    },
    code: {
      coding: [
        {
          system: "http://namaste-ayush.in/codes",
          code: "T123",
          display: "Prameha"
        },
        {
          system: "http://icd.who.int/icd11",
          code: "5A11",
          display: "Type 2 diabetes mellitus"
        }
      ],
      text: "Prameha (Type 2 Diabetes Mellitus)"
    },
    subject: {
      reference: "Patient/example-patient-001",
      display: "John Doe"
    },
    recordedDate: new Date().toISOString(),
    recorder: {
      reference: "Practitioner/example-practitioner-001",
      display: "Dr. Smith"
    },
    extension: [
      {
        url: "http://namaste-ayush.in/fhir/extension/version",
        valueString: "v1.0"
      },
      {
        url: "http://namaste-ayush.in/fhir/extension/consent",
        valueCode: "granted"
      }
    ]
  };

  const generateFHIR = () => {
    setFhirData(sampleFHIR);
  };

  const downloadFHIR = () => {
    const filename = "fhir-condition.json";
    const blob = new Blob([JSON.stringify(fhirData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    // Add to history if user is logged in and onAddToHistory is available
    if (user && onAddToHistory) {
      onAddToHistory({
        filename: filename,
        selectedCodes: [{
          namaste: 'T123',
          namasteTerm: 'Prameha',
          biomed: '5A11',
          biomedTerm: 'Type 2 diabetes mellitus'
        }],
        fhirData: fhirData,
        fileSize: `${Math.round(blob.size / 1024)} KB`,
        searchQuery: 'FHIR Generator'
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(fhirData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          FHIR Generator
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate FHIR R4 compliant data structures for medical conditions. 
          Perfect for healthcare interoperability and data exchange.
        </p>
      </div>

      {/* Generator Card */}
      <div className="professional-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Condition Resource Generator</h2>
            <p className="text-gray-600">Generate a sample FHIR Condition resource with NAMASTE and ICD-11 coding</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <div>FHIR Version: R4</div>
            <div>Resource Type: Condition</div>
          </div>
        </div>
        
        <button
          onClick={generateFHIR}
          className="btn-primary flex items-center space-x-2 px-6 py-3 rounded-lg font-medium"
        >
          <FiCode className="w-5 h-5" />
          <span>Generate FHIR Condition</span>
        </button>
      </div>

      {/* Generated Output */}
      {fhirData && (
        <div className="professional-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Generated FHIR Resource</h3>
              <p className="text-sm text-gray-500 mt-1">
                Resource ID: {fhirData.id} • Last Updated: {new Date(fhirData.meta.lastUpdated).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={copyToClipboard}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 text-sm rounded-lg"
              >
                {copied ? (
                  <>
                    <FiCheck className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="w-4 h-4" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={downloadFHIR}
                className="btn-primary flex items-center space-x-2 px-4 py-2 text-sm rounded-lg"
              >
                <FiDownload className="w-4 h-4" />
                <span>Download JSON</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm overflow-x-auto font-mono text-gray-700 max-h-96">
              {JSON.stringify(fhirData, null, 2)}
            </pre>
          </div>
          
          {/* Resource Summary */}
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Resource Summary</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700 font-medium">Type:</span>
                  <span className="ml-2 text-gray-700">{fhirData.resourceType}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Status:</span>
                  <span className="ml-2 text-gray-700">{fhirData.clinicalStatus.text}</span>
                </div>
                <div>
                  <span className="text-blue-700 font-medium">Condition:</span>
                  <span className="ml-2 text-gray-700">{fhirData.code.text}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="professional-card p-6">
          <h3 className="font-semibold text-gray-900 mb-3">About FHIR</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Fast Healthcare Interoperability Resources (FHIR) is a standard for exchanging healthcare 
            information electronically. This generator creates FHIR R4 compliant Condition resources.
          </p>
        </div>
        
        <div className="professional-card p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Integration Ready</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Generated resources include NAMASTE and ICD-11 coding systems, making them suitable for 
            integration with modern healthcare information systems and EHRs.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FHIRSection;
