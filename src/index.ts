
import React from 'react';
import {
  registerRoot,
  Composition,
  Sequence,
  Audio,
  staticFile,
  useCurrentFrame,
  AbsoluteFill,
} from 'remotion';

const E = React.createElement;

type Speaker = 'teacher' | 'student' | 'silent';

interface StoryScene {
  text?: string;
  arabic?: string;
  speaker?: string;
  durationInSeconds?: number;
}

// Animated classroom illustration.
// No external MP4 character videos are required.
const Classroom: React.FC<{ speaker: Speaker }> = ({ speaker }) => {
  const frame = useCurrentFrame();
  const blink = frame % 100 > 95;

  const teacherMouth =
    speaker === 'teacher'
      ? 3 + Math.abs(Math.sin(frame / 2.2)) * 12
      : 2;

  const studentMouth =
    speaker === 'student'
      ? 3 + Math.abs(Math.sin(frame / 2)) * 10
      : 2;

  return E('svg', {
    viewBox: '0 0 900 760',
    width: '100%',
    height: '100%',
    preserveAspectRatio: 'xMidYMid meet',
  },

    // Classroom background
    E('defs', null,
      E('linearGradient', { id: 'room', x1: '0', y1: '0', x2: '0', y2: '1' },
        E('stop', { offset: '0%', stopColor: '#294d3e' }),
        E('stop', { offset: '100%', stopColor: '#081d16' })
      ),
      E('linearGradient', { id: 'board', x1: '0', y1: '0', x2: '1', y2: '1' },
        E('stop', { offset: '0%', stopColor: '#174d37' }),
        E('stop', { offset: '100%', stopColor: '#092b20' })
      )
    ),

    E('rect', {
      x: 5, y: 5, width: 890, height: 750,
      rx: 40, fill: 'url(#room)',
      stroke: '#d5b45b', strokeWidth: 7
    }),

    // Islamic architectural arch
    E('path', {
      d: 'M75 640 V280 Q75 65 450 65 Q825 65 825 280 V640',
      fill: 'none', stroke: '#d5b45b', strokeWidth: 9
    }),

    // Classroom windows
    E('g', { opacity: 0.65 },
      E('rect', { x: 25, y: 250, width: 90, height: 250, rx: 10, fill: '#9bc7b6', stroke: '#d5b45b', strokeWidth: 6 }),
      E('path', { d: 'M70 250 V500 M25 375 H115', stroke: '#d5b45b', strokeWidth: 5 }),
      E('rect', { x: 785, y: 250, width: 90, height: 250, rx: 10, fill: '#9bc7b6', stroke: '#d5b45b', strokeWidth: 6 }),
      E('path', { d: 'M830 250 V500 M785 375 H875', stroke: '#d5b45b', strokeWidth: 5 })
    ),

    // Blackboard
    E('rect', {
      x: 300, y: 155, width: 300, height: 225,
      rx: 18, fill: 'url(#board)',
      stroke: '#d5b45b', strokeWidth: 7
    }),

    E('path', {
      d: 'M355 225 H545 M375 260 H525',
      stroke: '#d9e5d8', strokeWidth: 5,
      opacity: 0.45, strokeLinecap: 'round'
    }),

    E('circle', {
      cx: 450, cy: 305, r: 38,
      fill: 'none', stroke: '#e5c66e', strokeWidth: 4
    }),

    E('path', {
      d: 'M450 270 Q490 305 450 340 Q410 305 450 270',
      fill: '#e5c66e'
    }),

    // Teacher: white turban and dark waistcoat
    E('g', { opacity: speaker === 'student' ? 0.7 : 1 },

      E('path', {
        d: 'M105 735 Q110 555 230 550 Q350 555 355 735 Z',
        fill: '#f4f0e7', stroke: '#c9bda9', strokeWidth: 4
      }),

      E('path', {
        d: 'M170 555 L230 640 L290 555 L310 735 H150 Z',
        fill: '#263e35', stroke: '#c9a34a', strokeWidth: 4
      }),

      E('rect', {
        x: 195, y: 475, width: 70, height: 85,
        rx: 25, fill: '#d8a477'
      }),

      E('ellipse', {
        cx: 230, cy: 405, rx: 82, ry: 100,
        fill: '#d8a477', stroke: '#a87552', strokeWidth: 3
      }),

      E('path', {
        d: 'M148 380 Q145 275 230 270 Q315 275 312 380 Q285 340 230 340 Q175 340 148 380',
        fill: '#fffdf7', stroke: '#d9d5cb', strokeWidth: 4
      }),

      E('path', {
        d: 'M165 320 Q230 290 295 320 M158 345 Q230 315 302 345',
        fill: 'none', stroke: '#d9d5cb', strokeWidth: 7
      }),

      blink
        ? E('path', {
            d: 'M190 405 H208 M252 405 H270',
            stroke: '#241b18', strokeWidth: 5
          })
        : E('g', null,
            E('circle', { cx: 200, cy: 405, r: 6, fill: '#241b18' }),
            E('circle', { cx: 260, cy: 405, r: 6, fill: '#241b18' })
          ),

      E('path', {
        d: 'M224 420 L218 445 Q230 452 242 445',
        fill: 'none', stroke: '#a46f4f', strokeWidth: 4
      }),

      E('path', {
        d: 'M175 455 Q230 480 285 455 Q280 535 230 545 Q180 535 175 455 Z',
        fill: '#29221e'
      }),

      E('ellipse', {
        cx: 230, cy: 466, rx: 12,
        ry: teacherMouth, fill: '#6f2c2c'
      }),

      // Teacher's teaching hand
      E('path', {
        d: 'M150 590 Q105 620 98 680',
        fill: 'none', stroke: '#f4f0e7',
        strokeWidth: 31, strokeLinecap: 'round'
      })
    ),

    // Student: white topi and green waistcoat
    E('g', { opacity: speaker === 'teacher' ? 0.7 : 1 },

      E('path', {
        d: 'M545 735 Q550 565 670 560 Q790 565 795 735 Z',
        fill: '#f5f1e7', stroke: '#c9bda9', strokeWidth: 4
      }),

      E('path', {
        d: 'M610 565 L670 640 L730 565 L750 735 H590 Z',
        fill: '#1c563f', stroke: '#c9a34a', strokeWidth: 4
      }),

      E('rect', {
        x: 635, y: 490, width: 70, height: 82,
        rx: 25, fill: '#d8a477'
      }),

      E('ellipse', {
        cx: 670, cy: 415, rx: 78, ry: 96,
        fill: '#d8a477', stroke: '#a87552', strokeWidth: 3
      }),

      E('path', {
        d: 'M592 375 Q600 295 670 290 Q740 295 748 375 Q670 345 592 375',
        fill: '#fffdf7', stroke: '#d9d5cb', strokeWidth: 4
      }),

      blink
        ? E('path', {
            d: 'M630 410 H645 M695 410 H710',
            stroke: '#241b18', strokeWidth: 5
          })
        : E('g', null,
            E('circle', { cx: 638, cy: 410, r: 6, fill: '#241b18' }),
            E('circle', { cx: 702, cy: 410, r: 6, fill: '#241b18' })
          ),

      E('path', {
        d: 'M663 430 L658 450 Q670 456 682 450',
        fill: 'none', stroke: '#a46f4f', strokeWidth: 4
      }),

      E('ellipse', {
        cx: 670, cy: 470, rx: 11,
        ry: studentMouth, fill: '#6f2c2c'
      }),

      // Student raises his hand when answering
      E('path', {
        d: speaker === 'student'
          ? 'M750 610 Q785 540 770 445'
          : 'M750 610 Q780 635 790 675',
        fill: 'none', stroke: '#f5f1e7',
        strokeWidth: 31, strokeLinecap: 'round'
      }),

      speaker === 'student'
        ? E('path', {
            d: 'M770 445 Q760 415 774 390',
            fill: 'none', stroke: '#d8a477',
            strokeWidth: 21, strokeLinecap: 'round'
          })
        : null
    ),

    // Foreground wooden desk and open book
    E('path', {
      d: 'M45 700 Q450 665 855 700 L855 750 H45 Z',
      fill: '#563821', stroke: '#d0a45a', strokeWidth: 5
    }),

    E('path', {
      d: 'M390 700 Q450 670 510 700 L510 730 Q450 705 390 730 Z',
      fill: '#f2e8cf', stroke: '#b99c68', strokeWidth: 3
    }),

    E('path', {
      d: 'M450 680 V730',
      stroke: '#b99c68', strokeWidth: 2
    })
  );
};

