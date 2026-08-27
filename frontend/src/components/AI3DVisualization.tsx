import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface AI3DVisualizationProps {
  className?: string;
}

export default function AI3DVisualization({ className }: AI3DVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.z = 18;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // 4. Create AI Core Objects
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // A. Central Glowing Sphere (Wireframe)
    const sphereGeo = new THREE.IcosahedronGeometry(3.5, 2);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const centralSphere = new THREE.Mesh(sphereGeo, sphereMat);
    coreGroup.add(centralSphere);

    // B. Floating Neural Particles
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const randomSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      // Random coordinates inside a sphere boundary
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 5.5 + Math.random() * 2.5; // Radius between 5.5 and 8

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      randomSpeeds[i] = 0.2 + Math.random() * 0.8;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Custom Canvas Texture for smooth circular particles
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(6, 182, 212, 0.8)'); // Cyan
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.45,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    // C. Outer Scan Rings
    const ringMat = new THREE.LineBasicMaterial({
      color: 0x3b82f6, // Blue
      transparent: true,
      opacity: 0.25,
    });

    const scanRings: THREE.LineLoop[] = [];
    const ringRadii = [4.8, 6.2, 7.5];

    ringRadii.forEach((radius, index) => {
      const ringPoints: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ring = new THREE.LineLoop(ringGeo, ringMat);
      
      // Rotate rings differently initially
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.z = Math.random() * Math.PI;

      coreGroup.add(ring);
      scanRings.push(ring);
    });

    // 5. Mouse Parallax Tracker
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetX = (x / rect.width - 0.5) * 4;
      targetY = (y / rect.height - 0.5) * 4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let animationFrameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Rotation settings (stop on prefers-reduced-motion)
      if (!prefersReducedMotion) {
        centralSphere.rotation.y = elapsedTime * 0.15;
        centralSphere.rotation.x = elapsedTime * 0.08;

        particles.rotation.y = elapsedTime * 0.05;

        scanRings.forEach((ring, index) => {
          const speed = (index + 1) * 0.12;
          ring.rotation.y += speed * 0.03;
          ring.rotation.x += speed * 0.015;
        });
      }

      // Parallax camera lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      camera.position.x = mouseX * 2;
      camera.position.y = -mouseY * 2;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      // Dispose resources
      sphereGeo.dispose();
      sphereMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
      ringMat.dispose();
      scanRings.forEach((r) => r.geometry.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
}
