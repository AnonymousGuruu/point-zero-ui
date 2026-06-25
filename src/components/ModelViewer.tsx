'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
// 1. We imported Bounds
import { OrbitControls, useGLTF, useAnimations, Center, Bounds } from '@react-three/drei';

function CharacterModel() {
  const { scene, animations } = useGLTF('/animation.gltf');
  const { actions } = useAnimations(animations, scene);

  useEffect(() => {
    if (actions && Object.keys(actions).length > 0) {
      const firstAction = Object.keys(actions)[0];
      actions[firstAction]?.play();
    }
  }, [actions]);

  // 2. We can return scale to a normal baseline because Bounds handles the framing!
  return <primitive object={scene} scale={1} />;
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
          {/* 3. Wrap Center inside Bounds. 
                 fit: Automatically pulls the camera back to fit the object
                 clip: Adjusts the near/far clipping planes
                 observe: Auto-recalculates if the browser window resizes
                 margin: 1.2 gives a beautiful 20% padding around the dancer */}
          <Bounds fit clip observe margin={1.2}>
            <Center>
              <CharacterModel />
            </Center>
          </Bounds>
        </Suspense>

        {/* 4. OrbitControls MUST have makeDefault so Bounds can hijack it to move the camera */}
        <OrbitControls makeDefault enableZoom={true} maxPolarAngle={Math.PI / 2} />
      </Canvas>
    </div>
  );
}