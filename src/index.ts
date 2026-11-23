import React from 'react';
import { registerRoot, Composition, Sequence, Audio, staticFile, useCurrentFrame, AbsoluteFill } from 'remotion';

const Classroom: React.FC<{ speaker: string; speaking: boolean; count?: number }> = ({ speaker, speaking, count }) => {
  const f = useCurrentFrame();
  const blink = f % 95 > 90;
  const tMouth = speaker === 'teacher' && speaking ? Math.abs(Math.sin(f / 2.2)) * 12 + 3 : 2;
  const sMouth = speaker === 'student' && speaking ? Math.abs(Math.sin(f / 2.0)) * 10 + 3 : 2;
  const tTilt = speaker === 'teacher' && speaking ? Math.sin(f / 10) * 2.5 : 0;
  const sTilt = speaker === 'student' && speaking ? Math.sin(f / 9) * -3 : 0;

  return React.createElement(
    'svg',
    { width: 960, height: 820, viewBox: '0 0 800 680' },
    React.createElement('path', { d: 'M80 620 L80 260 Q80 60 400 60 Q720 60 720 260 L720 620 Z', fill: '#1b2e28', stroke: '#d4af37', strokeWidth: 5 }),
    React.createElement('path', { d: 'M115 620 L115 270 Q115 100 400 100 Q685 100 685 270 L685 620 Z', fill: '#243b33' }),
    React.createElement('line', { x1: 400, y1: 60, x2: 400, y2: 145, stroke: '#f5c767', strokeWidth: 3 }),
    React.createElement('polygon', { points: '382,145 418,145 426,185 400,205 374,185', fill: '#f5c767' }),
    React.createElement('rect', { x: 265, y: 225, width: 270, height: 175, rx: 18, fill: '#0f1f1a', stroke: '#c9a227', strokeWidth: 4 }),
    count !== undefined
      ? React.createElement('g', null,
          React.createElement('circle', { cx: 400, cy: 312, r: 58, fill: 'rgba(245,199,103,0.15)', stroke: '#f5c767', strokeWidth: 5 }),
          React.createElement('text', { x: 400, y: 334, textAnchor: 'middle', fill: '#f5c767', fontSize: 64, fontWeight: 'bold', fontFamily: 'sans-serif' }, String(count))
        )
      : React.createElement('g', null,
          React.createElement('circle', { cx: 400, cy: 312, r: 42, fill: '#f5c767', opacity: 0.85 }),
          React.createElement('circle', { cx: 416, cy: 304, r: 36, fill: '#0f1f1a' })
        ),
    React.createElement('rect', { x: 40, y: 585, width: 720, height: 65, rx: 20, fill: '#7f1d1d', stroke: '#f5c767', strokeWidth: 3 }),
    React.createElement('g', { opacity: speaker === 'teacher' ? 0.82 : 1, transform: `rotate(${sTilt} 210 460)` },
      React.createElement('path', { d: 'M125 595 C125 495 160 475 210 475 C260 475 295 495 295 595 Z', fill: '#f8f9fa', stroke: '#adb5bd', strokeWidth: 3 }),
      speaker === 'student' ? React.createElement('path', { d: 'M275 510 Q305 445 292 405', fill: 'none', stroke: '#e0ac69', strokeWidth: 18, strokeLinecap: 'round' }) : null,
      React.createElement('rect', { x: 162, y: 360, width: 96, height: 105, rx: 46, fill: '#e0ac69' }),
      React.createElement('path', { d: 'M162 392 Q210 342 258 392 Z', fill: '#ffffff', stroke: '#dee2e6', strokeWidth: 2 }),
      blink
        ? React.createElement('g', null, React.createElement('line', { x1: 182, y1: 412, x2: 198, y2: 412, stroke: '#1d1e2c', strokeWidth: 3 }), React.createElement('line', { x1: 222, y1: 412, x2: 238, y2: 412, stroke: '#1d1e2c', strokeWidth: 3 }))
        : React.createElement('g', null, React.createElement('circle', { cx: 190, cy: 412, r: 5.5, fill: '#1d1e2c' }), React.createElement('circle', { cx: 230, cy: 412, r: 5.5, fill: '#1d1e2c' })),
      React.createElement('ellipse', { cx: 210, cy: 440, rx: 9, ry: sMouth / 2, fill: '#7f1d1d' }),
      React.createElement('polygon', { points: '155,595 210,545 265,595 245,595 210,562 175,595', fill: '#8d5524' })
    ),

          'g',
          null,
          React.createElement('circle', {
            cx: 400,
            cy: 312,
               React.createElement('g', { opacity: speaker === 'student' ? 0.82 : 1, transform: `rotate(${tTilt} 585 430)` },
      React.createElement('path', { d: 'M480 595 C480 465 525 440 585 440 C645 440 690 465 690 595 Z', fill: '#14532d', stroke: '#f5c767', strokeWidth: 4 }),
      React.createElement('rect', { x: 530, y: 300, width: 110, height: 120, rx: 52, fill: '#e0ac69' }),
      React.createElement('ellipse', { cx: 585, cy: 298, rx: 70, ry: 40, fill: '#ffffff' }),
      React.createElement('path', { d: 'M548 272 Q585 246 622 272 Z', fill: '#d4af37' }),
      blink
        ? React.createElement('g', null, React.createElement('line', { x1: 552, y1: 350, x2: 570, y2: 350, stroke: '#1d1e2c', strokeWidth: 3 }), React.createElement('line', { x1: 600, y1: 350, x2: 618, y2: 350, stroke: '#1d1e2c', strokeWidth: 3 }))
        : React.createElement('g', null, React.createElement('circle', { cx: 561, cy: 350, r: 6, fill: '#1d1e2c' }), React.createElement('circle', { cx: 609, cy: 350, r: 6, fill: '#1d1e2c' })),
      React.createElement('path', { d: 'M530 364 C530 422 558 442 585 442 C612 442 640 422 640 364 C630 388 612 392 585 392 C558 392 540 388 530 364 Z', fill: '#2b2d42' }),
      React.createElement('ellipse', { cx: 585, cy: 394, rx: 11, ry: tMouth / 2, fill: '#7f1d1d' }),
      React.createElement('polygon', { points: '520,595 585,540 650,595 628,595 585,558 542,595', fill: '#8d5524' })
    )
  );
};

const SceneView: React.FC<{ text: string; arabic?: string; speaker?: string; frames: number }> = ({ text, arabic, speaker = 'teacher', frames }) => {
  const f = useCurrentFrame();
  const speaking = speaker !== 'silent' && f < frames - 15;
  const rtl = /[\u0600-\u06FF]/.test(text);
  const count = speaker === 'silent' ? Math.max(1, Math.ceil((frames - f) / 30)) : undefined;
  const label = speaker === 'student' ? 'طالبِ علم' : speaker === 'silent' ? 'سوچنے کا وقت' : 'استادِ محترم';
  const color = speaker === 'student' ? '#38bdf8' : '#f5c767';

  return React.createElement(
    AbsoluteFill,
    { style: { background: 'radial-gradient(circle at 50% 28%, #1e332c 0%, #070c0a 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '55px 50px 80px' } },
    React.createElement('div', { style: { minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      arabic ? React.createElement('div', { dir: 'rtl', style: { fontFamily: "'Noto Naskh Arabic', serif", fontSize: 52, color: '#f5c767', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.4)', padding: '14px 30px', borderRadius: 20, border: '1px solid rgba(245,199,103,0.35)' } }, arabic) : null
    ),
    React.createElement('div', { style: { marginTop: -30 } }, React.createElement(Classroom, { speaker, speaking, count })),
    React.createElement('div', { style: { opacity: Math.min(1, f / 10), width: '100%', backgroundColor: 'rgba(9,16,14,0.88)', border: `2px solid ${color}`, borderRadius: 32, padding: '30px 38px 36px', textAlign: 'center' } },
      React.createElement('div', { dir: 'rtl', style: { display: 'inline-block', backgroundColor: color, color: '#070c0a', fontFamily: "'Noto Nastaliq Urdu', sans-serif", fontSize: 28, fontWeight: 'bold', padding: '4px 24px', borderRadius: 999, marginBottom: 14 } }, label),
      React.createElement('div', { dir: rtl ? 'rtl' : 'ltr', style: { fontFamily: rtl ? "'Noto Nastaliq Urdu', serif" : 'sans-serif', fontSize: rtl ? 52 : 48, lineHeight: rtl ? 2.2 : 1.4, fontWeight: 700, color: '#ffffff' } }, text)
    )
  );
};

const MainVideo: React.FC<{ scenes?: any[] }> = ({ scenes = [] }) => {
  let cur = 0;
  return React.createElement(
    AbsoluteFill,
    { style: { backgroundColor: '#000' } },
    React.createElement(Audio, { src: staticFile('voiceover.mp3') }),
    scenes.map((s: any, i: number) => {
      const frames = Math.max(15, Math.round((Number(s.durationInSeconds) || 5) * 30));
      const from = cur;
      cur += frames;
      return React.createElement(Sequence, { key: i, from, durationInFrames: frames },
        React.createElement(SceneView, { text: String(s.text || ''), arabic: s.arabic, speaker: s.speaker || 'teacher', frames })
      );
    })
  );
};

export const RemotionRoot: React.FC = () => React.createElement(Composition, {
  id: 'IslamicVideo',
  component: MainVideo,
  durationInFrames: 150,
  fps: 30,
  width: 1080,
  height: 1920,
  defaultProps: { scenes: [] },
  calculateMetadata: async () => {
    const res = await fetch(staticFile('story.json'));
    const data = await res.json();
    const scenes = Array.isArray(data?.scenes) ? data.scenes : [];
    const total = scenes.reduce((a: number, s: any) => a + (Number(s.durationInSeconds) || 5), 0);
    return { durationInFrames: Math.max(30, Math.round(total * 30)), props: { scenes } };
  },
});

registerRoot(RemotionRoot);

        strokeWidth: 2,
      }),
      isBlinking
        ? React.createElement(
            'g',
            null,
            React.createElement('line', { x1: 182, y1: 412, x2: 198, y2: 412, stroke: '#1d1e2c', strokeWidth: 3 }),
            React.createElement('line', { x1: 222, y1: 412, x2: 238, y2: 412, stroke: '#1d1e2c', strokeWidth: 3 })
          )
        : React.createElement(
            'g',
            null,
            React.createElement('circle', { cx: 190, cy: 412, r: 5.5, fill: '#1d1e2c' }),
            React.createElement('circle', { cx: 230, cy: 412, r: 5.5, fill: '#1d1e2c' })
          ),
      React.createElement('ellipse', { cx: 210, cy: 440, rx: 9, ry: studentMouth / 2, fill: '#7f1d1d' }),
      React.createElement('polygon', { points: '155,595 210,545 265,595 245,595 210,562 175,595', fill: '#8d5524' }),
      React.createElement('polygon', { points: '165,542 210,552 255,542 248,532 210,542 172,532', fill: '#fffbeb' })
    ),
    React.createElement(
      'g',
      {
        opacity: speaker === 'student' ? 0.82 : 1,
        transform: `rotate(${teacherTilt} 585 430)`,
      },
      React.createElement('path', {
        d: 'M 480 595 C 480 465, 525 440, 585 440 C 645 440, 690 465, 690 595 Z',
        fill: '#14532d',
        stroke: '#f5c767',
        strokeWidth: 4,
      }),
      React.createElement('rect', { x: 530, y: 300, width: 110, height: 120, rx: 52, fill: '#e0ac69' }),
