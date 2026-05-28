// src/components/AssetFormModal.jsx
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const AssetFormModal = ({
  show,
  onHide,
  editing,
  formData,
  formErrors,
  sections,
  submitLoading,
  onSubmit,
  onInputChange
}) => {
  return (
    <Modal show={show} onHide={onHide} centered dir="rtl">
      <Modal.Header closeButton>
        <Modal.Title>{editing ? "ویرایش دارایی" : "افزودن دارایی جدید"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>نام دارایی *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>بخش *</Form.Label>
            <Form.Select
              name="section_id"
              value={formData.section_id}
              onChange={onInputChange}
              isInvalid={!!formErrors.section_id}
            >
              <option value="">انتخاب بخش</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.plant?.name} ({s.plant?.factory?.name})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.section_id}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>نوع دارایی</Form.Label>
            <Form.Control
              type="text"
              name="asset_type"
              value={formData.asset_type}
              onChange={onInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>مدل</Form.Label>
            <Form.Control
              type="text"
              name="model"
              value={formData.model}
              onChange={onInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>شماره سریال</Form.Label>
            <Form.Control
              type="text"
              name="serial_number"
              value={formData.serial_number}
              onChange={onInputChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>توضیحات</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={onInputChange}
            />
          </Form.Group>

          {formErrors.submit && (
            <div className="alert alert-danger">{formErrors.submit}</div>
          )}

          <div className="d-flex gap-2 mt-4">
            <Button
              variant="outline-secondary"
              onClick={onHide}
              disabled={submitLoading}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant={editing ? "primary" : "success"}
              disabled={submitLoading}
            >
              {submitLoading ? "در حال ذخیره..." : editing ? "ذخیره تغییرات" : "ثبت دارایی"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AssetFormModal;