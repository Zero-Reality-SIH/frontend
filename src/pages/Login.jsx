import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiX } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Logo from '../components/Logo';

export default function Login({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Validation functions
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

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email
    const emailValidation = validateEmail(email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    
    setEmailError('');
    setPasswordError('');
    setIsLoading(true);
    
    // Simulate login API call
    setTimeout(() => {
      if (email && password) {
        // For demo purposes, any email/password combination works
        onLogin({
          email: email,
          name: email.split('@')[0],
          role: 'Doctor',
          specialty: 'General Medicine'
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate Google OAuth
    setTimeout(() => {
      onLogin({
        email: 'user@gmail.com',
        name: 'Google User',
        role: 'Doctor',
        specialty: 'General Medicine',
        provider: 'google'
      });
      setIsLoading(false);
    }, 1000);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsResettingPassword(true);
    
    // Simulate password reset API call
    setTimeout(() => {
      setResetEmailSent(true);
      setIsResettingPassword(false);
      // Close modal after 3 seconds
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmailSent(false);
        setForgotPasswordEmail('');
      }, 3000);
    }, 1000);
  };

  const openForgotPasswordModal = () => {
    setShowForgotPassword(true);
    setForgotPasswordEmail(email); // Pre-fill with current email if available
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetEmailSent(false);
    setForgotPasswordEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        <div className="professional-card p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 p-2 shadow-md border border-gray-200">
              <Logo className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to access full platform features</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (emailError) {
                      setEmailError('');
                    }
                  }}
                  required
                  className={`input-professional w-full pl-10 pr-3 py-3 rounded-lg focus-ring ${
                    emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="doctor@hospital.com"
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    // Clear error when user starts typing
                    if (passwordError) {
                      setPasswordError('');
                    }
                  }}
                  required
                  className={`input-professional w-full pl-10 pr-10 py-3 rounded-lg focus-ring ${
                    passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={openForgotPasswordModal}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 px-4 rounded-lg font-medium text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Google Login */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FcGoogle className="h-5 w-5 mr-3" />
              Continue with Google
            </button>
          </div>

          {/* Switch to Signup */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 underline transition-colors font-medium"
                onClick={onSwitchToSignup}
              >
                Sign up here
              </button>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              By signing in, you agree to our{' '}
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 underline transition-colors"
                onClick={() => {
                  // TODO: Open terms of service modal or navigate to terms page
                  window.open('#', '_blank');
                }}
              >
                Terms of Service
              </button>
              {' '}and{' '}
              <button 
                type="button"
                className="text-blue-600 hover:text-blue-800 underline transition-colors"
                onClick={() => {
                  // TODO: Open privacy policy modal or navigate to privacy page
                  window.open('#', '_blank');
                }}
              >
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Reset Your Password
              </h3>
              <button
                onClick={closeForgotPasswordModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            {!resetEmailSent ? (
              <>
                <p className="text-gray-600 mb-4">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <form onSubmit={handleForgotPassword}>
                  <div className="mb-4">
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="reset-email"
                        type="email"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                        className="input-professional w-full pl-10 pr-3 py-3 rounded-lg focus-ring"
                        placeholder="doctor@hospital.com"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={closeForgotPasswordModal}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isResettingPassword}
                      className="flex-1 btn-primary px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResettingPassword ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Reset Link Sent!
                </h4>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <strong>{forgotPasswordEmail}</strong>. 
                  Please check your email and follow the instructions to reset your password.
                </p>
                <p className="text-sm text-gray-500">
                  This modal will close automatically in a few seconds.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}