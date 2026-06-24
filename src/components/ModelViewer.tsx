'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';

function CharacterModel() {
  const { scene, animations } = useGLTF('/animation.gltf');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.keys(actions)[0];
      actions[firstAction]?.play();
    }
  }, [actions]);

  // Dropped scale from 0.35 to 0.25 to scale it down, and raised position slightly to ground it
  return <primitive object={scene} scale={0.25} position={[0, -1.6, 0]} />;
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
          <CharacterModel />
        </Suspense>

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}