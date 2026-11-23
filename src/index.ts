import React from 'react';
import { registerRoot, Composition, Sequence, Audio, staticFile, useCurrentFrame, AbsoluteFill } from 'remotion';
import storyData from '../story.json';

const ScholarCharacter: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => {
  const frame = useCurrentFrame();

  // Gentle breathing & head-nod motion
  const floatY = Math.sin(frame / 18) * 6;
  const headTilt = isSpeaking ? Math.sin(frame / 10) * 2.5 : 0;

  // Natural eye blink every ~3 seconds
  const isBlinking = frame % 95 > 90;

  // Lip-sync mouth opening while speaking (pauses slightly at the end of scene)
  const mouthOpen = isSpeaking ? Math.abs(Math.sin(frame / 2.2)) * 14 + 3 : 2;

  return React.createElement(
    'svg',
    {
      width: 540,
      height: 600,
      viewBox: '0 0 400 440',
      style: {
        transform: `translateY(${floatY}px)`,
        filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.65))',
      },
    },
    // Soft golden aura behind scholar
    React.createElement('circle', { cx: 200, cy: 190, r: 155, fill: 'rgba(245, 199, 103, 0.12)' }),
    React.createElement('circle', { cx: 200, cy: 190, r: 120, fill: 'rgba(245, 199, 103, 0.08)' }),

    // Shoulders & Jubbah (Robe)
    React.createElement('path', {
      d: 'M 75 440 C 75 315, 130 285, 200 285 C 270 285, 325 315, 325 440 Z',
      fill: '#1b4332',
      stroke: '#d4af37',
      strokeWidth: 4,
    }),
    // Inner White Thobe Collar
    React.createElement('path', {
      d: 'M 162 285 L 200 355 L 238 285 Z',
      fill: '#f8f9fa',
    }),
    // Gold Trim Lines on Jubbah
    React.createElement('line', { x1: 162, y1: 287, x2: 162, y2: 440, stroke: '#f5c767', strokeWidth: 4 }),
    React.createElement('line', { x1: 238, y1: 287, x2: 238, y2: 440, stroke: '#f5c767', strokeWidth: 4 }),

    // Head Group (tilts gently while explaining)
    React.createElement(
      'g',
      { style: { transform: `rotate(${headTilt}deg)`, transformOrigin: '200px 210px' } },
      // Neck
      React.createElement('rect', { x: 176, y: 245, width: 48, height: 48, rx: 14, fill: '#e0ac69' }),
      // Ears
      React.createElement('circle', { cx: 132, cy: 195, r: 16, fill: '#d49a55' }),
      React.createElement('circle', { cx: 268, cy: 195, r: 16, fill: '#d49a55' }),
      // Face
      React.createElement('rect', { x: 135, y: 125, width: 130, height: 140, rx: 62, fill: '#e0ac69' }),

      // Turban (Imamah)
      React.createElement('ellipse', { cx: 200, cy: 120, rx: 82, ry: 48, fill: '#ffffff' }),
      React.createElement('path', {
        d: 'M 122 128 Q 200 155 278 128 Q 268 85 200 85 Q 132 85 122 128 Z',
        fill: '#f1f3f5',
        stroke: '#dee2e6',
        strokeWidth: 2,
      }),
      React.createElement('path', {
        d: 'M 135 110 Q 200 132 265 110',
        fill: 'none',
        stroke: '#ced4da',
        strokeWidth: 3,
      }),
      // Top Kufi Cap Peak
      React.createElement('path', {
        d: 'M 155 88 Q 200 58 245 88 Z',
        fill: '#d4af37',
      }),

      // Eyebrows
      React.createElement('path', { d: 'M 156 168 Q 172 161 186 168', fill: 'none', stroke: '#2b2d42', strokeWidth: 4, strokeLinecap: 'round' }),
      React.createElement('path', { d: 'M 214 168 Q 228 161 244 168', fill: 'none', stroke: '#2b2d42', strokeWidth: 4, strokeLinecap: 'round' }),

      // Eyes (with natural blinking)
      isBlinking
        ? React.createElement(
            'g',
            null,
            React.createElement('line', { x1: 160, y1: 184, x2: 182, y2: 184, stroke: '#2b2d42', strokeWidth: 3.5, strokeLinecap: 'round' }),
            React.createElement('line', { x1: 218, y1: 184, x2: 240, y2: 184, stroke: '#2b2d42', strokeWidth: 3.5, strokeLinecap: 'round' })
          )
        : React.createElement(
            'g',
            null,
            React.createElement('circle', { cx: 171, cy: 184, r: 7, fill: '#1d1e2c' }),
            React.createElement('circle', { cx: 173, cy: 182, r: 2.2, fill: '#ffffff' }),
            React.createElement('circle', { cx: 229, cy: 184, r: 7, fill: '#1d1e2c' }),
            React.createElement('circle', { cx: 231, cy: 182, r: 2.2, fill: '#ffffff' })
          ),

      // Nose
      React.createElement('path', { d: 'M 200 184 L 195 208 L 204 210', fill: 'none', stroke: '#c68b48', strokeWidth: 3.5, strokeLinecap: 'round' }),

      // Full Beard
      React.createElement('path', {
        d: 'M 135 198 C 135 268, 168 292, 200 292 C 232 292, 265 268, 265 198 C 254 226, 232 232, 200 232 C 168 232, 146 226, 135 198 Z',
        fill: '#2b2d42',
      }),

      // Animated Speaking Mouth
      React.createElement('ellipse', {
        cx: 200,
        cy: 235,
        rx: 13,
        ry: mouthOpen / 2,
        fill: '#7f1d1d',
        stroke: '#e0ac69',
        strokeWidth: 2,
      })
    )
  );
};

