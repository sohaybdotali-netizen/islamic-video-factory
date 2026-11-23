import React from 'react';
import { registerRoot, Composition, Sequence, Audio, OffthreadVideo, staticFile, useCurrentFrame, AbsoluteFill } from 'remotion';

const E = React.createElement;

const SPEAKER_CLIPS: Record<string, string> = {
  teacher: 'assets/teacher.mp4',
  silent: 'assets/silent.mp4',
  student: 'assets/student.mp4',
};

const SceneView: React.FC<{ text: string; arabic?: string; speaker?: string; frames: number }> = ({ text, arabic, speaker = 'teacher', frames }) => {
  const f = useCurrentFrame();
  const rtl = /[\u0600-\u06FF]/.test(text);
  const count = speaker === 'silent' ? Math.max(1, Math.ceil((frames - f) / 30)) : undefined;
  const label = speaker === 'student' ? 'طالبِ علم' : speaker === 'silent' ? 'سوچنے کا وقت' : 'استادِ محترم';
  const color = speaker === 'student' ? '#38bdf8' : '#f5c767';
  const clipPath = SPEAKER_CLIPS[speaker] || SPEAKER_CLIPS.teacher;

  return E(AbsoluteFill, { style: { backgroundColor: '#070c0a' } },
    // 1. Full-screen 3D Cartoon Background Loop
    E(OffthreadVideo, {
      src: staticFile(clipPath),
      loop: true,
      muted: true,
      style: { width: '100%', height: '100%', objectFit: 'cover' },
    }),

    // 2. Subtle gradient overlay so top Arabic & bottom Urdu captions stay readable
    E(AbsoluteFill, {
      style: {
        background: 'linear-gradient(180deg, rgba(7,12,10,0.55) 0%, rgba(7,12,10,0.05) 35%, rgba(7,12,10,0.15) 65%, rgba(7,12,10,0.82) 100%)',
      },
    }),

    // 3. Foreground UI (Arabic Verse + Countdown + Urdu Caption Box)
    E(AbsoluteFill, {
      style: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '60px 50px 80px',
      },
    },
      // Top Arabic Verse
      E('div', { style: { minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        arabic
          ? E('div', {
              dir: 'rtl',
              style: {
                fontFamily: "'Noto Naskh Arabic', serif",
                fontSize: 52,
                color: '#f5c767',
                fontWeight: 'bold',
                backgroundColor: 'rgba(0,0,0,0.6)',
                padding: '14px 30px',
                borderRadius: 20,
                border: '1px solid rgba(245,199,103,0.45)',
              },
            }, arabic)
          : null
      ),

      // Center 5-to-1 Countdown Circle (only during 'silent' scenes)
      count !== undefined
        ? E('div', {
            style: {
              width: 170,
              height: 170,
              borderRadius: '50%',
              backgroundColor: 'rgba(7,12,10,0.72)',
              border: '6px solid #f5c767',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f5c767',
              fontSize: 88,
              fontWeight: 'bold',
              fontFamily: 'sans-serif',
              boxShadow: '0 0 35px rgba(245,199,103,0.35)',
            },
          }, String(count))
        : E('div', null),

      // Bottom Urdu Caption Box
      E('div', {
        style: {
          opacity: Math.min(1, f / 10),
          width: '100%',
          backgroundColor: 'rgba(9,16,14,0.88)',
          border: `2px solid ${color}`,
          borderRadius: 32,
          padding: '30px 38px 36px',
          textAlign: 'center',
        },
      },
        E('div', {
          dir: 'rtl',
          style: {
            display: 'inline-block',
            backgroundColor: color,
            color: '#070c0a',
            fontFamily: "'Noto Nastaliq Urdu', sans-serif",
            fontSize: 28,
            fontWeight: 'bold',
            padding: '4px 24px',
            borderRadius: 999,
            marginBottom: 14,
          },
        }, label),
        E('div', {
          dir: rtl ? 'rtl' : 'ltr',
          style: {
            fontFamily: rtl ? "'Noto Nastaliq Urdu', serif" : 'sans-serif',
            fontSize: rtl ? 52 : 48,
            lineHeight: rtl ? 2.2 : 1.4,
            fontWeight: 700,
            color: '#ffffff',
          },
        }, text)
      )
    )
  );
};

const MainVideo: React.FC<{ scenes?: any[] }> = ({ scenes = [] }) => {
  let cur = 0;
  return E(AbsoluteFill, { style: { backgroundColor: '#000' } },
    E(Audio, { src: staticFile('voiceover.mp3') }),
    scenes.map((s: any, i: number) => {
      const frames = Math.max(15, Math.round((Number(s.durationInSeconds) || 5) * 30));
      const from = cur;
      cur += frames;
      return E(Sequence, { key: i, from, durationInFrames: frames },
        E(SceneView, {
          text: String(s.text || ''),
          arabic: s.arabic,
          speaker: s.speaker || 'teacher',
          frames,
        })
      );
    })
  );
};

export const RemotionRoot: React.FC = () => E(Composition, {
  id: 'IslamicVideo',
  component: MainVideo,
  durationInFrames: 150,
  fps: 30,
  width: 1080,
  height: 1920,
  defaultProps: { scenes: [] },
  calculateMetadata: async () => {
    const data = await (await fetch(staticFile('story.json'))).json();
    const scenes = Array.isArray(data?.scenes) ? data.scenes : [];
    const total = scenes.reduce((a: number, s: any) => a + (Number(s.durationInSeconds) || 5), 0);
    return { durationInFrames: Math.max(30, Math.round(total * 30)), props: { scenes } };
  },
});

registerRoot(RemotionRoot);
