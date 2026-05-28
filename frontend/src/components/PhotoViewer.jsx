// components/PhotoViewer.jsx
import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { FaDownload, FaChevronLeft, FaChevronRight, FaImage } from "react-icons/fa";
import { getMediaUrl } from "../utils/helpers";


const PhotoViewer = ({ photos = [], show, onHide }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextPhoto = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") nextPhoto();
    if (e.key === "ArrowLeft") prevPhoto();
    if (e.key === "Escape") onHide();
  };

  useEffect(() => {
    if (show) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [show]);

  useEffect(() => {
    if (show) setCurrentIndex(0);
  }, [show]);

  if (!show || !photos.length) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="photo-viewer-modal">
      <Modal.Header closeButton className="border-0">
        <Modal.Title>
          تصاویر ({currentIndex + 1} از {photos.length})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center p-0">
<div className="position-relative d-flex justify-content-center align-items-center" style={{ width: "100%", height: "70vh" }}>
  <img
    src={getMediaUrl(currentPhoto.image_url || currentPhoto.image)}
    alt={currentPhoto.description || `Photo ${currentIndex + 1}`}
    className="img-fluid"
    style={{ maxHeight: "100%", objectFit: "contain" }}
  />

  {photos.length > 1 && (
    <>
      <Button
        variant="light"
        onClick={prevPhoto}
        style={{
          position: "absolute",
          left: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaChevronLeft />
      </Button>

      <Button
        variant="light"
        onClick={nextPhoto}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaChevronRight />
      </Button>
    </>
  )}
</div>


        {currentPhoto.description && (
          <div className="mt-3 p-3 bg-light rounded">
            <p className="mb-0">{currentPhoto.description}</p>
          </div>
        )}

        <div className="mt-3">
          <small className="text-muted">
            آپلود شده در:{" "}
            {currentPhoto.uploaded_at
              ? new Date(currentPhoto.uploaded_at).toLocaleDateString("fa-IR")
              : "نامشخص"}
          </small>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button
          variant="primary"
          onClick={() => window.open(currentPhoto.image_url || currentPhoto.image, "_blank")}
        >
          <FaDownload className="ms-2" /> دانلود
        </Button>
        <Button variant="secondary" onClick={onHide}>
          بستن
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PhotoViewer;
