import source from './source.glsl?raw';
import mandala from './mandala.glsl?raw';
import cylinder from './cylinder.glsl?raw';
import entity from './entity.glsl?raw';

export const wallMapFragment =
  source +
  mandala +
  `
  void main() {
    gl_FragColor = vec4(mandala((outTexCoord - 0.5) * 1.66, uTime), 1.0);
  }
`;

export const effectDuration = 7_000;

export const effects = [
  {
    id: 'kaleidoscope',
    title: 'Kaleidoscope',
    fragment:
      source +
      mandala +
      `
      void main() {
        gl_FragColor = vec4(mandala(stagePoint(), uTime), 1.0);
      }
    `,
  },
  {
    id: 'tunnel',
    title: 'Relief Tunnel',
    usesWallMap: true,
    fragment:
      source +
      cylinder +
      entity +
      `
      void main() {
        gl_FragColor = vec4(tunnel(stagePoint()), 1.0);
      }
    `,
  },
] as const;

export type EffectId = (typeof effects)[number]['id'];
