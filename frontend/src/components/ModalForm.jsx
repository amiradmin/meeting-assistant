import React from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const ModalForm = ({
  show,
  onHide,
  onSubmit,
  title,
  formData = {},
  formErrors = {},
  handleChange,
  children,
  loading = false
}) => {
  // Function to format field labels (convert snake_case to readable text)
  const formatLabel = (key) => {
    const labels = {
      name: "نام",
      address: "آدرس",
      phone: "تلفن",
      description: "توضیحات",
      capacity: "ظرفیت",
      status: "وضعیت",
      created_at: "تاریخ ایجاد",
      updated_at: "تاریخ بروزرسانی"
    };

    return labels[key] || key.replace(/_/g, " ");
  };

  // Determine input type based on field name
  const getInputType = (key) => {
    if (key.includes('email')) return 'email';
    if (key.includes('phone') || key.includes('tel')) return 'tel';
    if (key.includes('password')) return 'password';
    if (key.includes('date')) return 'date';
    if (key.includes('number') || key.includes('capacity')) return 'number';
    return 'text';
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
      dir="rtl"
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="w-100">
          <div className="d-flex align-items-center">
            <i className="fas fa-edit ms-2 text-primary"></i>
            <span className="fw-bold">{title}</span>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={onSubmit} noValidate>
        <Modal.Body className="pt-0">
          <Row>
            {Object.keys(formData).map((key) => {
              // Skip fields handled as children or system fields
              if (['factory_id', 'location_id', 'id', 'created_at', 'updated_at'].includes(key))
                return null;

              return (
                <Col key={key} md={6} className="mb-3">
                  <Form.Group controlId={key}>
                    <Form.Label className="fw-semibold text-muted small mb-1">
                      {formatLabel(key)}
                      <span className="text-danger me-1">*</span>
                    </Form.Label>
                    <Form.Control
                      type={getInputType(key)}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleChange}
                      isInvalid={!!formErrors[key]}
                      className="py-2 border-0 bg-light rounded-3"
                      placeholder={`${formatLabel(key)} را وارد کنید`}
                      disabled={loading}
                    />
                    <Form.Control.Feedback type="invalid" className="d-flex align-items-center mt-1">
                      <i className="fas fa-exclamation-circle ms-1 small"></i>
                      {formErrors[key]}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              );
            })}
          </Row>

          {/* Render custom children */}
          {children && (
            <div className="mt-3 pt-3 border-top">
              {children}
            </div>
          )}

          {/* Form validation summary */}
          {Object.keys(formErrors).length > 0 && (
            <div className="alert alert-warning py-2 mt-3 mb-0">
              <i className="fas fa-exclamation-triangle ms-2"></i>
              لطفا خطاهای فرم را برطرف کنید
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0">
          <Button
            variant="outline-secondary"
            onClick={onHide}
            disabled={loading}
            className="px-4 rounded-2"
          >
            <i className="fas fa-times ms-2"></i>
            انصراف
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="px-4 rounded-2"
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm ms-2" role="status">
                  <span className="visually-hidden">در حال ذخیره...</span>
                </div>
                در حال ذخیره...
              </>
            ) : (
              <>
                <i className="fas fa-save ms-2"></i>
                ذخیره اطلاعات
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ModalForm;