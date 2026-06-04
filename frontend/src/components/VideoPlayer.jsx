import React, { useEffect, useRef, useState } from 'react';
import HLS from 'hls.js';

function VideoPlayer({ videoUrl, videoId }) {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoRef.current || !videoUrl) return;

    const video = videoRef.current;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari et navigateurs natifs HLS
      video.src = videoUrl;
    } else if (HLS.isSupported()) {
      // Autres navigateurs avec HLS.js
      const hls = new HLS();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      hls.on(HLS.Events.ERROR, (event, data) => {
        if (data.fatal) {
          setError('Erreur de lecture vidéo');
        }
      });

      return () => {
        hls.destroy();
      };
    } else {
      setError('Votre navigateur ne supporte pas HLS');
    }
  }, [videoUrl]);

  return (
    <div className="w-full">
      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      <video
        ref={videoRef}
        controls
        className="w-full bg-black rounded-lg"
        controlsList="nodownload"
      />
    </div>
  );
}

export default VideoPlayer;
