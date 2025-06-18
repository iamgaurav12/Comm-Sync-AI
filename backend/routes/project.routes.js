import { Router } from "express";
import { body } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleWare from "../middleware/auth.middleware.js";

const router = Router();

router.post(
  "/create",
  authMiddleWare.authUser,
  body("name").isString().withMessage("Name is required"),
  projectController.createProject
);

router.get("/all", authMiddleWare.authUser, projectController.getAllProject);

router.put(
  "/add-user",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be an array of strings")
    .bail()
    .custom((users) => users.every((user) => typeof user === "string"))
    .withMessage("Each user must be a string"),
  projectController.addUserToProject
);

router.get(
  "/get-project/:projectId",
  authMiddleWare.authUser,
  projectController.getProjectById
);

router.put(
  "/update-file-tree",
  authMiddleWare.authUser,
  body("projectId").isString().withMessage("Project ID is required"),
  body("fileTree").isObject().withMessage("File tree is required"),
  projectController.updateFileTree
);

// 🆕 NEW: Get messages for a project
router.get(
  "/get-messages/:projectId",
  authMiddleWare.authUser,
  projectController.getMessages
);

// 🆕 NEW: Add message to project (optional - if you want HTTP endpoint too)
router.post(
  "/add-message/:projectId",
  authMiddleWare.authUser,
  body("message")
    .isString()
    .withMessage("Message is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Message must be between 1 and 1000 characters"),
  body("messageType")
    .optional()
    .isIn(['user', 'ai'])
    .withMessage("Message type must be 'user' or 'ai'"),
  projectController.addMessage
);

export default router;