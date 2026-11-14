import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Controls } from './Controls';
import { useCamera } from './camera/useCamera';
import { effects } from './visuals/effects';
import { PhaserCanvas } from './visuals/PhaserCanvas';
import { useEffectCycle } from './visuals/useEffectCycle';

const Page = styled.main`
  max-width: 1320px;
  margin-inline: auto;
  padding: 42px clamp(19px, 4vw, 55px) 32px;

  @media (max-width: 600px) {
    padding-top: 25px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
`;

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

const Mark = styled.span`
  display: grid;
  place-items: center;
  border: 1px solid #42354f;
  background: #21192d;
  color: #ceadf0;
  border-radius: 9px;
  width: 39px;
  height: 39px;
  flex: none;
  font-size: 24px;
  line-height: 1;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(20px, 3vw, 27px);
  font-weight: 620;
  letter-spacing: -0.055em;
`;

const CameraButton = styled.button`
  padding: 10px 14px;
  border: 1px solid #c2e685;
  background: var(--accent);
  color: #181e0e;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;

  &:hover {
    background: #d7f4ab;
  }

  &[aria-pressed='true'] {
    color: var(--accent);
    background: #242a1d;
    border-color: #5e7143;
  }
`;

const Workspace = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 253px;
  background: #131119;
  border: 1px solid var(--line);
  border-radius: 13px;
  overflow: hidden;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Display = styled.section`
  min-width: 0;
  background: #14121b;

  &:fullscreen {
    display: flex;
    flex-direction: column;
  }
`;

const Picture = styled.div`
  position: relative;
  min-height: clamp(290px, 53vw, 620px);
  isolation: isolate;

  &:fullscreen {
    width: 100%;
  }

  @media (max-width: 760px) {
    min-height: clamp(290px, 76vw, 525px);
  }

  :fullscreen > & {
    flex: 1;
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border: 1px solid #ffffff30;
  border-radius: 5px;
  background: #13101bd9;
  color: #eae6f5;
  font-family: var(--mono);
  font-size: 10px;
`;

const Dot = styled.span`
  background: #bd9cef;
  width: 6px;
  height: 6px;
  border-radius: 50%;

  &[data-live='true'] {
    background: var(--accent);
  }
`;

const Bottom = styled.div`
  border-top: 1px solid var(--line);
  min-height: 45px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 5px 12px 5px 15px;
`;

const Status = styled.p`
  color: var(--muted);
  font: 11px var(--mono);
  margin: 0;
`;

const Fullscreen = styled.button`
  border: 1px solid var(--line);
  border-radius: 5px;
  color: #e5ddf0;
  background: #1b1824;
  font-size: 12px;
  padding: 6px 8px;

  &:hover {
    border-color: #79658f;
  }
`;

const RenderError = styled.p`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #f1d8ea;
  margin: 0;
  padding: 25px;
  text-align: center;
`;

export function App() {
  const camera = useCamera();
  const cycle = useEffectCycle();
  const [tracking, setTracking] = useState(false);
  const [renderError, setRenderError] = useState('');
  const [fullscreenError, setFullscreenError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const display = useRef<HTMLElement>(null);
  const live = ['ready', 'loading', 'unavailable'].includes(camera.status);
  const cameraStatus = {
    demo: 'Camera off',
    requesting: 'Waiting for camera permission',
    loading: 'Loading face tracking',
    ready: tracking ? 'Face tracked' : 'Looking for a face',
    unavailable: 'Face tracking unavailable',
  }[camera.status];

  useEffect(() => {
    const update = () => setFullscreen(document.fullscreenElement === display.current);

    document.addEventListener('fullscreenchange', update);

    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await display.current?.requestFullscreen();

      setFullscreenError('');
    } catch {
      setFullscreenError('Fullscreen is unavailable.');
    }
  }

  return (
    <Page>
      <Header>
        <Identity>
          <Mark aria-hidden="true">✺</Mark>
          <Title>Video Mandala</Title>
        </Identity>
        <CameraButton
          aria-pressed={camera.enabled}
          onClick={camera.toggleCamera}
          disabled={Boolean(renderError)}
        >
          {camera.enabled ? 'Turn camera off' : 'Turn camera on'}
        </CameraButton>
      </Header>
      <Workspace aria-label="Mandala workspace">
        <Display ref={display} aria-label="Mandala preview">
          <Picture>
            <PhaserCanvas
              input={camera.input}
              playback={cycle.playback}
              onTracking={setTracking}
              onError={setRenderError}
            />
            {renderError && <RenderError role="alert">{renderError}</RenderError>}
            <Overlay>
              <Dot data-live={live} /> {live ? 'Camera feed' : 'Demo feed'}
            </Overlay>
          </Picture>
          <Bottom>
            <Status role="status">{camera.error || fullscreenError || cameraStatus}</Status>
            {document.fullscreenEnabled && (
              <Fullscreen onClick={toggleFullscreen}>
                {fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </Fullscreen>
            )}
          </Bottom>
        </Display>
        <Controls
          activeId={effects[cycle.index].id}
          cycling={cycle.cycling}
          cycleKey={cycle.cycleKey}
          select={cycle.select}
          toggleCycle={cycle.toggleCycle}
        />
      </Workspace>
    </Page>
  );
}
