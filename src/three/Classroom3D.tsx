import React from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useCurrentFrame, useVideoConfig} from 'remotion';

type Speaker = 'teacher' | 'student' | 'silent';

type CharacterProps = {
  role: 'teacher' | 'student';
  speaker: Speaker;
  x: number;
  frame: number;
};

const Arm: React.FC<{
  side: -1 | 1;
  raised: boolean;
  sleeveColor: string;
}> = ({side, raised, sleeveColor}) => {
  const angle = raised
    ? (side === 1 ? 2.35 : -2.35)
    : (side === 1 ? 0.18 : -0.18);

  return (
    <group position={[side * 0.53, 1.18, 0.03]} rotation={[0, 0, angle]}>
      <mesh position={[0, -0.37, 0]} castShadow>
        <capsuleGeometry args={[0.145, 0.58, 5, 10]} />
        <meshStandardMaterial color={sleeveColor} roughness={0.88} />
      </mesh>
      <mesh position={[0, -0.77, 0.015]} castShadow>
        <sphereGeometry args={[0.16, 18, 18]} />
        <meshStandardMaterial color="#dba77f" roughness={0.82} />
      </mesh>
    </group>
  );
};

const Character: React.FC<CharacterProps> = ({role, speaker, x, frame}) => {
  const isTeacher = role === 'teacher';
  const active = speaker === role;
  const bodyColor = isTeacher ? '#eee8dc' : '#f5f1e8';
  const vestColor = isTeacher ? '#214b3a' : '#18533e';
  const mouthOpen = active ? 0.035 + Math.abs(Math.sin(frame * 0.56)) * 0.085 : 0.018;
  const headBob = active ? Math.sin(frame / 8) * 0.035 : Math.sin(frame / 40) * 0.012;
  const raisedArm = role === 'student'
    ? speaker === 'student'
    : speaker === 'teacher';

  return (
    <group position={[x, -1.45, 0]} rotation={[0, Math.sin(frame / 75 + x) * 0.025, 0]}>
      {/* Body and tunic */}
      <mesh position={[0, 0.72, 0]} scale={[0.59, 0.83, 0.42]} castShadow>
        <sphereGeometry args={[1, 28, 24]} />
        <meshStandardMaterial color={bodyColor} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.78, 0.365]} castShadow>
        <boxGeometry args={[0.82, 1.05, 0.16]} />
        <meshStandardMaterial color={vestColor} roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[0, 1.43, 0.02]}>
        <cylinderGeometry args={[0.19, 0.2, 0.28, 20]} />
        <meshStandardMaterial color="#dba77f" roughness={0.85} />
      </mesh>

      {/* Arms: the student raises a hand when answering; the teacher gestures when speaking. */}
      <Arm side={-1} raised={false} sleeveColor={bodyColor} />
      <Arm side={1} raised={raisedArm} sleeveColor={bodyColor} />

      {/* Head and face */}
      <group position={[0, 1.93 + headBob, 0]}>
        <mesh scale={[0.55, 0.69, 0.49]} castShadow>
          <sphereGeometry args={[1, 36, 30]} />
          <meshStandardMaterial color="#e4b28a" roughness={0.78} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 0.43, -0.02]} scale={[0.53, 0.30, 0.47]}>
          <sphereGeometry args={[1, 24, 20]} />
          <meshStandardMaterial color="#28201c" roughness={0.95} />
        </mesh>

        {/* White turban for the teacher; white prayer cap for the student. */}
        {isTeacher ? (
          <group position={[0, 0.57, 0]}>
            <mesh scale={[0.68, 0.31, 0.55]}>
              <sphereGeometry args={[1, 32, 24]} />
              <meshStandardMaterial color="#fffdf7" roughness={0.82} />
            </mesh>
            <mesh position={[0, -0.10, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.53, 0.055, 8, 36]} />
              <meshStandardMaterial color="#e5dfd2" roughness={0.9} />
            </mesh>
            <mesh position={[-0.22, 0.12, 0.12]} rotation={[0, 0, -0.32]} scale={[0.42, 0.13, 0.3]}>
              <sphereGeometry args={[1, 20, 16]} />
              <meshStandardMaterial color="#fffefa" roughness={0.85} />
            </mesh>
          </group>
        ) : (
          <group position={[0, 0.58, 0]}>
            <mesh>
              <cylinderGeometry args={[0.49, 0.54, 0.22, 32]} />
              <meshStandardMaterial color="#fffdf7" roughness={0.86} />
            </mesh>
            <mesh position={[0, 0.10, 0]} scale={[0.48, 0.12, 0.48]}>
              <sphereGeometry args={[1, 24, 16]} />
              <meshStandardMaterial color="#fffdf7" roughness={0.86} />
            </mesh>
          </group>
        )}

        {/* Eyes and brows */}
        {([-1, 1] as const).map((side) => (
          <group key={side} position={[side * 0.205, 0.10, 0.435]}>
            <mesh position={[0, 0.075, 0]} scale={[0.095, 0.035, 0.025]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color="#35251e" roughness={0.9} />
            </mesh>
            <mesh scale={[0.045, 0.06, 0.035]}>
              <sphereGeometry args={[1, 16, 16]} />
              <meshStandardMaterial color="#201b18" roughness={0.65} />
            </mesh>
            <mesh position={[0, -0.012, 0.025]} scale={[0.013, 0.019, 0.01]}>
              <sphereGeometry args={[1, 12, 12]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Nose and simple frame-driven mouth movement (basic lip sync). */}
        <mesh position={[0, -0.035, 0.49]} scale={[0.075, 0.11, 0.09]}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#d49b75" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.205, 0.475]} scale={[0.105, mouthOpen, 0.035]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#642c2b" roughness={0.75} />
        </mesh>

        {/* Beard and moustache for the Ustad. */}
        {isTeacher ? (
          <group>
            <mesh position={[0, -0.39, 0.30]} scale={[0.42, 0.38, 0.22]}>
              <sphereGeometry args={[1, 24, 20]} />
              <meshStandardMaterial color="#29231f" roughness={0.98} />
            </mesh>
            <mesh position={[-0.095, -0.18, 0.47]} rotation={[0, 0, -0.2]} scale={[0.14, 0.055, 0.055]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color="#29231f" roughness={0.98} />
            </mesh>
            <mesh position={[0.095, -0.18, 0.47]} rotation={[0, 0, 0.2]} scale={[0.14, 0.055, 0.055]}>
              <sphereGeometry args={[1, 16, 12]} />
              <meshStandardMaterial color="#29231f" roughness={0.98} />
            </mesh>
            {/* Simple glasses */}
            {([-1, 1] as const).map((side) => (
              <mesh key={side} position={[side * 0.205, 0.105, 0.48]}>
                <torusGeometry args={[0.135, 0.018, 8, 24]} />
                <meshStandardMaterial color="#30291f" metalness={0.5} roughness={0.35} />
              </mesh>
            ))}
            <mesh position={[0, 0.105, 0.48]}>
              <boxGeometry args={[0.12, 0.025, 0.025]} />
              <meshStandardMaterial color="#30291f" metalness={0.5} roughness={0.35} />
            </mesh>
          </group>
        ) : null}
      </group>

      {/* Gold buttons on the waistcoat */}
      {[0.95, 0.72, 0.49].map((y) => (
        <mesh key={y} position={[0, y, 0.46]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color="#d8b65e" metalness={0.75} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
};

const Bookshelf: React.FC<{x: number}> = ({x}) => {
  const colors = ['#9b453a', '#d0a74f', '#477c78', '#5b5c91', '#a56b38'];
  return (
    <group position={[x, 0.15, -2.55]}>
      <mesh>
        <boxGeometry args={[0.78, 2.9, 0.18]} />
        <meshStandardMaterial color="#53351f" roughness={0.9} />
      </mesh>
      {[-0.8, 0, 0.8].map((y) => (
        <mesh key={y} position={[0, y, 0.12]}>
          <boxGeometry args={[0.88, 0.09, 0.42]} />
          <meshStandardMaterial color="#bb8c4c" roughness={0.7} />
        </mesh>
      ))}
      {Array.from({length: 12}).map((_, index) => (
        <mesh key={index} position={[-0.29 + (index % 4) * 0.19, -0.56 + Math.floor(index / 4) * 0.8, 0.15]} rotation={[0, 0, (index % 3 - 1) * 0.04]}>
          <boxGeometry args={[0.12, 0.43 + (index % 2) * 0.10, 0.18]} />
          <meshStandardMaterial color={colors[index % colors.length]} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
};

export const Classroom3D: React.FC<{speaker: Speaker}> = ({speaker}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{position: [0, 0.7, 8.2], fov: 42}}
      dpr={1}
      gl={{antialias: true, alpha: false, powerPreference: 'low-power'}}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    >
      <color attach="background" args={['#07140f']} />
      <fog attach="fog" args={['#07140f', 10, 22]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[-4, 7, 6]} intensity={2.0} />
      <pointLight position={[-3, 3, 1]} color="#ffc77a" intensity={18} distance={12} />
      <pointLight position={[3, 3, -1]} color="#79b5a0" intensity={10} distance={10} />

      {/* Back wall and decorative Islamic arch */}
      <mesh position={[0, 1.25, -3.0]}>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial color="#18392d" roughness={1} />
      </mesh>
      <mesh position={[0, 1.1, -2.82]} scale={[1, 1.16, 1]}>
        <torusGeometry args={[2.15, 0.075, 10, 64]} />
        <meshStandardMaterial color="#c8a454" metalness={0.58} roughness={0.36} />
      </mesh>

      {/* Blackboard */}
      <mesh position={[0, 1.08, -2.68]}>
        <boxGeometry args={[2.45, 1.48, 0.12]} />
        <meshStandardMaterial color="#103e2e" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.08, -2.595]}>
        <boxGeometry args={[2.31, 1.34, 0.018]} />
        <meshStandardMaterial color="#0a3023" roughness={1} />
      </mesh>
      <mesh position={[0, 1.08, -2.57]} rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[0.31, 0.018, 6, 4]} />
        <meshStandardMaterial color="#d4b461" metalness={0.45} roughness={0.4} />
      </mesh>

      <Bookshelf x={-3.05} />
      <Bookshelf x={3.05} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.47, 0]}>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#3b2a20" roughness={0.92} />
      </mesh>

      {/* Teacher and student */}
      <Character role="teacher" speaker={speaker} x={-0.96} frame={frame} />
      <Character role="student" speaker={speaker} x={0.96} frame={frame} />

      {/* Wooden desk, open book and small brass details */}
      <mesh position={[0, -0.60, 0.92]}>
        <boxGeometry args={[4.65, 0.16, 1.05]} />
        <meshStandardMaterial color="#68452b" roughness={0.72} />
      </mesh>
      <mesh position={[-1.35, -0.96, 0.93]}>
        <boxGeometry args={[0.16, 0.65, 0.85]} />
        <meshStandardMaterial color="#51341f" roughness={0.8} />
      </mesh>
      <mesh position={[1.35, -0.96, 0.93]}>
        <boxGeometry args={[0.16, 0.65, 0.85]} />
        <meshStandardMaterial color="#51341f" roughness={0.8} />
      </mesh>
      <group position={[0, -0.48, 0.42]} rotation={[-0.12, 0, 0]}>
        <mesh position={[-0.26, 0, 0]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.52, 0.045, 0.48]} />
          <meshStandardMaterial color="#e9dfc7" roughness={0.96} />
        </mesh>
        <mesh position={[0.26, 0, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.52, 0.045, 0.48]} />
          <meshStandardMaterial color="#f5ecd9" roughness={0.96} />
        </mesh>
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.025, 0.06, 0.49]} />
          <meshStandardMaterial color="#9c7546" roughness={0.9} />
        </mesh>
      </group>

      {/* Subtle camera drift, deterministic from the Remotion frame */}
      <group position={[Math.sin(frame / 180) * 0.035, Math.sin(frame / 95) * 0.018, 0]} />
    </ThreeCanvas>
  );
};
