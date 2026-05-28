import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Button, InputGroup, FormControl, Form, Modal, Spinner } from "react-bootstrap";
import DeleteConfirm from "../components/DeleteConfirm";
import "../assets/css/custom.css"; // استایل‌های مشابه Locations و Factories

const Sections = () => {
  const [sections, setSections] = useState([]);
  const [plants, setPlants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", plant_id: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchSections();
    fetchPlants();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const res = await api.get("/factories/sections/");
      setSections(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const res = await api.get("/factories/plants/");
      setPlants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSections = sections.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.plant?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.plant?.factory?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.plant?.factory?.location?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const errors = {};
    if (!formData.name?.trim()) errors.name = "نام بخش الزامی است";
    if (!formData.plant_id) errors.plant_id = "انتخاب واحد الزامی است";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitLoading(false);
      return;
    }

    try {
      if (editing) {
        await api.put(`/factories/sections/${editing.id}/`, formData);
      } else {
        await api.post("/factories/sections/", formData);
      }
      await fetchSections();
      handleCloseModal();
    } catch (err) {
      console.error(err.response || err);
      setFormErrors({ submit: "خطا در ذخیره اطلاعات" });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/factories/sections/${deleting.id}/`);
      setSections(prev => prev.filter(s => s.id !== deleting.id));
      setShowDelete(false);
      setDeleting(null);
    } catch (err) {
      console.error(err.response || err);
      alert("خطا در حذف بخش");
    }
  };

  const handleCloseModal = () => {
    setShowAddEdit(false);
    setEditing(null);
    setFormData({ name: "", plant_id: "", description: "" });
    setFormErrors({});
  };

  const handleEdit = (section) => {
    setEditing(section);
    setFormData({
      name: section.name || "",
      plant_id: section.plant?.id || "",
      description: section.description || ""
    });
    setShowAddEdit(true);
  };

  return (
    <div className="col-12 p-2" dir="rtl">
      <div className="card shade h-100">
        <div className="card-body">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">مدیریت بخش‌ها</h5>
            <Button variant="success" size="sm" className="btn-custom" onClick={() => setShowAddEdit(true)}>
              افزودن بخش
            </Button>
          </div>

          <hr />

          {/* Search Input */}
          <InputGroup className="mb-3">
            <FormControl
              placeholder="جستجوی بخش..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </InputGroup>

          {/* Sections Table */}
          <div className="table-responsive">
            <table className="table table-striped text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>نام بخش</th>
                  <th>واحد مربوطه</th>
                  <th>کارخانه</th>
                  <th>لوکیشن</th>
                  <th>توضیحات</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <Spinner animation="border" size="sm" /> در حال بارگذاری...
                    </td>
                  </tr>
                ) : filteredSections.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-3">هیچ بخشی یافت نشد</td>
                  </tr>
                ) : (
                  filteredSections.map((section, index) => (
                    <tr key={section.id}>
                      <th>{index + 1}</th>
                      <td>{section.name}</td>
                      <td>{section.plant?.name || "-"}</td>
                      <td>{section.plant?.factory?.name || "-"}</td>
                      <td>{section.plant?.factory?.location?.name || "-"}</td>
                      <td>{section.description || "-"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <Button variant="outline-primary" size="sm" className="btn-custom" onClick={() => handleEdit(section)}>ویرایش</Button>
                          <Button variant="outline-danger" size="sm" className="btn-custom" onClick={() => { setDeleting(section); setShowDelete(true); }}>حذف</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          {!loading && filteredSections.length > 0 && (
            <div className="text-muted small mt-2">
              نمایش {filteredSections.length} از {sections.length} بخش
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showAddEdit} onHide={handleCloseModal} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? `ویرایش بخش: ${editing.name}` : "افزودن بخش جدید"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="mb-2"
              placeholder="نام بخش *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>

            <Form.Select
              className="mb-2"
              name="plant_id"
              value={formData.plant_id}
              onChange={handleInputChange}
              isInvalid={!!formErrors.plant_id}
            >
              <option value="">انتخاب واحد *</option>
              {plants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.factory?.name} - {p.name} {p.factory?.location && `(${p.factory.location.name})`}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.plant_id}</Form.Control.Feedback>

            <Form.Control
              as="textarea"
              rows={3}
              placeholder="توضیحات"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mb-2"
            />

            {formErrors.submit && <div className="alert alert-danger">{formErrors.submit}</div>}

            <div className="d-flex gap-2 mt-2">
              <Button variant="secondary" onClick={handleCloseModal} className="flex-fill" disabled={submitLoading}>انصراف</Button>
              <Button variant={editing ? "primary" : "success"} type="submit" className="flex-fill" disabled={submitLoading}>
                {submitLoading ? <Spinner animation="border" size="sm" className="ms-2" /> : editing ? "ذخیره تغییرات" : "ثبت بخش"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteConfirm
        show={showDelete}
        onHide={() => { setShowDelete(false); setDeleting(null); }}
        onConfirm={handleDelete}
        itemName={deleting?.name}
      />
    </div>
  );
};

export default Sections;
