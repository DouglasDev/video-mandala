import { styled } from '@linaria/react';
import { effectDuration, effects, type EffectId } from './visuals/effects';

const Rail = styled.aside`
  padding: 23px 19px 19px;
  border-left: 1px solid var(--line);
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 760px) {
    border-left: 0;
    border-top: 1px solid var(--line);
  }
`;

const RailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const Heading = styled.h2`
  margin: 0;
  font-size: 14px;
  font-weight: 650;
`;

const Toggle = styled.button`
  display: inline-flex;
  gap: 7px;
  align-items: center;
  padding: 4px 0 4px 4px;
  font-size: 11px;
  color: var(--muted);
  background: transparent;
  border: 0;
  white-space: nowrap;
`;

const Switch = styled.span`
  width: 25px;
  height: 14px;
  border-radius: 9px;
  background: #3b3946;
  padding: 2px;
  display: flex;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #aaa7b5;
  }

  &[data-on='true'] {
    justify-content: flex-end;
    background: #5b7038;
  }

  &[data-on='true']::before {
    background: var(--accent);
  }
`;

const EffectList = styled.div`
  display: grid;
  gap: 9px;

  @media (max-width: 540px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const EffectButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  text-align: left;
  padding: 9px;
  min-height: 60px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #17151e;

  &:hover {
    background: #211e2c;
  }

  &[aria-pressed='true'] {
    border-color: #637147;
    background: #20241e;
  }
`;

const Motif = styled.span`
  width: 36px;
  height: 36px;
  flex: none;
  border: 1px solid #3b2e50;
  border-radius: 5px;
  background:
    repeating-radial-gradient(circle, transparent 0 4px, #9b66c2 5px, transparent 6px 8px),
    repeating-conic-gradient(#351b4c 0deg 15deg, #171326 15deg 30deg);

  &[data-effect='tunnel'] {
    background:
      radial-gradient(ellipse at 45% 38%, #e2f5aa, #687c39 19%, transparent 41%),
      repeating-radial-gradient(circle, #1c122a 0 4px, #8e54ba 5px, #261634 7px 9px);
  }
`;

const EffectName = styled.span`
  font-size: 13px;
  font-weight: 550;
`;

const Progress = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  transform-origin: left;
  background: var(--accent);
  animation: fill var(--duration) linear both;

  @keyframes fill {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
`;

const CycleTime = styled.p`
  color: var(--muted);
  font-family: var(--mono);
  font-size: 10px;
  margin: 0;
`;

interface Props {
  activeId: EffectId;
  cycling: boolean;
  cycleKey: number;
  select: (id: EffectId) => void;
  toggleCycle: () => void;
}

export function Controls({ activeId, cycling, cycleKey, select, toggleCycle }: Props) {
  return (
    <Rail aria-label="Effect controls">
      <RailHeader>
        <Heading>Effects</Heading>
        <Toggle role="switch" aria-checked={cycling} onClick={toggleCycle}>
          Auto-cycle <Switch data-on={cycling} aria-hidden="true" />
        </Toggle>
      </RailHeader>
      <EffectList>
        {effects.map((effect) => (
          <EffectButton
            key={effect.id}
            aria-pressed={activeId === effect.id}
            onClick={() => select(effect.id)}
          >
            <Motif data-effect={effect.id} aria-hidden="true" />
            <EffectName>{effect.title}</EffectName>
            {cycling && activeId === effect.id && (
              <Progress
                key={cycleKey}
                style={{ '--duration': effectDuration + 'ms' } as React.CSSProperties}
                aria-hidden="true"
              />
            )}
          </EffectButton>
        ))}
      </EffectList>
      <CycleTime>{effectDuration / 1000}s per effect</CycleTime>
    </Rail>
  );
}
