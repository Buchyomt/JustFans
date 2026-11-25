import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directory exists: server/uploads/videos
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/videos');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Allowed video MIME types and extensions
const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
  'video/x-matroska', // .mkv
  'video/x-m4v'
];

const ALLOWED_EXTENSIONS = ['.mp4', '.mov', '.webm', '.mkv', '.m4v'];

// Storage configuration with diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Re-verify directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanOriginalName = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    cb(null, `video-${timestamp}-${random}-${cleanOriginalName}${ext}`);
  }
});

// File validation filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('video/');

  if (isExtAllowed && isMimeAllowed) {
    return cb(null, true);
  }

  const error = new Error(`Unsupported file type (${ext || file.mimetype}). Only common video formats (MP4, MOV, WebM) are allowed.`);
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

// Size limit: 1GB (1024MB) for full-length 4K uncut creator video uploads
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024; // 1GB in bytes

export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
    fieldSize: 50 * 1024 * 1024, // 50MB for base64 thumbnails and metadata
    files: 1
  }
});

// Middleware wrapper to catch Multer errors and return clean JSON
export const handleVideoUpload = (fieldName = 'video') => {
  const upload = videoUpload.single(fieldName);

  return (req, res, next) => {
    upload(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Video file size exceeds the 1GB limit. Please upload a compressed or shorter clip.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: `Unexpected upload field. Please upload under the field name '${fieldName}'.`
          });
        }
        return res.status(400).json({
          success: false,
          message: `Multer upload error: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

// Avatar uploads directory: server/uploads/avatars
export const AVATAR_DIR = path.resolve(__dirname, '../../uploads/avatars');
if (!fs.existsSync(AVATAR_DIR)) {
  fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(AVATAR_DIR)) {
      fs.mkdirSync(AVATAR_DIR, { recursive: true });
    }
    cb(null, AVATAR_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `avatar-${timestamp}-${Math.round(Math.random() * 1e6)}${ext}`);
  }
});

export const uploadAvatarMiddleware = multer({
  storage: avatarStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single('avatar');

