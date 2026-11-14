import * as Phaser from 'phaser';
import { styled } from '@linaria/react';
import { useEffect, useRef, type RefObject } from 'react';
import type { CameraInput } from '../camera/useCamera';
import { effects, wallMapFragment } from './effects';
import { makeFeedTexture } from './feedTexture';

const Host = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #10101a;

  canvas {
    display: block;
    width: 100% !important;
    height: 100% !important;
  }
`;

interface Props {
  input: RefObject<CameraInput>;
  playback: RefObject<{ index: number }>;
  onTracking: (tracking: boolean) => void;
  onError: (message: string) => void;
}

export function PhaserCanvas({ input, playback, onTracking, onError }: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = host.current;

    if (!element) return;

    const dimensions = () => {
      const { clientWidth, clientHeight } = element;
      const scale = Math.min(1, 960 / Math.max(clientWidth, clientHeight, 1));

      return [
        Math.max(1, Math.round(clientWidth * scale)),
        Math.max(1, Math.round(clientHeight * scale)),
      ] as const;
    };

    const [width, height] = dimensions();
    let game: Phaser.Game | undefined;

    try {
      game = new Phaser.Game({
        type: Phaser.WEBGL,
        parent: element,
        width,
        height,
        backgroundColor: '#10101a',
        banner: false,
        audio: { noAudio: true },
        render: { antialias: false },
        scene: {
          create(this: Phaser.Scene) {
            const texture = this.textures.createCanvas('camera', 640, 360);

            if (!texture) {
              onError('The camera texture could not be created.');

              return;
            }

            const feed = makeFeedTexture(texture, onTracking);
            let frame = feed(input.current, 0, 0);
            let seconds = 0;

            const setFeedUniforms = (
              setUniform: (name: string, value: number | number[]) => void,
            ) => {
              setUniform('uVideo', 0);
              setUniform('uTime', seconds);
              setUniform('uCamera', Number(frame.active));
              setUniform('uFace', frame.crop);
              setUniform('uSource', frame.size);
            };

            const wallMap = this.make
              .shader({
                add: false,
                width: 384,
                height: 384,
                config: {
                  name: 'wall-map',
                  fragmentSource: wallMapFragment,
                  setupUniforms: setFeedUniforms,
                },
              })
              .setOrigin(0);

            wallMap.setTextures(['camera']);
            wallMap.setRenderToTexture('wall-map');

            const shaders = effects.map((effect) => {
              const usesWallMap = 'usesWallMap' in effect;

              return this.add
                .shader(
                  {
                    name: effect.id,
                    fragmentSource: effect.fragment,
                    setupUniforms: (setUniform: Parameters<typeof setFeedUniforms>[0]) => {
                      setFeedUniforms(setUniform);
                      if (usesWallMap) setUniform('uWall', 1);
                      setUniform('uViewport', [this.scale.width, this.scale.height]);
                    },
                  },
                  0,
                  0,
                  width,
                  height,
                  usesWallMap ? ['camera', 'wall-map'] : ['camera'],
                )
                .setOrigin(0);
            });

            const resize = (size: Phaser.Structs.Size) => {
              for (const shader of shaders) shader.setSize(size.width, size.height);
            };

            this.scale.on(Phaser.Scale.Events.RESIZE, resize);

            this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
              this.scale.off(Phaser.Scale.Events.RESIZE, resize);
              wallMap.destroy();
            });

            this.events.on(Phaser.Scenes.Events.UPDATE, (time: number, delta: number) => {
              frame = feed(input.current, time, delta);
              seconds += delta / 1000;
              if ('usesWallMap' in effects[playback.current.index]) wallMap.renderImmediate();

              shaders.forEach((shader, index) =>
                shader.setVisible(index === playback.current.index),
              );
            });
          },
        },
      });
    } catch {
      onError('WebGL is unavailable in this browser.');
    }

    const observer = new ResizeObserver(() => game?.scale?.resize(...dimensions()));

    observer.observe(element);

    return () => {
      observer.disconnect();
      game?.destroy(true);
    };
  }, [input, playback, onTracking, onError]);

  return <Host ref={host} role="img" aria-label="Animated video mandala" />;
}
