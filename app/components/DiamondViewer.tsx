import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const DiamondViewer = () => {
  const [zoomIn, setZoomIn] = useState<number>(5);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.set(0, 1, zoomIn); // Set zoom based on state

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting (For better wireframe visibility)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);

    // Wireframe Cube (Edges Only)
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const faceColors = [
      0xff0000, // Red
      0x00ff00, // Green
      0x0000ff, // Blue
      0xffff00, // Yellow
      0xff00ff, // Magenta
      0x00ffff, // Cyan
    ];
    const materials = faceColors.map(
      (color) => new THREE.MeshBasicMaterial({ color }),
    );

    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Smooth movement

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      //   cube.rotation.y += 0.01; // Rotate slowly
      //   cube.rotation.x += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [zoomIn]);

  // Toggle zoom for testing
  const handleTest = () => {
    setZoomIn((oldVal) => (oldVal > 3 ? 2 : 5));
  };

  return (
    <div>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
      <button
        onClick={handleTest}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          padding: "10px",
          background: "#0077ff",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "5px",
        }}
      >
        Toggle Zoom
      </button>
    </div>
  );
};

export default DiamondViewer;
