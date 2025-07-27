import React, { useState, useEffect, useContext, useRef } from "react";
import { UserContext } from "../context/user.context";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../config/axios";
import {
  initializeSocket,
  receiveMessage,
  sendMessage,
  disconnectSocket,
} from "../config/socket";
import Markdown from "markdown-to-jsx";
import hljs from "highlight.js";

// File Upload Component for Chat
const ChatFileUpload = ({ onFileUpload, isUploading }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files) => {
    if (files && files.length > 0) {
      onFileUpload(Array.from(files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar,.js,.jsx,.ts,.tsx,.html,.css,.json,.md"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={`p-2 rounded-lg transition-all duration-200 ${
          isUploading 
            ? "text-gray-500 cursor-not-allowed" 
            : "text-gray-400 hover:text-blue-400 hover:bg-gray-700/50"
        }`}
        title="Upload files"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <i className="ri-attachment-2 text-lg"></i>
        )}
      </button>

      {/* Drag and Drop Overlay */}
      {dragOver && (
        <div
          className="fixed inset-0 bg-blue-600/20 backdrop-blur-sm flex items-center justify-center z-50"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-gray-800 border-2 border-dashed border-blue-400 rounded-xl p-8 text-center">
            <i className="ri-upload-cloud-2-line text-4xl text-blue-400 mb-4"></i>
            <p className="text-blue-400 font-medium">Drop files here to upload</p>
          </div>
        </div>
      )}
    </>
  );
};

// Enhanced File Message Component
const FileMessage = ({ file, sender, isOwn, onDelete, currentUser }) => {
  const getFileIcon = (fileName) => {
    const extension = fileName?.split(".")?.pop()?.toLowerCase() || '';
    const iconMap = {
      pdf: "📄", doc: "📝", docx: "📝", txt: "📄",
      zip: "🗜️", rar: "🗜️",
      jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
      js: "📜", jsx: "⚛️", ts: "📘", tsx: "⚛️",
      html: "🌐", css: "🎨", json: "📋", md: "📖"
    };
    return iconMap[extension] || "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDownload = async () => {
    try {
      if (file.fileUrl || file.url) {
        const downloadUrl = file.fileUrl || file.url;
        
        // Use fetch to download the file
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = file.originalName || file.filename || file.name || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: try opening in new tab
      if (file.fileUrl || file.url) {
        window.open(file.fileUrl || file.url, '_blank');
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Get API URL from environment variables
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Delete from server using the fileKey
      const fileKey = file.fileKey || file.key;
      if (fileKey) {
        const response = await fetch(`${API_URL}/api/files/delete/${encodeURIComponent(fileKey)}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete file from server');
        }
      }
      
      // Call the delete callback to remove from UI
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  return (
    <div className={`file-message border border-gray-600 rounded-lg p-3 max-w-sm ${
      isOwn ? "bg-blue-700/30" : "bg-gray-700/50"
    }`}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getFileIcon(file.originalName || file.filename || file.name)}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{file.originalName || file.filename || file.name}</p>
          <p className="text-xs text-gray-400">{formatFileSize(file.fileSize || file.size)}</p>
        </div>
      </div>
      
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDownload}
          className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs font-medium transition-colors"
          title="Download file"
        >
          <i className="ri-download-line mr-1"></i>
          Download
        </button>
        {(file.fileUrl || file.url) && (
          <button
            onClick={() => window.open(file.fileUrl || file.url, '_blank')}
            className="flex-1 px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-xs font-medium transition-colors"
            title="Open in new tab"
          >
            <i className="ri-external-link-line mr-1"></i>
            Open
          </button>
        )}
        {/* Show delete button only for file owner */}
        {isOwn && (
          <button
            onClick={handleDelete}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs font-medium transition-colors"
            title="Delete file"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        )}
      </div>
    </div>
  );
};

function SyntaxHighlightedCode(props) {
  const ref = useRef(null);

  React.useEffect(() => {
    if (ref.current && props.className?.includes("lang-") && window.hljs) {
      window.hljs.highlightElement(ref.current);
      ref.current.removeAttribute("data-highlighted");
    }
  }, [props.className, props.children]);

  return <code {...props} ref={ref} />;
}

