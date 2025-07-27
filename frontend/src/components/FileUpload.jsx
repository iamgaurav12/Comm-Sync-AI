import React, { useState } from 'react';

const FileUpload = ({ onUploadSuccess, multiple = false, maxFileSize = 10 * 1024 * 1024 }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [errors, setErrors] = useState([]);

    // Get API URL from environment variables
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const validateFiles = (files) => {
        const validationErrors = [];
        const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/zip',
            'application/x-rar-compressed'
        ];

        files.forEach((file, index) => {
            // Check file type
            if (!allowedTypes.includes(file.type)) {
                validationErrors.push(`File ${file.name}: Unsupported file type`);
            }

            // Check file size
            if (file.size > maxFileSize) {
                validationErrors.push(`File ${file.name}: File size exceeds ${formatFileSize(maxFileSize)} limit`);
            }

            // Check for empty files
            if (file.size === 0) {
                validationErrors.push(`File ${file.name}: File is empty`);
            }
        });

        return validationErrors;
    };

    const handleFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const validationErrors = validateFiles(files);
        
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setSelectedFiles([]);
            return;
        }

        setErrors([]);
        setSelectedFiles(files);
    };

    const simulateProgress = () => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) {
                clearInterval(interval);
                setUploadProgress(90);
            } else {
                setUploadProgress(progress);
            }
        }, 200);
        return interval;
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setErrors(['Please select at least one file']);
            return;
        }

        setUploading(true);
        setUploadProgress(0);
        setErrors([]);

        const progressInterval = simulateProgress();

        try {
            const formData = new FormData();
            
            if (multiple) {
                selectedFiles.forEach(file => {
                    formData.append('files', file);
                });
            } else {
                formData.append('file', selectedFiles[0]);
            }

            const endpoint = multiple ? '/api/files/upload-multiple' : '/api/files/upload';
            const url = `${API_URL}${endpoint}`;
            
            console.log('Uploading to:', url);
            console.log('Files:', selectedFiles.map(f => ({ name: f.name, size: f.size })));
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            clearInterval(progressInterval);

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned invalid response format');
            }

            const result = await response.json();
            console.log('Upload result:', result);

            if (result.success) {
                setUploadProgress(100);
                if (onUploadSuccess) {
                    onUploadSuccess(result);
                }
                setSelectedFiles([]);
                // Clear the file input
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) fileInput.value = '';
                
                // Success notification could be handled by parent component
                console.log('File(s) uploaded successfully!');
            } else {
                throw new Error(result.message || 'Upload failed');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error('Upload error:', error);
            
            let errorMessage = 'An error occurred while uploading';
            
            if (error.name === 'AbortError') {
                errorMessage = 'Upload timed out. Please try again.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to server. Please check your connection.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setErrors([errorMessage]);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const removeFile = (indexToRemove) => {
        setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
        setErrors([]);
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">
                {multiple ? 'Upload Files' : 'Upload File'}
            </h3>
            
            <div className="space-y-4">
                {/* Error Messages */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <div className="text-sm text-red-800">
                            {errors.map((error, index) => (
                                <div key={index} className="mb-1 last:mb-0">
                                    {error}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* File Input */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Choose {multiple ? 'files' : 'file'} (Max {formatFileSize(maxFileSize)} each)
                    </label>
                    <input
                        type="file"
                        multiple={multiple}
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                    />
                </div>

                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Selected files:</h4>
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                <div>
                                    <span className="font-medium">{file.name}</span>
                                    <span className="ml-2 text-gray-500">({formatFileSize(file.size)})</span>
                                </div>
                                {!uploading && (
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700 ml-2"
                                        title="Remove file"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                    <div className="space-y-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <div className="text-sm text-center text-gray-600">
                            {Math.round(uploadProgress)}% uploaded
                        </div>
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                        uploading || selectedFiles.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                    } transition-colors duration-200`}
                >
                    {uploading 
                        ? `Uploading${multiple && selectedFiles.length > 1 ? ` ${selectedFiles.length} files` : ''}...` 
                        : `Upload ${multiple && selectedFiles.length > 1 ? `${selectedFiles.length} Files` : selectedFiles.length === 1 ? 'File' : multiple ? 'Files' : 'File'}`
                    }
                </button>
            </div>
        </div>
    );
};

export default FileUpload;