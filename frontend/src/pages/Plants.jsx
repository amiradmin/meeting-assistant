import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Button, InputGroup, FormControl, Form, Modal, Spinner } from "react-bootstrap";
import DeleteConfirm from "../components/DeleteConfirm";
import "../assets/css/custom.css"; // استایل‌های مشابه Locations و Factories

const Plants = () => {
  const [plants, setPlants] = useState([]);
  const [factories, setFactories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", factory_id: "", description: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showAddEdit, setShowAddEdit] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchPlants();
    fetchFactories();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const res = await api.get("/factories/plants/");
      setPlants(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFactories = async () => {
    try {
      const res = await api.get("/factories/factories/");
      setFactories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredPlants = plants.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.factory?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.factory?.location?.name?.toLowerCase().includes(search.toLowerCase())
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
    if (!formData.name?.trim()) errors.name = "نام واحد الزامی است";
    if (!formData.factory_id) errors.factory_id = "انتخاب کارخانه الزامی است";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitLoading(false);
      return;
    }

    try {
      if (editing) {
        await api.put(`/factories/plants/${editing.id}/`, formData);
      } else {
        await api.post("/factories/plants/", formData);
      }
      await fetchPlants();
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
      await api.delete(`/factories/plants/${deleting.id}/`);
      setPlants(prev => prev.filter(p => p.id !== deleting.id));
      setShowDelete(false);
      setDeleting(null);
    } catch (err) {
      console.error(err.response || err);
      alert("خطا در حذف واحد");
    }
  };

  const handleCloseModal = () => {
    setShowAddEdit(false);
    setEditing(null);
    setFormData({ name: "", factory_id: "", description: "" });
    setFormErrors({});
  };

  const handleEdit = (plant) => {
    setEditing(plant);
    setFormData({
      name: plant.name || "",
      factory_id: plant.factory?.id || "",
      description: plant.description || ""
    });
    setShowAddEdit(true);
  };

  return (
    <div className="col-12 p-2" dir="rtl">
      <div className="card shade h-100">
        <div className="card-body">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">مدیریت واحدها</h5>
            <Button variant="success" size="sm" className="btn-custom" onClick={() => setShowAddEdit(true)}>
              افزودن واحد
            </Button>
          </div>

          <hr />

          {/* Search Input */}
          <InputGroup className="mb-3">
            <FormControl
              placeholder="جستجوی واحد..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </InputGroup>

          {/* Plants Table */}
          <div className="table-responsive">
            <table className="table table-striped text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>نام واحد</th>
                  <th>کارخانه</th>
                  <th>لوکیشن</th>
                  <th>توضیحات</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      <Spinner animation="border" size="sm" /> در حال بارگذاری...
                    </td>
                  </tr>
                ) : filteredPlants.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-3">هیچ واحدی یافت نشد</td>
                  </tr>
                ) : (
                  filteredPlants.map((plant, index) => (
                    <tr key={plant.id}>
                      <th>{index + 1}</th>
                      <td>{plant.name}</td>
                      <td>{plant.factory?.name || "-"}</td>
                      <td>{plant.factory?.location?.name || "-"}</td>
                      <td>{plant.description || "-"}</td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <Button variant="outline-primary" size="sm" className="btn-custom" onClick={() => handleEdit(plant)}>ویرایش</Button>
                          <Button variant="outline-danger" size="sm" className="btn-custom" onClick={() => { setDeleting(plant); setShowDelete(true); }}>حذف</Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Results Count */}
          {!loading && filteredPlants.length > 0 && (
            <div className="text-muted small mt-2">
              نمایش {filteredPlants.length} از {plants.length} واحد
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal show={showAddEdit} onHide={handleCloseModal} centered dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>{editing ? `ویرایش واحد: ${editing.name}` : "افزودن واحد جدید"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Control
              className="mb-2"
              placeholder="نام واحد *"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              isInvalid={!!formErrors.name}
            />
            <Form.Control.Feedback type="invalid">{formErrors.name}</Form.Control.Feedback>

            <Form.Select
              name="factory_id"
              value={formData.factory_id}
              onChange={handleInputChange}
              isInvalid={!!formErrors.factory_id}
              className="location-select"
            >
              <option value="">انتخاب کارخانه *</option>
              {factories.map(f => <option key={f.id} value={f.id}>{f.name} {f.location && `- ${f.location.name}`}</option>)}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{formErrors.factory_id}</Form.Control.Feedback>

            <Form.Control
              as="textarea"
              rows={3}
              placeholder="توضیحات"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mb-2 mt-2"
            />

            {formErrors.submit && <div className="alert alert-danger">{formErrors.submit}</div>}

            <div className="d-flex gap-2 mt-2">
              <Button variant="secondary" onClick={handleCloseModal} className="flex-fill" disabled={submitLoading}>انصراف</Button>
              <Button variant={editing ? "primary" : "success"} type="submit" className="flex-fill" disabled={submitLoading}>
                {submitLoading ? <Spinner animation="border" size="sm" className="ms-2" /> : editing ? "ذخیره تغییرات" : "ثبت واحد"}
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

export default Plants;
