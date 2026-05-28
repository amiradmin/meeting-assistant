// src/components/cmms/WorkOrderFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createWorkOrder, updateWorkOrder, getSpareParts } from '../../services/cmmsService';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const WorkOrderFormModal = ({ show, onHide, workOrder, assets, users, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    work_order_type: 'maintenance',
    priority: 'medium',
    status: 'pending',
    asset: '',
    assigned_to: '', // Will be set to 1 if available
    due_date: '',
    estimated_hours: '',
    estimated_cost: '',
    required_tools: '',
    safety_requirements: '',
    notes: '',
    spare_parts: []
  });
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (workOrder) {
      setFormData({
        title: workOrder.title || '',
        description: workOrder.description || '',
        work_order_type: workOrder.work_order_type || 'maintenance',
        priority: workOrder.priority || 'medium',
        status: workOrder.status || 'pending',
        asset: workOrder.asset?.id || '',
        assigned_to: workOrder.assigned_to?.id || '1', // Default to user ID 1
        due_date: workOrder.due_date ? workOrder.due_date.split('T')[0] : '',
        estimated_hours: workOrder.estimated_hours || '',
        estimated_cost: workOrder.estimated_cost || '',
        required_tools: workOrder.required_tools || '',
        safety_requirements: workOrder.safety_requirements || '',
        notes: workOrder.notes || '',
        spare_parts: workOrder.spare_parts?.map(sp => sp.id) || []
      });
    } else {
      // For new work orders, automatically assign to user ID 1
      setFormData({
        title: '',
        description: '',
        work_order_type: 'maintenance',
        priority: 'medium',
        status: 'pending',
        asset: '',
        assigned_to: '1', // Default to the only user (ID = 1)
        due_date: '',
        estimated_hours: '',
        estimated_cost: '',
        required_tools: '',
        safety_requirements: '',
        notes: '',
        spare_parts: []
      });
    }
    setError('');
  }, [workOrder, show]);

  // Fetch spare parts when modal opens
  useEffect(() => {
    if (show) {
      fetchSpareParts();
    }
  }, [show]);

  const fetchSpareParts = async () => {
    try {
      const parts = await getSpareParts();
      // Only take first 20 spare parts to avoid performance issues
      setSpareParts(parts.slice(0, 20));
    } catch (err) {
      console.error('Error fetching spare parts:', err);
    }
  };

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Prepare the data - always use user ID 1 for assigned_to
      const submitData = {
        title: formData.title,
        description: formData.description,
        work_order_type: formData.work_order_type,
        priority: formData.priority,
        status: formData.status,
        asset: formData.asset || null,
        assigned_to: 1, // Always use the only user (ID = 1)
        due_date: formData.due_date || null,
        estimated_hours: formData.estimated_hours || null,
        estimated_cost: formData.estimated_cost || null,
        required_tools: formData.required_tools || '',
        safety_requirements: formData.safety_requirements || '',
        notes: formData.notes || '',
        spare_parts: formData.spare_parts
      };

      // Remove completely empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      console.log('Submitting work order data:', submitData);

      if (workOrder) {
        await updateWorkOrder(workOrder.id, submitData);
      } else {
        await createWorkOrder(submitData);
      }
      onSave();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('خطا در ایجاد دستور کار. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSparePartChange = (sparePartId) => {
    setFormData(prev => {
      const currentParts = prev.spare_parts;
      const isSelected = currentParts.includes(sparePartId);

      if (isSelected) {
        return {
          ...prev,
          spare_parts: currentParts.filter(id => id !== sparePartId)
        };
      } else {
        return {
          ...prev,
          spare_parts: [...currentParts, sparePartId]
        };
      }
    });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onHide();
    }
  };

  const removeSparePart = (sparePartId) => {
    setFormData(prev => ({
      ...prev,
      spare_parts: prev.spare_parts.filter(id => id !== sparePartId)
    }));
  };

  // Get the only user (ID = 1)
  const mainUser = users.find(user => user.id === 1) || { id: 1, full_name: 'کاربر اصلی' };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">
              {workOrder ? 'ویرایش دستور کار' : 'ایجاد دستور کار جدید'}
            </h2>
            <button type="button" className="close-button" onClick={onHide}>
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            {error && (
              <div className="error-message">
                <FaExclamationTriangle className="error-icon" />
                {error}
              </div>
            )}

            <div className="user-assignment-notice">
              <strong>توجه:</strong> این دستور کار به طور خودکار به <strong>{mainUser.full_name}</strong> واگذار خواهد شد.
            </div>

            <div className="form-grid">
              {/* Basic Information */}
              <div className="form-section">
                <h3 className="section-title">اطلاعات پایه</h3>

                <div className="form-group">
                  <label className="form-label">عنوان *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="form-input"
                    placeholder="عنوان دستور کار را وارد کنید"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">نوع دستور کار</label>
                  <select
                    name="work_order_type"
                    value={formData.work_order_type}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="maintenance">نگهداری</option>
                    <option value="repair">تعمیر</option>
                    <option value="inspection">بازرسی</option>
                    <option value="installation">نصب</option>
                    <option value="emergency">اضطراری</option>
                    <option value="other">سایر</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">اولویت</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="low">کم</option>
                    <option value="medium">متوسط</option>
                    <option value="high">بالا</option>
                    <option value="urgent">فوری</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">وضعیت</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="pending">در انتظار</option>
                    <option value="assigned">واگذار شده</option>
                    <option value="in_progress">در حال انجام</option>
                    <option value="on_hold">در انتظار</option>
                    <option value="completed">تکمیل شده</option>
                    <option value="cancelled">لغو شده</option>
                  </select>
                </div>
              </div>

              {/* Assignment & Scheduling */}
              <div className="form-section">
                <h3 className="section-title">واگذاری و زمان‌بندی</h3>

                <div className="form-group">
                  <label className="form-label">تجهیز</label>
                  <select
                    name="asset"
                    value={formData.asset}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">انتخاب تجهیز (اختیاری)</option>
                    {assets.map(asset => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">تاریخ سررسید</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">ساعت تخمینی</label>
                    <input
                      type="number"
                      name="estimated_hours"
                      value={formData.estimated_hours}
                      onChange={handleChange}
                      step="0.5"
                      min="0"
                      className="form-input"
                      placeholder="0.0"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">هزینه تخمینی</label>
                    <input
                      type="number"
                      name="estimated_cost"
                      value={formData.estimated_cost}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className="form-input"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Spare Parts */}
            {formData.spare_parts.length > 0 && (
              <div className="form-full-section">
                <h3 className="section-title">قطعات یدکی انتخاب شده ({formData.spare_parts.length})</h3>
                <div className="selected-parts-grid">
                  {formData.spare_parts.map(sparePartId => {
                    const part = spareParts.find(p => p.id === sparePartId);
                    if (!part) return null;

                    return (
                      <div key={sparePartId} className="selected-part-item">
                        <div className="part-info">
                          <div className="part-name">{part.name}</div>
                          <div className="part-details">
                            {part.part_number} • موجودی: {part.quantity_in_stock}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSparePart(sparePartId)}
                          className="remove-part-btn"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Spare Parts Selection */}
            <div className="form-full-section">
              <h3 className="section-title">انتخاب قطعات یدکی (اختیاری)</h3>
              <div className="spare-parts-grid">
                {spareParts.filter(part => part.is_active).map(part => (
                  <label key={part.id} className="spare-part-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.spare_parts.includes(part.id)}
                      onChange={() => handleSparePartChange(part.id)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">
                      {part.name} ({part.part_number})
                      <span className="part-stock">
                        موجودی: {part.quantity_in_stock}
                        {part.unit_price && ` - قیمت: ${part.unit_price} ریال`}
                      </span>
                    </span>
                  </label>
                ))}
                {spareParts.filter(part => part.is_active).length === 0 && (
                  <p className="text-gray-500 text-sm">هیچ قطعه یدکی فعالی یافت نشد</p>
                )}
              </div>
            </div>

            {/* Description & Notes */}
            <div className="form-full-section">
              <h3 className="section-title">شرح کار و ملاحظات</h3>

              <div className="form-group">
                <label className="form-label">شرح کار *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="شرح کامل کار مورد نظر را وارد کنید..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">ابزار و مواد مورد نیاز</label>
                <textarea
                  name="required_tools"
                  value={formData.required_tools}
                  onChange={handleChange}
                  rows={2}
                  className="form-textarea"
                  placeholder="ابزارها و مواد مورد نیاز برای انجام کار..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">ملاحظات ایمنی</label>
                <textarea
                  name="safety_requirements"
                  value={formData.safety_requirements}
                  onChange={handleChange}
                  rows={2}
                  className="form-textarea"
                  placeholder="ملاحظات و دستورالعمل‌های ایمنی..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">یادداشت‌ها</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="form-textarea"
                  placeholder="یادداشت‌ها و توضیحات اضافی..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onHide}
                className="cancel-button"
                disabled={loading}
              >
                انصراف
              </button>
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? 'در حال ذخیره...' : (workOrder ? 'بروزرسانی' : 'ایجاد دستور کار')}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
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
          padding: 20px;
          margin-top:100px;
        }

        .modal-container {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .modal-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #6b7280;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .close-button:hover {
          color: #374151;
          background: #f3f4f6;
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .error-message {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-icon {
          flex-shrink: 0;
        }

        .user-assignment-notice {
          background: #f0f9ff;
          border: 1px solid #7dd3fc;
          color: #0369a1;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-full-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin: 0 0 0.5rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
        }

        .form-input {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 0.875rem;
          resize: vertical;
          min-height: 80px;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Spare Parts Styles */
        .spare-parts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          max-height: 300px;
          overflow-y: auto;
        }

        .spare-part-checkbox {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .spare-part-checkbox:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }

        .checkbox-input {
          margin-top: 0.25rem;
        }

        .checkbox-label {
          font-size: 0.875rem;
          color: #374151;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .part-stock {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .selected-parts-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .selected-part-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: #dbeafe;
          border: 1px solid #93c5fd;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .part-info {
          display: flex;
          flex-direction: column;
        }

        .part-name {
          font-weight: 500;
          color: #1e40af;
        }

        .part-details {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .remove-part-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .remove-part-btn:hover {
          background: #fef2f2;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .cancel-button {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f9fafb;
          border-color: #9ca3af;
        }

        .cancel-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          background: #3b82f6;
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .modal-backdrop {
            padding: 10px;
          }

          .modal-header {
            padding: 1rem 1.5rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .spare-parts-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .submit-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default WorkOrderFormModal;