import { useEffect, useRef, useState } from 'react';
import type { FaceLandmarker } from '@mediapipe/tasks-vision';

export type CameraInput = {
  video: HTMLVideoElement | null;
  tracker: FaceLandmarker | null;
};

export type CameraStatus = 'demo' | 'requesting' | 'loading' | 'ready' | 'unavailable';

function describeCameraError(error: unknown) {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') return 'Camera permission was denied.';
    if (error.name === 'NotFoundError') return 'No camera was found.';
    if (error.name === 'NotReadableError') return 'The camera is busy or unavailable.';
  }

  return 'The camera could not start.';
}

export function useCamera() {
  const input = useRef<CameraInput>({ video: null, tracker: null });
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<CameraStatus>('demo');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!enabled) return;

    let closed = false;
    let stream: MediaStream | undefined;
    const video = document.createElement('video');

    video.muted = true;
    video.playsInline = true;

    const start = async () => {
      setStatus('requesting');

      try {
        if (!navigator.mediaDevices) throw new Error('Camera API unavailable');

        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 960 }, height: { ideal: 540 }, facingMode: 'user' },
          audio: false,
        });

        if (closed) {
          stream.getTracks().forEach((track) => track.stop());

          return;
        }

        stream.getVideoTracks()[0]?.addEventListener('ended', () => {
          if (closed) return;
          setError('The camera disconnected.');
          setEnabled(false);
          setStatus('demo');
        });

        video.srcObject = stream;
        await video.play();

        if (closed) return;

        input.current.video = video;
        setStatus('loading');
      } catch (error) {
        if (closed) return;

        setError(describeCameraError(error));
        setEnabled(false);
        setStatus('demo');

        return;
      }

      try {
        const { createTracker } = await import('./createTracker');
        const tracker = await createTracker();

        if (closed) {
          tracker.close();

          return;
        }

        input.current.tracker = tracker;
        setStatus('ready');
      } catch {
        if (!closed) setStatus('unavailable');
      }
    };

    void start();

    return () => {
      closed = true;
      stream?.getTracks().forEach((track) => track.stop());
      video.pause();
      video.srcObject = null;
      input.current.tracker?.close();
      input.current = { video: null, tracker: null };
    };
  }, [enabled]);

  function toggleCamera() {
    setError('');
    if (enabled) setStatus('demo');
    setEnabled(!enabled);
  }

  return { input, enabled, status, error, toggleCamera };
}