const SceneView: React.FC<{ text: string; arabic?: string; theme: string; durationInFrames: number }> = ({
  text,
  arabic,
  theme,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Smooth fade-in over first 12 frames
  const opacity = Math.min(1, frame / 12);
  const slideUp = Math.max(0, 20 - (frame / 12) * 20);

  // Stop mouth movement during the 0.6s pause at the end of each scene
  const isSpeaking = frame < durationInFrames - 18;
  const isUrduOrArabic = /[\u0600-\u06FF]/.test(text);

  const bgGradient =
    theme === 'golden_light'
      ? 'radial-gradient(circle at 50% 30%, #3b2d1f 0%, #0d0d12 100%)'
      : 'radial-gradient(circle at 50% 30%, #132842 0%, #060911 100%)';

  return React.createElement(
    AbsoluteFill,
    {
      style: {
        background: bgGradient,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '70px 55px 90px 55px',
      },
    },
    // Top Section: Optional Arabic Verse Banner
    React.createElement(
      'div',
      { style: { minHeight: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' } },
      arabic
        ? React.createElement(
            'div',
            {
              dir: 'rtl',
              style: {
                fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
                fontSize: 56,
                color: '#f5c767',
                fontWeight: 'bold',
                lineHeight: 1.7,
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.35)',
                padding: '18px 34px',
                borderRadius: 24,
                border: '1px solid rgba(245,199,103,0.3)',
              },
            },
            arabic
          )
        : null
    ),

    // Middle Section: Animated Islamic Scholar Character
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: -20 } },
      React.createElement(ScholarCharacter, { isSpeaking })
    ),

    // Bottom Section: Big Exact Story Words Box
    React.createElement(
      'div',
      {
        style: {
          opacity,
          transform: `translateY(${slideUp}px)`,
          width: '100%',
          backgroundColor: 'rgba(10, 15, 28, 0.82)',
          border: '2px solid rgba(245, 199, 103, 0.35)',
          borderRadius: 32,
          padding: '38px 42px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.75)',
          textAlign: 'center',
        },
      },
      React.createElement(
        'div',
        {
          dir: isUrduOrArabic ? 'rtl' : 'ltr',
          style: {
            fontFamily: isUrduOrArabic ? "'Noto Nastaliq Urdu', serif" : 'sans-serif',
            fontSize: isUrduOrArabic ? 54 : 50,
            lineHeight: isUrduOrArabic ? 2.25 : 1.4,
            fontWeight: 700,
            color: '#ffffff',
            textShadow: '0 4px 16px rgba(0,0,0,0.9)',
          },
        },
        text
      )
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
        React.createElement(SceneView, {
          text: scene.text,
          arabic: scene.arabic,
          theme: scene.theme,
          durationInFrames,
        })
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
