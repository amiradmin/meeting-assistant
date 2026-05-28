// src/components/cmms/PMScheduleFormModal.jsx
import React, { useState, useEffect, useMemo } from "react";
import { createPMSchedule, updatePMSchedule } from "../../services/cmmsService";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function PMScheduleFormModal({
  show,
  onHide,
  schedule,
  assets,
  users,
  workOrders,
  onSave
}) {
  const [formData, setFormData] = useState({
    name: "",
    asset: "",
    frequency_days: 30,
    last_performed_date: null,
    next_due_date: null,
    is_active: true,
    template_work_order: "",
    standard_tasks: "",
    estimated_hours: 0,
    auto_assign_to: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Filter work orders for the selected asset - stable calculation
  const filteredWorkOrders = useMemo(() => {
    if (!formData.asset) {
      return workOrders || []; // Show all work orders when no asset is selected
    }

    const assetId = parseInt(formData.asset);
    return (workOrders || []).filter(wo => {
      // Check both nested asset object and direct asset ID
      return wo.asset?.id === assetId || wo.asset_id === assetId;
    });
  }, [formData.asset, workOrders]);

  useEffect(() => {
    if (schedule) {
      setFormData({
        id: schedule.id,
        name: schedule.name || "",
        asset: schedule.asset?.id?.toString() || schedule.asset?.toString() || "",
        frequency_days: schedule.frequency_days || 30,
        last_performed_date: schedule.last_performed_date ? new Date(schedule.last_performed_date) : null,
        next_due_date: schedule.next_due_date ? new Date(schedule.next_due_date) : null,
        is_active: schedule.is_active !== undefined ? schedule.is_active : true,
        template_work_order: schedule.template_work_order?.id?.toString() || schedule.template_work_order?.toString() || "",
        standard_tasks: schedule.standard_tasks || "",
        estimated_hours: schedule.estimated_hours || 0,
        auto_assign_to: schedule.auto_assign_to?.id?.toString() || schedule.auto_assign_to?.toString() || ""
      });
    } else {
      setFormData({
        name: "",
        asset: "",
        frequency_days: 30,
        last_performed_date: null,
        next_due_date: null,
        is_active: true,
        template_work_order: "",
        standard_tasks: "",
        estimated_hours: 0,
        auto_assign_to: ""
      });
    }
    setFormErrors({});
  }, [schedule]);

  // Reset template work order when asset changes
  useEffect(() => {
    if (formData.asset && formData.template_work_order) {
      const currentTemplate = (workOrders || []).find(wo =>
        wo.id === parseInt(formData.template_work_order)
      );

      const selectedAsset = parseInt(formData.asset);

      // If the template work order doesn't belong to the selected asset, clear it
      if (currentTemplate && currentTemplate.asset?.id !== selectedAsset) {
        setFormData(prev => ({
          ...prev,
          template_work_order: ""
        }));
      }
    }
  }, [formData.asset, workOrders]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      // If asset is changing and we have a template work order selected,
      // check if we need to clear it
      if (name === 'asset' && prev.template_work_order) {
        const selectedAsset = parseInt(value);
        const currentTemplate = (workOrders || []).find(wo =>
          wo.id === parseInt(prev.template_work_order)
        );

        // Clear template if it doesn't belong to the new asset
        if (currentTemplate && currentTemplate.asset?.id !== selectedAsset) {
          newFormData.template_work_order = "";
        }
      }

      return newFormData;
    });

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date ? date : null
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'نام برنامه الزامی است';
    }

    if (!formData.asset || formData.asset === "") {
      errors.asset = 'انتخاب تجهیز الزامی است';
    }

    if (!formData.frequency_days || formData.frequency_days < 1) {
      errors.frequency_days = 'تناوب باید بیشتر از صفر باشد';
    }

    if (formData.estimated_hours < 0) {
      errors.estimated_hours = 'ساعات تخمینی نمی‌تواند منفی باشد';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Ensure asset is properly formatted as integer
    const assetId = parseInt(formData.asset);
    const templateWorkOrderId = formData.template_work_order ? parseInt(formData.template_work_order) : null;
    const autoAssignToId = formData.auto_assign_to ? parseInt(formData.auto_assign_to) : null;

    if (isNaN(assetId)) {
      alert("خطا: شناسه تجهیز نامعتبر است. لطفاً یک تجهیز انتخاب کنید.");
      return;
    }

    // Check if the asset ID exists in available assets
    const assetExists = (assets || []).some(asset => asset.id === assetId);
    if (!assetExists) {
      alert("خطا: تجهیز انتخاب شده معتبر نیست. لطفاً تجهیز دیگری انتخاب کنید.");
      return;
    }

    const payload = {
      name: formData.name.trim(),
      asset: assetId,
      frequency_days: parseInt(formData.frequency_days),
      last_performed_date: formData.last_performed_date ? formData.last_performed_date.format("YYYY-MM-DD") : null,
      next_due_date: formData.next_due_date ? formData.next_due_date.format("YYYY-MM-DD") : null,
      is_active: formData.is_active,
      template_work_order: templateWorkOrderId,
      standard_tasks: formData.standard_tasks.trim(),
      estimated_hours: parseFloat(formData.estimated_hours) || 0,
      auto_assign_to: autoAssignToId
    };

    // Remove null values for template_work_order and auto_assign_to
    if (!payload.template_work_order) delete payload.template_work_order;
    if (!payload.auto_assign_to) delete payload.auto_assign_to;

    console.log("Final payload to be sent:", payload);

    setSubmitting(true);
    try {
      if (formData.id) {
        console.log("Updating PM schedule with ID:", formData.id);
        await updatePMSchedule(formData.id, payload);
      } else {
        console.log("Creating new PM schedule");
        await createPMSchedule(payload);
      }
      onSave();
    } catch (err) {
      console.error("Submit error:", err);
      alert("خطا در ذخیره برنامه: " + (err.message || "خطای ناشناخته"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      asset: "",
      frequency_days: 30,
      last_performed_date: null,
      next_due_date: null,
      is_active: true,
      template_work_order: "",
      standard_tasks: "",
      estimated_hours: 0,
      auto_assign_to: ""
    });
    setFormErrors({});
    if (onHide) onHide();
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {schedule ? "ویرایش برنامه PM" : "ایجاد برنامه PM جدید"}
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
          {/* Basic Information Section */}
          <div className="form-section">
            <h3 className="form-section-title">اطلاعات پایه</h3>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">
                نام برنامه *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${formErrors.name ? 'error' : ''}`}
                placeholder="نام برنامه نگهداری پیشگیرانه"
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>

            {/* Asset */}
            <div className="form-group">
              <label className="form-label">
                تجهیز *
              </label>
              <select
                name="asset"
                value={formData.asset}
                onChange={handleChange}
                className={`form-input ${formErrors.asset ? 'error' : ''}`}
                required
              >
                <option value="">-- انتخاب تجهیز --</option>
                {(assets || []).map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} (ID: {asset.id})
                  </option>
                ))}
              </select>
              {formErrors.asset && <div className="form-error">{formErrors.asset}</div>}
              {(assets || []).length === 0 && (
                <div className="form-warning">
                  ⚠️ هیچ تجهیزی یافت نشد. لطفاً ابتدا تجهیزات را اضافه کنید.
                </div>
              )}
            </div>

            {/* Frequency */}
            <div className="form-group">
              <label className="form-label">
                تناوب (روز) *
              </label>
              <input
                type="number"
                name="frequency_days"
                value={formData.frequency_days}
                onChange={handleChange}
                className={`form-input ${formErrors.frequency_days ? 'error' : ''}`}
                min="1"
                placeholder="هر چند روز یکبار"
                required
              />
              {formErrors.frequency_days && <div className="form-error">{formErrors.frequency_days}</div>}
              <div className="form-help">
                تعداد روزهای بین هر اجرای برنامه
              </div>
            </div>
          </div>

          {/* Template & Tasks Section */}
          <div className="form-section">
            <h3 className="form-section-title">قالب و وظایف</h3>

            {/* Template Work Order */}
            <div className="form-group">
              <label className="form-label">
                قالب دستور کار
              </label>
              <select
  name="template_work_order"
  value={formData.template_work_order}
  onChange={handleChange}
  className="form-input"
>
  <option value="">-- انتخاب قالب دستور کار --</option>
  {(workOrders || []).map((workOrder) => (
    <option key={workOrder.id} value={workOrder.id}>
      {workOrder.title} (ID: {workOrder.id})
      {workOrder.asset && ` - Asset: ${workOrder.asset.id || workOrder.asset}`}
    </option>
  ))}
</select>
              <div className="form-help">
                {formData.asset
                  ? `تعداد دستور کارهای موجود: ${filteredWorkOrders.length}`
                  : "پس از انتخاب تجهیز، دستور کارهای مرتبط نمایش داده می‌شوند"
                }
              </div>
            </div>

            {/* Standard Tasks */}
            <div className="form-group">
              <label className="form-label">
                وظایف استاندارد
              </label>
              <textarea
                name="standard_tasks"
                value={formData.standard_tasks}
                onChange={handleChange}
                className="form-input"
                rows="4"
                placeholder="وظایف استاندارد این برنامه PM (هر وظیفه در یک خط)"
              />
              <div className="form-help">
                هر وظیفه را در یک خط جداگانه وارد کنید. در صورت وجود قالب دستور کار، این فیلد نادیده گرفته می‌شود.
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="form-group">
              <label className="form-label">
                ساعات تخمینی اجرا
              </label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                className={`form-input ${formErrors.estimated_hours ? 'error' : ''}`}
                min="0"
                step="0.5"
                placeholder="0"
              />
              {formErrors.estimated_hours && <div className="form-error">{formErrors.estimated_hours}</div>}
              <div className="form-help">
                مدت زمان تخمینی برای اجرای کامل برنامه (ساعت)
              </div>
            </div>
          </div>

          {/* Assignment Section */}
          <div className="form-section">
            <h3 className="form-section-title">تخصیص</h3>

            {/* Auto Assign To */}
            <div className="form-group">
              <label className="form-label">
                تخصیص خودکار به
              </label>
              <select
                name="auto_assign_to"
                value={formData.auto_assign_to}
                onChange={handleChange}
                className="form-input"
              >
                <option value="">-- انتخاب کاربر --</option>
                {(users || []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name
                      ? `${user.full_name} `
                      : user.full_name}
                  </option>
                ))}
              </select>
              <div className="form-help">
                کاربری که به صورت خودکار به دستور کارهای ایجاد شده تخصیص داده می‌شود
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="form-section">
            <h3 className="form-section-title">زمان‌بندی</h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  تاریخ آخرین اجرا
                </label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={formData.last_performed_date}
                  onChange={(date) => handleDateChange('last_performed_date', date)}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="انتخاب تاریخ"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  تاریخ سررسید بعدی
                </label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={formData.next_due_date}
                  onChange={(date) => handleDateChange('next_due_date', date)}
                  format="YYYY/MM/DD"
                  containerClassName="w-full"
                  inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  placeholder="انتخاب تاریخ"
                />
              </div>
            </div>

            {/* Status */}
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
              disabled={submitting || (assets || []).length === 0}
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
                schedule ? "بروزرسانی برنامه" : "ایجاد برنامه"
              )}
            </button>

            {schedule && (
              <button
                type="button"
                onClick={handleReset}
                className="cancel-btn"
              >
                انصراف
              </button>
            )}
          </div>

          {(assets || []).length === 0 && (
            <div className="form-warning-banner">
              ⚠️ برای ایجاد برنامه PM، ابتدا باید تجهیزات را اضافه کنید.
            </div>
          )}
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
          max-width: 600px;
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

        .form-section {
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .form-section:last-of-type {
          border-bottom: none;
        }

        .form-section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #f59e0b;
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
          font-family: inherit;
        }

        .form-input:focus {
          outline: none;
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-input:disabled {
          background-color: #f9fafb;
          cursor: not-allowed;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        textarea.form-input {
          resize: vertical;
          min-height: 100px;
        }

        .form-error {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }

        .form-warning {
          color: #f59e0b;
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .form-help {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
          line-height: 1.4;
        }

        .form-warning-banner {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          padding: 1rem;
          margin-top: 1rem;
          color: #d97706;
          font-size: 0.875rem;
          text-align: center;
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
          background-color: #f59e0b;
          border-color: #f59e0b;
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
          background: linear-gradient(135deg, #f59e0b, #d97706);
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
          background: linear-gradient(135deg, #d97706, #b45309);
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
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