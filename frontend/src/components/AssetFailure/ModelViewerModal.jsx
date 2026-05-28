// components/ModelViewerModal.jsx
import React, { useState, Suspense, useRef, useEffect } from 'react';
import { Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { FaTimes, FaExclamationTriangle, FaRedo, FaCube } from 'react-icons/fa';

// Error boundary for 3D model loading
class ThreeErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('3D Model Error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="model-error-state text-center p-4">
          <FaExclamationTriangle size={48} className="text-warning mb-3" />
          <h5 className="text-warning">خطا در بارگذاری مدل سه‌بعدی</h5>
          <p className="text-muted mb-3">
            {this.state.error?.message || 'مدل سه‌بعدی تجهیز در دسترس نمی‌باشد یا فرمت آن نامعتبر است.'}
          </p>
          <Button variant="outline-warning" onClick={this.resetError}>
            <FaRedo className="ms-2" />
            تلاش مجدد
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Async model loader component
const ModelLoader = ({ modelUrl, onLoad, onError }) => {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadModel = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use the GLTF loader directly with proper error handling
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
        const loader = new GLTFLoader();

        loader.load(
          modelUrl,
          (gltf) => {
            if (mounted) {
              setModel(gltf.scene);
              setLoading(false);
              onLoad?.(gltf);
            }
          },
          (progress) => {
            // Progress callback - optional
            console.log(`Loading progress: ${(progress.loaded / progress.total * 100).toFixed(2)}%`);
          },
          (error) => {
            if (mounted) {
              console.error('Failed to load 3D model:', modelUrl, error);
              setError(error);
              setLoading(false);
              onError?.(error);
            }
          }
        );
      } catch (err) {
        if (mounted) {
          console.error('Error loading model:', err);
          setError(err);
          setLoading(false);
          onError?.(err);
        }
      }
    };

    if (modelUrl) {
      loadModel();
    }

    return () => {
      mounted = false;
    };
  }, [modelUrl, onLoad, onError]);

  if (loading) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#6b7280" transparent opacity={0.5} />
      </mesh>
    );
  }

  if (error || !model) {
    return (
      <FallbackModel />
    );
  }

  return <primitive object={model} scale={1} />;
};

