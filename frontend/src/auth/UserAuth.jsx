import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children, shouldRedirect = true }) => {
  const { user, setUser } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (!token || !storedUser) {
      // If no authentication data, redirect to intro
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

      // If we have a valid token but no user in context, set it
      if (!user && storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error validating token:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      navigate("/intro");
      setLoading(false);
    }
  }, [navigate, setUser, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;