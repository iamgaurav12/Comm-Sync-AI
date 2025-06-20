import React, { useState, useEffect } from "react";
import {
  verifyOTP,
  sendOTP,
  generateOTP,
  storeOTP,
  clearOTP,
} from "../utils/otpUtils";

const OTPVerification = ({ email, onVerified, onBack }) => {
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
      clearOTP();
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

    const result = verifyOTP(email, otp);

    if (result.success) {
      onVerified();
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    const newOTP = generateOTP();
    const result = await sendOTP(email, newOTP);

    if (result.success) {
      storeOTP(email, newOTP);
      setResendCooldown(60); // 1 minute cooldown
      setTimeLeft(600); // Reset timer to 10 minutes
      setError("");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleOTPChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-white mb-6">
          Verify Your Email
        </h2>

        <p className="text-gray-400 mb-4">
          We've sent a 6-digit code to{" "}
          <span className="text-white font-semibold">{email}</span>
        </p>

        <div className="mb-4 text-center">
          <span className="text-blue-400">
            Time remaining: {formatTime(timeLeft)}
          </span>
        </div>

        <form onSubmit={handleVerifyOTP}>
          <div className="mb-4">
            <label className="block text-gray-400 mb-2" htmlFor="otp">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={handleOTPChange}
              className="w-full p-3 rounded bg-gray-700 text-white text-center text-2xl tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-600 text-white rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full p-3 rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed mb-4"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="flex justify-between items-center">
          <button onClick={onBack} className="text-gray-400 hover:text-white">
            ← Back to Login
          </button>

          <button
            onClick={handleResendOTP}
            disabled={loading || resendCooldown > 0}
            className="text-blue-500 hover:text-blue-400 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;