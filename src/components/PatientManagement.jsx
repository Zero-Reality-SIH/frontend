import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiTrash2, FiUser, FiCalendar, FiPhone, FiMail, FiEdit3 } from 'react-icons/fi';

export default function PatientManagement({ isOpen, onClose, user, onPatientSelect }) {
  // Start with empty patient list - new users should add their own patients
  const [patients, setPatients] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    phone: '',
    email: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Validation functions
  const validateIndianPhone = (phone) => {
    const phoneRegex = /^(\+91[\-\s]?)?[6-9]\d{9}$/;
    if (!phone) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(phone.replace(/[\s\-]/g, ''))) {
      return 'Please enter a valid Indian phone number (10 digits starting with 6-9)';
    }
    return '';
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      return 'Name should only contain letters and spaces';
    }
    return '';
  };

  const validateAge = (age) => {
    const ageNum = parseInt(age);
    if (!age) {
      return 'Age is required';
    }
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      return 'Please enter a valid age between 1 and 120';
    }
    return '';
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(newPatient.name);
    if (nameError) errors.name = nameError;
    
    const ageError = validateAge(newPatient.age);
    if (ageError) errors.age = ageError;
    
    const phoneError = validateIndianPhone(newPatient.phone);
    if (phoneError) errors.phone = phoneError;
    
    const emailError = validateEmail(newPatient.email);
    if (emailError) errors.email = emailError;
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPatient = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const patient = {
      id: Date.now(),
      ...newPatient,
      age: parseInt(newPatient.age),
      dateAdded: new Date().toISOString().split('T')[0],
      lastVisit: new Date().toISOString().split('T')[0]
    };
    setPatients(prev => [...prev, patient]);
    setNewPatient({ name: '', age: '', phone: '', email: '' });
    setValidationErrors({});
    setShowAddModal(false);
  };

  const handleRemovePatient = (patientId) => {
    if (window.confirm('Are you sure you want to remove this patient?')) {
      setPatients(prev => prev.filter(p => p.id !== patientId));
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setNewPatient({
      name: patient.name,
      age: patient.age.toString(),
      phone: patient.phone,
      email: patient.email
    });
    setShowAddModal(true);
  };

  const handleUpdatePatient = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const updatedPatient = {
      ...editingPatient,
      ...newPatient,
      age: parseInt(newPatient.age)
    };
    setPatients(prev => prev.map(p => p.id === editingPatient.id ? updatedPatient : p));
    setNewPatient({ name: '', age: '', phone: '', email: '' });
    setValidationErrors({});
    setEditingPatient(null);
    setShowAddModal(false);
  };

  // Search and selection functions
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePatientSelect = (patientId) => {
    setSelectedPatients(prev => {
      if (prev.includes(patientId)) {
        return prev.filter(id => id !== patientId);
      } else {
        return [...prev, patientId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === filteredPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(filteredPatients.map(p => p.id));
    }
  };

  const getSuggestions = () => {
    if (!searchTerm.trim()) return [];
    return patients
      .filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        patient.name.toLowerCase() !== searchTerm.toLowerCase()
      )
      .slice(0, 5);
  };

  const handleSuggestionClick = (patientName) => {
    setSearchTerm(patientName);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  // Only allow doctors to access patient management
  if (!user || user.role !== 'Doctor') {
    return (
      <div className="fixed inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            Only licensed doctors can access patient management features.
          </p>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Patient Management</h2>
            <p className="text-gray-600 mt-1">
              Dr. {user?.name} • {user?.specialty}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Search Bar and Patient Stats */}
          <div className="flex flex-col space-y-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Patients</h3>
                <p className="text-gray-600">
                  {selectedPatients.length > 0 
                    ? `${selectedPatients.length} selected • ` 
                    : ''}
                  Total: {filteredPatients.length} patients
                  {searchTerm && filteredPatients.length !== patients.length 
                    ? ` (filtered from ${patients.length})` 
                    : ''}
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingPatient(null);
                  setNewPatient({ name: '', age: '', phone: '', email: '' });
                  setValidationErrors({});
                  setShowAddModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add Patient</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                  placeholder="Search patients by name..."
                  className="w-full px-4 py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Search Suggestions */}
              {showSuggestions && getSuggestions().length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {getSuggestions().map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => handleSuggestionClick(patient.name)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
                    >
                      <FiUser className="w-4 h-4 text-gray-400" />
                      <span>{patient.name}</span>
                      <span className="text-sm text-gray-500">Age: {patient.age}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selection Controls */}
            {filteredPatients.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Select All ({filteredPatients.length})
                    </span>
                  </label>
                  {selectedPatients.length > 0 && (
                    <button
                      onClick={() => setSelectedPatients([])}
                      className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
                {selectedPatients.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedPatients.length} selected
                    </span>
                    {selectedPatients.length === 1 && (
                      <button
                        onClick={() => {
                          const selectedPatient = patients.find(p => p.id === selectedPatients[0]);
                          onPatientSelect(selectedPatient);
                          onClose();
                        }}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Done - Switch to Patient</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${selectedPatients.length} selected patients?`)) {
                          setPatients(prev => prev.filter(p => !selectedPatients.includes(p.id)));
                          setSelectedPatients([]);
                        }
                      }}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                    >
                      <FiTrash2 className="w-3 h-3" />
                      <span>Remove Selected</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Patients List */}
          <div className="space-y-4">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12">
                {searchTerm ? (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Found</h3>
                    <p className="text-gray-600 mb-4">No patients match your search for "{searchTerm}"</p>
                    <button
                      onClick={clearSearch}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiUser className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patients Yet</h3>
                    <p className="text-gray-600 mb-4">Start by adding your first patient</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Your First Patient
                    </button>
                  </>
                )}
              </div>
            ) : (
              filteredPatients.map((patient) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={!!selectedPatients.find(id => id === patient.id)}
                        onChange={() => handlePatientSelect(patient.id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900">{patient.name}</h4>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 mt-1">
                          <span>Age: {patient.age}</span>
                          <span className="flex items-center space-x-1">
                            <FiPhone className="w-4 h-4" />
                            <span>{patient.phone}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FiMail className="w-4 h-4" />
                            <span>{patient.email}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-xs text-gray-500 mt-2">
                          <span className="flex items-center space-x-1">
                            <FiCalendar className="w-3 h-3" />
                            <span>Added: {new Date(patient.dateAdded).toLocaleDateString()}</span>
                          </span>
                          <span>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPatient(patient)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Edit Patient"
                      >
                        <FiEdit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemovePatient(patient.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove Patient"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Add/Edit Patient Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center p-4 z-60">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg w-full max-w-md"
              >
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingPatient(null);
                      setNewPatient({ name: '', age: '', phone: '', email: '' });
                      setValidationErrors({});
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FiX className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient} className="p-6 space-y-4">
                  <div>
                    <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="patient-name"
                      type="text"
                      value={newPatient.name}
                      onChange={(e) => {
                        setNewPatient(prev => ({ ...prev, name: e.target.value }));
                        if (validationErrors.name) {
                          setValidationErrors(prev => ({ ...prev, name: '' }));
                        }
                      }}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter patient's full name"
                    />
                    {validationErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="patient-age" className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      id="patient-age"
                      type="number"
                      value={newPatient.age}
                      onChange={(e) => {
                        setNewPatient(prev => ({ ...prev, age: e.target.value }));
                        if (validationErrors.age) {
                          setValidationErrors(prev => ({ ...prev, age: '' }));
                        }
                      }}
                      required
                      min="1"
                      max="120"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.age ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter age"
                    />
                    {validationErrors.age && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.age}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="patient-phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="patient-phone"
                      type="tel"
                      value={newPatient.phone}
                      onChange={(e) => {
                        setNewPatient(prev => ({ ...prev, phone: e.target.value }));
                        if (validationErrors.phone) {
                          setValidationErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="+91-"
                    />
                    {validationErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="patient-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      id="patient-email"
                      type="email"
                      value={newPatient.email}
                      onChange={(e) => {
                        setNewPatient(prev => ({ ...prev, email: e.target.value }));
                        if (validationErrors.email) {
                          setValidationErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        validationErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                      }`}
                      placeholder="patient@email.com"
                    />
                    {validationErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddModal(false);
                        setEditingPatient(null);
                        setNewPatient({ name: '', age: '', phone: '', email: '' });
                        setValidationErrors({});
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {editingPatient ? 'Update Patient' : 'Add Patient'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}