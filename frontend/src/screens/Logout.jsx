import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const Logout = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const performLogout = () => {
      try {
        // Clear user context
        setUser(null);
        
        // Clear any local storage/session storage if used
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.clear();
        
        console.log("User logged out successfully");
        
        // Redirect to login page after a brief delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
        
      } catch (error) {
        console.error("Logout error:", error);
        
        // Fallback: still redirect even if there's an error
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 1500);
      }
    };

    performLogout();
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <i className="ri-logout-box-line text-2xl text-blue-600"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Logging Out</h2>
          <p className="text-gray-600">Please wait while we securely log you out...</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        
        <div className="text-sm text-gray-500">
          <p>You will be redirected to the login page in a moment.</p>
        </div>
      </div>
    </div>
  );
};

export default Logout;