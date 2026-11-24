import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useFrame} from '@react-three/fiber';
import {useAnimations, useGLTF} from '@react-three/drei';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type Speaker = 'teacher' | 'student' | 'silent';
type Role = 'ustad' | 'student';

const RiggedCharacter: React.FC<{role: Role; speaker: Speaker; x: number}> = ({role, speaker, x}) => {
  const root = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const path = staticFile(`assets/${role}.glb`);
  const gltf = useGLTF(path);
  const {actions, mixer} = useAnimations(gltf.animations, root);

  const clip = role === 'ustad'
    ? (speaker === 'teacher' ? 'Explain' : speaker === 'silent' ? 'Idle' : 'Idle')
    : (speaker === 'student' ? 'Answer' : 'Idle');

  useEffect(() => {
    mixer.stopAllAction();
    const action = actions[clip];
    if (action) {
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.play();
    }
  }, [actions, clip, mixer]);

  useFrame(() => {
    // Set the animation clock from Remotion's absolute frame, not wall-clock time.
    // This keeps every rendered frame deterministic in GitHub Actions.
    mixer.setTime(frame / fps);
  });

  return (
    <group ref={root} position={[x, -1.43, 0.15]} scale={0.91}>
      <primitive object={gltf.scene} />
    </group>
  );
};

const Bookshelf: React.FC<{x: number}> = ({x}) => (
  <group position={[x, 0.05, -2.7]}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[0.86, 2.9, 0.32]} />
      <meshStandardMaterial color="#49301e" roughness={0.86} />
    </mesh>
    {[-0.85, 0, 0.85].map((y) => (
      <mesh key={y} position={[0, y, 0.22]}>
        <boxGeometry args={[0.96, 0.09, 0.52]} />
        <meshStandardMaterial color="#b88b4c" roughness={0.65} />
      </mesh>
    ))}
    {Array.from({length: 12}).map((_, i) => (
      <mesh key={i} position={[-0.29 + (i % 4) * 0.19, -0.56 + Math.floor(i / 4) * 0.85, 0.24]} rotation={[0, 0, (i % 3 - 1) * 0.035]}>
        <boxGeometry args={[0.13, 0.43 + (i % 2) * 0.1, 0.2]} />
        <meshStandardMaterial color={['#8e4036', '#c49a4a', '#386b60', '#4e5680'][i % 4]} roughness={0.84} />
      </mesh>
    ))}
  </group>
);

export const Classroom3D: React.FC<{speaker: Speaker}> = ({speaker}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{position: [0, 0.75, 8.6], fov: 39}}
      dpr={1}
      gl={{antialias: false, alpha: false, powerPreference: 'low-power'}}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    >
      <color attach="background" args={['#07140f']} />
      <fog attach="fog" args={['#07140f', 10, 22]} />
      <ambientLight intensity={1.15} />
      <directionalLight position={[-4, 7, 6]} intensity={2.1} castShadow shadow-mapSize-width={512} shadow-mapSize-height={512} />
      <pointLight position={[-3, 3, 1]} color="#ffc77a" intensity={14} distance={12} />
      <pointLight position={[3, 3, -1]} color="#79b5a0" intensity={8} distance={10} />

      {/* Emerald classroom wall and decorative gold arch */}
      <mesh position={[0, 1.25, -3.15]} receiveShadow>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial color="#173b2e" roughness={1} />
      </mesh>
      <mesh position={[0, 1.0, -2.93]} scale={[1, 1.18, 1]}>
        <torusGeometry args={[2.05, 0.075, 10, 64]} />
        <meshStandardMaterial color="#c7a354" metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, 1.05, -2.83]}>
        <boxGeometry args={[2.55, 1.52, 0.13]} />
        <meshStandardMaterial color="#0c3527" roughness={0.96} />
      </mesh>
      <Bookshelf x={-3.05} />
      <Bookshelf x={3.05} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#39271d" roughness={0.9} />
      </mesh>

      {/* Reusable, armature-driven GLB characters */}
      <RiggedCharacter role="ustad" speaker={speaker} x={-1.12 + Math.sin(frame / 180) * 0.015} />
      <RiggedCharacter role="student" speaker={speaker} x={1.12 - Math.sin(frame / 180) * 0.015} />

      {/* Foreground desk and open book */}
      <mesh position={[0, -0.68, 1.05]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.17, 1.08]} />
        <meshStandardMaterial color="#654329" roughness={0.7} />
      </mesh>
      <mesh position={[-1.38, -1.03, 1.05]}>
        <boxGeometry args={[0.17, 0.62, 0.86]} />
        <meshStandardMaterial color="#4c301e" roughness={0.82} />
      </mesh>
      <mesh position={[1.38, -1.03, 1.05]}>
        <boxGeometry args={[0.17, 0.62, 0.86]} />
        <meshStandardMaterial color="#4c301e" roughness={0.82} />
      </mesh>
      <group position={[0, -0.56, 0.58]} rotation={[-0.12, 0, 0]}>
        <mesh position={[-0.26, 0, 0]} rotation={[0, 0, -0.08]}>
          <boxGeometry args={[0.52, 0.045, 0.48]} />
          <meshStandardMaterial color="#e9dfc7" roughness={0.96} />
        </mesh>
        <mesh position={[0.26, 0, 0]} rotation={[0, 0, 0.08]}>
          <boxGeometry args={[0.52, 0.045, 0.48]} />
          <meshStandardMaterial color="#f5ecd9" roughness={0.96} />
        </mesh>
      </group>
    </ThreeCanvas>
  );
};

