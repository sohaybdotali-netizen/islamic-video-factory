import React, {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useFrame} from '@react-three/fiber';
import {useAnimations, useGLTF} from '@react-three/drei';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

type Speaker = 'teacher' | 'student' | 'silent';
type Role = 'ustad' | 'student';

const CartoonCharacter: React.FC<{role: Role; speaker: Speaker; x: number}> = ({role, speaker, x}) => {
  const root = useRef<THREE.Group>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gltf = useGLTF(staticFile(`assets/${role}.glb`));
  const {actions, mixer} = useAnimations(gltf.animations, root);

  const clip = speaker === 'silent'
    ? 'Idle'
    : role === 'ustad'
      ? (speaker === 'teacher' ? 'Explain' : 'Idle')
      : (speaker === 'student' ? 'Answer' : 'Idle');

  useEffect(() => {
    mixer.stopAllAction();
    const action = actions[clip];
    if (action) {
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.play();
    }
  }, [actions, clip, mixer]);

  useFrame(() => {
    mixer.setTime(frame / fps);
  });

  return (
    <group ref={root} position={[x, -1.24, 0.12]} scale={0.78}>
      <primitive object={gltf.scene} />
    </group>
  );
};

const Shelf: React.FC<{x: number}> = ({x}) => (
  <group position={[x, 0.05, -3.4]}>
    <mesh>
      <boxGeometry args={[0.58, 2.25, 0.25]} />
      <meshStandardMaterial color="#765036" roughness={0.88} />
    </mesh>
    {[-0.65, 0, 0.65].map((y) => (
      <mesh key={y} position={[0, y, 0.17]}>
        <boxGeometry args={[0.68, 0.065, 0.36]} />
        <meshStandardMaterial color="#d0a45c" roughness={0.62} />
      </mesh>
    ))}
    {Array.from({length: 9}).map((_, i) => (
      <mesh
        key={i}
        position={[-0.19 + (i % 3) * 0.18, -0.43 + Math.floor(i / 3) * 0.65, 0.19]}
        rotation={[0, 0, (i % 3 - 1) * 0.05]}
      >
        <boxGeometry args={[0.12, 0.32 + (i % 2) * 0.07, 0.13]} />
        <meshStandardMaterial color={['#c66d55', '#e4bd6b', '#438d72'][i % 3]} roughness={0.8} />
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
      camera={{position: [0, 0.55, 9.5], fov: 38}}
      dpr={1}
      gl={{antialias: true, alpha: false, powerPreference: 'low-power'}}
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}
    >
      <color attach="background" args={['#17372d']} />
      <fog attach="fog" args={['#17372d', 13, 25]} />
      <ambientLight intensity={1.45} />
      <directionalLight position={[-4, 7, 6]} intensity={2.0} />
      <pointLight position={[-3, 3, 2]} color="#ffdda1" intensity={10} distance={13} />
      <pointLight position={[3, 2, -1]} color="#a4e0bf" intensity={6} distance={11} />

      {/* Warm, friendly Islamic classroom background */}
      <mesh position={[0, 1.05, -3.8]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#246347" roughness={1} />
      </mesh>
      <mesh position={[0, 1.02, -3.55]} scale={[1, 1.08, 1]}>
        <torusGeometry args={[1.48, 0.055, 12, 64]} />
        <meshStandardMaterial color="#e4bd6b" metalness={0.18} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.0, -3.48]}>
        <boxGeometry args={[2.05, 1.35, 0.10]} />
        <meshStandardMaterial color="#174b35" roughness={0.9} />
      </mesh>
      <Shelf x={-1.72} />
      <Shelf x={1.72} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.48, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#805b3d" roughness={0.9} />
      </mesh>

      {/* Keep both characters within the narrow portrait frame. */}
      <CartoonCharacter role="ustad" speaker={speaker} x={-0.68 + Math.sin(frame / 150) * 0.008} />
      <CartoonCharacter role="student" speaker={speaker} x={0.68 - Math.sin(frame / 150) * 0.008} />

      {/* Low desk leaves faces, headwear and upper bodies visible. */}
      <mesh position={[0, -1.12, 1.0]}>
        <boxGeometry args={[3.35, 0.14, 0.72]} />
        <meshStandardMaterial color="#895d3c" roughness={0.78} />
      </mesh>
      <mesh position={[-1.35, -1.34, 1.0]}>
        <boxGeometry args={[0.13, 0.42, 0.58]} />
        <meshStandardMaterial color="#69472f" />
      </mesh>
      <mesh position={[1.35, -1.34, 1.0]}>
        <boxGeometry args={[0.13, 0.42, 0.58]} />
        <meshStandardMaterial color="#69472f" />
      </mesh>
      <group position={[0, -1.025, 0.57]} rotation={[-0.12, 0, 0]}>
        <mesh position={[-0.22, 0, 0]}>
          <boxGeometry args={[0.44, 0.035, 0.38]} />
          <meshStandardMaterial color="#f1e6ce" />
        </mesh>
        <mesh position={[0.22, 0, 0]}>
          <boxGeometry args={[0.44, 0.035, 0.38]} />
          <meshStandardMaterial color="#fff5df" />
        </mesh>
      </group>
    </ThreeCanvas>
  );
};
