import React from 'react';
import { registerRoot, Composition, Sequence, Audio, staticFile, useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import storyData from '../story.json';

const SceneView: React.FC<{ text: string; arabic?: string; theme: string }> = ({ text, arabic, theme }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const translateY = interpolate(frame, [0, 20], [30, 0], { extrapolateRight: 'clamp' });

  const bgGradient = theme === 'golden_light'
    ? 'radial-gradient(circle at center, #3b2d1f 0%, #0d0d12 100%)'
    : 'radial-gradient(circle at center, #132238 0%, #070b14 100%)';

  return React.createElement(
    AbsoluteFill,
    { style: { background: bgGradient, justifyContent: 'center', alignItems: 'center', padding: 60, textAlign: 'center' } },
    React.createElement(
      'div',
      { style: { opacity, transform: `translateY(${translateY}px)`, color: '#ffffff', fontFamily: 'sans-serif' } },
      arabic
        ? React.createElement('div', { style: { fontSize: 58, color: '#f5c767', marginBottom: 40, fontWeight: 'bold', lineHeight: 1.5 } }, arabic)
        : null,
      React.createElement('div', { style: { fontSize: 44, lineHeight: 1.4, fontWeight: 500, textShadow: '0 4px 20px rgba(0,0,0,0.8)' } }, text)
    )
  );
};

const MainVideo: React.FC = () => {
  let currentFrame = 0;
  const fps = 30;

  return React.createElement(
    AbsoluteFill,
    { style: { backgroundColor: '#000' } },
    React.createElement(Audio, { src: staticFile('voiceover.mp3') }),
    storyData.scenes.map((scene, index) => {
      const durationInFrames = Math.round(scene.durationInSeconds * fps);
      const startFrame = currentFrame;
      currentFrame += durationInFrames;

      return React.createElement(
        Sequence,
        { key: index, from: startFrame, durationInFrames },
        React.createElement(SceneView, { text: scene.text, arabic: scene.arabic, theme: scene.theme })
      );
    })
  );
};

export const RemotionRoot: React.FC = () => {
  const fps = 30;
  const totalSeconds = storyData.scenes.reduce((acc, s) => acc + s.durationInSeconds, 0);

  return React.createElement(Composition, {
    id: 'IslamicVideo',
    component: MainVideo,
    durationInFrames: Math.max(30, Math.round(totalSeconds * fps)),
    fps,
    width: 1080,
    height: 1920,
  });
};

registerRoot(RemotionRoot);
