/*import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";

export default function Dancer({ move = "step_touch" }) {
  const group = useRef();
  const { scene, animations } = useGLTF(`/animations/${move}.glb`);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (!actions) return;

    // Stop all animations first
    Object.values(actions).forEach((action) => action.stop());

    // Play first animation in the file
    const firstAction = actions[Object.keys(actions)[0]];
    firstAction.reset().fadeIn(0.2).play();
  }, [actions, move]);

  return (
    <primitive
      ref={group}
      object={scene}
      scale={1.7}
      position={[0, -1.2, 0]}
    />
  );
}*/

import { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";

export default function Dancer({ move }) {
  const ref = useRef();

  // ------------------------------------------
  // Load main character model
  // ------------------------------------------
  const model = useGLTF("/animations/character.glb");

  // ------------------------------------------
  // Load ALL animations once
  // ------------------------------------------
  const kickstep = useGLTF("/animations/kickstep.glb");
  const runningman = useGLTF("/animations/runningman.glb");
  const locking = useGLTF("/animations/locking.glb");
  const wave = useGLTF("/animations/wave.glb");
  const snake = useGLTF("/animations/snake.glb");
  const sideToSide = useGLTF("/animations/sideToSide.glb");
  const step = useGLTF("/animations/step.glb");

  // ------------------------------------------
  // Map animations by name
  // ------------------------------------------
  const animations = useMemo(
    () => ({
      kickstep: kickstep.animations[0],
      runningman: runningman.animations[0],
      locking: locking.animations[0],
      wave: wave.animations[0],
      snake: snake.animations[0],
      sideToSide: sideToSide.animations[0],
      step: step.animations[0],
    }),
    [kickstep, runningman, locking, wave, snake, sideToSide, step]
  );

  // ------------------------------------------
  // Animation mixer
  // ------------------------------------------
  const mixer = useMemo(() => {
    return new THREE.AnimationMixer(model.scene);
  }, [model.scene]);

  const current = useRef(null);

  // ------------------------------------------
  // Handle animation switching
  // ------------------------------------------
  useEffect(() => {
    // If move = null → STOP animations & freeze pose
    if (!move) {
      if (current.current) {
        current.current.fadeOut(0.3);
        current.current = null;
      }
      return; // do nothing else
    }

    // If the animation doesn't exist, skip
    if (!animations[move]) return;

    const clip = animations[move];
    const action = mixer.clipAction(clip);

    // Crossfade smoothly
    if (current.current && current.current !== action) {
      current.current.crossFadeTo(action, 0.3, false);
    }

    action.reset();
    action.timeScale = 0.65; // slow down animation
    action.fadeIn(0.3).play();

    current.current = action;
  }, [move, animations, mixer]);

  // ------------------------------------------
  // Mixer update loop + Model material tweaks
  // ------------------------------------------
  useEffect(() => {
    // Improve material look
    model.scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.material.roughness = 0.45;
        obj.material.metalness = 0.15;
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    const clock = new THREE.Clock();

    const update = () => {
      mixer.update(clock.getDelta());
      requestAnimationFrame(update);
    };

    update();
  }, [mixer, model.scene]);

  return (
    <primitive
      ref={ref}
      object={model.scene}
      scale={2.2}              // Good balance
      position={[0, -0.4, 0]}  // Centered on grid
    />
  );
}

