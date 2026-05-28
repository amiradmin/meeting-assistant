import React from "react";
import { Modal, Table } from "react-bootstrap";

const HistoryModal = ({ show, onHide, historyData = [] }) => {
  const data = historyData || [];

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>تاریخچه تجهیز</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {data.length === 0 ? (
          <p className="text-center text-muted">هیچ داده‌ای موجود نیست.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>تاریخ</th>
                <th>وضعیت</th>
                <th>توضیحات</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, idx) => (
                <tr key={idx}>
                  <td>{record.date || "-"}</td>
                  <td>{record.status || "-"}</td>
                  <td>{record.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default HistoryModal;
