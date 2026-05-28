import React from "react";
import { Modal, Button } from "react-bootstrap";
import "../assets/css/custom.css"; // اطمینان از اینکه دکمه‌ها گرد هستند

const DeleteConfirm = ({ show, onHide, onConfirm, itemName }) => {
  return (
    <Modal show={show} onHide={onHide} centered dir="rtl" className="modal w-lg fade light blur">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold text-danger">حذف مورد</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ textAlign: "right", fontSize: "15px" }}>
        آیا مطمئن هستید که می‌خواهید <strong>{itemName}</strong> را حذف کنید؟
      </Modal.Body>
      <Modal.Footer
        style={{ display: "flex", justifyContent: "flex-end", gap: "5px" }}
      >
        <Button
          variant="secondary"
          onClick={onHide}
          className="btn-custom"
        >
          لغو
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
          className="btn-custom"
        >
          حذف
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirm;
