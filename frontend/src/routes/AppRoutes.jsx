import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import Intro from "../screens/Intro";
import Logout from "../screens/Logout";
import RequireAuth from "../auth/RequireAuth";
import FileManager from "../screens/FileManager";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root route redirects to home if authenticated, otherwise to intro */}
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        
        {/* Public routes */}
        <Route path="/intro" element={<Intro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Protected routes */}
        <Route
          path="/files"
          element={
            <RequireAuth>
              <FileManager />
            </RequireAuth>
          }
        />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* Project route */}
        <Route
          path="/project"
          element={
            <RequireAuth>
              <Project />
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;