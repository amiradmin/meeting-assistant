// src/components/cmms/EmployeeFormModal.jsx
import React, { useState, useEffect } from "react";
import { createEmployee, updateEmployee } from "../../services/cmmsService";

export default function EmployeeFormModal({ show, onHide, employee, onSave }) {
  const [formData, setFormData] = useState({
    full_name: "",
    role: "Worker",
    department: "",
    mobile: "",
    email: "",
    ext: "",
    is_active: true
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        id: employee.id,
        full_name: employee.full_name || "",
        role: employee.role || "Worker",
        department: employee.department || "",
        mobile: employee.mobile || "",
        email: employee.email || "",
        ext: employee.ext || "",
        is_active: employee.is_active !== undefined ? employee.is_active : true
      });
    } else {
      setFormData({
        full_name: "",
        role: "Worker",
        department: "",
        mobile: "",
        email: "",
        ext: "",
        is_active: true
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name) {
      alert("نام کامل الزامی است.");
      return;
    }

    const payload = {
      full_name: formData.full_name.trim(),
      role: formData.role,
      department: formData.department.trim() || null,
      mobile: formData.mobile.trim() || null,
      email: formData.email.trim() || null,
      ext: formData.ext.trim() || null,
      is_active: formData.is_active
    };

    setSubmitting(true);
    try {
      if (formData.id) {
        await updateEmployee(formData.id, payload);
      } else {
        await createEmployee(payload);
      }
      onSave();
    } catch (err) {
      console.error("Submit error:", err);
      alert("خطا در ذخیره پرسنل: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      full_name: "",
      role: "Worker",
      department: "",
      mobile: "",
      email: "",
      ext: "",
      is_active: true
    });
    if (onHide) onHide();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {employee ? "ویرایش پرسنل" : "ایجاد پرسنل جدید"}
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
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">
              نام کامل
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="form-input"
              placeholder="نام و نام خانوادگی"
              required
            />
          </div>

          {/* Role and Department */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                نقش
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="Worker">کارگر</option>
                <option value="Engineer">مهندس</option>
                <option value="Expert">کارشناس</option>
                <option value="Manager">مدیر</option>
                <option value="Other">سایر</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                دپارتمان
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                placeholder="دپارتمان"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                موبایل
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className="form-input"
                placeholder="شماره موبایل"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                ایمیل
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="آدرس ایمیل"
              />
            </div>
          </div>

          {/* Extension and Status */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                شماره داخلی
              </label>
              <input
                type="text"
                name="ext"
                value={formData.ext}
                onChange={handleChange}
                className="form-input"
                placeholder="شماره داخلی"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                وضعیت
              </label>
              <div className="checkbox-container">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">فعال</span>
                </label>
              </div>
            </div>
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
                employee ? "بروزرسانی پرسنل" : "ایجاد پرسنل"
              )}
            </button>

            {employee && (
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
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem 0;
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid #d1d5db;
          cursor: pointer;
        }

        .checkbox-input:checked {
          background-color: #3b82f6;
          border-color: #3b82f6;
        }

        .checkbox-text {
          font-size: 0.875rem;
          color: #374151;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .submit-btn {
          flex: 1;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
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
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
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