'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations, Center } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedModel() {
  // Pointing directly to the asset in your public root directory
  const { scene, animations } = useGLTF('/animation.gltf');
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // If the model contains animations, instantly target and fire the first animation track loop safely
    if (names && names.length > 0 && actions) {
      const activeAction = actions[names[0]];
      if (activeAction) {
        activeAction.fadeIn(0.5).play();
      }
    }
  }, [actions, names]);

  // Subtle continuous floating rotation backup animation matrix loop
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}

export default function ModelViewer() {
  return (
    <Canvas
      camera={{ position: [0, 2, 5], fov: 45 }}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
    >
      {/* Dynamic Lighting System setup */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-5, -5, -5]} intensity={0.5} />
      <spotLight position={[0, 8, 0]} intensity={1} angle={0.3} penumbra={1} />

      <Center>
        <AnimatedModel />
      </Center>

      {/* Enable pan/zoom interactions on the hero banner context cleanly */}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        minPolarAngle={Math.PI / 3} 
        maxPolarAngle={Math.PI / 1.8} 
      />
    </Canvas>
  );
}

// Pre-cache asset using the updated root path string
useGLTF.preload('/animation.gltf');