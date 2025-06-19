import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState(""); // Changed from null to empty string
  const [project, setProject] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/logout");
  };

  function createProject(e) {
    e.preventDefault();
    
    // Validate project name
    if (!projectName || projectName.trim() === "") {
      alert("Please enter a project name");
      return;
    }

    console.log({ projectName });

    axios
      .post("/projects/create", {
        name: projectName.trim(), // Trim whitespace
      })
      .then((res) => {
        console.log(res);
        setIsModalOpen(false);
        setProjectName("");
        fetchProjects();
      })
      .catch((error) => {
        console.log("Error creating project:", error);
        
        // Better error handling
        if (error.response) {
          console.log("Error data:", error.response.data);
          console.log("Error status:", error.response.status);
          alert(`Error: ${error.response.data.message || 'Failed to create project'}`);
        } else {
          alert("Network error. Please try again.");
        }
      });
  }

  function fetchProjects() {
    axios
      .get("/projects/all")
      .then((res) => {
        setProject(res.data.projects);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header with logout button */}
      <header className="flex justify-between items-center mb-8 bg-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            My Projects
          </h1>
          {user && (
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Welcome back, <span className="text-blue-400">{user.email}</span>
            </p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-xl hover:shadow-red-500/25 hover:from-red-500 hover:to-red-600 transition-all duration-300 transform hover:-translate-y-1 border border-red-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <i className="ri-logout-box-line text-lg relative z-10 group-hover:rotate-12 transition-transform duration-300"></i>
          <span className="font-medium relative z-10">Logout</span>
          <div className="absolute inset-0 rounded-xl bg-red-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-300"></div>
        </button>
      </header>

      {/* Projects Grid */}
      <div className="projects grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* New Project Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="group project flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-600 rounded-2xl hover:border-blue-500 hover:bg-slate-700/30 transition-all duration-300 min-h-48 bg-slate-800/30 backdrop-blur-sm hover:shadow-2xl hover:shadow-blue-500/10"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all duration-300">
            <i className="ri-add-line text-2xl text-white group-hover:rotate-90 transition-transform duration-300"></i>
          </div>
          <span className="text-slate-200 font-semibold text-lg group-hover:text-blue-400 transition-colors">
            New Project
          </span>
          <span className="text-slate-500 text-sm mt-1 group-hover:text-slate-400 transition-colors">Create a new project</span>
        </button>

        {/* Project Cards */}
        {project.map((proj) => (
          <div
            key={proj._id}
            onClick={() => {
              navigate(`/project`, {
                state: { project: proj },
              });
            }}
            className="project group flex flex-col gap-4 cursor-pointer p-6 bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 min-h-48 border border-slate-700/50 hover:border-blue-500/50 transform hover:-translate-y-2 hover:bg-slate-700/50"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
                <i className="ri-folder-3-line text-xl text-white"></i>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse shadow-lg shadow-green-400/50"></div>
            </div>
            
            <div className="flex-1">
              <h2 className="font-bold text-lg text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-2">
                {proj.name}
              </h2>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-slate-400">
                <div className="flex -space-x-1">
                  {[...Array(Math.min(proj.users.length, 3))].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-slate-800 flex items-center justify-center shadow-lg"
                    >
                      <i className="ri-user-line text-xs text-white"></i>
                    </div>
                  ))}
                  {proj.users.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-slate-800 flex items-center justify-center shadow-lg">
                      <span className="text-xs font-medium text-slate-200">
                        +{proj.users.length - 3}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-slate-300">
                  {proj.users.length} {proj.users.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              <i className="ri-arrow-right-line text-slate-500 group-hover:text-blue-400 group-hover:translate-x-2 transition-all duration-300"></i>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md z-50 p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-md mx-4 overflow-hidden backdrop-blur-xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
              <h2 className="text-xl font-bold text-white relative z-10">Create New Project</h2>
              <p className="text-blue-100 text-sm mt-1 relative z-10">Start your next amazing project</p>
            </div>
            
            {/* Modal Body */}
            <form onSubmit={createProject} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Project Name
                </label>
                <div className="relative">
                  <input
                    onChange={(e) => setProjectName(e.target.value)}
                    value={projectName || ""}
                    type="text"
                    className="w-full p-4 border-2 border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-slate-700/50 focus:bg-slate-700 text-slate-100 placeholder-slate-400 backdrop-blur-sm"
                    placeholder="Enter your project name..."
                    required
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <i className="ri-edit-2-line text-slate-400"></i>
                  </div>
                </div>
              </div>
              
              {/* Modal Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  className="flex-1 px-4 py-3 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 transition-all duration-200 font-medium border border-slate-600 hover:border-slate-500"
                  onClick={() => {
                    setIsModalOpen(false);
                    setProjectName("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-500 hover:to-purple-600 transition-all duration-200 font-medium shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transform hover:-translate-y-0.5"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;