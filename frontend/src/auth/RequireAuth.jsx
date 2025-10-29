import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const RequireAuth = ({ children }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const validateAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        // No auth data, redirect to intro
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/intro");
        setLoading(false);
        return;
      }

      try {
        // Validate token expiration
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = tokenData.exp * 1000;

        if (Date.now() >= expirationTime) {
          // Token expired
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          navigate("/intro");
          setLoading(false);
          return;
        }

        // Valid token but no user in context
        if (!user && storedUser) {
          setUser(JSON.parse(storedUser));
        }

        setLoading(false);
      } catch (error) {
        console.error("Error validating auth:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/intro");
        setLoading(false);
      }
    };

    validateAuth();
  }, [navigate, setUser, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If we made it here, user is authenticated
  return <>{children}</>;
};

export default RequireAuth;