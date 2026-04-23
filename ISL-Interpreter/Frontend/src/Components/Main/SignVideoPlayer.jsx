import React, { useState, useEffect, useRef } from 'react';
import signAssets from '../../assets/signAssets.json';

function normalizeSignKey(sign) {
  return String(sign || '')
    .trim()
    .toUpperCase();
}

function resolveVideoSources(sign) {
  const normalized = normalizeSignKey(sign);
  if (!normalized) return [];

  if (signAssets[normalized]) return [signAssets[normalized]];

  const underscored = normalized.replace(/[\s-]+/g, '_');
  if (signAssets[underscored]) return [signAssets[underscored]];

  const compact = normalized.replace(/[\s_-]+/g, '');
  if (signAssets[compact]) return [signAssets[compact]];

  const fileKey = normalized
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!fileKey) return [];

  return [
    `/assets/signs/${fileKey}.mp4`,
    `/assets/signs/${fileKey}.webm`,
    `/assets/signs/${fileKey}.mov`,
    `/assets/signs/${fileKey}.m4v`,
  ];
}

export default function SignVideoPlayer({ signSequence, onSequenceComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    // Reset and start playing when a new sequence arrives
    if (signSequence && signSequence.length > 0) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, [signSequence]);

  useEffect(() => {
    // Automatically play the video when the index changes and we are in playing mode
    if (isPlaying && videoRef.current) {
      videoRef.current.load(); // Load the new source
      videoRef.current.play().catch(e => {
        console.error("Autoplay prevented or video not found:", e);
        handleVideoFailure(); // Skip to next if this one fails
      });
    }
  }, [currentIndex, isPlaying]);

  const handleVideoFailure = () => {
    if (currentIndex < signSequence.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsPlaying(false);
      if (onSequenceComplete) {
        onSequenceComplete();
      }
    }
  };

  const handleVideoEnd = () => {
    if (currentIndex < signSequence.length - 1) {
      // Play next video in sequence
      setCurrentIndex(prev => prev + 1);
    } else {
      // Sequence finished
      setIsPlaying(false);
      if (onSequenceComplete) {
        onSequenceComplete();
      }
    }
  };

  if (!signSequence || signSequence.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-800 shadow-inner">
        <p className="text-gray-500 font-medium text-lg">Waiting for input...</p>
      </div>
    );
  }

  const currentSign = signSequence[currentIndex];
  const currentVideoSources = resolveVideoSources(currentSign);
  const hasSources = currentVideoSources.length > 0;

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
      {/* Video Element */}
      {hasSources ? (
        <video
          ref={videoRef}
          className="w-full h-full object-cover transition-opacity duration-300"
          onEnded={handleVideoEnd}
          onError={handleVideoFailure}
          playsInline
          muted // Muted to allow autoplay without interaction in some browsers
        >
          {currentVideoSources.map((src) => {
            const ext = src.split('.').pop()?.toLowerCase();
            const type = ext === 'webm' ? 'video/webm' : 'video/mp4';
            return <source key={src} src={src} type={type} />;
          })}
          Your browser does not support the video tag.
        </video>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
          <i className="ri-error-warning-line text-4xl text-yellow-500 mb-2"></i>
          <p className="text-gray-400">Sign not found for "{currentSign}"</p>
        </div>
      )}

      {/* Overlay Status */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 flex items-center gap-3">
          {isPlaying ? (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          ) : (
            <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
          )}
          <span className="text-white font-medium text-sm tracking-widest">
            {currentSign} ({currentIndex + 1}/{signSequence.length})
          </span>
        </div>
      </div>
    </div>
  );
}
