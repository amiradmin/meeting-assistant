// src/components/cmms/SparePartFormModal.jsx
import React, { useState, useEffect } from "react";
import { createSparePart, updateSparePart } from "../../services/cmmsService";

export default function SparePartFormModal({ show, onHide, sparePart, locations, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    part_number: "",
    quantity_in_stock: 0,
    unit_price: "",
    location: ""
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sparePart) {
      setFormData({
        id: sparePart.id,
        name: sparePart.name || "",
        part_number: sparePart.part_number || "",
        quantity_in_stock: sparePart.quantity_in_stock || 0,
        unit_price: sparePart.unit_price || "",
        location: sparePart.location?.id?.toString() || "" // Fix: use location id
      });
    } else {
      setFormData({
        name: "",
        part_number: "",
        quantity_in_stock: 0,
        unit_price: "",
        location: ""
      });
    }
  }, [sparePart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'quantity_in_stock' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.part_number) {
      alert("نام و شماره قطعه الزامی است.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      part_number: formData.part_number.trim(),
      quantity_in_stock: formData.quantity_in_stock,
      unit_price: formData.unit_price ? parseFloat(formData.unit_price) : null,
      location: formData.location || null, // Fix: send location id
    };

    setSubmitting(true);
    try {
      if (formData.id) {
        await updateSparePart(formData.id, payload);
      } else {
        await createSparePart(payload);
      }
      onSave();
    } catch (err) {
      console.error("Submit error:", err);
      alert("خطا در ذخیره قطعه: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      part_number: "",
      quantity_in_stock: 0,
      unit_price: "",
      location: ""
    });
    if (onHide) onHide();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {sparePart ? "ویرایش قطعه یدکی" : "ایجاد قطعه یدکی جدید"}
          </h2>
          <button
            onClick={handleReset}
            className="modal-close-btn"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Name */}
          <div className="form-group">
            <label className="form-label">
              نام قطعه
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              placeholder="نام قطعه را وارد کنید"
              required
            />
          </div>

          {/* Part Number */}
          <div className="form-group">
            <label className="form-label">
              شماره قطعه
            </label>
            <input
              type="text"
              name="part_number"
              value={formData.part_number}
              onChange={handleChange}
              className="form-input"
              placeholder="شماره قطعه را وارد کنید"
              required
            />
          </div>

          {/* Quantity and Price */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                موجودی
              </label>
              <input
                type="number"
                name="quantity_in_stock"
                value={formData.quantity_in_stock}
                onChange={handleChange}
                className="form-input"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                قیمت واحد (ریال)
              </label>
              <input
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                className="form-input"
                min="0"
                step="0.01"
                placeholder="قیمت واحد"
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              موقعیت
            </label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
            >
              <option value="">انتخاب موقعیت</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={submitting}
              className="submit-btn"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -mr-1 ml-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>در حال ذخیره...</span>
                </>
              ) : (
                sparePart ? "بروزرسانی قطعه" : "ایجاد قطعه"
              )}
            </button>

            {sparePart && (
              <button
                type="button"
                onClick={handleReset}
                className="cancel-btn"
              >
                انصراف
              </button>
            )}
          </div>
        </form>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-content {
          background: white;
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .modal-close-btn:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-form {
          padding: 2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-label {
          display: block;
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          color: #374151;
          transition: all 0.3s ease;
          background: white;
        }

        .form-input:focus {
          outline: none;
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .submit-btn {
          flex: 1;
          background: linear-gradient(135deg, #059669, #047857);
          color: white;
          border: none;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #047857, #065f46);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .cancel-btn {
          padding: 1rem 1.5rem;
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-btn:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 1rem;
          }

          .modal-header {
            padding: 1.25rem 1.5rem;
          }

          .modal-form {
            padding: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}