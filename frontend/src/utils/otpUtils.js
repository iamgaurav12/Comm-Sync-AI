// src/utils/otpUtils.js
import emailjs from '@emailjs/browser';

// Replace these with your EmailJS credentials
const EMAILJS_SERVICE_ID = 'service_223xomp';
const EMAILJS_TEMPLATE_ID = 'template_uupnarf';
const EMAILJS_PUBLIC_KEY = 'zDvIZLgkc9qsyRJ_i';

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTP = async (email, otp) => {
  try {
    const templateParams = {
      to_email: email,
      otp_code: otp,
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return { success: false, message: 'Failed to send OTP' };
  }
};

// Store OTP in sessionStorage with expiry
export const storeOTP = (email, otp) => {
  const otpData = {
    otp,
    email,
    timestamp: Date.now(),
    expiryTime: 10 * 60 * 1000, // 10 minutes
  };
  sessionStorage.setItem('otpData', JSON.stringify(otpData));
};

// Verify OTP
export const verifyOTP = (email, inputOTP) => {
  const storedData = sessionStorage.getItem('otpData');
  
  if (!storedData) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }

  const otpData = JSON.parse(storedData);
  const currentTime = Date.now();
  
  // Check if OTP expired
  if (currentTime - otpData.timestamp > otpData.expiryTime) {
    sessionStorage.removeItem('otpData');
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check if email matches
  if (otpData.email !== email) {
    return { success: false, message: 'Email mismatch.' };
  }

  // Check if OTP matches
  if (otpData.otp !== inputOTP) {
    return { success: false, message: 'Invalid OTP.' };
  }

  // OTP is valid
  sessionStorage.removeItem('otpData');
  return { success: true, message: 'OTP verified successfully.' };
};

// Clear stored OTP
export const clearOTP = () => {
  sessionStorage.removeItem('otpData');
};