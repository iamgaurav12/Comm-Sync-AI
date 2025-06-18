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
import { getWebContainer } from "../config/webContainer";

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

  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [fileTree, setFileTree] = useState({});

  const [currentFile, setCurrentFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);

  const [webContainer, setWebContainer] = useState(null);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [webContainerError, setWebContainerError] = useState(null);
  const [isWebContainerSupported, setIsWebContainerSupported] = useState(true);

  const [runProcess, setRunProcess] = useState(null);

  // Add ref to track if socket is initialized
  const socketInitialized = useRef(false);

  // Early return if no project
  if (!project) {
    return <div>Loading...</div>;
  }

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

  // Function to save messages to localStorage
  const saveMessagesToStorage = (messages) => {
    try {
      // Use in-memory storage as fallback if localStorage is not available
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
    // First load messages from localStorage immediately
    const cachedMessages = loadMessagesFromStorage();
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
    }

    // Then try to fetch from server
    axios
      .get(`/projects/get-messages/${project._id}`)
      .then((res) => {
        console.log("Fetched messages from server:", res.data.messages);
        const serverMessages = res.data.messages || [];
        
        // Merge server messages with cached messages (avoid duplicates)
        const mergedMessages = mergeMessages(cachedMessages, serverMessages);
        setMessages(mergedMessages);
        saveMessagesToStorage(mergedMessages);
      })
      .catch((err) => {
        console.log("Error fetching messages from server:", err);
        // If server fails, use cached messages
        if (cachedMessages.length === 0) {
          setMessages([]);
        }
      });
  }

  // Function to merge messages and avoid duplicates
  const mergeMessages = (cached, server) => {
    const allMessages = [...cached];
    
    server.forEach(serverMsg => {
      // Check if message already exists (simple check by content and sender)
      const exists = cached.some(cachedMsg => 
        cachedMsg.message === serverMsg.message && 
        cachedMsg.sender._id === serverMsg.sender._id &&
        Math.abs(new Date(cachedMsg.timestamp || 0) - new Date(serverMsg.timestamp || 0)) < 1000
      );
      
      if (!exists) {
        allMessages.push(serverMsg);
      }
    });
    
    // Sort by timestamp if available
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
      timestamp: new Date().toISOString(), // Add timestamp
    };
    
    // Add message to local state immediately for better UX
    const updatedMessages = [...messages, messageData];
    setMessages(updatedMessages);
    
    // Save to localStorage immediately
    saveMessagesToStorage(updatedMessages);
    
    // Send message via socket
    sendMessage("project-message", messageData);
    
    setMessage("");
  };

  function WriteAiMessage(message) {
    const messageObject = JSON.parse(message);

    return (
      <div className="overflow-auto bg-slate-950 text-white rounded-sm p-2">
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

  // Check if cross-origin isolation is enabled
  const checkCrossOriginIsolation = () => {
    return typeof window !== 'undefined' && window.crossOriginIsolated;
  };

  // Initialize WebContainer with error handling
  const initializeWebContainer = async () => {
    try {
      // Check if cross-origin isolation is supported
      if (!checkCrossOriginIsolation()) {
        setWebContainerError("WebContainer requires cross-origin isolation. Please ensure your server sends the following headers:\n- Cross-Origin-Embedder-Policy: require-corp\n- Cross-Origin-Opener-Policy: same-origin");
        setIsWebContainerSupported(false);
        return;
      }

      const container = await getWebContainer();
      setWebContainer(container);
      setWebContainerError(null);
      console.log("WebContainer initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WebContainer:", error);
      setWebContainerError(`Failed to initialize WebContainer: ${error.message}`);
      setIsWebContainerSupported(false);
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
          
          // Add AI message to state and save to localStorage
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, data];
            saveMessagesToStorage(updatedMessages);
            return updatedMessages;
          });
        } else {
          // For non-AI messages, check if it's from current user
          if (data.sender._id !== user._id.toString()) {
            // Only add if it's from another user (not current user)
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages, data];
              saveMessagesToStorage(updatedMessages);
              return updatedMessages;
            });
          }
          // If it's from current user, we already added it locally in send()
        }
      });
    }

    // Initialize WebContainer with error handling
    if (!webContainer && isWebContainerSupported) {
      initializeWebContainer();
    }

    // Fetch project data and messages
    fetchProjectData();
    fetchProjectMessages(); // Add this line to fetch messages on component mount

    axios
      .get("/users/all")
      .then((res) => {
        setUsers(res.data.users);
      })
      .catch((err) => {
        console.log(err);
      });

    // Cleanup function
    return () => {
      if (socketInitialized.current) {
        disconnectSocket();
        socketInitialized.current = false;
      }
    };
  }, [project?._id]); // Removed webContainer from dependencies

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

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  return (
    <main className="h-screen w-screen flex">
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        <header className="flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0">
          <button className="flex gap-2" onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="p-2"
          >
            <i className="ri-group-fill"></i>
          </button>
        </header>
        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender._id}-${index}-${msg.message.substring(0, 10)}`} // Better key
                className={`${
                  msg.sender._id === "ai" ? "max-w-80" : "max-w-52"
                } ${
                  msg.sender._id === user._id.toString() && "ml-auto"
                }  message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}
              >
                <small className="opacity-65 text-xs">{msg.sender.email}</small>
                <div className="text-sm">
                  {msg.sender._id === "ai" ? (
                    WriteAiMessage(msg.message)
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && send()}
              className="p-2 px-4 border-none outline-none flex-grow"
              type="text"
              placeholder="Enter message"
            />
            <button onClick={send} className="px-5 bg-slate-950 text-white">
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>
        <div
          className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${
            isSidePanelOpen ? "translate-x-0" : "-translate-x-full"
          } top-0`}
        >
          <header className="flex justify-between items-center px-4 p-2 bg-slate-200">
            <h1 className="font-semibold text-lg">Collaborators</h1>
            <button
              onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
              className="p-2"
            >
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            {project.users &&
              project.users.map((projectUser) => {
                return (
                  <div 
                    key={projectUser._id}
                    className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center"
                  >
                    <div className="aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                      <i className="ri-user-fill absolute"></i>
                    </div>
                    <h1 className="font-semibold text-lg">{projectUser.email}</h1>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="right bg-red-50 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file);
                  setOpenFiles([...new Set([...openFiles, file])]);
                }}
                className="tree-element cursor-pointer p-2 px-4 flex items-center gap-2 bg-slate-300 w-full"
              >
                <p className="font-semibold text-lg">{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink">
          <div className="top flex justify-between w-full">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 bg-slate-300 ${
                    currentFile === file ? "bg-slate-400" : ""
                  }`}
                >
                  <p className="font-semibold text-lg">{file}</p>
                </button>
              ))}
            </div>

            <div className="actions flex gap-2">
              {!isWebContainerSupported ? (
                <div className="text-red-600 text-sm p-2">
                  WebContainer not supported
                </div>
              ) : (
                <button
                  onClick={async () => {
                    if (!webContainer) {
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
                  className="p-2 px-4 bg-slate-600 text-white rounded disabled:bg-gray-400"
                  disabled={!webContainer}
                >
                  {webContainer ? "Run" : "Loading..."}
                </button>
              )}
            </div>
          </div>

          {/* Error message display */}
          {webContainerError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-2">
              <strong className="font-bold">WebContainer Error: </strong>
              <span className="block sm:inline whitespace-pre-line">{webContainerError}</span>
            </div>
          )}

          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {fileTree[currentFile] && (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
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
          <div className="flex min-w-96 flex-col h-full">
            <div className="address-bar">
              <input
                type="text"
                onChange={(e) => setIframeUrl(e.target.value)}
                value={iframeUrl}
                className="w-full p-2 px-4 bg-slate-200"
              />
            </div>
            <iframe src={iframeUrl} className="w-full h-full"></iframe>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2">
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map((modalUser) => (
                <div
                  key={modalUser._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${
                    Array.from(selectedUserId).includes(modalUser._id)
                      ? "bg-slate-200"
                      : ""
                  } p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(modalUser._id)}
                >
                  <div className="aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600">
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className="font-semibold text-lg">{modalUser.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={addCollaborators}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md"
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