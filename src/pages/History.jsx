import React from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiDownload, FiCode, FiTrash2, FiCalendar, FiUser } from 'react-icons/fi';

export default function History({ historyItems, onDownloadAgain, onClearHistory }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalCodes = (entry) => {
    if (entry.fhirData && entry.fhirData.entry) {
      return entry.fhirData.entry.length;
    }
    return entry.selectedCodes?.length || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Download History
              </h1>
              <p className="text-gray-600">
                Track your FHIR bundle downloads and medical code mappings
              </p>
            </div>
            {historyItems.length > 0 && (
              <button
                onClick={onClearHistory}
                className="btn-secondary flex items-center space-x-2 px-4 py-2 rounded-lg"
              >
                <FiTrash2 className="w-4 h-4" />
                <span>Clear History</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* History Items */}
        {historyItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="professional-card p-12 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiClock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Download History
            </h3>
            <p className="text-gray-600 mb-4">
              Your FHIR bundle downloads will appear here once you start generating and downloading them.
            </p>
            <button
              onClick={() => window.location.href = '/search'}
              className="btn-primary px-6 py-2 rounded-lg"
            >
              Start Mapping Codes
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="professional-card p-6 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiCode className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          FHIR Bundle Download
                          {item.patient && (
                            <span className="ml-2 text-base font-normal text-blue-600">
                              (Patient: {item.patient})
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <FiCalendar className="w-4 h-4" />
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiUser className="w-4 h-4" />
                            <span>{item.user}</span>
                            {item.patient && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Patient: {item.patient}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Download Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700">Total Codes</div>
                        <div className="text-xl font-bold text-blue-600">{getTotalCodes(item)}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700">File Size</div>
                        <div className="text-xl font-bold text-green-600">{item.fileSize}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-700">Format</div>
                        <div className="text-xl font-bold text-purple-600">FHIR R4</div>
                      </div>
                    </div>

                    {/* Selected Codes Preview */}
                    {item.selectedCodes && item.selectedCodes.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Mapped Codes:</div>
                        <div className="flex flex-wrap gap-2">
                          {item.selectedCodes.slice(0, 5).map((code, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {code.namaste}: {code.namasteTerm}
                            </span>
                          ))}
                          {item.selectedCodes.length > 5 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{item.selectedCodes.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="ml-6">
                    <button
                      onClick={() => onDownloadAgain(item)}
                      className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg"
                    >
                      <FiDownload className="w-4 h-4" />
                      <span>Download Again</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {historyItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {historyItems.length}
              </div>
              <div className="text-gray-600">Total Downloads</div>
            </div>
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {historyItems.reduce((sum, item) => sum + getTotalCodes(item), 0)}
              </div>
              <div className="text-gray-600">Codes Mapped</div>
            </div>
            <div className="professional-card p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {historyItems.length > 0 ? formatDate(Math.max(...historyItems.map(item => item.timestamp))).split(',')[0] : 'N/A'}
              </div>
              <div className="text-gray-600">Last Activity</div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}