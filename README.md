# Video Mandala

A browser-based camera visualizer with two live effects. Run `pnpm install` and `pnpm dev` from this directory, then open the local URL printed by Vite. Use localhost or HTTPS for camera access, and a browser with WebGL.

**Turn camera on** enables video and MediaPipe Face Landmarker. The video and face landmarks stay in the browser. The app serves the model and WASM alongside its other static assets. If a face is outside the frame, the effects ease back to a center crop. The demo feed works without camera permission.

The effects cycle every seven seconds. Select an effect to hold it, and turn **Auto-cycle** back on to resume cycling.

- **Kaleidoscope** uses rotating mirrored sectors of an animated triangle lattice, with a tracked head crop and tiled feed borders.
- **Relief Tunnel** uses the same kaleidoscope as a luminance-driven relief in a rotating cylinder. The object inside samples a tiled face crop for color and height and twists its sampling direction using a projection from four dimensions.

The effect list lives in `src/visuals/effects.ts`. Each effect supplies a Phaser fragment shader and can reuse the feed and crop sampling helpers in `src/visuals/source.glsl`.

The checked-in Face Landmarker model comes from Google's [MediaPipe model distribution](https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task).

Run `pnpm run format`, `pnpm run format:check`, `pnpm run typecheck`, and `pnpm run build` to verify changes. The production build is in `dist/`.
