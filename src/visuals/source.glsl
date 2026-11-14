precision highp float;

varying vec2 outTexCoord;
uniform sampler2D uVideo;
uniform vec2 uViewport;
uniform vec2 uSource;
uniform vec3 uFace;
uniform float uCamera;
uniform float uTime;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

mat2 rotate(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

float luminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec2 mirrorTile(vec2 p) {
  return 1.0 - abs(mod(p, 2.0) - 1.0);
}

vec3 source(vec2 uv) {
  uv = mirrorTile(uv);
  if (uCamera > 0.5) {
    return texture2D(uVideo, vec2(1.0 - uv.x, 1.0 - uv.y)).rgb;
  }

  // An animated synthetic source with enough contrast to read the relief.
  vec2 p = uv - 0.5;
  p = rotate(0.23 * sin(uTime * 0.37)) * p;
  float flow = sin(10.0 * p.x + 4.0 * sin(8.0 * p.y - uTime * 0.51))
             + cos(13.0 * p.y - 5.0 * p.x + uTime * 0.43);
  float fine = sin(30.0 * length(p * vec2(1.2, 0.84)) - flow * 1.1 + uTime * 0.43);
  vec3 dark = vec3(0.025, 0.025, 0.09);
  vec3 purple = vec3(0.48, 0.14, 0.68);
  vec3 mint = vec3(0.61, 0.89, 0.40);
  vec3 color = mix(dark, purple, smoothstep(-1.5, 1.5, flow + 0.28 * fine));
  color = mix(color, mint, smoothstep(0.64, 1.0, fine) * (0.27 + 0.30 * abs(flow)));
  return color;
}

vec3 faceSource(vec2 uv) {
  vec2 crop = uFace.z * vec2(1.0, uSource.x / uSource.y);
  return source(uFace.xy + (uv - 0.5) * crop);
}

vec2 stagePoint() {
  return (outTexCoord * 2.0 - 1.0) * uViewport / min(uViewport.x, uViewport.y);
}
