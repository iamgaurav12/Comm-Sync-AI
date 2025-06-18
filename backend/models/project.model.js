import mongoose from "mongoose";

// Message schema for embedded messages
const messageSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  sender: {
    _id: {
      type: String, // Can be ObjectId string or 'ai'
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user'
  }
}, {
  _id: true, // Enable _id for each message
  timestamps: false // We're using custom timestamp field
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
    unique: [true, "Project name must be unique"],
  },
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  fileTree: {
    type: Object,
    default: {},
  },
  messages: [messageSchema] // Array of messages
}, {
  timestamps: true // createdAt, updatedAt for project
});

const Project = mongoose.model("project", projectSchema);

export default Project;