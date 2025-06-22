import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const Logout = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Clearing session...");

  useEffect(() => {
    const performCompleteLogout = async () => {
  try {
    // Simulate logout progress with more comprehensive steps
    const steps = [
      { message: "Clearing session data...", delay: 300 },
      { message: "Removing local storage...", delay: 400 },
      { message: "Clearing cookies...", delay: 500 },
      { message: "Cleaning cache storage...", delay: 600 },
      { message: "Securing logout...", delay: 400 },
      { message: "Finalizing cleanup...", delay: 300 },
      { message: "Logout complete!", delay: 200 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setStatus(steps[i].message);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }

    // 1. Clear React context
    setUser(null);
    
    // 2. Clear localStorage completely
    localStorage.clear();
    
    // 3. Clear sessionStorage
    sessionStorage.clear();
    
    // 4. Clear all cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // 5. Clear IndexedDB (if used)
    if ('indexedDB' in window) {
      try {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            return new Promise((resolve, reject) => {
              const deleteReq = indexedDB.deleteDatabase(db.name);
              deleteReq.onsuccess = () => resolve();
              deleteReq.onerror = () => reject(deleteReq.error);
            });
          })
        );
      } catch (error) {
        console.warn("Could not clear IndexedDB:", error);
      }
    }
    
    // 6. Clear Cache API storage
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.warn("Could not clear cache storage:", error);
      }
    }
    
    // 7. (Removed backend logout request)
    // 8. Clear any Web SQL (deprecated but might be used)
    if (window.openDatabase) {
      try {
        // This is deprecated and not recommended for new applications
        console.log("Web SQL detected but not cleared (deprecated)");
      } catch (error) {
        console.warn("Web SQL clearing failed:", error);
      }
    }
    
    // 9. Notify service worker to clear its data (if applicable)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_ALL_DATA'
      });
    }
    
    console.log("Complete logout performed successfully");
    
    // 10. Use navigate to redirect to login page (no reload)
    setTimeout(() => {
      navigate("/login");
    }, 500);
    
  } catch (error) {
    console.error("Logout error:", error);
    setStatus("Logout error occurred");
    
    // Fallback: still redirect even if there's an error
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  }
};

    performCompleteLogout();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 relative overflow-hidden">
      <div className="max-w-md w-full relative z-10">
        {/* Main logout card */}
        <div className="bg-slate-800/60 backdrop-blur-xl shadow-2xl rounded-3xl p-8 text-center border border-slate-700/50 relative overflow-hidden">
          {/* Card background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-slate-800/20 rounded-3xl"></div>
          
          {/* Animated icon container */}
          <div className="mb-8 relative z-10">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-500/30 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              <i className="ri-logout-box-line text-3xl text-white relative z-10 animate-pulse"></i>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-xl animate-pulse"></div>
            </div>
            
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
              Logging Out
            </h2>
            <p className="text-slate-400 text-lg">
              Securely ending your session...
            </p>
          </div>
          
          {/* Progress section */}
          <div className="mb-8 relative z-10">
            {/* Progress bar */}
            <div className="w-full bg-slate-700/50 rounded-full h-3 mb-4 overflow-hidden shadow-inner border border-slate-600/50">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out shadow-lg relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-ping"></div>
              </div>
            </div>
            
            {/* Status text */}
            <p className="text-sm font-medium text-slate-300 mb-4 animate-pulse">
              {status}
            </p>
            
            {/* Animated spinner */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-600/50"></div>
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent absolute top-0 left-0 shadow-lg shadow-blue-500/30"></div>
                {/* Additional spinning ring for more visual interest */}
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500/30 border-l-transparent absolute -top-1 -left-1" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
              </div>
            </div>
          </div>
          
          {/* Additional info */}
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-2xl p-4 border border-slate-600/50 backdrop-blur-sm relative z-10">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
              <i className="ri-shield-check-line text-green-400 animate-pulse"></i>
              <p>Your data is being securely cleared</p>
            </div>
          </div>
        </div>
        
        {/* Floating elements for visual enhancement - Dark theme */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-20 w-16 h-16 bg-red-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        
        {/* Additional dark theme atmospheric elements */}
        <div className="absolute top-10 right-5 w-12 h-12 bg-slate-500/10 rounded-full blur-lg animate-pulse delay-700"></div>
        <div className="absolute bottom-10 left-5 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl animate-pulse delay-1500"></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default Logout;