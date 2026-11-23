import React from 'react';
import { registerRoot, Composition, Sequence, Audio, staticFile, useCurrentFrame, AbsoluteFill } from 'remotion';
import storyData from '../story.json';

const MadrasaClassroom: React.FC<{ speaker: string; isSpeaking: boolean; countdown?: number }> = ({
  speaker,
  isSpeaking,
  countdown,
}) => {
  const frame = useCurrentFrame();
  const isBlinking = frame % 95 > 90;

  // Teacher & Student animations
  const teacherSpeak = speaker === 'teacher' && isSpeaking;
  const studentSpeak = speaker === 'student' && isSpeaking;
  const teacherMouth = teacherSpeak ? Math.abs(Math.sin(frame / 2.2)) * 12 + 3 : 2;
  const studentMouth = studentSpeak ? Math.abs(Math.sin(frame / 2.0)) * 10 + 3 : 2;
  const teacherTilt = teacherSpeak ? Math.sin(frame / 10) * 2.5 : 0;
  const studentTilt = studentSpeak ? Math.sin(frame / 9) * -3 : 0;

  return React.createElement(
    'svg',
    { width: 960, height: 820, viewBox: '0 0 800 680' },

    // Warm Madrasa Arch Background
    React.createElement('path', {
      d: 'M 80 620 L 80 260 Q 80 60 400 60 Q 720 60 720 260 L 720 620 Z',
      fill: '#1b2e28',
      stroke: '#d4af37',
      strokeWidth: 5,
    }),
    // Inner Arch Glow
    React.createElement('path', {
      d: 'M 115 620 L 115 270 Q 115 100 400 100 Q 685 100 685 270 L 685 620 Z',
      fill: '#243b33',
    }),

    // Hanging Islamic Lantern
    React.createElement('line', { x1: 400, y1: 60, x2: 400, y2: 145, stroke: '#f5c767', strokeWidth: 3 }),
    React.createElement('polygon', { points: '382,145 418,145 426,185 400,205 374,185', fill: '#f5c767', opacity: 0.9 }),
    React.createElement('circle', { cx: 400, cy: 175, r: 45, fill: 'rgba(245, 199, 103, 0.16)' }),

    // Chalkboard / Wall Frame in Center
    React.createElement('rect', {
      x: 265,
      y: 225,
      width: 270,
      height: 175,
      rx: 18,
      fill: '#0f1f1a',
      stroke: '#c9a227',
      strokeWidth: 4,
    }),
    // Crescent & Star on Board (or Countdown Number during silent pause)
    countdown !== undefined
      ? React.createElement(
          'g',
          null,
          React.createElement('circle', {
            cx: 400,
            cy: 312,
            r: 58,
            fill: 'rgba(245, 199, 103, 0.15)',
            stroke: '#f5c767',
            strokeWidth: 5,
          }),
          React.createElement(
            'text',
            {
              x: 400,
              y: 334,
              textAnchor: 'middle',
              fill: '#f5c767',
              fontSize: 64,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
            },
            String(countdown)
          )
        )
      : React.createElement(
          'g',
          null,
          React.createElement('circle', { cx: 400, cy: 312, r: 42, fill: '#f5c767', opacity: 0.85 }),
          React.createElement('circle', { cx: 416, cy: 304, r: 36, fill: '#0f1f1a' })
        ),

    // Carpet Floor
    React.createElement('rect', { x: 40, y: 585, width: 720, height: 65, rx: 20, fill: '#7f1d1d', stroke: '#f5c767', strokeWidth: 3 }),

    // ================= LEFT SIDE: MADRASA STUDENT =================
    React.createElement(
      'g',
      {
        style: {
          opacity: speaker === 'teacher' ? 0.82 : 1,
          transform: `rotate(${studentTilt}deg)`,
          transformOrigin: '210px 460px',
        },
      },
      // Student Body (White Kurta)
      React.createElement('path', {
        d: 'M 125 595 C 125 495, 160 475, 210 475 C 260 475, 295 495, 295 595 Z',
        fill: '#f8f9fa',
        stroke: '#adb5bd',
        strokeWidth: 3,
      }),
      // Raised Hand when Student Answers!
      speaker === 'student'
        ? React.createElement('path', {
            d: 'M 275 510 Q 305 445 292 405',
            fill: 'none',
            stroke: '#e0ac69',
            strokeWidth: 18,
            strokeLinecap: 'round',
          })
        : null,
      // Student Head
      React.createElement('rect', { x: 162, y: 360, width: 96, height: 105, rx: 46, fill: '#e0ac69' }),
      // White Kufi Prayer Cap
      React.createElement('path', {
        d: 'M 162 392 Q 210 342 258 392 Z',
        fill: '#ffffff',
        stroke: '#dee2e6',
        strokeWidth: 2,
      }),
      // Student Eyes
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
      // Student Mouth
      React.createElement('ellipse', { cx: 210, cy: 440, rx: 9, ry: studentMouth / 2, fill: '#7f1d1d' }),
      // Wooden Rehal (Bookstand) & Quran in front of Student
      React.createElement('polygon', { points: '155,595 210,545 265,595 245,595 210,562 175,595', fill: '#8d5524' }),
      React.createElement('polygon', { points: '165,542 210,552 255,542 248,532 210,542 172,532', fill: '#fffbeb' })
    ),

    // ================= RIGHT SIDE: USTAD (ISLAMIC TEACHER) =================
    React.createElement(
      'g',
      {
        style: {
          opacity: speaker === 'student' ? 0.82 : 1,
          transform: `rotate(${teacherTilt}deg)`,
          transformOrigin: '585px 430px',
        },
      },
      // Teacher Jubbah
      React.createElement('path', {
        d: 'M 480 595 C 480 465, 525 440, 585 440 C 645 440, 690 465, 690 595 Z',
        fill: '#14532d',
        stroke: '#f5c767',
        strokeWidth: 4,
      }),
      // Teacher Head
      React.createElement('rect', { x: 530, y: 300, width: 110, height: 120, rx: 52, fill: '#e0ac69' }),
      // Teacher Imamah (Turban)
      React.createElement('ellipse', { cx: 585, cy: 298, rx: 70, ry: 40, fill: '#ffffff' }),
      React.createElement('path', { d: 'M 548 272 Q 585 246 622 272 Z', fill: '#d4af37' }),
      // Teacher Eyes
      isBlinking
        ? React.createElement(
            'g',
            null,
            React.createElement('line', { x1: 552, y1: 350, x2: 570, y2: 350, stroke: '#1d1e2c', strokeWidth: 3 }),
            React.createElement('line', { x1: 600, y1: 350, x2: 618, y2: 350, stroke: '#1d1e2c', strokeWidth: 3 })
          )
        : React.createElement(
            'g',
            null,
            React.createElement('circle', { cx: 561, cy: 350, r: 6, fill: '#1d1e2c' }),
            React.createElement('circle', { cx: 609, cy: 350, r: 6, fill: '#1d1e2c' })
          ),
      // Teacher Beard
      React.createElement('path', {
        d: 'M 530 364 C 530 422, 558 442, 585 442 C 612 442, 640 422, 640 364 C 630 388, 612 392, 585 392 C 558 392, 540 388, 530 364 Z',
        fill: '#2b2d42',
      }),
      // Teacher Speaking Mouth
      React.createElement('ellipse', { cx: 585, cy: 394, rx: 11, ry: teacherMouth / 2, fill: '#7f1d1d' }),
      // Teacher Wooden Rehal
      React.createElement('polygon', { points: '520,595 585,540 650,595 628,595 585,558 542,595', fill: '#8d5524' })
    )
  );
};

