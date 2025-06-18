import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/user.context";

const UserAuth = ({ children }) => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // If no token, redirect to login
    if (!token) {
      navigate("/login");
      return;
    }

    // If user is already loaded, stop loading
    if (user) {
      setLoading(false);
      return;
    }

    // If token exists but no user, redirect to login
    // This handles cases where token might be invalid
    if (token && !user) {
      // You might want to validate the token here
      // For now, we'll set a timeout to avoid infinite loading
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000); // Wait 2 seconds for user to load

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default UserAuth;