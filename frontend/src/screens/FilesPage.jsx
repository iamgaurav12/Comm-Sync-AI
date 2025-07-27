import React from 'react';
import FileUpload from '../components/FileUpload';
import FileManager from './FileManager';

const FilesPage = () => {
  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result);
    // You might want to trigger a refresh of the FileManager here
    window.location.reload(); // Simple refresh for now
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">File Management</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold mb-4">Single File Upload</h2>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Multiple Files Upload</h2>
            <FileUpload multiple={true} onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
        
        <FileManager />
      </div>
    </div>
  );
};

export default FilesPage;