// Fallback component when model is not available
const FallbackModel = () => {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3, 0.2, 2]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>

      {/* Main body */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 1.5, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>

      {/* Top part */}
      <mesh position={[0, 1.2, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>

      {/* Side components */}
      <mesh position={[1.2, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>

      <mesh position={[-1.2, 0.3, 0]}>
        <boxGeometry args={[0.3, 0.8, 0.3]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>
    </group>
  );
};

// Simple loading component
const LoadingModel = () => {
  return (
    <mesh rotation={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#6b7280" transparent opacity={0.7} />
    </mesh>
  );
};

const ModelViewerModal = ({ show, onHide, asset, modelUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const controlsRef = useRef();

  // Validate model URL
  const isValidModelUrl = (url) => {
    if (!url) return false;
    // Check if URL ends with .glb or .gltf and is not an HTML page
    const validExtensions = ['.glb', '.gltf'];
    return validExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const getModelUrl = () => {
    // Use provided modelUrl or try to get from asset
    const url = modelUrl || asset?.model_3d || asset?.model_url || asset?.glb_file;

    if (!isValidModelUrl(url)) {
      console.warn('Invalid or missing 3D model URL:', url);
      return null;
    }

    // Ensure absolute URL for local development
    if (url && url.startsWith('/media/') && !url.includes('://')) {
      // For development - adjust based on your server
      return `http://192.168.150.10:8000${url}`;
    }

    return url;
  };

  const currentModelUrl = getModelUrl();

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadComplete = () => {
    setLoading(false);
    setError(null);
  };

  const handleLoadError = (error) => {
    console.error('3D Model loading error:', error);
    setLoading(false);
    setError(`خطا در بارگذاری مدل سه‌بعدی: ${error.message || 'فایل مدل پیدا نشد'}`);
  };

  const handleResetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleRetry = () => {
    setRetryKey(prev => prev + 1);
    setError(null);
    setLoading(true);
  };

  React.useEffect(() => {
    if (show) {
      setLoading(true);
      setError(null);
    }
  }, [show, currentModelUrl]);

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="model-viewer-modal">
      <Modal.Header className="border-0 bg-light">
        <div className="d-flex justify-content-between align-items-center w-100">
          <div>
            <h5 className="mb-0">نمایشگر سه‌بعدی تجهیز</h5>
            <small className="text-muted">{asset?.asset_name || 'نامشخص'}</small>
          </div>
          <Button variant="link" onClick={onHide} className="text-muted p-0">
            <FaTimes size={20} />
          </Button>
        </div>
      </Modal.Header>

      <Modal.Body className="p-0 position-relative" style={{ minHeight: '60vh' }}>
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 mb-0">در حال بارگذاری مدل سه‌بعدی...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="error-overlay">
            <div className="error-content">
              <FaExclamationTriangle size={48} className="text-danger mb-3" />
              <h6 className="text-danger">خطا در بارگذاری مدل</h6>
              <p className="text-muted small mb-3">{error}</p>
              <div className="d-flex gap-2 justify-content-center">
                <Button variant="outline-primary" size="sm" onClick={handleRetry}>
                  <FaRedo className="ms-2" />
                  تلاش مجدد
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={onHide}>
                  بستن
                </Button>
              </div>
            </div>
          </div>
        )}

        {!currentModelUrl ? (
          <div className="no-model-state gap-2 text-center py-5">
            <FaCube size={48} className="text-warning mb-3" />
            <h6 className="text-warning">مدل سه‌بعدی موجود نیست</h6>
            <p className="text-muted mb-3">
              مدل سه‌بعدی برای این تجهیز تعریف نشده است.
            </p>
            <Button variant="outline-warning" onClick={onHide}>
              بازگشت
            </Button>
          </div>
        ) : (
          <ThreeErrorBoundary key={retryKey} onReset={handleRetry}>
            <Canvas
              style={{
                height: '60vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                opacity: loading ? 0.5 : 1
              }}
              camera={{ position: [5, 5, 5], fov: 50 }}
            >
              <Suspense fallback={<LoadingModel />}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <ModelLoader
                  modelUrl={currentModelUrl}
                  onLoad={handleLoadComplete}
                  onError={handleLoadError}
                />

                <OrbitControls
                  ref={controlsRef}
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  onStart={handleLoadStart}
                />
                <Environment preset="sunset" />
              </Suspense>
            </Canvas>
          </ThreeErrorBoundary>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 bg-light">
        <div className="d-flex justify-content-between w-100 align-items-center">
          <small className="text-muted">
            {currentModelUrl ? `مدل: ${currentModelUrl.split('/').pop()}` : 'مدل سه‌بعدی موجود نیست'}
          </small>
          <div>
            <Button
              variant="outline-secondary"
              onClick={handleResetView}
              className="me-2 "
              style={{marginLeft:"10px"}}
              disabled={!currentModelUrl || loading}
            >
              بازنشانی نمای
            </Button>
            <Button variant="secondary" onClick={onHide}>
              بستن
            </Button>
          </div>
        </div>
      </Modal.Footer>

      <style jsx>{`
        .model-viewer-modal .modal-content {
          border-radius: 12px;
          overflow: hidden;
          border: none;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .loading-content {
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .error-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .error-content {
          text-align: center;
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          max-width: 400px;
        }

        .no-model-state {
          background: #f8f9fa;
          border-radius: 8px;
          margin: 2rem;
        }

        .model-error-state {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          margin: 1rem;
          padding: 2rem;
        }
      `}</style>
    </Modal>
  );
};

export default ModelViewerModal;