import AWS from 'aws-sdk'
import multer from 'multer'
import multerS3 from 'multer-s3'

// Configure AWS - Simple approach
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    apiVersion: '2006-03-01'
});

// Test connection
console.log('🔧 Initializing AWS S3...');
console.log('📍 Region:', process.env.AWS_REGION);
console.log('📂 Bucket:', process.env.AWS_S3_BUCKET);

// Simple upload configuration
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET,
        key: function (req, file, cb) {
            // Simple file naming
            const timestamp = Date.now();
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, `uploads/${timestamp}_${safeName}`);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit to start
    },
    fileFilter: function (req, file, cb) {
        console.log('📄 Filtering file:', file.originalname);
        console.log('📄 MIME type:', file.mimetype);
        
        // Simple file type check
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
        
        if (allowedTypes.includes(file.mimetype)) {
            console.log('✅ File accepted');
            cb(null, true);
        } else {
            console.log('❌ File rejected');
            cb(new Error(`File type ${file.mimetype} not allowed`));
        }
    }
});

// Simple delete function
const deleteFile = async (fileKey) => {
    try {
        await s3.deleteObject({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: fileKey
        }).promise();
        return { success: true };
    } catch (error) {
        console.error('Delete error:', error);
        throw error;
    }
};

// Simple list function
const listFiles = async (prefix = 'uploads/') => {
    try {
        const result = await s3.listObjectsV2({
            Bucket: process.env.AWS_S3_BUCKET,
            Prefix: prefix
        }).promise();
        return result.Contents || [];
    } catch (error) {
        console.error('List error:', error);
        throw error;
    }
};

export {
    upload,
    deleteFile,
    listFiles,
    s3
};