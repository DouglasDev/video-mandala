uniform sampler2D uWall;

vec2 wallUv(vec3 p) {
  return vec2(atan(p.y, p.x) / TAU - uTime * 0.045, p.z * 0.16 + uTime * 0.075);
}

vec3 wallColor(vec3 p) {
  vec2 uv = wallUv(p);
  return texture2D(uWall, mirrorTile(uv * vec2(6.0, 2.0))).rgb;
}

float wallRadius(vec3 p) {
  return 1.7 - 0.23 * luminance(wallColor(p));
}

vec3 cylinder(vec3 ray) {
  // Ray starts on the cylinder axis. Refine the first inner-wall intersection.
  float radialSpeed = length(ray.xy);
  if (radialSpeed < 0.025) return vec3(0.02, 0.014, 0.045);
  float near = 1.47 / radialSpeed, far = 1.70 / radialSpeed;
  for (int i = 0; i < 6; ++i) {
    float mid = 0.5 * (near + far);
    if (mid * radialSpeed > wallRadius(ray * mid)) far = mid;
    else near = mid;
  }

  vec3 p = ray * far;
  vec3 color = wallColor(p);
  vec2 tangent = normalize(vec2(-p.y, p.x));
  float slope = wallRadius(p + vec3(tangent * 0.026, 0.0))
              - wallRadius(p - vec3(tangent * 0.026, 0.0));
  float zSlope = wallRadius(p + vec3(0.0, 0.0, 0.026))
               - wallRadius(p - vec3(0.0, 0.0, 0.026));
  float relief = clamp(0.69 + slope * 3.8 - zSlope * 3.0, 0.24, 1.38);
  float depth = exp(-p.z * 0.16);
  return mix(vec3(0.018, 0.012, 0.037), color * relief, depth);
}
