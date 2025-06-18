import socket from "socket.io-client";

let socketInstance = null;

export const initializeSocket = (projectId) => {
  // Disconnect existing socket if it exists
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  socketInstance = socket(import.meta.env.VITE_API_URL, {
    auth: {
      token: localStorage.getItem("token"),
    },
    query: {
      projectId,
    },
  });

  return socketInstance;
};

export const receiveMessage = (eventName, cb) => {
  if (socketInstance) {
    // Remove existing listeners first to prevent duplicates
    socketInstance.off(eventName);
    socketInstance.on(eventName, cb);
  }
};

export const sendMessage = (eventName, data) => {
  if (socketInstance) {
    socketInstance.emit(eventName, data);
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const getSocketInstance = () => {
  return socketInstance;
};