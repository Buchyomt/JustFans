import fs from 'fs';
import path from 'path';
import { UPLOAD_DIR } from '../middleware/upload.js';

/**
 * Saves a base64 data URL (e.g. from canvas video frame capture) to disk as a real image file.
 * Returns the public relative path `/uploads/videos/thumb-xxx.jpg`.
 */
export const saveBase64Image = (dataUrl, prefix = 'thumb') => {
  if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
    return dataUrl;
  }
  try {
    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return dataUrl;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/videos/${filename}`;
  } catch (err) {
    console.error('[Base64 Image Save Error]:', err);
    return dataUrl;
  }
};

