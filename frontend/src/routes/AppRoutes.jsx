import React from "react";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Project from "../screens/Project";
import Intro from "../screens/Intro";
import Logout from "../screens/Logout";
import UserAuth from "../auth/UserAuth";
import FileManager from "../screens/FileManager";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public intro page - first thing users see */}
        <Route path="/" element={<Intro />} />
        <Route path="/files" element={<FileManager/>} />
        {/* Authenticated home page */}
        <Route
          path="/home"
          element={
            <UserAuth>
              <Home />
            </UserAuth>
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
            <UserAuth>
              <Project />
            </UserAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;