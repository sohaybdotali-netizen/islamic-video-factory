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
  const clip = speaker === 'silent' ? 'Idle' : role === 'ustad'
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

  useFrame(() => mixer.setTime(frame / fps));

  return (
    <group ref={root} position={[x, -1.42, 0.1]} scale={0.76}>
      <primitive object={gltf.scene} />
    </group>
  );
};

const Shelf: React.FC<{x: number}> = ({x}) => (
  <group position={[x, 0.15, -3.2]}>
    <mesh><boxGeometry args={[0.72, 2.5, 0.28]} /><meshStandardMaterial color="#65442d" roughness={0.88} /></mesh>
    {[-0.72, 0, 0.72].map((y) => <mesh key={y} position={[0,y,0.18]}><boxGeometry args={[0.84,0.07,0.42]} /><meshStandardMaterial color="#c59b55" /></mesh>)}
    {Array.from({length:9}).map((_,i)=><mesh key={i} position={[-0.24+(i%3)*0.22,-0.48+Math.floor(i/3)*0.72,0.2]}><boxGeometry args={[0.15,0.36+(i%2)*0.08,0.18]} /><meshStandardMaterial color={['#b65b48','#e0b65f','#3e8b70'][i%3]} /></mesh>)}
  </group>
);

export const Classroom3D: React.FC<{speaker: Speaker}> = ({speaker}) => {
  const frame = useCurrentFrame();
  const {width,height} = useVideoConfig();
  return (
    <ThreeCanvas
      width={width}
      height={height}
      camera={{position:[0,0.75,10.2], fov:34}}
      dpr={1}
      gl={{antialias:true, alpha:false, powerPreference:'low-power'}}
      style={{position:'absolute', inset:0, width:'100%', height:'100%'}}
    >
      <color attach="background" args={['#132b24']} />
      <fog attach="fog" args={['#132b24',12,24]} />
      <ambientLight intensity={1.5} />
      <directionalLight position={[-4,7,6]} intensity={2.2} />
      <pointLight position={[-3,3,2]} color="#ffd28b" intensity={11} distance={14} />
      <pointLight position={[3,2,-1]} color="#8bd4b0" intensity={7} distance={12} />

      <mesh position={[0,1.2,-3.8]}><planeGeometry args={[12,8]} /><meshStandardMaterial color="#1e5943" roughness={1} /></mesh>
      <mesh position={[0,1.1,-3.55]} scale={[1,1.12,1]}><torusGeometry args={[1.8,0.065,12,64]} /><meshStandardMaterial color="#e0b65f" metalness={0.25} roughness={0.55} /></mesh>
      <mesh position={[0,1.05,-3.48]}><boxGeometry args={[2.45,1.45,0.12]} /><meshStandardMaterial color="#164631" /></mesh>
      <Shelf x={-3.0} /><Shelf x={3.0} />
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-1.48,0]}><planeGeometry args={[18,18]} /><meshStandardMaterial color="#76543a" roughness={0.9} /></mesh>

      <CartoonCharacter role="ustad" speaker={speaker} x={-1.35 + Math.sin(frame/180)*0.012} />
      <CartoonCharacter role="student" speaker={speaker} x={1.35 - Math.sin(frame/180)*0.012} />

      {/* Desk is deliberately lower so it does not hide the characters' faces or torsos. */}
      <mesh position={[0,-1.02,1.0]}><boxGeometry args={[4.2,0.16,0.85]} /><meshStandardMaterial color="#805535" roughness={0.78} /></mesh>
      <mesh position={[-1.65,-1.28,1.0]}><boxGeometry args={[0.15,0.48,0.68]} /><meshStandardMaterial color="#654329" /></mesh>
      <mesh position={[1.65,-1.28,1.0]}><boxGeometry args={[0.15,0.48,0.68]} /><meshStandardMaterial color="#654329" /></mesh>
      <group position={[0,-0.91,0.55]} rotation={[-0.12,0,0]}>
        <mesh position={[-0.24,0,0]}><boxGeometry args={[0.48,0.035,0.42]} /><meshStandardMaterial color="#f2e8d2" /></mesh>
        <mesh position={[0.24,0,0]}><boxGeometry args={[0.48,0.035,0.42]} /><meshStandardMaterial color="#fff5df" /></mesh>
      </group>
    </ThreeCanvas>
  );
};
