import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 4000;

// ✅ Use same allowed origins as in app.js
const allowedOrigins = [
  "http://localhost:5173",
  "https://comm-sync-ai.vercel.app",
  "https://comm-sync-ai-3vjv-5s0kf088b-gaurav-prakashs-projects.vercel.app",
  "https://comm-sync-ai-3vjv.vercel.app",
  "https://new-comm-sync-ai.vercel.app"
];

const server = http.createServer(app);

// ✅ Enhanced Socket.IO CORS configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    credentials: true
  },
  allowEIO3: true // Enable Engine.IO v3 compatibility if needed
});

// ✅ Auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid projectId'));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error('Authentication error'));
    }

    socket.user = decoded;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    next(error);
  }
});

// 🆕 Helper function to save message to database
const saveMessageToDb = async (projectId, messageData) => {
  try {
    const project = await projectModel.findById(projectId);
    if (project) {
      project.messages.push({
        message: messageData.message,
        sender: messageData.sender,
        timestamp: new Date(),
        messageType: messageData.sender._id === 'ai' ? 'ai' : 'user'
      });
      await project.save();
      console.log('✅ Message saved to database');
    }
  } catch (error) {
    console.error('❌ Error saving message to database:', error);
  }
};

// ✅ Socket events
io.on('connection', socket => {
  socket.roomId = socket.project._id.toString();
  console.log('✅ User connected from:', socket.handshake.headers.origin);
  socket.join(socket.roomId);

  socket.on('project-message', async data => {
    try {
      const message = data.message;

      // 🆕 Save user message to database
      await saveMessageToDb(socket.project._id, data);

      const aiIsPresentInMessage = message.includes('@ai');
      socket.broadcast.to(socket.roomId).emit('project-message', data);

      if (aiIsPresentInMessage) {
        const prompt = message.replace('@ai', '');
        const result = await generateResult(prompt);

        const aiMessage = {
          message: result,
          sender: {
            _id: 'ai',
            email: 'AI'
          }
        };

        // 🆕 Save AI message to database
        await saveMessageToDb(socket.project._id, aiMessage);

        io.to(socket.roomId).emit('project-message', aiMessage);
      }
    } catch (error) {
      console.error('❌ Error handling project message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📋 Allowed origins:`, allowedOrigins);
});