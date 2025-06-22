import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios";
import { UserContext } from "../context/user.context";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useContext(UserContext); // Use login function from context

  const navigate = useNavigate();

  function submitHandler(e) {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post("/users/login", {
        email,
        password,
      })
      .then((res) => {
        console.log(res.data);

        // Use the login function from context instead of manual localStorage
        login(res.data.user, res.data.token);

        navigate("/home");
      })
      .catch((err) => {
        console.log(err.response.data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gray-700/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-slate-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gray-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Login Card */}
      <div className="relative bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-gray-700/30">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <i className="ri-user-line text-3xl text-gray-300"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={submitHandler} className="space-y-6">
          {/* Email Field */}
          <div className="group">
            <label className="block text-gray-400 mb-2 font-medium" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ri-mail-line text-gray-500"></i>
              </div>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                id="email"
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-800/50 backdrop-blur-sm text-gray-100 placeholder-gray-500 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:bg-gray-800/70"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="group">
            <label className="block text-gray-400 mb-2 font-medium" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <i className="ri-lock-line text-gray-500"></i>
              </div>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-800/50 backdrop-blur-sm text-gray-100 placeholder-gray-500 border border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200 hover:bg-gray-800/70"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-500 hover:text-gray-300 transition-colors"
              >
                <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
              </button>
            </div>
          </div>



          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-gray-100 font-semibold hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-100 rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <i className="ri-login-box-line"></i>
                <span>Sign In</span>
              </div>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-8">
          <p className="text-gray-500">
            Don't have an account?{" "}
            <Link 
              to="/register" 
              className="text-gray-300 font-semibold hover:text-gray-100 transition-colors"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;