import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  Button,
  InputGroup,
  FormControl,
  Form,
  Modal,
} from "react-bootstrap";
import DeleteConfirm from "../components/DeleteConfirm";
import { FaEdit, FaTrashAlt, FaPlus } from "react-icons/fa";
import "./Factories.css";

const Factories = () => {
  const [factories, setFactories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location_id: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // گرفتن کارخانه‌ها و لوکیشن‌ها
  useEffect(() => {
    fetchFactories();
    fetchLocations();
  }, []);

  const fetchFactories = () => {
    api
      .get("/factories/factories/")
      .then((res) => setFactories(res.data))
      .catch((err) => console.error(err));
  };

  const fetchLocations = () => {
    api
      .get("/locations/locations/")
      .then((res) => setLocations(res.data))
      .catch((err) => console.error(err));
  };

  const filtered = factories.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.name.trim()) errors.name = "نام کارخانه الزامی است";
    if (!formData.location_id) errors.location_id = "انتخاب لوکیشن الزامی است";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editing) {
        await api.put(`/factories/factories/${editing.id}/`, formData);
        setFactories((prev) =>
          prev.map((f) =>
            f.id === editing.id
              ? {
                  ...f,
                  ...formData,
                  location: locations.find(
                    (l) => l.id === formData.location_id
                  ),
                }
              : f
          )
        );
      } else {
        const res = await api.post("/factories/factories/", formData);
        res.data.location =
          locations.find((l) => l.id === res.data.location_id) || null;
        setFactories((prev) => [...prev, res.data]);
      }
      setShowAddEdit(false);
      setFormData({ name: "", location_id: "", description: "" });
      setEditing(null);
      setFormErrors({});
    } catch (err) {
      console.error(err.response || err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/factories/factories/${deleting.id}/`);
      setFactories((prev) => prev.filter((f) => f.id !== deleting.id));
      setShowDelete(false);
    } catch (err) {
      console.error(err.response || err);
    }
  };

  const handleCloseModal = () => {
    setShowAddEdit(false);
    setEditing(null);
    setFormData({ name: "", location_id: "", description: "" });
    setFormErrors({});
  };

  const handleEdit = (factory) => {
    setEditing(factory);
    setFormData({
      name: factory.name,
      location_id: factory.location?.id || "",
      description: factory.description || "",
    });
    setShowAddEdit(true);
  };

  return (
    <div className="col-12 p-2 factories-page">
      <div className="card shade h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">مدیریت کارخانه‌ها</h5>
            <Button
              variant="success"
              size="sm"
              className="d-flex custom-btn-outline align-items-center gap-1 rounded-pill shadow-sm px-3"
              onClick={() => setShowAddEdit(true)}
            >
              <FaPlus /> افزودن کارخانه
            </Button>
          </div>

          <hr />

          {/* جستجو */}
          <InputGroup className="mb-3">
            <FormControl
              placeholder="جستجوی کارخانه..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rtl-input"
            />
          </InputGroup>

          {/* جدول کارخانه‌ها */}
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">نام</th>
                  <th scope="col">لوکیشن</th>
                  <th scope="col">توضیحات</th>
                  <th scope="col">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((factory, index) => (
                    <tr key={factory.id}>
                      <th scope="row">{index + 1}</th>
                      <td>{factory.name}</td>
                      <td>{factory.location?.name || "-"}</td>
                      <td>{factory.description || "-"}</td>
                      <td>
                        <div className="d-flex justify-content-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="custom-btn-outline action-btn d-flex align-items-center gap-1"
                            onClick={() => handleEdit(factory)}
                          >
                            <FaEdit /> ویرایش
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="custom-btn-outline action-btn d-flex align-items-center gap-1"
                            onClick={() => {
                              setDeleting(factory);
                              setShowDelete(true);
                            }}
                          >
                            <FaTrashAlt /> حذف
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      کارخانه‌ای یافت نشد!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* تعداد نتایج */}
          {filtered.length > 0 && (
            <div className="text-muted small mt-2">
              نمایش {filtered.length} از {factories.length} کارخانه
            </div>
          )}
        </div>
      </div>

      {/* مودال افزودن/ویرایش */}
      <Modal show={showAddEdit} onHide={handleCloseModal} centered>
        <Modal.Header closeButton className="rtl-modal">
          <Modal.Title>
            {editing ? "ویرایش کارخانه" : "افزودن کارخانه جدید"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="rtl-modal">
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>نام کارخانه *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                isInvalid={!!formErrors.name}
                placeholder="نام کارخانه را وارد کنید"
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>لوکیشن *</Form.Label>
              <Form.Select
                name="location_id"
                value={formData.location_id}
                onChange={handleInputChange}
                isInvalid={!!formErrors.location_id}
                className="location-select"
              >
                <option value="">انتخاب لوکیشن</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {formErrors.location_id}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>توضیحات</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="توضیحات مربوط به کارخانه را وارد کنید"
              />
            </Form.Group>

            <div className="d-flex gap-2">
              <Button
                variant="secondary"
                onClick={handleCloseModal}
                className="flex-fill rounded-pill shadow-sm"
              >
                انصراف
              </Button>
              <Button
                type="submit"
                variant={editing ? "primary" : "success"}
                className="flex-fill rounded-pill shadow-sm"
              >
                {editing ? "ذخیره تغییرات" : "ثبت کارخانه"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* مودال حذف */}
      <DeleteConfirm
        show={showDelete}
        onHide={() => setShowDelete(false)}
        onConfirm={handleDelete}
        itemName={deleting?.name}
      />
    </div>
  );
};

export default Factories;
