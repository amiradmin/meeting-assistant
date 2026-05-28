import React, { Suspense, useRef, useEffect, useState, useCallback } from "react";
import { Modal, Spinner, Alert } from "react-bootstrap";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// ===== Model Loader with lighter material =====
function Model({ modelUrl, onModelLoaded, onError }) {
  const ref = useRef();
  const { scene, materials } = useGLTF(modelUrl, true);

  // Simplify materials for better performance
  useEffect(() => {
    if (materials) {
      Object.values(materials).forEach(material => {
        if (material.isMeshStandardMaterial) {
          material.metalness = 0;
          material.roughness = 1;
        }
      });
    }
  }, [materials]);

  // Auto-rotation
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.004;
  });

  useEffect(() => {
    if (ref.current) {
      try {
        const box = new THREE.Box3().setFromObject(ref.current);
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.5 / maxDim;
        ref.current.scale.setScalar(scale);

        const center = new THREE.Vector3();
        box.getCenter(center);
        ref.current.position.sub(center.multiplyScalar(scale));

        const distance = maxDim * scale * 2.5;
        onModelLoaded(distance);
      } catch (error) {
        console.warn("Error processing model:", error);
        onModelLoaded(5);
      }
    }
  }, [scene, onModelLoaded]);

  return <primitive ref={ref} object={scene.clone()} />;
}

// ===== Lighter Lighting =====
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.0} />
    </>
  );
}

// ===== Camera Controls =====
function CameraControls({ distance }) {
  const controlsRef = useRef();
  const { gl } = useThree();

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.update();
  }, [distance]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan
      enableZoom
      enableRotate
      minDistance={0.5}
      maxDistance={distance * 3}
    />
  );
}

// ===== WebGL Context Manager =====
function WebGLContextManager({ onContextLost }) {
  const { gl } = useThree();

  useEffect(() => {
    const handleContextLoss = (e) => {
      e.preventDefault();
      console.warn("WebGL context lost");
      onContextLost();
    };
    gl.domElement.addEventListener("webglcontextlost", handleContextLoss, false);
    return () => gl.domElement.removeEventListener("webglcontextlost", handleContextLoss);
  }, [gl, onContextLost]);

  return null;
}

// ===== Error Boundary =====
class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Viewer Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <p className="text-danger fw-bold">❌ خطا در بارگذاری مدل سه‌بعدی</p>
          <p className="text-muted small">{this.state.error?.message}</p>
          <button
            className="btn btn-primary mt-2"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            تلاش مجدد
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== Main Modal =====
const ModelViewerModal = ({ show, onHide, asset }) => {
  const modelUrl = asset?.model_3d || asset?.three_d_model || null;
  const [cameraDistance, setCameraDistance] = useState(5);
  const [mounted, setMounted] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const canvasRef = useRef();

  useEffect(() => {
    if (show) {
      setContextLost(false);
      const timer = setTimeout(() => setMounted(true), 150);
      return () => clearTimeout(timer);
    } else {
      setMounted(false);
      if (canvasRef.current) {
        const canvas = canvasRef.current.querySelector("canvas");
        if (canvas) {
          const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
        }
      }
    }
  }, [show]);

  const handleContextLost = useCallback(() => setContextLost(true), []);
  const handleModelLoaded = useCallback((distance) => setCameraDistance(distance), []);
  const handleRetry = useCallback(() => {
    setContextLost(false);
    setMounted(false);
    setTimeout(() => setMounted(true), 100);
  }, []);

  const renderCanvas = mounted && modelUrl && !contextLost;

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          مدل سه‌بعدی تجهیز: {asset?.name ?? asset?.asset_name ?? "بدون‌نام"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ height: "500px", background: "#f8f9fa" }} ref={canvasRef}>
        <ThreeErrorBoundary>
          {contextLost ? (
            <div className="text-center p-4">
              <Alert variant="warning">
                <h6>اتصال گرافیکی قطع شد</h6>
                <p className="mb-3">مشکلی در نمایش گرافیکی پیش آمده است.</p>
                <button className="btn btn-primary" onClick={handleRetry}>🔄 تلاش مجدد</button>
              </Alert>
            </div>
          ) : renderCanvas ? (
            <Suspense fallback={
              <div className="d-flex justify-content-center align-items-center h-100">
                <Spinner animation="border" variant="primary" />
                <span className="me-2">در حال بارگذاری مدل...</span>
              </div>
            }>
              <Canvas
                camera={{ fov: 55, position: [cameraDistance, cameraDistance, cameraDistance], near: 0.1, far: 1000 }}
                gl={{ antialias: true, toneMapping: THREE.LinearToneMapping, toneMappingExposure: 1, powerPreference: "high-performance", preserveDrawingBuffer: false }}
                style={{ background: "#f8f9fa" }}
              >
                <WebGLContextManager onContextLost={handleContextLost} />
                <Lighting />
                <CameraControls distance={cameraDistance} />
                <Model modelUrl={modelUrl} onModelLoaded={handleModelLoaded} />
              </Canvas>
            </Suspense>
          ) : (
            <div className="text-center mt-5">
              <Spinner animation="border" variant="primary" />
              <span className="ms-2">در حال آماده‌سازی نمایشگر...</span>
            </div>
          )}
        </ThreeErrorBoundary>
      </Modal.Body>
    </Modal>
  );
};

export default ModelViewerModal;
