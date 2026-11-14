// A triangular lattice with six equilateral triangles meeting at every vertex.
vec3 hexTile(vec2 p, float t) {
  const float SQRT3 = 1.73205080757;
  vec2 lattice = vec2(p.x - p.y / SQRT3, 2.0 * p.y / SQRT3);
  vec2 cell = floor(lattice);
  vec2 tri = fract(lattice);
  float flipped = step(1.0, tri.x + tri.y);
  tri = mix(tri, 1.0 - tri, flipped);
  float barycentric = 1.0 - tri.x - tri.y;

  // Only one triangle in each repeating group uses the tracked head crop.
  float tile = mod(cell.x - cell.y + flipped * 3.0, 6.0);
  vec2 tileUv = vec2(tri.x + 0.5 * tri.y, tri.y);
  vec2 drift = vec2(0.11 * sin(t * 0.63), 0.09 * cos(t * 0.55));
  vec2 faceUv = vec2((tileUv.x - 0.5) * 1.6 + 0.5, (1.0 - tileUv.y) * 0.96) + drift;
  vec2 patch = vec2(0.19 + 0.31 * mod(tile, 3.0), 0.22 + 0.43 * step(3.0, tile));
  vec3 color = tile < 0.5 ? faceSource(faceUv) : source(patch + (tileUv - 0.5) * 0.55 + drift);
  float edge = smoothstep(0.0, 0.035, min(min(tri.x, tri.y), barycentric));
  return color * mix(0.64, 1.0, edge);
}

vec2 fold(vec2 p, float segments) {
  float wedge = TAU / segments;
  float angle = abs(mod(atan(p.y, p.x) + 0.5 * wedge, wedge) - 0.5 * wedge);
  return length(p) * vec2(cos(angle), sin(angle));
}

vec3 border(vec2 p, float t, float spin) {
  vec2 q = rotate(spin * t) * p;
  vec2 tile = mirrorTile(q * 9.0 + vec2(t * 0.27, -t * 0.19));
  vec3 color = source(vec2(0.23, 0.72) + (tile - 0.5) * vec2(0.12, 0.12 * uSource.x / uSource.y));
  return color * (0.62 + 0.26 * sin(12.0 * length(p) - t * 0.58));
}

vec3 mandala(vec2 p, float t) {
  float r = length(p);
  vec3 color;
  if (r < 0.405) {
    vec2 q = fold(rotate(t * 0.23) * p, 6.0);
    color = hexTile(q * 9.6 + vec2(t * 0.18, -t * 0.11), t);
  } else if (r > 0.475 && r < 0.835) {
    vec2 q = fold(rotate(-t * 0.145) * p, 12.0);
    color = hexTile(q * 8.0 + vec2(-t * 0.13, t * 0.09), t) * 0.92;
  } else {
    color = border(p, t, r < 0.475 ? -0.35 : 0.09);
    color *= r < 0.475 ? 0.83 : 0.45 * exp(-max(r - 0.85, 0.0) * 3.2);
  }

  float rings = min(min(abs(r - 0.405), abs(r - 0.475)), abs(r - 0.835));
  float glow = exp(-rings * 190.0);
  return color + vec3(0.55, 0.76, 0.33) * glow * 0.30;
}