const Project = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if project data exists, redirect if not
  useEffect(() => {
    if (!location.state?.project) {
      navigate("/");
      return;
    }
  }, [location.state, navigate]);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(new Set());
  const [project, setProject] = useState(location.state?.project || null);
  const [message, setMessage] = useState("");
  const { user } = useContext(UserContext);
  const messageBox = useRef(null);

  // File upload states
  const [isFileUploading, setIsFileUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [webContainerError, setWebContainerError] = useState(null);
  const [isWebContainerSupported, setIsWebContainerSupported] = useState(true);
  const [webContainerLoading, setWebContainerLoading] = useState(false);

  const [runProcess, setRunProcess] = useState(null);

  // Add ref to track if socket is initialized
  const socketInitialized = useRef(false);

  // Early return if no project
  if (!project) {
    return <div className="h-screen w-screen bg-gray-900 text-white flex items-center justify-center">Loading...</div>;
  }

  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Function to delete a message (for file messages)
  const deleteMessage = (messageIndex) => {
    const updatedMessages = messages.filter((_, index) => index !== messageIndex);
    setMessages(updatedMessages);
    saveMessagesToStorage(updatedMessages);
  };

  // File upload handler
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    setIsFileUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/files/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const result = await response.json();
        return {
          ...result.file,
          originalName: file.name,
          type: 'file'
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Send file messages to chat
      uploadedFiles.forEach(file => {
        const fileMessage = {
          message: `📎 Shared file: ${file.originalName}`,
          sender: user,
          timestamp: new Date().toISOString(),
          file: file,
          type: 'file'
        };

        const updatedMessages = [...messages, fileMessage];
        setMessages(updatedMessages);
        saveMessagesToStorage(updatedMessages);
        sendMessage("project-message", fileMessage);
      });

      setUploadProgress(100);
      
    } catch (error) {
      console.error('File upload error:', error);
      // Could add error notification here
    } finally {
      setIsFileUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleUserClick = (id) => {
    setSelectedUserId((prevSelectedUserId) => {
      const newSelectedUserId = new Set(prevSelectedUserId);
      if (newSelectedUserId.has(id)) {
        newSelectedUserId.delete(id);
      } else {
        newSelectedUserId.add(id);
      }
      return newSelectedUserId;
    });
  };

  function addCollaborators() {
    axios
      .put("/projects/add-user", {
        projectId: project._id,
        users: Array.from(selectedUserId),
      })
      .then((res) => {
        console.log(res.data);
        setIsModalOpen(false);
        setSelectedUserId(new Set());
        fetchProjectData();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Function to get localStorage key for project messages
  const getMessagesStorageKey = () => `project_messages_${project._id}`;

  // Function to save messages to localStorage (with fallback)
  const saveMessagesToStorage = (messages) => {
    try {
      if (typeof Storage !== "undefined") {
        localStorage.setItem(getMessagesStorageKey(), JSON.stringify(messages));
      }
    } catch (error) {
      console.error("Error saving messages to localStorage:", error);
    }
  };

  // Function to load messages from localStorage
  const loadMessagesFromStorage = () => {
    try {
      if (typeof Storage !== "undefined") {
        const storedMessages = localStorage.getItem(getMessagesStorageKey());
        return storedMessages ? JSON.parse(storedMessages) : [];
      }
      return [];
    } catch (error) {
      console.error("Error loading messages from localStorage:", error);
      return [];
    }
  };

  // Add function to fetch messages from server
  function fetchProjectMessages() {
    const cachedMessages = loadMessagesFromStorage();
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
    }

    axios
      .get(`/projects/get-messages/${project._id}`)
      .then((res) => {
        console.log("Fetched messages from server:", res.data.messages);
        const serverMessages = res.data.messages || [];
        
        const mergedMessages = mergeMessages(cachedMessages, serverMessages);
        setMessages(mergedMessages);
        saveMessagesToStorage(mergedMessages);
      })
      .catch((err) => {
        console.log("Error fetching messages from server:", err);
        if (cachedMessages.length === 0) {
          setMessages([]);
        }
      });
  }

  // Function to merge messages and avoid duplicates
  const mergeMessages = (cached, server) => {
    const allMessages = [...cached];
    
    server.forEach(serverMsg => {
      const exists = cached.some(cachedMsg => 
        cachedMsg.message === serverMsg.message && 
        cachedMsg.sender._id === serverMsg.sender._id &&
        Math.abs(new Date(cachedMsg.timestamp || 0) - new Date(serverMsg.timestamp || 0)) < 1000
      );
      
      if (!exists) {
        allMessages.push(serverMsg);
      }
    });
    
    return allMessages.sort((a, b) => {
      const aTime = new Date(a.timestamp || 0);
      const bTime = new Date(b.timestamp || 0);
      return aTime - bTime;
    });
  };

  const send = () => {
    if (!message.trim()) return;
    
    const messageData = {
      message,
      sender: user,
      timestamp: new Date().toISOString(),
    };
    
    const updatedMessages = [...messages, messageData];
    setMessages(updatedMessages);
    
    saveMessagesToStorage(updatedMessages);
    
    sendMessage("project-message", messageData);
    
    setMessage("");
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);

    return (
      <div className="bg-gray-800 text-gray-100 rounded-lg p-3 border border-gray-700">
        <Markdown
          children={messageObject.text}
          options={{
            overrides: {
              code: SyntaxHighlightedCode,
            },
          }}
        />
      </div>
    );
  }

  function fetchProjectData() {
    axios
      .get(`/projects/get-project/${project._id}`)
      .then((res) => {
        console.log(res.data.project);
        setProject(res.data.project);
        setFileTree(res.data.project.fileTree || {});
      })
      .catch((err) => {
        console.log(err);
      });
  }

  // Enhanced cross-origin isolation check
  const checkCrossOriginIsolation = () => {
    if (typeof window === 'undefined') return false;

    if (!window.isSecureContext) {
      setWebContainerError("WebContainer requires a secure context (HTTPS). Please ensure your site is served over HTTPS.");
      return false;
    }

    if (!window.crossOriginIsolated) {
      setWebContainerError(`WebContainer requires cross-origin isolation. 

Current status:
- Secure Context: ${window.isSecureContext ? '✅' : '❌'}
- Cross-Origin Isolated: ${window.crossOriginIsolated ? '✅' : '❌'}

Your server needs to send these headers:
- Cross-Origin-Embedder-Policy: require-corp
- Cross-Origin-Opener-Policy: same-origin

Please check your server configuration.`);
      return false;
    }

    return true;
  };

  // Enhanced WebContainer initialization
  const initializeWebContainer = async () => {
    if (webContainerLoading || webContainer) return;
    
    setWebContainerLoading(true);
    setWebContainerError(null);

    try {
      if (typeof SharedArrayBuffer === 'undefined') {
        throw new Error("SharedArrayBuffer is not supported in this browser");
      }

      if (!checkCrossOriginIsolation()) {
        setIsWebContainerSupported(false);
        setWebContainerLoading(false);
        return;
      }

      const { WebContainer } = await import('@webcontainer/api');
      
      console.log("Initializing WebContainer...");
      const container = await WebContainer.boot();
      
      setWebContainer(container);
      setIsWebContainerSupported(true);
      setWebContainerError(null);
      console.log("WebContainer initialized successfully");
      
    } catch (error) {
      console.error("Failed to initialize WebContainer:", error);
      
      let errorMessage = `Failed to initialize WebContainer: ${error.message}`;
      
      if (error.message.includes('SharedArrayBuffer')) {
        errorMessage += "\n\nThis usually means cross-origin isolation is not properly configured.";
      }
      
      setWebContainerError(errorMessage);
      setIsWebContainerSupported(false);
    } finally {
      setWebContainerLoading(false);
    }
  };

  useEffect(() => {
    if (!project) return;

    // Prevent duplicate socket initialization
    if (!socketInitialized.current) {
      initializeSocket(project._id);
      socketInitialized.current = true;

      receiveMessage("project-message", (data) => {
        console.log("Received message:", data);

        if (data.sender._id === "ai") {
          const messageData = JSON.parse(data.message);
          console.log(messageData);

          if (webContainer && messageData.fileTree) {
            webContainer.mount(messageData.fileTree).catch(err => {
              console.error("Failed to mount file tree:", err);
            });
          }

          if (messageData.fileTree) {
            setFileTree(messageData.fileTree || {});
          }
          
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, data];
            saveMessagesToStorage(updatedMessages);
            return updatedMessages;
          });
        } else {
          if (data.sender._id !== user._id.toString()) {
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, data];
              saveMessagesToStorage(updatedMessages);
              return updatedMessages;
            });
          }
        }
      });
    }

    // Initialize WebContainer
    if (!webContainer && isWebContainerSupported && !webContainerLoading) {
      initializeWebContainer();
    }

    fetchProjectData();
    fetchProjectMessages();

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });

    return () => {
      if (socketInitialized.current) {
        disconnectSocket();
        socketInitialized.current = false;
      }
    };
  }, [project?._id]);

  function saveFileTree(ft) {
    axios
      .put("/projects/update-file-tree", {
        projectId: project._id,
        fileTree: ft,
      })
      .then((res) => {
        console.log(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function scrollToBottom() {
    if (messageBox.current) {
      messageBox.current.scrollTop = messageBox.current.scrollHeight;
    }
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  return (
    <main className="h-screen w-screen flex bg-gray-900">
      <section className="left relative flex flex-col h-screen min-w-96 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700">
        <header className="flex justify-between items-center p-3 px-4 w-full bg-gray-800/90 backdrop-blur-sm absolute z-10 top-0 border-b border-gray-700 shadow-lg">
          <button className="flex gap-2 items-center text-blue-400 hover:text-blue-300 hover:bg-gray-700/50 px-3 py-2 rounded-lg transition-all duration-200" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill"></i>
            <p className="font-medium">Add collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          >
            <i className="ri-group-fill text-lg"></i>
          </button>
        </header>
        
        <div className="conversation-area pt-16 pb-20 flex-grow flex flex-col h-full relative">
          {/* Upload Progress Bar */}
          {isFileUploading && (
            <div className="absolute top-0 left-0 right-0 bg-gray-800 border-b border-gray-700 p-2 z-10">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <i className="ri-upload-line"></i>
                <span>Uploading files...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div
            ref={messageBox}
            className={`message-box p-4 flex-grow flex flex-col gap-3 overflow-auto max-h-full scrollbar-hide ${
              isFileUploading ? 'pt-16' : ''
            }`}
          >
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender._id}-${index}-${msg.message.substring(0, 10)}`}
                className={`flex ${msg.sender._id === user._id.toString() ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-md ${
                    msg.sender._id === "ai" ? "max-w-lg" : ""
                  } message p-3 rounded-lg ${
                    msg.sender._id === user._id.toString() 
                      ? "bg-blue-600 text-white" 
                      : msg.sender._id === "ai" 
                        ? "bg-gray-800 text-gray-100 border border-gray-700" 
                        : "bg-gray-700 text-gray-100"
                  }`}
                >
                  <div className={`text-xs mb-1 ${
                    msg.sender._id === user._id.toString() 
                      ? "text-blue-100" 
                      : "text-gray-400"
                  }`}>
                    {msg.sender.email}
                  </div>
                  <div className="text-sm">
                    {msg.sender._id === "ai" ? (
                      WriteAiMessage(msg.message)
                    ) : msg.type === 'file' && msg.file ? (
                      <FileMessage 
                        file={msg.file} 
                        sender={msg.sender}
                        isOwn={msg.sender._id === user._id.toString()}
                        onDelete={() => deleteMessage(index)}
                        currentUser={user}
                      />
                    ) : (
                      <p>{msg.message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0 bg-gray-800 border-t border-gray-700 shadow-lg">
            <ChatFileUpload 
              onFileUpload={handleFileUpload}
              isUploading={isFileUploading}
            />
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && send()}
              className="p-4 border-none outline-none flex-grow bg-gray-800 text-gray-100 placeholder-gray-400"
              type="text"
              placeholder="Type your message or upload files..."
            />
            <button onClick={send} className="px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-gray-800/95 backdrop-blur-sm absolute transition-all duration-300 ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0 border-r border-gray-700 shadow-xl`}
        >
          <header className="flex justify-between items-center px-4 p-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-1 p-2">
            {project.users &&
              project.users.map((projectUser) => {
                return (
                  <div 
                    key={projectUser._id}
                    className="user cursor-pointer hover:bg-gray-700/50 p-3 rounded-lg flex gap-3 items-center transition-all duration-200"
                  >
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-medium text-gray-200">{projectUser.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right bg-gray-900 flex-grow h-full flex">
        {/* Rest of your existing code for the right section... */}
        <div className="explorer h-full max-w-64 min-w-52 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-gray-700">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element cursor-pointer p-3 px-4 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 w-full border-b border-gray-700 transition-all duration-200 text-left"
              >
                <i className="ri-file-code-line text-blue-400"></i>
                <p className="font-medium text-gray-200">{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink bg-gray-900">
          <div className="top flex justify-between w-full bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-3 px-4 flex items-center w-fit gap-2 border-r border-gray-600 transition-all duration-200 ${
                    currentFile === file ? "bg-gray-900 text-blue-400 shadow-sm" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <i className="ri-file-code-line text-sm"></i>
                  <p className="font-medium">{file}</p>
                </button>
              ))}
            </div>

            <div className="actions flex gap-2 p-2">
              <button
                onClick={async () => {
                  if (!webContainer) {
                    if (!isWebContainerSupported) {
                      alert("WebContainer is not supported in this environment");
                      return;
                    }
                    console.error("WebContainer not initialized");
                    return;
                  }
                  
                  try {
                    await webContainer.mount(fileTree);

                    const installProcess = await webContainer.spawn("npm", [
                      "install",
                    ]);

                    installProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );

                    if (runProcess) {
                      runProcess.kill();
                    }

                    let tempRunProcess = await webContainer.spawn("npm", [
                      "start",
                    ]);

                    tempRunProcess.output.pipeTo(
                      new WritableStream({
                        write(chunk) {
                          console.log(chunk);
                        },
                      })
                    );

                    setRunProcess(tempRunProcess);

                    webContainer.on("server-ready", (port, url) => {
                      console.log(port, url);
                      setIframeUrl(url);
                    });
                  } catch (error) {
                    console.error("Error running project:", error);
                    setWebContainerError(`Error running project: ${error.message}`);
                  }
                }} 
                className="p-2 px-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm"
                disabled={!webContainer || webContainerLoading}
              >
                {webContainerLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : webContainer ? (
                  <div className="flex items-center gap-2">
                    <i className="ri-play-fill"></i>
                    <span>Run</span>
                  </div>
                ) : (
                  "WebContainer Unavailable"
                )}
              </button>
            </div>
          </div>

          {/* Enhanced error message display */}
          {webContainerError && (
            <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg m-3 shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <i className="ri-error-warning-line text-red-400 text-xl"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-red-100">WebContainer Error</h3>
                  <div className="mt-2 text-sm whitespace-pre-line">{webContainerError}</div>
                  {!isWebContainerSupported && (
                    <div className="mt-3">
                      <button 
                        onClick={initializeWebContainer}
                        className="text-sm bg-red-700 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors duration-200"
                      >
                        Retry Initialization
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {fileTree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-gray-900">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText;
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent,
                          },
                        },
                      };
                      setFileTree(ft);
                      saveFileTree(ft);
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(
                        "javascript",
                        fileTree[currentFile].file.contents
                      ).value,
                    }}
                    style={{
                      whiteSpace: "pre-wrap",
                      paddingBottom: "25rem",
                      counterSet: "line-numbering",
                    }}
                  />
                </pre>
              </div>
            )}
          </div>
        </div>

        {iframeUrl && webContainer && (
          <div className="flex min-w-96 flex-col h-full border-l border-gray-700">
            <div className="address-bar bg-gray-800 border-b border-gray-700">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-3 px-4 bg-gray-900 border-none outline-none text-gray-200 placeholder-gray-500"
                placeholder="Preview URL"
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full bg-white"></iframe>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl shadow-2xl w-96 max-w-full relative border border-gray-700">
            <header className="flex justify-between items-center mb-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-t-xl">
              <h2 className="text-xl font-semibold">Select Users</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-1 mb-16 max-h-96 overflow-auto p-4 pt-0">
              {users.map((modalUser) => (
                <div
                  key={modalUser._id}
                  className={`user cursor-pointer hover:bg-gray-700 ${
                    Array.from(selectedUserId).includes(modalUser._id)
                      ? "bg-gray-700 border-blue-500"
                      : "border-gray-600"
                  } p-3 flex gap-3 items-center rounded-lg border transition-all duration-200`}
                  onClick={() => handleUserClick(modalUser._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-4 text-white bg-gradient-to-r from-blue-600 to-indigo-700 shadow-md">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-medium text-gray-200">{modalUser.email}</h1>
                  {Array.from(selectedUserId).includes(modalUser._id) && (
                    <i className="ri-check-line text-blue-400 ml-auto"></i>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
            >
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Project;