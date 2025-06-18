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
    <main className="p-4">
      {/* Header with logout button */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
          {user && (
            <p className="text-gray-600 text-sm">Welcome back, {user.email}</p>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          <i className="ri-logout-box-line"></i>
          <span>Logout</span>
        </button>
      </header>

      <div className="projects flex flex-wrap gap-3">
        <button
          onClick={() => setIsModalOpen(true)}
          className="project p-4 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          New Project
          <i className="ri-add-line ml-2"></i>
        </button>

        {project.map((proj) => ( // Changed variable name to avoid confusion
          <div
            key={proj._id}
            onClick={() => {
              navigate(`/project`, {
                state: { project: proj }, // Use proj instead of project
              });
            }}
            className="project flex flex-col gap-2 cursor-pointer p-4 border border-slate-300 rounded-md min-w-52 hover:bg-slate-200 transition-colors"
          >
            <h2 className="font-semibold">{proj.name}</h2>

            <div className="flex gap-2 items-center">
              <p className="text-sm text-gray-600">
                <i className="ri-user-line mr-1"></i>
                Collaborators: {proj.users.length}
              </p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-md shadow-md w-1/3 max-w-md">
            <h2 className="text-xl mb-4 font-semibold">Create New Project</h2>
            <form onSubmit={createProject}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  onChange={(e) => setProjectName(e.target.value)}
                  value={projectName || ""} // Handle null case
                  type="text"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  onClick={() => {
                    setIsModalOpen(false);
                    setProjectName(""); // Reset form on cancel
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create
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