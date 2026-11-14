import { FaceLandmarker } from '@mediapipe/tasks-vision';
import wasmLoaderPath from '@mediapipe/tasks-vision/vision_wasm_internal.js?url';
import wasmBinaryPath from '@mediapipe/tasks-vision/vision_wasm_internal.wasm?url';

export function createTracker() {
  return FaceLandmarker.createFromOptions(
    { wasmLoaderPath, wasmBinaryPath },
    {
      baseOptions: { modelAssetPath: import.meta.env.BASE_URL + 'face_landmarker.task' },
      runningMode: 'VIDEO',
      numFaces: 1,
    },
  );
}
