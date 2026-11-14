vec3 entityCoords(vec3 direction) {
  // Lift the direction into a unit 3-sphere, rotate through two planes involving
  // its fourth axis, then use the projected direction to twist the face relief.
  float latitude = 0.64 * sin(direction.y * 3.1 + uTime * 0.62);
  vec4 q = vec4(direction * cos(latitude), sin(latitude));
  q.xw = rotate(uTime * 0.53) * q.xw;
  q.yw = rotate(-uTime * 0.37) * q.yw;
  return normalize(q.xyz + vec3(0.0, 0.0, 0.0001)) * (0.83 + 0.17 * q.w);
}

vec2 entityUv(vec3 q) {
  vec3 dir = normalize(q);
  float longitude = atan(dir.z, dir.x) / TAU + 0.5;
  float latitude = asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5;
  longitude += 0.09 * sin(dir.y * 8.0 + uTime * 1.2);
  return mirrorTile(vec2(longitude * 6.0, (1.0 - latitude) * 3.0));
}

float entityField(vec3 p) {
  vec3 projected = entityCoords(normalize(p + vec3(0.0, 0.0, 0.0001)));
  float height = luminance(faceSource(entityUv(projected)));
  float facets = sin(projected.x * 11.0 + uTime) * cos(projected.y * 9.0 - uTime * 0.8);
  float radius = 0.66 + 0.24 * height + 0.14 * facets + 0.14 * (length(projected) - 0.82);
  return length(p) - radius;
}

vec3 tunnel(vec2 p) {
  vec3 ray = normalize(vec3(p * 0.74, 1.0));
  vec3 center = vec3(0.09 * sin(uTime * 0.53), 0.06 * cos(uTime * 0.66), 2.30);
  float projection = dot(ray, center);
  float chord = projection * projection - dot(center, center) + 1.10 * 1.10;

  if (chord > 0.0) {
    float span = sqrt(chord);
    float origin = projection - span;
    float stride = 2.0 * span / 18.0;
    for (int i = 1; i <= 18; ++i) {
      float far = origin + float(i) * stride;
      vec3 point = ray * far - center;
      if (entityField(point) > 0.0) continue;
      float near = far - stride;
      for (int j = 0; j < 4; ++j) {
        float mid = 0.5 * (near + far);
        if (entityField(ray * mid - center) > 0.0) near = mid;
        else far = mid;
      }

      point = ray * far - center;
      float d = 0.008;
      vec2 e = vec2(d, 0.0);
      vec3 normal = normalize(vec3(
        entityField(point + e.xyy) - entityField(point - e.xyy),
        entityField(point + e.yxy) - entityField(point - e.yxy),
        entityField(point + e.yyx) - entityField(point - e.yyx)
      ));
      vec3 color = faceSource(entityUv(entityCoords(normalize(point))));
      float diffuse = max(0.0, dot(normal, normalize(vec3(-0.65, 0.7, -1.0))));
      float rim = pow(1.0 - max(0.0, dot(normal, -ray)), 3.0);
      return color * (0.29 + 0.83 * diffuse) + vec3(0.54, 0.72, 0.80) * rim * 0.66;
    }
  }

  return cylinder(ray);
}
