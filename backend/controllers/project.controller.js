import projectModel from "../models/project.model.js";
import * as projectService from "../services/project.service.js";
import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";
import mongoose from "mongoose";

export const createProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name } = req.body;
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    const userId = loggedInUser._id;

    const newProject = await projectService.createProject({ name, userId });

    res.status(201).json(newProject);
  } catch (err) {
    console.log(err);
    res.status(400).send(err.message);
  }
};

export const getAllProject = async (req, res) => {
  try {
    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      projects: allUserProjects,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const addUserToProject = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({
      email: req.user.email,
    });

    const project = await projectService.addUsersToProject({
      projectId,
      users,
      userId: loggedInUser._id,
    });

    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await projectService.getProjectById({ projectId });

    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateFileTree = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId, fileTree } = req.body;

    const project = await projectService.updateFileTree({
      projectId,
      fileTree,
    });

    return res.status(200).json({
      project,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};

// 🆕 NEW: Get messages for a project
export const getMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    // Get logged in user
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    
    // Find project and check if user has access
    const project = await projectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is part of the project
    const hasAccess = project.users.some(userId => 
      userId.toString() === loggedInUser._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Return messages (sorted by timestamp, newest first)
    const sortedMessages = project.messages.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    return res.status(200).json({
      success: true,
      messages: sortedMessages,
      projectId: project._id,
      projectName: project.name
    });

  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// 🆕 NEW: Add message to project (optional - if you want to store via HTTP too)
export const addMessage = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { projectId } = req.params;
    const { message, messageType = 'user' } = req.body;
    
    // Validate projectId
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ error: "Invalid project ID" });
    }

    // Get logged in user
    const loggedInUser = await userModel.findOne({ email: req.user.email });
    
    // Find project and check if user has access
    const project = await projectModel.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is part of the project
    const hasAccess = project.users.some(userId => 
      userId.toString() === loggedInUser._id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied to this project" });
    }

    // Create new message object
    const newMessage = {
      message: message.trim(),
      sender: {
        _id: loggedInUser._id.toString(),
        email: loggedInUser.email
      },
      timestamp: new Date(),
      messageType
    };

    // Add message to project
    project.messages.push(newMessage);
    await project.save();

    return res.status(201).json({
      success: true,
      message: newMessage,
      projectId: project._id
    });

  } catch (err) {
    console.error("Error adding message:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};