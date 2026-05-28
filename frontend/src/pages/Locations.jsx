import React, { useEffect, useState } from "react";
import api from "../api/api";
import { Button, InputGroup, FormControl, Modal, Form, Alert } from "react-bootstrap";
import DeleteConfirm from "../components/DeleteConfirm"; // ایمپورت کامپوننت حذف
import "../assets/css/custom.css";

// Convert Persian digits to English
const toEnglishNumber = (num) => {
  if (!num) return num;
  return num.toString().replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
};

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({ name: "", address: "", latitude: "", longitude: "", phone: "" });
  const [formErrors, setFormErrors] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingLocation, setDeletingLocation] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  useEffect(() => { fetchLocations(); }, []);

  const fetchLocations = () => {
    api.get("/locations/locations/")
       .then((res) => setLocations(res.data))
       .catch((err) => console.error(err));
  };

  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "نام مکان الزامی است";
    if (formData.latitude && isNaN(parseFloat(toEnglishNumber(formData.latitude)))) errors.latitude = "عرض جغرافیایی معتبر نیست";
    if (formData.longitude && isNaN(parseFloat(toEnglishNumber(formData.longitude)))) errors.longitude = "طول جغرافیایی معتبر نیست";
    if (formData.phone && !/^\d+$/.test(toEnglishNumber(formData.phone))) errors.phone = "شماره تلفن معتبر نیست";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      latitude: formData.latitude ? parseFloat(toEnglishNumber(formData.latitude)) : null,
      longitude: formData.longitude ? parseFloat(toEnglishNumber(formData.longitude)) : null,
      phone: formData.phone ? toEnglishNumber(formData.phone) : null,
    };
    try {
      const res = await api.post("/locations/locations/", payload);
      setLocations(prev => [...prev, res.data]);
      setFormData({ name: "", address: "", latitude: "", longitude: "", phone: "" });
      setShowAddModal(false);
    } catch (err) {
      console.error("API Error:", err.response || err);
      alert("خطا در ثبت مکان! لطفاً مقادیر را بررسی کنید.");
    }
  };

  const handleEditClick = (loc) => {
    setEditingLocation(loc);
    setFormData({ name: loc.name || "", address: loc.address || "", latitude: loc.latitude || "", longitude: loc.longitude || "", phone: loc.phone || "" });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim() || null,
      latitude: formData.latitude ? parseFloat(toEnglishNumber(formData.latitude)) : null,
      longitude: formData.longitude ? parseFloat(toEnglishNumber(formData.longitude)) : null,
      phone: formData.phone ? toEnglishNumber(formData.phone) : null,
    };
    try {
      await api.put(`/locations/locations/${editingLocation.id}/`, payload);
      setLocations(prev => prev.map(loc => loc.id === editingLocation.id ? { ...loc, ...payload } : loc));
      setShowEditModal(false);
      setEditingLocation(null);
    } catch (err) {
      console.error("API Error:", err.response || err);
      alert("خطا در ویرایش مکان!");
    }
  };

  const handleDeleteClick = (loc) => {
    setDeletingLocation(loc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/locations/locations/${deletingLocation.id}/`);
      setLocations(prev => prev.filter(l => l.id !== deletingLocation.id));
      setShowDeleteModal(false);
      setDeletingLocation(null);
    } catch (err) {
      console.error("Delete Error:", err.response || err);
      alert("خطا در حذف مکان!");
    }
  };

  return (
    <div className="col-12 p-2" dir="rtl">
      <div className="card shade h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">مدیریت مکان‌ها</h5>
            <Button variant="success" size="sm" className="btn-custom" onClick={() => setShowAddModal(true)}>
              افزودن مکان
            </Button>
          </div>

          <hr />

          <InputGroup className="mb-3">
            <FormControl
              placeholder="جستجوی مکان..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <div className="table-responsive">
            <table className="table table-striped text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>نام</th>
                  <th>آدرس</th>
                  <th>عرض جغرافیایی</th>
                  <th>طول جغرافیایی</th>
                  <th>تلفن</th>
                  <th>عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.length > 0 ? filteredLocations.map((loc, index) => (
                  <tr key={loc.id}>
                    <th>{index + 1}</th>
                    <td>{loc.name}</td>
                    <td>{loc.address || "-"}</td>
                    <td><span dir="ltr">{loc.latitude || "-"}</span></td>
                    <td><span dir="ltr">{loc.longitude || "-"}</span></td>
                    <td><span dir="ltr">{toEnglishNumber(loc.phone) || "-"}</span></td>
                    <td>
                      <div className="d-flex justify-content-center gap-1">
                        <Button variant="outline-primary" size="sm" className="btn-custom" onClick={() => handleEditClick(loc)}>ویرایش</Button>
                        <Button variant="outline-danger" size="sm" className="btn-custom" onClick={() => handleDeleteClick(loc)}>حذف</Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-3">مکانی یافت نشد!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredLocations.length > 0 && (
            <div className="text-muted small mt-2">
              نمایش {filteredLocations.length} از {locations.length} مکان
            </div>
          )}
        </div>
      </div>

      {/* ---------- Modals ---------- */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>افزودن مکان جدید</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Control className="mb-2" placeholder="نام مکان" name="name" value={formData.name} onChange={handleInputChange} isInvalid={!!formErrors.name} required />
            <Form.Control className="mb-2" placeholder="آدرس" name="address" value={formData.address} onChange={handleInputChange} />
            <Form.Control className="mb-2" placeholder="عرض جغرافیایی" name="latitude" value={formData.latitude} onChange={handleInputChange} isInvalid={!!formErrors.latitude} />
            <Form.Control className="mb-2" placeholder="طول جغرافیایی" name="longitude" value={formData.longitude} onChange={handleInputChange} isInvalid={!!formErrors.longitude} />
            <Form.Control className="mb-2" placeholder="تلفن" name="phone" value={formData.phone} onChange={handleInputChange} isInvalid={!!formErrors.phone} />
            {Object.keys(formErrors).length > 0 && (
              <Alert variant="danger">
                {Object.values(formErrors).map((err, i) => <div key={i}>{err}</div>)}
              </Alert>
            )}
            <Button type="submit" variant="success" className="w-100 mt-2 btn-custom">ثبت مکان جدید</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} dir="rtl">
        <Modal.Header closeButton>
          <Modal.Title>ویرایش مکان</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Control className="mb-2" placeholder="نام مکان" name="name" value={formData.name} onChange={handleInputChange} isInvalid={!!formErrors.name} required />
            <Form.Control className="mb-2" placeholder="آدرس" name="address" value={formData.address} onChange={handleInputChange} />
            <Form.Control className="mb-2" placeholder="عرض جغرافیایی" name="latitude" value={formData.latitude} onChange={handleInputChange} isInvalid={!!formErrors.latitude} />
            <Form.Control className="mb-2" placeholder="طول جغرافیایی" name="longitude" value={formData.longitude} onChange={handleInputChange} isInvalid={!!formErrors.longitude} />
            <Form.Control className="mb-2" placeholder="تلفن" name="phone" value={formData.phone} onChange={handleInputChange} isInvalid={!!formErrors.phone} />
            {Object.keys(formErrors).length > 0 && (
              <Alert variant="danger">
                {Object.values(formErrors).map((err, i) => <div key={i}>{err}</div>)}
              </Alert>
            )}
            <Button type="submit" variant="primary" className="w-100 mt-2 btn-custom">ذخیره تغییرات</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* ---------- DeleteConfirm ---------- */}
      <DeleteConfirm
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        itemName={deletingLocation?.name}
      />
    </div>
  );
};

export default Locations;
