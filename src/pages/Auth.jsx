import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

export default function Auth({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  const handleSwitchToSignup = () => {
    setIsSignup(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignup(false);
  };

  const handleSignup = (userData) => {
    // For demo purposes, treat signup the same as login
    // In a real app, you'd make a separate API call for registration
    onLogin(userData);
  };

  return (
    <>
      {isSignup ? (
        <Signup 
          onSignup={handleSignup}
          onSwitchToLogin={handleSwitchToLogin}
        />
      ) : (
        <Login 
          onLogin={onLogin}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}
    </>
  );
}