// Individual scene with Urdu captions and countdown
const SceneView: React.FC<{
  text: string;
  arabic?: string;
  speaker?: Speaker;
  frames: number;
}> = ({ text, arabic, speaker = 'teacher', frames }) => {

  const frame = useCurrentFrame();
  const rtl = /[\u0600-\u06FF]/.test(text);

  const count = speaker === 'silent'
    ? Math.max(1, Math.ceil((frames - frame) / 30))
    : undefined;

  const label = speaker === 'student'
    ? 'طالب علم'
    : speaker === 'silent'
      ? 'سوچنے کا وقت'
      : 'استاد';

  const accent = speaker === 'student' ? '#38bdf8' : '#f5c767';

  return E(AbsoluteFill, {
    style: {
      background: 'radial-gradient(ellipse at 50% 25%, #1b3c2e 0%, #070c0a 75%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '48px 48px 72px',
      boxSizing: 'border-box'
    }
  },

    // Optional Quranic or Hadith Arabic text
    E('div', {
      style: {
        minHeight: 105,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    },
      arabic
        ? E('div', {
            dir: 'rtl',
            style: {
              fontFamily: "'Noto Naskh Arabic', serif",
              fontSize: 48,
              color: '#f5c767',
              fontWeight: 'bold',
              textAlign: 'center',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '12px 28px',
              borderRadius: 20,
              border: '1px solid rgba(245,199,103,0.45)'
            }
          }, arabic)
        : null
    ),

    // Animated classroom illustration and countdown
    E('div', {
      style: {
        width: '100%',
        height: '61%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }
    },
      E(Classroom, { speaker }),

      count !== undefined
        ? E('div', {
            style: {
              position: 'absolute',
              left: '50%',
              top: '48%',
              transform: 'translate(-50%, -50%)',
              width: 150,
              height: 150,
              borderRadius: '50%',
              border: '6px solid #f5c767',
              backgroundColor: 'rgba(7,12,10,0.92)',
              boxShadow: '0 0 35px rgba(245,199,103,0.45)',
              color: '#f5c767',
              fontFamily: 'sans-serif',
              fontSize: 88,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }
          }, String(count))
        : null
    ),

    // Urdu caption box
    E('div', {
      style: {
        width: '100%',
        backgroundColor: 'rgba(9,16,14,0.94)',
        border: `2px solid ${accent}`,
        borderRadius: 30,
        padding: '25px 32px 30px',
        boxSizing: 'border-box',
        textAlign: 'center',
        boxShadow: '0 12px 36px rgba(0,0,0,0.3)'
      }
    },

      E('div', {
        dir: 'rtl',
        style: {
          display: 'inline-block',
          backgroundColor: accent,
          color: '#07110d',
          fontFamily: "'Noto Nastaliq Urdu', sans-serif",
          fontSize: 27,
          fontWeight: 800,
          padding: '3px 24px 8px',
          borderRadius: 999,
          marginBottom: 10
        }
      }, label),

      E('div', {
        dir: rtl ? 'rtl' : 'ltr',
        style: {
          fontFamily: rtl
            ? "'Noto Nastaliq Urdu', serif"
            : 'sans-serif',
          fontSize: rtl ? 47 : 44,
          lineHeight: rtl ? 1.95 : 1.35,
          fontWeight: 700,
          color: '#ffffff',
          overflowWrap: 'anywhere'
        }
      }, text)
    )
  );
};

// Main video composition
const MainVideo: React.FC<{ scenes?: StoryScene[] }> = ({
  scenes = []
}) => {

  let currentFrame = 0;

  return E(AbsoluteFill, {
    style: { backgroundColor: '#000000' }
  },

    // Existing generated Urdu voiceover
    E(Audio, {
      src: staticFile('voiceover.mp3')
    }),

    scenes.map((scene, index) => {
      const seconds = Number(scene.durationInSeconds) || 5;
      const durationInFrames = Math.max(
        15,
        Math.round(seconds * 30)
      );

      const from = currentFrame;
      currentFrame += durationInFrames;

      const speaker: Speaker =
        scene.speaker === 'student' ||
        scene.speaker === 'silent'
          ? scene.speaker
          : 'teacher';

      return E(Sequence, {
        key: index,
        from,
        durationInFrames
      },

        E(SceneView, {
          text: String(scene.text || ''),
          arabic: scene.arabic,
          speaker,
          frames: durationInFrames
        })
      );
    })
  );
};

// Remotion root and automatic story duration
export const RemotionRoot: React.FC = () => E(Composition, {
  id: 'IslamicVideo',
  component: MainVideo,
  durationInFrames: 150,
  fps: 30,
  width: 1080,
  height: 1920,
  defaultProps: { scenes: [] },

  calculateMetadata: async () => {
    const response = await fetch(staticFile('story.json'));

    if (!response.ok) {
      throw new Error(
        `Unable to load story.json: HTTP ${response.status}`
      );
    }

    const data = await response.json();

    const scenes: StoryScene[] =
      Array.isArray(data?.scenes) ? data.scenes : [];

    const totalSeconds = scenes.reduce(
      (sum, scene) =>
        sum + (Number(scene.durationInSeconds) || 5),
      0
    );

    return {
      durationInFrames: Math.max(
        30,
        Math.round(totalSeconds * 30)
      ),
      props: { scenes }
    };
  }
});

registerRoot(RemotionRoot);
