// src/components/cmms/WorkOrderForm.jsx
import React, { useState, useEffect } from "react";
import { createWorkOrder, updateWorkOrder } from "../../services/cmmsService";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function WorkOrderForm({ workOrder, assets, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    title: "",
    asset: "",
    status: "Open",
    priority: "Medium",
    start_date: null,
    completion_date: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (workOrder) {
      setFormData({
        id: workOrder.id,
        title: workOrder.title,
        asset: workOrder.asset?.id?.toString() || "",
        status: workOrder.status,
        priority: workOrder.priority,
        start_date: workOrder.start_date ? new Date(workOrder.start_date) : null,
        completion_date: workOrder.completion_date ? new Date(workOrder.completion_date) : null,
      });
    } else {
      setFormData({
        title: "",
        asset: "",
        status: "Open",
        priority: "Medium",
        start_date: null,
        completion_date: null,
      });
    }
  }, [workOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date ? date : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.asset || !formData.title) {
      alert("عنوان و تجهیز الزامی است.");
      return;
    }

    const payload = {
      title: formData.title.trim(),
      asset: formData.asset,
      status: formData.status,
      priority: formData.priority,
      start_date: formData.start_date ? formData.start_date.format("YYYY-MM-DD") : null,
      completion_date: formData.completion_date ? formData.completion_date.format("YYYY-MM-DD") : null,
    };

    setSubmitting(true);
    try {
      if (formData.id) {
        await updateWorkOrder(formData.id, payload);
      } else {
        await createWorkOrder(payload);
      }
      onSave();
    } catch (err) {
      console.error("Submit error:", err);
      alert("خطا در ذخیره دستور کار: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: "",
      asset: "",
      status: "Open",
      priority: "Medium",
      start_date: null,
      completion_date: null,
    });
    if (onCancel) onCancel();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {workOrder ? "ویرایش دستور کار" : "ایجاد دستور کار جدید"}
        </h2>
        {workOrder && (
          <button
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            عنوان دستور کار
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="عنوان دستور کار را وارد کنید"
            required
          />
        </div>

        {/* Asset */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تجهیز
          </label>
          <select
            name="asset"
            value={formData.asset}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="">انتخاب تجهیز</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وضعیت
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Open">باز</option>
              <option value="In Progress">در حال انجام</option>
              <option value="Closed">بسته شده</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              اولویت
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="Low">کم</option>
              <option value="Medium">متوسط</option>
              <option value="High">بالا</option>
            </select>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ شروع
            </label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.start_date}
              onChange={(date) => handleDateChange('start_date', date)}
              format="YYYY/MM/DD"
              containerClassName="w-full"
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="انتخاب تاریخ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ اتمام
            </label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.completion_date}
              onChange={(date) => handleDateChange('completion_date', date)}
              format="YYYY/MM/DD"
              containerClassName="w-full"
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="انتخاب تاریخ"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2.5 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
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
              workOrder ? "بروزرسانی دستور کار" : "ایجاد دستور کار"
            )}
          </button>

          {workOrder && (
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              انصراف
            </button>
          )}
        </div>
      </form>
    </div>
  );
}