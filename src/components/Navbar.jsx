import { FiUser, FiBell, FiSettings, FiClock, FiLogIn, FiLogOut, FiUsers } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import PatientManagement from './PatientManagement';

export default function Navbar({ user, onLogout, selectedPatient, onPatientSelect, onBackToDoctor }) {
  const navigate = useNavigate();
  const [showPatientManagement, setShowPatientManagement] = useState(false);

  const handleAuthAction = () => {
    if (user) {
      onLogout();
    } else {
      navigate('/login');
    }
  };
  return (
    <nav className="bg-blue-600 border-b border-blue-700 px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1.5 shadow-sm">
              <Logo className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-semibold text-white">
              BridgeHealth
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <button 
                onClick={() => navigate('/history')}
                className="p-2 text-blue-100 hover:text-white hover:bg-blue-700 rounded-lg transition-colors" 
                title="History"
              >
                <FiClock className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-blue-400"></div>
              <button 
                onClick={() => setShowPatientManagement(true)}
                className="flex items-center space-x-2 text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                title="Manage Patients"
              >
                <FiUser className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {selectedPatient ? selectedPatient.name : user.name}
                </span>
                {/* <FiUsers className="w-4 h-4" /> */}
              </button>
              {selectedPatient && (
                <button 
                  onClick={onBackToDoctor}
                  className="flex items-center space-x-2 text-blue-100 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors"
                  title="Switch back to Doctor view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="text-sm">Back to Dr. {user.name}</span>
                </button>
              )}
            </>
          )}
          {!user && (
            <></>  
          )}
          <button 
            onClick={handleAuthAction}
            className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2"
          >
            {user ? (
              <>
                <FiLogOut className="w-4 h-4" />
                <span>Log Out</span>
              </>
            ) : (
              <>
                <FiLogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Patient Management Modal */}
      <PatientManagement 
        isOpen={showPatientManagement}
        onClose={() => setShowPatientManagement(false)}
        user={user}
        onPatientSelect={onPatientSelect}
      />
    </nav>
  );
}
