// components/DocumentsViewer.jsx
import React from "react";
import { Modal, Button, Badge } from "react-bootstrap";
import {
  FaFileAlt,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaTimes,
  FaCalendarAlt
} from "react-icons/fa";
import { getMediaUrl } from "../utils/helpers";

const DocumentsViewer = ({ documents = [], show, onHide, assetName = "تجهیز" }) => {
  const handleDownload = (doc) => {
    const url = getMediaUrl(doc.file);
    window.open(url, "_blank");
  };

  const handleView = (doc) => {
    const url = getMediaUrl(doc.file);
    window.open(url, "_blank");
  };

  // Get file icon based on file extension
  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FaFilePdf className="text-danger" size={20} />;
      case 'doc':
      case 'docx':
        return <FaFileWord className="text-primary" size={20} />;
      case 'xls':
      case 'xlsx':
        return <FaFileExcel className="text-success" size={20} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FaFileImage className="text-warning" size={20} />;
      default:
        return <FaFileAlt className="text-secondary" size={20} />;
    }
  };

  // Get file type badge with color coding
  const getFileTypeBadge = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    const type = extension ? extension.toUpperCase() : 'FILE';

    const badgeColors = {
      pdf: 'danger',
      doc: 'primary',
      docx: 'primary',
      xls: 'success',
      xlsx: 'success',
      jpg: 'warning',
      jpeg: 'warning',
      png: 'info',
      gif: 'secondary'
    };

    return (
      <Badge
        bg={`outline-${badgeColors[extension] || 'secondary'}`}
        text="dark"
        className="border fw-normal"
        style={{ fontSize: '0.6rem', padding: '0.25rem 0.5rem' }}
      >
        {type}
      </Badge>
    );
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      dialogClassName="modern-modal"
    >
      <Modal.Header className="border-bottom-0 pb-0">
        <div className="d-flex align-items-center w-100">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <div className="icon-wrapper bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                <FaFileAlt className="text-primary" size={18} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">
                  مستندات {assetName}
                </h5>
                <p className="text-muted small mb-0">
                  مدیریت و مشاهده تمام اسناد مرتبط
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center">
            <Badge
              bg="light"
              text="dark"
              className="border me-3 fw-semibold"
              style={{ fontSize: '0.75rem' }}
            >
              {documents.length} سند
            </Badge>
            <Button
              variant="link"
              onClick={onHide}
              className="text-muted p-1"
              style={{ minWidth: 'auto' }}
            >
              <FaTimes size={16} />
            </Button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="pt-3" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {documents.length === 0 ? (
          <div className="text-center text-muted py-5">
            <div className="empty-state-icon mb-4">
              <FaFileAlt size={56} className="opacity-25" />
            </div>
            <h6 className="text-muted fw-semibold mb-2">هیچ مدرکی وجود ندارد</h6>
            <p className="small text-muted mb-0">برای این تجهیز هیچ سندی آپلود نشده است</p>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((doc, index) => (
              <div
                key={doc.id || index}
                className="document-item card border-0 shadow-sm mb-3 hover-lift"
              >
                <div className="card-body p-4">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <div className="file-icon-wrapper bg-light rounded-3 p-3">
                        {getFileIcon(doc.file)}
                      </div>
                    </div>

                    <div className="col">
                      <div className="d-flex align-items-center mb-2">
                        <h6 className="mb-0 text-dark fw-semibold me-3 text-truncate">
                          {doc.file.split("/").pop()}
                        </h6>
                        {getFileTypeBadge(doc.file)}
                      </div>

                      {doc.description && (
                        <p className="text-muted small mb-2 lh-sm">
                          {doc.description}
                        </p>
                      )}

                      <div className="d-flex align-items-center text-muted small">
                        <FaCalendarAlt size={12} className="me-1" />
                        <span className="fw-medium">
                          {doc.uploaded_at ?
                            new Date(doc.uploaded_at).toLocaleDateString("fa-IR") :
                            'تاریخ نامشخص'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="col-auto">
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="d-flex align-items-center gap-2 px-3"
                          onClick={() => handleView(doc)}
                          style={{
                            fontWeight: '500',
                            borderRadius: '8px',
                            height: '38px',
                            marginLeft: '5px'
                          }}
                        >
                          <FaEye size={14} />
                          مشاهده
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          className="d-flex align-items-center gap-2 px-3"
                          onClick={() => handleDownload(doc)}
                          style={{
                            fontWeight: '500',
                            borderRadius: '8px',
                            height: '38px'
                          }}
                        >
                          <FaDownload size={14} />
                          دانلود
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top-0 pt-0">
        <div className="d-flex justify-content-between align-items-center w-100">
          <small className="text-muted">
            مجموع: {documents.length} سند
          </small>
          <Button
            variant="outline-secondary"
            onClick={onHide}
            className="px-4"
            style={{ borderRadius: '8px' }}
          >
            بستن
          </Button>
        </div>
      </Modal.Footer>

      {/* Enhanced CSS */}
      <style jsx>{`
        .modern-modal .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }

        .icon-wrapper {
          transition: all 0.3s ease;
        }

        .file-icon-wrapper {
          transition: all 0.3s ease;
          border: 1px solid #f1f3f4;
        }

        .document-item {
          transition: all 0.3s ease;
          border-radius: 10px;
        }

        .document-item:hover {
          border-color: #007bff;
        }

        .hover-lift:hover {
          transform: translateY(-2px);
        }

        .empty-state-icon {
          opacity: 0.5;
          transition: opacity 0.3s ease;
        }

        .btn {
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .document-list::-webkit-scrollbar {
          width: 6px;
        }

        .document-list::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .document-list::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }

        .document-list::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </Modal>
  );
};

export default DocumentsViewer;