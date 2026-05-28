import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const HistoryModal = ({ show, onHide, historyRecords, historyLoading, historyAsset }) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>تاریخچه دارایی {historyAsset}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {historyLoading ? (
          <div className="text-center py-3"><Spinner animation="border" /></div>
        ) : historyRecords.length === 0 ? (
          <div className="text-center text-muted py-3">تاریخی یافت نشد</div>
        ) : (
          <div className="list-group">
            {historyRecords.map((h, idx) => (
              <div key={h.id || idx} className="list-group-item">
                <div className="d-flex justify-content-between">
                  <div>
                    <div className="fw-bold">{h.title || h.event || `رویداد ${idx+1}`}</div>
                    <div className="text-muted small">{h.description || ""}</div>
                  </div>
                  <div className="text-muted small">{h.timestamp ? new Date(h.timestamp).toLocaleString('fa-IR') : ""}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>بستن</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default HistoryModal;
