import express from 'express';
const router = express.Router();
import { upload, deleteFile, listFiles } from '../services/awsService.js';

// Test route
router.get('/test', (req, res) => {
    res.json({ success: true, message: 'File routes working' });
});

// Simple upload route
router.post('/upload', (req, res) => {
    console.log('📤 Starting upload...');
    
    upload.single('file')(req, res, function(err) {
        if (err) {
            console.error('❌ Upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }

        if (!req.file) {
            console.log('❌ No file received');
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        console.log('✅ Upload successful!');
        console.log('📄 File:', req.file.originalname);
        console.log('🔗 URL:', req.file.location);

        res.json({
            success: true,
            message: 'File uploaded successfully',
            file: {
                filename: req.file.originalname,
                fileUrl: req.file.location,
                fileKey: req.file.key,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                uploadedAt: new Date()
            }
        });
    });
});

// Multiple files upload
router.post('/upload-multiple', (req, res) => {
    upload.array('files', 5)(req, res, function(err) {
        if (err) {
            console.error('❌ Multiple upload error:', err);
            return res.status(400).json({
                success: false,
                message: err.message || 'Upload failed'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const filesData = req.files.map(file => ({
            filename: file.originalname,
            fileUrl: file.location,
            fileKey: file.key,
            fileSize: file.size,
            mimeType: file.mimetype,
            uploadedAt: new Date()
        }));

        res.json({
            success: true,
            message: `${req.files.length} files uploaded successfully`,
            files: filesData
        });
    });
});

// List files
router.get('/list', async (req, res) => {
    try {
        console.log('📂 Listing files...');
        const files = await listFiles();
        
        const formattedFiles = files.map(file => ({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
            url: `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
        }));

        console.log(`✅ Found ${formattedFiles.length} files`);
        res.json({
            success: true,
            files: formattedFiles
        });
    } catch (error) {
        console.error('❌ List error:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing files',
            error: error.message
        });
    }
});

// Delete file
router.delete('/delete/:fileKey', async (req, res) => {
    try {
        const fileKey = decodeURIComponent(req.params.fileKey);
        console.log('🗑️ Deleting file:', fileKey);
        
        await deleteFile(fileKey);
        
        console.log('✅ File deleted');
        res.json({
            success: true,
            message: 'File deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting file',
            error: error.message
        });
    }
});

export default router;