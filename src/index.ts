import React from 'react';
import { registerRoot, Composition, Sequence, Audio, staticFile, useCurrentFrame, AbsoluteFill } from 'remotion';

const MadrasaClassroom: React.FC<{ speaker: string; isSpeaking: boolean; countdown?: number }> = ({
  speaker,
  isSpeaking,
  countdown,
}) => {
  const frame = useCurrentFrame();
  const isBlinking = frame % 95 > 90;

  const teacherSpeak = speaker === 'teacher' && isSpeaking;
  const studentSpeak = speaker === 'student' && isSpeaking;
  const teacherMouth = teacherSpeak ? Math.abs(Math.sin(frame / 2.2)) * 12 + 3 : 2;
  const studentMouth = studentSpeak ? Math.abs(Math.sin(frame / 2.0)) * 10 + 3 : 2;
  const teacherTilt = teacherSpeak ? Math.sin(frame / 10) * 2.5 : 0;
  const studentTilt = studentSpeak ? Math.sin(frame / 9) * -3 : 0;

  return React.createElement(
    'svg',
    { width: 960, height: 820, viewBox: '0 0 800 680' },
    React.createElement('path', {
      d: 'M 80 620 L 80 260 Q 80 60 400 60 Q 720 60 720 260 L 720 620 Z',
      fill: '#1b2e28',
      stroke: '#d4af37',
      strokeWidth: 5,
    }),
    React.createElement('path', {
      d: 'M 115 620 L 115 270 Q 115 100 400 100 Q 685 100 685 270 L 685 620 Z',
      fill: '#243b33',
    }),
    React.createElement('line', { x1: 400, y1: 60, x2: 400, y2: 145, stroke: '#f5c767', strokeWidth: 3 }),
    React.createElement('polygon', { points: '382,145 418,145 426,185 400,205 374,185', fill: '#f5c767', opacity: 0.9 }),
    React.createElement('circle', { cx: 400, cy: 175, r: 45, fill: 'rgba(245, 199, 103, 0.16)' }),
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
    React.createElement('rect', { x: 40, y: 585, width: 720, height: 65, rx: 20, fill: '#7f1d1d', stroke: '#f5c767', strokeWidth: 3 }),
    React.createElement(
      'g',
      {
        opacity: speaker === 'teacher' ? 0.82 : 1,
        transform: `rotate(${studentTilt} 210 460)`,
      },
      React.createElement('path', {
        d: 'M 125 595 C 125 495, 160 475, 210 475 C 260 475, 295 495, 295 595 Z',
        fill: '#f8f9fa',
        stroke: '#adb5bd',
        strokeWidth: 3,
      }),
      speaker === 'student'
        ? React.createElement('path', {
            d: 'M 275 510 Q 305 445 292 405',
            fill: 'none',
            stroke: '#e0ac69',
            strokeWidth: 18,
            strokeLinecap: 'round',
          })
        : null,
      React.createElement('rect', { x: 162, y: 360, width: 96, height: 105, rx: 46, fill: '#e0ac69' }),
      React.createElement('path', {
        d: 'M 162 392 Q 210 342 258 392 Z',
        fill: '#ffffff',
        stroke: '#dee2e6',
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
