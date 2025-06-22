import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Intro = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: "ri-code-s-slash-line",
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live code editing and instant synchronization across all team members."
    },
    {
      icon: "ri-terminal-box-line",
      title: "Integrated Development",
      description: "Built-in code editor with syntax highlighting, file management, and instant preview capabilities."
    },
    {
      icon: "ri-chat-3-line",
      title: "Smart Communication",
      description: "AI-powered chat assistance combined with team messaging for enhanced productivity."
    },
    {
      icon: "ri-play-circle-line",
      title: "Live Preview",
      description: "See your changes instantly with our integrated preview system and WebContainer technology."
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-950 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gray-600/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Floating Code Elements */}
        <div className="absolute top-20 left-10 text-gray-600/20 text-6xl animate-bounce delay-300">
          <i className="ri-code-s-slash-line"></i>
        </div>
        <div className="absolute bottom-32 right-20 text-gray-600/20 text-4xl animate-bounce delay-700">
          <i className="ri-terminal-box-line"></i>
        </div>
        <div className="absolute top-1/3 right-10 text-gray-600/20 text-5xl animate-bounce delay-1000">
          <i className="ri-git-branch-line"></i>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
            <i className="ri-code-s-slash-line text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Comm-Sync-AI</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-gray-300 hover:text-gray-100 transition-colors duration-200 font-medium"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-8">
        {/* Hero Section */}
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-700/50 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">Made By Gaurav & Vaibhav</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-gray-100 mb-6 leading-tight">
              Code Together,
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Build Faster
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
              A full-stack collaborative development platform showcasing real-time code editing, 
              WebSocket communication, and modern web technologies in a single project demonstration.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <i className="ri-code-s-slash-line text-xl"></i>
              Explore Project
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="px-8 py-4 bg-gray-800/50 backdrop-blur-sm text-gray-100 rounded-xl hover:bg-gray-700/50 transition-all duration-200 font-semibold border border-gray-700/50 hover:border-gray-600 flex items-center justify-center gap-2"
            >
              <i className="ri-eye-line text-xl"></i>
              Register to See Demo
            </button>
          </div>
        </div>

        {/* Features Showcase */}
        <div className="w-full max-w-6xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/30 p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Feature Display */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <i className={`${features[currentFeature].icon} text-3xl text-white`}></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-100">{features[currentFeature].title}</h3>
                  </div>
                </div>
                
                <p className="text-gray-400 text-lg leading-relaxed">
                  {features[currentFeature].description}
                </p>

                {/* Feature Navigation Dots */}
                <div className="flex gap-2">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentFeature 
                          ? 'bg-blue-600 w-8' 
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Mock Code Editor Preview */}
              <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 shadow-xl">
                {/* Editor Header */}
                <div className="bg-gray-700 px-4 py-3 flex items-center gap-2 border-b border-gray-600">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="ml-4 text-gray-300 text-sm font-medium">server.js</div>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">2 collaborators online</span>
                  </div>
                </div>
                
                {/* Editor Content */}
                <div className="p-4 space-y-2 font-mono text-sm">
                  <div className="text-purple-400">
                    <span className="text-gray-500">1</span>
                    <span className="ml-4">const express = require('express');</span>
                  </div>
                  <div className="text-purple-400">
                    <span className="text-gray-500">2</span>
                    <span className="ml-4">const cors = require('cors');</span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-gray-500">3</span>
                    <span className="ml-4"></span>
                  </div>
                  <div className="text-yellow-400">
                    <span className="text-gray-500">4</span>
                    <span className="ml-4">const app = express();</span>
                  </div>
                  <div className="text-blue-400">
                    <span className="text-gray-500">5</span>
                    <span className="ml-4">const PORT = process.env.PORT || 3000;</span>
                    <span className="bg-green-600/30 border-l-2 border-green-500 ml-2 px-1 text-xs">Gaurav is editing</span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-gray-500">6</span>
                    <span className="ml-4"></span>
                  </div>
                  <div className="text-green-400">
                    <span className="text-gray-500">7</span>
                    <span className="ml-4">app.use(cors());</span>
                  </div>
                  <div className="text-green-400">
                    <span className="text-gray-500">8</span>
                    <span className="ml-4">app.use(express.json());</span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-gray-500">9</span>
                    <span className="ml-4"></span>
                  </div>
                  <div className="text-cyan-400">
                    <span className="text-gray-500">10</span>
                    <span className="ml-4">app.get('/', (req, res) =&gt; {`{`}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-500">11</span>
                    <span className="ml-4">  res.json({`{ message: 'Hello World!' }`});</span>
                    <span className="bg-blue-600/30 border-l-2 border-blue-500 ml-2 px-1 text-xs">Vaibhav added this</span>
                  </div>
                  <div className="text-cyan-400">
                    <span className="text-gray-500">12</span>
                    <span className="ml-4">{`});`}</span>
                  </div>
                  <div className="text-gray-400">
                    <span className="text-gray-500">13</span>
                    <span className="ml-4"></span>
                  </div>
                  <div className="text-orange-400">
                    <span className="text-gray-500">14</span>
                    <span className="ml-4">app.listen(PORT, () =&gt; {`{`}</span>
                  </div>
                  <div className="text-gray-300">
                    <span className="text-gray-500">15</span>
                    <span className="ml-4">  console.log(`Server running on port ${`$\{PORT\}`}`);</span>
                  </div>
                  <div className="text-orange-400">
                    <span className="text-gray-500">16</span>
                    <span className="ml-4">{`});`}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack Section */}
        <div className="w-full max-w-4xl mx-auto mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { tech: "Express.js", label: "Backend Framework", icon: "ri-server-line" },
              { tech: "WebSocket", label: "Real-time Sync", icon: "ri-wifi-line" },
              { tech: "Node.js", label: "Runtime Environment", icon: "ri-javascript-line" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <i className={`${item.icon} text-2xl text-gray-300`}></i>
                </div>
                <div className="text-2xl font-bold text-gray-100 mb-2">{item.tech}</div>
                <div className="text-gray-400">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-gray-800">
        <p className="text-gray-500">
          © 2025 Comm-Sync-AI. Built for developers, by developers.
        </p>
      </footer>
    </div>
  );
};

export default Intro;