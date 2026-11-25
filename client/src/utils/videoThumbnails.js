/**
 * Client-Side Video Frame Extraction Utility
 * Captures real frames directly from any selected video file without server lag.
 */

export const formatVideoTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const extractVideoFrames = (videoFileOrUrl, numFrames = 6) => {
  return new Promise((resolve, reject) => {
    if (!videoFileOrUrl) return resolve([]);

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const isFile = typeof videoFileOrUrl !== 'string';
    const objectUrl = isFile ? URL.createObjectURL(videoFileOrUrl) : videoFileOrUrl;
    video.src = objectUrl;

    const timeout = setTimeout(() => {
      if (isFile) URL.revokeObjectURL(objectUrl);
      resolve([]);
    }, 15000);

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 10;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Target standard 16:9 640x360 resolution for crisp preview thumbnails
        const width = Math.min(video.videoWidth || 640, 1280);
        const height = Math.round((width / (video.videoWidth || 16)) * (video.videoHeight || 9));
        canvas.width = width || 640;
        canvas.height = height || 360;

        // Distribute sample points across video duration (e.g. 10%, 25%, 40%, 60%, 75%, 90%)
        const timestamps = [];
        for (let i = 1; i <= numFrames; i++) {
          const t = Math.max(0.5, (duration * i) / (numFrames + 1));
          timestamps.push(t);
        }

        const frames = [];

        for (const t of timestamps) {
          await new Promise((res) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              try {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
                frames.push({
                  time: t,
                  timeFormatted: formatVideoTime(t),
                  dataUrl
                });
              } catch (drawErr) {
                console.warn('[Video Frame Draw Error]:', drawErr);
              }
              res();
            };

            video.addEventListener('seeked', onSeeked, { once: true });
            video.currentTime = t;
          });
        }

        clearTimeout(timeout);
        if (isFile) URL.revokeObjectURL(objectUrl);
        resolve(frames);
      } catch (err) {
        clearTimeout(timeout);
        if (isFile) URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = () => {
      clearTimeout(timeout);
      if (isFile) URL.revokeObjectURL(objectUrl);
      resolve([]);
    };
  });
};

export const extractSingleFrameAtTime = (videoFileOrUrl, targetTime = 1) => {
  return new Promise((resolve) => {
    if (!videoFileOrUrl) return resolve(null);

    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    const isFile = typeof videoFileOrUrl !== 'string';
    const objectUrl = isFile ? URL.createObjectURL(videoFileOrUrl) : videoFileOrUrl;
    video.src = objectUrl;

    const timeout = setTimeout(() => {
      if (isFile) URL.revokeObjectURL(objectUrl);
      resolve(null);
    }, 10000);

    video.onloadedmetadata = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = Math.min(video.videoWidth || 640, 1280);
      canvas.height = Math.round((canvas.width / (video.videoWidth || 16)) * (video.videoHeight || 9));

      const seekTime = Math.min(Math.max(0.2, targetTime), (video.duration || 10) - 0.2);

      video.addEventListener('seeked', () => {
        try {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          clearTimeout(timeout);
          if (isFile) URL.revokeObjectURL(objectUrl);
          resolve({
            time: seekTime,
            timeFormatted: formatVideoTime(seekTime),
            dataUrl
          });
        } catch {
          clearTimeout(timeout);
          if (isFile) URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      }, { once: true });

      video.currentTime = seekTime;
    };

    video.onerror = () => {
      clearTimeout(timeout);
      if (isFile) URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
  });
};

