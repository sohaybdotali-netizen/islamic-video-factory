import React from 'react';
import { registerRoot, Composition, Sequence, Audio, staticFile, useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import storyData from '../story.json';

const SceneView: React.FC<{ text: string; arabic?: string; theme: string }> = ({ text, arabic, theme }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, 20], [20, 0], { extrapolateRight: 'clamp' });

  const bgGradient = theme === 'golden_light'
    ? 'radial-gradient(circle at center, #3b2d1f 0%, #0d0d12 100%)'
    : 'radial-gradient(circle at center, #132238 0%, #070b14 100%)';

  return (
    <AbsoluteFill style={{ background: bgGradient, justifyContent: 'center', alignItems: 'center', padding: 60, textAlign: 'center' }}>
      <div style={{ opacity, transform: `translateY(${translateY}px)`, color: '#ffffff', fontFamily: 'sans-serif' }}>
        {arabic && (
          <div style={{ fontSize: 58, color: '#f5c767', marginBottom: 40, fontWeight: 'bold', lineHeight: 1.5 }}>
            {arabic}
          </div>
        )}
        <div style={{ fontSize: 44, lineHeight: 1.4, fontWeight: 500, textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          {text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MainVideo: React.FC = () => {
  let currentFrame = 0;
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <Audio src={staticFile('voiceover.mp3')} />
      {storyData.scenes.map((scene, index) => {
        const durationInFrames = Math.round(scene.durationInSeconds * fps);
        const startFrame = currentFrame;
        currentFrame += durationInFrames;

        return (
          <Sequence key={index} from={startFrame} durationInFrames={durationInFrames}>
            <SceneView text={scene.text} arabic={scene.arabic} theme={scene.theme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  const totalSeconds = storyData.scenes.reduce((acc, s) => acc + s.durationInSeconds, 0);

  return (
    <Composition
      id="IslamicVideo"
      component={MainVideo}
      durationInFrames={Math.max(30, Math.round(totalSeconds * fps))}
      fps={fps}
      width={1080}
      height={1920}
    />
  );
};

registerRoot(RemotionRoot);