const SceneView: React.FC<{
  text: string;
  arabic?: string;
  speaker?: string;
  durationInFrames: number;
}> = ({ text, arabic, speaker = 'teacher', durationInFrames }) => {
  const frame = useCurrentFrame();
  const opacity = Math.min(1, frame / 10);
  const isSpeaking = speaker !== 'silent' && frame < durationInFrames - 15;
  const isUrduOrArabic = /[\u0600-\u06FF]/.test(text);

  // Calculate live 5 -> 1 countdown if this is a silent thinking scene
  const countdown =
    speaker === 'silent'
      ? Math.max(1, Math.ceil((durationInFrames - frame) / 30))
      : undefined;

  const badgeLabel =
    speaker === 'student'
      ? 'طالبِ علم (Student)'
      : speaker === 'silent'
      ? 'سوچنے کا وقت (5 سیکنڈ)'
      : 'استادِ محترم (Teacher)';

  const badgeColor = speaker === 'student' ? '#38bdf8' : '#f5c767';

  return React.createElement(
    AbsoluteFill,
    {
      style: {
        background: 'radial-gradient(circle at 50% 28%, #1e332c 0%, #070c0a 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '55px 50px 80px 50px',
      },
    },

    // Top Arabic Verse or Speaker Tag
    React.createElement(
      'div',
      { style: { minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' } },
      arabic
        ? React.createElement(
            'div',
            {
              dir: 'rtl',
              style: {
                fontFamily: "'Noto Naskh Arabic', 'Amiri', serif",
                fontSize: 52,
                color: '#f5c767',
                fontWeight: 'bold',
                lineHeight: 1.6,
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
                padding: '14px 30px',
                borderRadius: 20,
                border: '1px solid rgba(245,199,103,0.35)',
              },
            },
            arabic
          )
        : null
    ),

    // Center: Madrasa Classroom with Animated Teacher & Student
    React.createElement(
      'div',
      { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: -30 } },
      React.createElement(MadrasaClassroom, { speaker, isSpeaking, countdown })
    ),

    // Bottom: Large Caption Card with Speaker Badge
    React.createElement(
      'div',
      {
        style: {
          opacity,
          width: '100%',
          backgroundColor: 'rgba(9, 16, 14, 0.88)',
          border: `2px solid ${badgeColor}`,
          borderRadius: 32,
          padding: '32px 40px 38px 40px',
