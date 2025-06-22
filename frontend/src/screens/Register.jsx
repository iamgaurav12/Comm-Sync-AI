import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { generateOTP, sendOTP } from "../utils/otpUtils";
import OTPVerification from "./OTPVerification";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [tempUserData, setTempUserData] = useState(null); // Store form data temporarily
  const [storedOTP, setStoredOTP] = useState(null); // Store OTP in React state
  const [error, setError] = useState("");

  const { login } = useContext(UserContext);
  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Don't register user yet - just send OTP
    const sendOTPOnly = async () => {
      try {
        // Store user data temporarily (not in database yet)
        setTempUserData({ email, password });
        
        // Generate and send OTP
        const otp = generateOTP();
        
        const otpResult = await sendOTP(email, otp);
        
        if (otpResult.success) {
          // Store OTP in React state instead of localStorage
          setStoredOTP(otp);
          setShowOTPVerification(true);
        } else {
          setError("Failed to send OTP. Please try again.");
        }
      } catch (err) {
        setError("Failed to send OTP. Please try again.");
      }
    };

    sendOTPOnly().finally(() => {
      setIsLoading(false);
    });
  }

  const handleOTPVerified = async () => {
    // Now register the user in database after OTP verification
    setIsLoading(true);
    
    try {
      const response = await axios.post("/users/register", {
        email: tempUserData.email,
        password: tempUserData.password,
      });
      
      
      // Login user after successful registration
      login(response.data.user, response.data.token);
      navigate("/home");
    } catch (err) {
      // Handle email already exists error or other registration errors
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('exist')) {
        setError("Email already registered. Please use a different email.");
      } else {
        setError(errorMessage);
      }
      
      setShowOTPVerification(false); // Go back to registration form
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOTPVerification(false);
    setTempUserData(null);
    setStoredOTP(null); // Clear stored OTP
    setError("");
  };

  const handleResendOTP = async () => {
    try {
      const newOTP = generateOTP();
      const result = await sendOTP(email, newOTP);
      
      if (result.success) {
        setStoredOTP(newOTP);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (err) {
      return { success: false, message: "Failed to resend OTP" };
    }
  };

  if (showOTPVerification) {
    return (
      <OTPVerification
        email={email}
        storedOTP={storedOTP}
        onVerified={handleOTPVerified}
        onBack={handleBackToRegister}
        onResendOTP={handleResendOTP}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900"></div>
      
      <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50 hover:shadow-blue-500/10 transition-all duration-300">
        {/* Decorative elements */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Create Account
          </h2>
          <p className="text-gray-400 text-sm">Join us and start your journey</p>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="relative">
            <label 
              className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                focusedField === 'email' ? 'text-blue-400' : 'text-gray-400'
              }`} 
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                value={email}
                type="email"
                id="email"
                className="w-full p-4 rounded-xl bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/70"
                placeholder="you@example.com"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
            </div>
          </div>

          <div className="relative">
            <label 
              className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
                focusedField === 'password' ? 'text-blue-400' : 'text-gray-400'
              }`} 
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                value={password}
                type="password"
                id="password"
                className="w-full p-4 rounded-xl bg-gray-700/50 text-white placeholder-gray-500 border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/70"
                placeholder="••••••••"
                required
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-900/50 border border-red-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-blue-500/25"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sending OTP...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>Send OTP</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600/50"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 text-gray-500 bg-gray-800/80">Already have an account?</span>
            </div>
          </div>
          
          <Link 
            to="/login" 
            className="inline-block mt-4 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline decoration-blue-400/50 underline-offset-4"
          >
            Sign in instead →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;