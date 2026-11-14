import type { FaceLandmarker } from '@mediapipe/tasks-vision';

export type FaceCrop = [x: number, y: number, size: number];

export const defaultCrop: FaceCrop = [0.5, 0.48, 0.48];

export function trackFace(tracker: FaceLandmarker, video: HTMLVideoElement, time: number) {
  const [face] = tracker.detectForVideo(video, time).faceLandmarks;

  if (!face?.length) return null;

  let left = 1;
  let right = 0;
  let top = 1;
  let bottom = 0;

  for (const { x, y } of face) {
    left = Math.min(left, x);
    right = Math.max(right, x);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }

  const side =
    1.5 * Math.max(right - left, ((bottom - top) * video.videoHeight) / video.videoWidth);

  return [
    1 - (left + right) / 2,
    (top + bottom) / 2 - (bottom - top) * 0.06,
    Math.max(0.12, Math.min(side, 1)),
  ] satisfies FaceCrop;
}
