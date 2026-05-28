// ProductionPlan.jsx
import React, { useState, useEffect } from 'react';
import './ProductionPlan.css';

const ProductionPlan = () => {
  const [heats, setHeats] = useState([]);
  const [selectedHeat, setSelectedHeat] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    heatNumber: '',
    steelGrade: '',
    steelGradeDescription: '',
    productionStandard: '',
    chargeType: 'bucket',
    buckets: {
      bucket1: 0,
      bucket2: 0,
      bucket3: 0,
      bucket4: 0,
      bucket5: 0,
    },
    continuousCharge: 0,
    tonsToTap: 0,
    liquidHeel: 0,
    notes: '',
  });

  // Steel grades data (in real app, this would come from API/Level 3)
  const steelGrades = [
    { id: 'ST37-2', description: 'Structural Steel', standard: 'EAF-STD-001' },
    { id: 'ST52-3', description: 'High Strength Steel', standard: 'EAF-STD-002' },
    { id: 'C45', description: 'Carbon Steel', standard: 'EAF-STD-003' },
    { id: '16MnCr5', description: 'Alloy Steel', standard: 'EAF-STD-004' },
    { id: '42CrMo4', description: 'Chrome-Moly Steel', standard: 'EAF-STD-005' },
  ];

  // Production standards
  const productionStandards = [
    { id: 'EAF-STD-001', description: 'Standard Scrap Charge' },
    { id: 'EAF-STD-002', description: 'DRI Continuous Charge' },
    { id: 'EAF-STD-003', description: 'Hot Metal + Scrap' },
    { id: 'EAF-STD-004', description: '100% Scrap - High Power' },
    { id: 'EAF-STD-005', description: 'Low Carbon Practice' },
  ];

  // Load initial demo data
  useEffect(() => {
    // In production, this would fetch from your API
    const demoHeats = [
      {
        id: 1,
        heatNumber: '24001',
        steelGrade: 'ST52-3',
        steelGradeDescription: 'High Strength Steel',
        productionStandard: 'EAF-STD-002',
        chargeType: 'continuous',
        buckets: { bucket1: 45, bucket2: 0, bucket3: 0, bucket4: 0, bucket5: 0 },
        continuousCharge: 85,
        tonsToTap: 120,
        liquidHeel: 15,
        status: 'planned',
        notes: 'Priority heat for customer ABC',
      },
      {
        id: 2,
        heatNumber: '24002',
        steelGrade: 'C45',
        steelGradeDescription: 'Carbon Steel',
        productionStandard: 'EAF-STD-001',
        chargeType: 'bucket',
        buckets: { bucket1: 55, bucket2: 50, bucket3: 0, bucket4: 0, bucket5: 0 },
        continuousCharge: 0,
        tonsToTap: 95,
        liquidHeel: 10,
        status: 'planned',
        notes: '',
      },
      {
        id: 3,
        heatNumber: '24003',
        steelGrade: '42CrMo4',
        steelGradeDescription: 'Chrome-Moly Steel',
        productionStandard: 'EAF-STD-005',
        chargeType: 'bucket',
        buckets: { bucket1: 40, bucket2: 35, bucket3: 30, bucket4: 0, bucket5: 0 },
        continuousCharge: 0,
        tonsToTap: 95,
        liquidHeel: 10,
        status: 'planned',
        notes: 'Requires special alloy addition',
      },
      {
        id: 4,
        heatNumber: '24004',
        steelGrade: '16MnCr5',
        steelGradeDescription: 'Alloy Steel',
        productionStandard: 'EAF-STD-004',
        chargeType: 'continuous',
        buckets: { bucket1: 30, bucket2: 25, bucket3: 0, bucket4: 0, bucket5: 0 },
        continuousCharge: 65,
        tonsToTap: 110,
        liquidHeel: 10,
        status: 'planned',
        notes: '',
      },
    ];
    setHeats(demoHeats);
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('bucket')) {
      setFormData({
        ...formData,
        buckets: { ...formData.buckets, [name]: parseFloat(value) || 0 },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle steel grade selection
  const handleSteelGradeChange = (e) => {
    const steelId = e.target.value;
    const selectedSteel = steelGrades.find(s => s.id === steelId);
    setFormData({
      ...formData,
      steelGrade: steelId,
      steelGradeDescription: selectedSteel ? selectedSteel.description : '',
      productionStandard: selectedSteel ? selectedSteel.standard : '',
    });
  };

  // Add new heat
  const handleAddHeat = () => {
    setIsEditing(false);
    setFormData({
      heatNumber: '',
      steelGrade: '',
      steelGradeDescription: '',
      productionStandard: '',
      chargeType: 'bucket',
      buckets: { bucket1: 0, bucket2: 0, bucket3: 0, bucket4: 0, bucket5: 0 },
      continuousCharge: 0,
      tonsToTap: 0,
      liquidHeel: 0,
      notes: '',
    });
    setShowEditModal(true);
  };

  // Edit existing heat
  const handleEditHeat = (heat) => {
    setIsEditing(true);
    setFormData({
      heatNumber: heat.heatNumber,
      steelGrade: heat.steelGrade,
      steelGradeDescription: heat.steelGradeDescription,
      productionStandard: heat.productionStandard,
      chargeType: heat.chargeType,
      buckets: heat.buckets,
      continuousCharge: heat.continuousCharge,
      tonsToTap: heat.tonsToTap,
      liquidHeel: heat.liquidHeel,
      notes: heat.notes || '',
    });
    setSelectedHeat(heat);
    setShowEditModal(true);
  };

  // Save heat
  const handleSaveHeat = () => {
    if (isEditing && selectedHeat) {
      // Update existing heat
      setHeats(heats.map(heat =>
        heat.id === selectedHeat.id
          ? { ...heat, ...formData, id: heat.id }
          : heat
      ));
    } else {
      // Add new heat
      const newHeat = {
        id: Math.max(...heats.map(h => h.id), 0) + 1,
        ...formData,
        status: 'planned',
      };
      setHeats([...heats, newHeat]);
    }
    setShowEditModal(false);
  };

  // Delete heat
  const handleDeleteHeat = (heatId) => {
    if (window.confirm('آیا از حذف این ذوب اطمینان دارید؟')) {
      setHeats(heats.filter(heat => heat.id !== heatId));
    }
  };

  // Select heat as current (send to production)
  const handleSelectCurrentHeat = (heat) => {
    if (window.confirm(`ذوب ${heat.heatNumber} به عنوان ذوب جاری انتخاب شود؟`)) {
      // In production, this would update the current heat in your state/store
      alert(`ذوب ${heat.heatNumber} به عنوان ذوب جاری انتخاب شد`);
    }
  };

  // Calculate total scrap weight
  const getTotalScrapWeight = (buckets) => {
    return Object.values(buckets).reduce((sum, val) => sum + (val || 0), 0);
  };

  return (
    <div className="production-plan-container">
      {/* Header */}
      <div className="production-plan-header">
        <h2>
          <i className="fas fa-industry ml-2"></i>
          برنامه تولید - کوره قوس الکتریکی
        </h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={handleAddHeat}>
            <i className="fas fa-plus ml-1"></i>
            افزودن ذوب جدید
          </button>
          <button className="btn-secondary" onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt ml-1"></i>
            بروزرسانی
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <i className="fas fa-info-circle ml-2"></i>
        <span>
          در حالت عادی، برنامه تولید به صورت خودکار از سیستم سطح ۳ دریافت می‌شود.
          این صفحه برای شرایط اضطراری و ورود دستی برنامه تولید طراحی شده است.
        </span>
      </div>

      {/* Heats Table */}
      <div className="heats-table-container">
        <table className="heats-table">
          <thead>
            <tr>
              <th>ردیف</th>
              <th>شماره ذوب</th>
              <th>گرید فولاد</th>
              <th>توضیحات</th>
              <th>استاندارد تولید</th>
              <th>نوع شارژ</th>
              <th>وزن قراضه (تن)</th>
              <th>شارژ پیوسته (تن)</th>
              <th>تاپینگ (تن)</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {heats.map((heat, index) => (
              <tr key={heat.id} className={index === 0 ? 'next-heat' : ''}>
                <td>{index + 1}</td>
                <td className="heat-number">{heat.heatNumber}</td>
                <td>
                  <strong>{heat.steelGrade}</strong>
                  <br />
                  <small>{heat.steelGradeDescription}</small>
                </td>
                <td>{heat.productionStandard}</td>
                <td>
                  <span className="charge-type-badge">
                    {heat.chargeType === 'bucket' ? '🪣 سطلی' : '⚡ پیوسته'}
                  </span>
                </td>
                <td>{getTotalScrapWeight(heat.buckets)}</td>
                <td>{heat.continuousCharge}</td>
                <td>{heat.tonsToTap}</td>
                <td>
                  <span className="status-badge status-planned">
                    برنامه‌ریزی شده
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="action-btn select-btn"
                    onClick={() => handleSelectCurrentHeat(heat)}
                    title="انتخاب به عنوان ذوب جاری"
                  >
                    <i className="fas fa-play"></i>
                  </button>
                  <button
                    className="action-btn edit-btn"
                    onClick={() => handleEditHeat(heat)}
                    title="ویرایش"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteHeat(heat.id)}
                    title="حذف"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Next Heat Indicator */}
      {heats.length > 0 && (
        <div className="next-heat-indicator">
          <i className="fas fa-arrow-right ml-2"></i>
          <span>
            ذوب بعدی: <strong>{heats[0].heatNumber}</strong> -
            {heats[0].steelGrade} ({heats[0].steelGradeDescription})
          </span>
          <button
            className="btn-start-heat"
            onClick={() => handleSelectCurrentHeat(heats[0])}
          >
            شروع ذوب
          </button>
        </div>
      )}

      {/* Edit/Add Modal */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isEditing ? 'ویرایش ذوب' : 'افزودن ذوب جدید'}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Heat Number */}
              <div className="form-group">
                <label>شماره ذوب *</label>
                <input
                  type="text"
                  name="heatNumber"
                  value={formData.heatNumber}
                  onChange={handleInputChange}
                  placeholder="مثال: 24005"
                  dir="ltr"
                />
              </div>

              {/* Steel Grade */}
              <div className="form-group">
                <label>گرید فولاد *</label>
                <select
                  name="steelGrade"
                  value={formData.steelGrade}
                  onChange={handleSteelGradeChange}
                >
                  <option value="">انتخاب گرید فولاد...</option>
                  {steelGrades.map(steel => (
                    <option key={steel.id} value={steel.id}>
                      {steel.id} - {steel.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Production Standard */}
              <div className="form-group">
                <label>استاندارد تولید</label>
                <select
                  name="productionStandard"
                  value={formData.productionStandard}
                  onChange={handleInputChange}
                >
                  <option value="">انتخاب استاندارد تولید...</option>
                  {productionStandards.map(standard => (
                    <option key={standard.id} value={standard.id}>
                      {standard.id} - {standard.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Charge Type */}
              <div className="form-group">
                <label>نوع شارژ</label>
                <select
                  name="chargeType"
                  value={formData.chargeType}
                  onChange={handleInputChange}
                >
                  <option value="bucket">شارژ سطلی (Scrap Bucket)</option>
                  <option value="continuous">شارژ پیوسته (DRI/Consteel)</option>
                  <option value="hybrid">ترکیبی (Bucket + Continuous)</option>
                </select>
              </div>

              {/* Buckets Section */}
              <div className="buckets-section">
                <label>سطل‌های قراضه (تن)</label>
                <div className="buckets-grid">
                  {['bucket1', 'bucket2', 'bucket3', 'bucket4', 'bucket5'].map((bucket, idx) => (
                    <div key={bucket} className="bucket-input">
                      <label>سطل {idx + 1}</label>
                      <input
                        type="number"
                        name={bucket}
                        value={formData.buckets[bucket]}
                        onChange={handleInputChange}
                        step="0.5"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Continuous Charge */}
              {(formData.chargeType === 'continuous' || formData.chargeType === 'hybrid') && (
                <div className="form-group">
                  <label>شارژ پیوسته (DRI/Scrap Mix) - تن</label>
                  <input
                    type="number"
                    name="continuousCharge"
                    value={formData.continuousCharge}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                  />
                </div>
              )}

              {/* Tons to Tap & Liquid Heel */}
              <div className="form-row">
                <div className="form-group half">
                  <label>مقدار تاپینگ (تن) *</label>
                  <input
                    type="number"
                    name="tonsToTap"
                    value={formData.tonsToTap}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                  />
                </div>
                <div className="form-group half">
                  <label>مقدار مذاب باقیمانده (تن)</label>
                  <input
                    type="number"
                    name="liquidHeel"
                    value={formData.liquidHeel}
                    onChange={handleInputChange}
                    step="0.5"
                    min="0"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="form-group">
                <label>یادداشت‌ها</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="توضیحات، توصیه‌ها یا نکات خاص..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowEditModal(false)}
              >
                انصراف
              </button>
              <button
                className="btn-save"
                onClick={handleSaveHeat}
                disabled={!formData.heatNumber || !formData.steelGrade || !formData.tonsToTap}
              >
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPlan;