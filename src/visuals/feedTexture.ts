import type { Textures } from 'phaser';
import type { CameraInput } from '../camera/useCamera';
import { defaultCrop, trackFace } from '../camera/faceTracking';

export function makeFeedTexture(
  texture: Textures.CanvasTexture,
  onTracking: (found: boolean) => void,
) {
  const crop = [...defaultCrop];
  const target = [...defaultCrop];
  let previousVideo: HTMLVideoElement | null = null;
  let lastFrame = -1;
  let lastDetection = -Infinity;
  let lastTextureUpload = -Infinity;
  let hasFace = false;

  return (input: CameraInput, time: number, delta: number) => {
    const { video, tracker } = input;

    if (video !== previousVideo) {
      previousVideo = video;
      lastFrame = -1;
      lastDetection = -Infinity;
      lastTextureUpload = -Infinity;
      target.splice(0, 3, ...defaultCrop);
      crop.splice(0, 3, ...defaultCrop);

      if (hasFace) {
        hasFace = false;
        onTracking(false);
      }
    }

    const active = Boolean(video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA);

    if (
      video &&
      active &&
      video.currentTime !== lastFrame &&
      time - lastTextureUpload >= 1000 / 35
    ) {
      lastTextureUpload = time;
      lastFrame = video.currentTime;
      texture.context.drawImage(video, 0, 0, texture.width, texture.height);
      texture.refresh();

      if (tracker && time - lastDetection >= 1000 / 14) {
        lastDetection = time;
        let detected = null;

        try {
          detected = trackFace(tracker, video, performance.now());
        } catch {
          // Keep the effect running if inference fails on an individual frame.
        }

        target.splice(0, 3, ...(detected ?? defaultCrop));

        if (Boolean(detected) !== hasFace) {
          hasFace = Boolean(detected);
          onTracking(hasFace);
        }
      }
    }

    const blend = 1 - Math.exp(-delta / 130);

    for (let i = 0; i < crop.length; i++) crop[i] += (target[i] - crop[i]) * blend;

    return { active, crop, size: [video?.videoWidth || 640, video?.videoHeight || 480] };
  };
}
