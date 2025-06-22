import React, { useState, useEffect } from "react";

const OTPVerification = ({ email, storedOTP, onVerified, onBack, onResendOTP, isLoading }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setError("OTP has expired. Please request a new one.");
    }
  }, [timeLeft]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    

    // Verify OTP directly by comparing with storedOTP
    if (otp === storedOTP) {
      onVerified();
    } else {
      setError("Invalid OTP. Please try again.");
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (!onResendOTP) {
      setError("Resend functionality not available");
      return;
    }

    setLoading(true);
    setError("");

    const result = await onResendOTP();

    if (result.success) {
      setResendCooldown(60); // 1 minute cooldown
      setTimeLeft(600); // Reset timer to 10 minutes
      setOtp(""); // Clear current OTP input
      setError("");
    } else {
      setError(result.message || "Failed to resend OTP");
    }

    setLoading(false);
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
      // Clear error when user starts typing
      if (error) setError("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900"></div>
      
      <div className="relative bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-sm">
            We've sent a 6-digit code to{" "}
            <span className="text-blue-400 font-semibold">{email}</span>
          </p>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900/30 rounded-lg border border-blue-700/30">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-400 text-sm font-medium">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="relative">
            <label className="block text-gray-400 text-sm font-medium mb-3" htmlFor="otp">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOTPChange}
              className="w-full p-4 rounded-xl bg-gray-700/50 text-white text-center text-2xl tracking-[0.5em] font-mono border border-gray-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-gray-700/70"
              placeholder="000000"
              maxLength={6}
              required
              autoComplete="one-time-code"
            />
          </div>

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
            disabled={loading || isLoading || otp.length !== 6 || timeLeft === 0}
            className="relative w-full p-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-blue-500/25"
          >
            {loading || isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{isLoading ? "Creating Account..." : "Verifying..."}</span>
              </div>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <span>Verify & Create Account</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </button>
        </form>

        <div className="mt-8 flex justify-between items-center">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
            disabled={loading || isLoading}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back</span>
          </button>

          <button
            onClick={handleResendOTP}
            disabled={loading || isLoading || resendCooldown > 0 || timeLeft === 0}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? (
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-500 border-t-blue-400 rounded-full animate-spin"></div>
                {resendCooldown}s
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 9l5-5 5 5m6 11l-5-5-5 5" />
                </svg>
                Resend OTP
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;