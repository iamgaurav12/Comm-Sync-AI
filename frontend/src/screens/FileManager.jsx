import React, { useState, useEffect, useCallback } from "react";
import FileUpload from "../components/FileUpload";

const FileManager = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingFiles, setDeletingFiles] = useState(new Set());
  const [notification, setNotification] = useState(null);

  // Get API URL from environment variables
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_URL}/api/files/list`, {
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format');
      }

      const result = await response.json();

      if (result.success) {
        setFiles(result.files || []);
        setError(null);
      } else {
        throw new Error(result.message || 'Failed to fetch files');
      }
    } catch (err) {
      console.error("Fetch files error:", err);
      
      let errorMessage = 'Error fetching files';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  const deleteFile = async (fileKey) => {
    if (!window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      return;
    }

    setDeletingFiles(prev => new Set(prev).add(fileKey));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `${API_URL}/api/files/delete/${encodeURIComponent(fileKey)}`,
        {
          method: "DELETE",
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned invalid response format');
      }

      const result = await response.json();

      if (result.success) {
        setFiles(prevFiles => prevFiles.filter((file) => file.key !== fileKey));
        showNotification("File deleted successfully", "success");
      } else {
        throw new Error(result.message || 'Failed to delete file');
      }
    } catch (err) {
      console.error("Delete file error:", err);
      
      let errorMessage = 'Error deleting file';
      
      if (err.name === 'AbortError') {
        errorMessage = 'Delete request timed out. Please try again.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to server. Please check your connection.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showNotification(errorMessage, "error");
    } finally {
      setDeletingFiles(prev => {
        const next = new Set(prev);
        next.delete(fileKey);
        return next;
      });
    }
  };

  const handleUploadSuccess = (result) => {
    console.log("Upload successful:", result);
    showNotification("File(s) uploaded successfully!", "success");
    // Refresh the file list after successful upload
    fetchFiles();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      return "Invalid date";
    }
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || '';

    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      txt: "📄",
      zip: "🗜️",
      rar: "🗜️",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      webp: "🖼️",
    };

    return iconMap[extension] || "📎";
  };

  const getDisplayFileName = (fileKey) => {
    try {
      // Remove path and timestamp prefix if it exists
      const fileName = fileKey.split("/").pop();
      const parts = fileName.split("-");
      
      // If filename follows timestamp-originalname pattern, extract original name
      if (parts.length >= 3 && /^\d+$/.test(parts[0])) {
        return parts.slice(2).join("-");
      }
      
      return fileName;
    } catch (err) {
      return fileKey;
    }
  };

  const handleDownload = async (file) => {
    try {
      // For external URLs (like S3), we can link directly
      if (file.url.startsWith('http')) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = getDisplayFileName(file.key);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For local files, use the API endpoint
        window.open(`${API_URL}/api/files/download/${encodeURIComponent(file.key)}`, '_blank');
      }
    } catch (err) {
      console.error('Download error:', err);
      showNotification('Error downloading file', 'error');
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Auto-refresh files every 30 seconds if no errors
  useEffect(() => {
    if (!error && !loading) {
      const interval = setInterval(fetchFiles, 30000);
      return () => clearInterval(interval);
    }
  }, [error, loading, fetchFiles]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          File Management
        </h1>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-md ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex justify-between items-center">
              <span>{notification.message}</span>
              <button 
                onClick={() => setNotification(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Single File Upload</h2>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">
              Multiple Files Upload
            </h2>
            <FileUpload multiple={true} onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>

        {/* File Manager Section */}
        <div className="w-full max-w-6xl mx-auto bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                File Manager ({files.length} files)
              </h3>
              <button
                onClick={fetchFiles}
                disabled={loading}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading files...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="text-red-800">{error}</div>
                  <button
                    onClick={fetchFiles}
                    className="ml-4 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">📁</div>
                <p>No files uploaded yet</p>
                <p className="text-sm mt-2">Upload some files using the forms above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {files.map((file, index) => (
                  <div
                    key={file.key || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0">
                        {getFileIcon(file.key)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {getDisplayFileName(file.key)}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.size)} • {formatDate(file.lastModified)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                        title="Open in new tab"
                      >
                        View
                      </a>
                      <button
                        onClick={() => handleDownload(file)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        title="Download file"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => deleteFile(file.key)}
                        disabled={deletingFiles.has(file.key)}
                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete file"
                      >
                        {deletingFiles.has(file.key) ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManager;