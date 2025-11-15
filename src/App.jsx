/*import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Dancer from "./components/Dancer";

const MIN_SWITCH_GAP = 0.25;
const MOVE_MIN_DURATION = 0.45;

// ---------------------------------------------------------
// CAMERA CONTROLLER — soft cinematic sway
// ---------------------------------------------------------
function CameraController({ musicEnded }) {
  const { camera } = useThree();
  const t = useRef(0);

  useFrame(() => {
    if (!musicEnded) {
      t.current += 0.002; // slow sway only when music plays
    }

    camera.position.set(
      Math.sin(t.current) * 0.4, // left-right sway
      2.6,                      // height
      9                     // distance (zoomed-out)
    );

    camera.lookAt(0, 1.9, 0); // aim at chest/head
  });

  return null;
}

// ---------------------------------------------------------
// NEON GRID FLOOR
// ---------------------------------------------------------
function GridFloor() {
  return (
    <Grid
      position={[0, -1.1, 0]}
      args={[40, 40]}
      cellSize={1}
      cellThickness={0.7}
      cellColor={"#4455ff"}
      sectionSize={4}
      sectionThickness={1.5}
      sectionColor={"#3355ff"}
      fadeDistance={30}
      fadeStrength={0.7}
    />
  );
}

// ---------------------------------------------------------
// MAIN APP COMPONENT
// ---------------------------------------------------------
export default function App() {
  const [currentMove, setCurrentMove] = useState("step");
  const [events, setEvents] = useState([]);
  const [lock, setLock] = useState(0);

  const audioRef = useRef(null);
  const momentum = useRef({});

  // Load beats JSON
  useEffect(() => {
    fetch("/beats/beats1.json")
      .then((r) => r.json())
      .then(setEvents);
  }, []);

  // Load + play music
  useEffect(() => {
    const audio = new Audio("/song1.mp3");
    audioRef.current = audio;

    audio.play().catch(() => {});

    // When song ends → STOP animations completely
    audio.onended = () => {
      setCurrentMove(null);  // null = freeze model in default pose
    };

    return () => audio.pause();
  }, []);

  // Beat-driven move selection loop
  useEffect(() => {
    if (!audioRef.current || !events.length) return;

    const interval = setInterval(() => {
      const audio = audioRef.current;
      if (audio.paused || audio.ended) return;

      // decrease lock
      setLock((l) => Math.max(0, l - 0.05));
      if (lock > 0) return;

      // find beat near current time
      const t = audio.currentTime;
      const e = events.find((ev) => Math.abs(ev.time - t) < 0.045);
      if (!e) return;

      const nextMove = pickMove(e, momentum);

      if (nextMove !== currentMove) {
        setCurrentMove(nextMove);
        setLock(MIN_SWITCH_GAP + MOVE_MIN_DURATION);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [events, lock, currentMove]);

  // MusicEnded = currentMove === null
  const musicEnded = currentMove === null;

  return (
    <Canvas
      shadows
      gl={{ antialias: true }}
      camera={{ position: [0, 3.6, 7.5], fov: 35 }}
      style={{ width: "100vw", height: "100vh", background: "black" }}
    >
      <CameraController musicEnded={musicEnded} />

      
      <ambientLight intensity={0.55} />

      <directionalLight
        position={[2, 5, -3]}
        intensity={1.2}
        color="#4b6fff"
        castShadow
      />

      <pointLight position={[-3, 2, 2]} intensity={0.8} color="#ff3fa8" />

      <spotLight
        position={[0, 8, 2]}
        angle={0.4}
        penumbra={0.6}
        intensity={1.1}
        color="#ffffff"
        castShadow
      />

      <GridFloor />

      
      <EffectComposer>
        <Bloom intensity={1.2} luminanceThreshold={0.2} />
      </EffectComposer>

      
      <Dancer move={currentMove} />
    </Canvas>
  );
}

// ---------------------------------------------------------
// SMOOTH HIP-HOP MOVE PICKER
// ---------------------------------------------------------
function pickMove(e, momentum) {
  const score = {
    kickstep: 0,
    runningman: 0,
    locking: 0,
    wave: 0,
    snake: 0,
    sideToSide: 0,
    step: 0,
  };

  if (e.type === "strong") {
    score.kickstep += 3;
    score.locking += 4;
    score.runningman += 2;
  }
  if (e.type === "weak") {
    score.wave += 3;
    score.snake += 2;
    score.sideToSide += 1;
  }

  if (e.spectralFlux > 0.00012) score.locking += 2;
  if (e.spectralFlux > 0.00018) score.kickstep += 2;

  if (e.intensity > 0.9) {
    score.kickstep += 3;
    score.runningman += 3;
  }
  if (e.intensity > 0.82) {
    score.snake += 1;
    score.wave += 1;
  }
  if (e.intensity < 0.78) {
    score.wave += 1;
    score.step += 1;
  }

  if (e.frequencyBand === "high") {
    score.locking += 2;
    score.wave += 1;
  }
  if (e.frequencyBand === "mid") {
    score.snake += 2;
    score.runningman += 2;
  }
  if (e.frequencyBand === "low") {
    score.sideToSide += 2;
    score.kickstep += 1;
  }

  if (e.spectralCentroid > 3300) {
    score.locking += 2;
    score.wave += 2;
  }
  if (e.spectralCentroid < 2000) {
    score.kickstep += 2;
    score.snake += 1;
  }

  if (e.energyDelta > 0.12) score.kickstep += 3;
  if (e.energyDelta > 0.08) score.runningman += 2;

  const prev = momentum.current || {};
  const smoothed = {};

  for (let m in score) {
    smoothed[m] = (prev[m] ?? 0) * 0.65 + score[m] * 0.35;
  }

  momentum.current = smoothed;

  let bestMove = "step";
  let bestScore = -999;

  for (let m in smoothed) {
    if (smoothed[m] > bestScore) {
      bestScore = smoothed[m];
      bestMove = m;
    }
  }

  return bestMove;
}*/
import { useState, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Dancer from "./components/Dancer";
import { useFrame, useThree } from "@react-three/fiber";
import { Grid } from "@react-three/drei";

// ===================================================
// CAMERA LOOK CONTROLLER
// ===================================================
function CameraController() {
  const { camera } = useThree();
  useFrame(() => camera.lookAt(0, 1, 0));
  return null;
}

// ===================================================
// GRID FLOOR
// ===================================================
function GridFloor() {
  return (
    <Grid
      position={[0, -1.1, 0]}
      args={[20, 20]}
      cellSize={1}
      cellThickness={0.7}
      cellColor={"#222"}
      sectionSize={4}
      sectionThickness={1.5}
      sectionColor={"#4444ff"}
      fadeDistance={20}
      fadeStrength={0.5}
    />
  );
}

const MIN_SWITCH_GAP = 0.25;
const MOVE_MIN_DURATION = 0.45;

// ===================================================
// MAIN APP
// ===================================================
export default function App() {
  const [currentMove, setCurrentMove] = useState("step");
  const [events, setEvents] = useState([]);
  const [lock, setLock] = useState(0);
  const [useChoreo, setUseChoreo] = useState(false); // ⭐ TOGGLE MODE

  const audioRef = useRef(null);
  const momentum = useRef({});

  // -----------------------------------------------
  // LOAD JSON DYNAMICALLY BASED ON TOGGLE
  // -----------------------------------------------
  useEffect(() => {
    const file = useChoreo ? "src/assets/data/choreo2.json" : "/beats/beats2.json";
    fetch(file)
      .then(r => r.json())
      .then(setEvents);
  }, [useChoreo]);

  // -----------------------------------------------
  // LOAD AUDIO ONCE
  // -----------------------------------------------
  useEffect(() => {
    const audio = new Audio("/song2.mp3");
    audioRef.current = audio;
    audio.play().catch(() => {});
    return () => audio.pause();
  }, []);

  // -----------------------------------------------
  // MOVE SELECTOR BASED ON MODE
  // -----------------------------------------------
  useEffect(() => {
    if (!audioRef.current || !events.length) return;

    const interval = setInterval(() => {
      const audio = audioRef.current;

      if (audio.paused || audio.ended) return;

      setLock(l => Math.max(0, l - 0.05));
      if (lock > 0) return;

      const t = audio.currentTime;
      const e = events.find(ev => Math.abs(ev.time - t) < 0.045);
      if (!e) return;

      let nextMove = currentMove;

      // ----------------------------------------
      // MODE 1: choreo.json (PRECOMPUTED)
      // ----------------------------------------
      if (useChoreo) {
        nextMove = e.move;

      // ----------------------------------------
      // MODE 2: LIVE AI LOGIC
      // ----------------------------------------
      } else {
        nextMove = pickMove(e, momentum);
      }

      if (nextMove !== currentMove) {
        setCurrentMove(nextMove);
        setLock(MIN_SWITCH_GAP + MOVE_MIN_DURATION);
      }

    }, 50);

    return () => clearInterval(interval);
  }, [events, lock, currentMove, useChoreo]);

  return (
    <>
      {/* Toggle Button */}
      <button
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          zIndex: 10,
          padding: "8px 14px",
          background: useChoreo ? "#4444ff" : "#22cc88",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold"
        }}
        onClick={() => setUseChoreo(!useChoreo)}
      >
        {useChoreo ? "Switch to LIVE (AI)" : "Switch to CHOREO.JSON"}
      </button>

      <Canvas
        shadows
        gl={{ antialias: true }}
        camera={{ position: [0, 2.5, 8.5], fov: 38 }}
        style={{ background: "black" }}
      >
        <CameraController />
        <ambientLight intensity={1.4} />
        <GridFloor />
        <Dancer move={currentMove} />
      </Canvas>
    </>
  );
}

// ===================================================
// LIVE AI PICK MOVE LOGIC
// ===================================================
function pickMove(e, momentum) {
  const score = {
    kickstep: 0,
    runningman: 0,
    locking: 0,
    wave: 0,
    snake: 0,
    sideToSide: 0,
    step: 0
  };

  if (e.type === "strong") {
    score.kickstep += 3;
    score.locking += 4;
    score.runningman += 2;
  }
  if (e.type === "weak") {
    score.wave += 3;
    score.snake += 2;
    score.sideToSide += 1;
  }

  if (e.spectralFlux > 0.00012) score.locking += 2;
  if (e.spectralFlux > 0.00018) score.kickstep += 2;

  if (e.intensity > 0.9) {
    score.kickstep += 3;
    score.runningman += 3;
  }
  if (e.intensity > 0.82) {
    score.snake += 1;
    score.wave += 1;
  }
  if (e.intensity < 0.78) {
    score.wave += 1;
    score.step += 1;
  }

  if (e.frequencyBand === "high") {
    score.locking += 2;
    score.wave += 1;
  }
  if (e.frequencyBand === "mid") {
    score.snake += 2;
    score.runningman += 2;
  }
  if (e.frequencyBand === "low") {
    score.sideToSide += 2;
    score.kickstep += 1;
  }

  if (e.spectralCentroid > 3300) {
    score.locking += 2;
    score.wave += 2;
  }
  if (e.spectralCentroid < 2000) {
    score.kickstep += 2;
    score.snake += 1;
  }

  if (e.energyDelta > 0.12) score.kickstep += 3;
  if (e.energyDelta > 0.08) score.runningman += 2;

  const prev = momentum.current || {};
  const smoothed = {};

  for (let m in score) {
    smoothed[m] = (prev[m] ?? 0) * 0.65 + score[m] * 0.35;
  }

  momentum.current = smoothed;

  let bestMove = "step";
  let bestScore = -999;

  for (let m in smoothed) {
    if (smoothed[m] > bestScore) {
      bestScore = smoothed[m];
      bestMove = m;
    }
  }

  return bestMove;
}

