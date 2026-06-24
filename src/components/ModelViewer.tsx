'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// 1. We imported Center from drei
import { OrbitControls, useGLTF, useAnimations, Center } from '@react-three/drei';

function CharacterModel() {
  const { scene, animations } = useGLTF('/animation.gltf');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.keys(actions)[0];
      actions[firstAction]?.play();
    }
  }, [actions]);

  // 2. We removed the manual position array entirely. 
  // Let the wrapper handle the math!
  return <primitive object={scene} scale={0.25} />;
}

export default function ModelViewer() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[350px] bg-slate-950/40 flex items-center justify-center text-slate-500 font-mono text-xs">
        Connecting Core Matrix...
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[350px] bg-slate-950/40">
      <Canvas camera={{ position: [0, 2, 6], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <pointLight position={[0, 4, 2]} intensity={0.5} color="#10b981" />
        
        <Suspense fallback={null}>
          {/* 3. Wrap the character in <Center>. 
              It forces the model into the exact middle of your canvas frame. */}
          <Center position={[0, -0.5, 0]}>
            <CharacterModel />
          </Center>
        </Suspense>

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}