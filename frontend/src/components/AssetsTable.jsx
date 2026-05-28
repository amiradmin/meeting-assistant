// components/AssetsTable.jsx
import React from "react";
import { Button, Spinner, Dropdown } from "react-bootstrap";
import {
  FaEdit,
  FaTrashAlt,
  FaChartLine,
  FaImages,
  FaFileAlt,
  FaEllipsisV,
  FaIndustry
} from "react-icons/fa";

const AssetsTable = ({
  assets,
  loading,
  search,
  filtered,
  onEdit,
  onDelete,
  onViewSensor,
  onViewPhotos,
  onViewDocuments
}) => {
  if (loading) {
    return (
      <div className="modern-loading-state">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">در حال بارگذاری...</h3>
          <p className="loading-subtitle">در حال دریافت اطلاعات دارایی‌ها</p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>

        <style jsx>{`
          .modern-loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
          }
          
          .loading-container {
            text-align: center;
            max-width: 400px;
            width: 100%;
          }
          
          .loading-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            margin: 0 auto 2rem;
          }
          
          .spinner-ring {
            position: absolute;
            width: 100%;
            height: 100%;
            border: 3px solid transparent;
            border-top: 3px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
          }
          
          .spinner-ring:nth-child(2) {
            width: 60px;
            height: 60px;
            top: 10px;
            left: 10px;
            border-top-color: #10b981;
            animation-duration: 1.2s;
            animation-direction: reverse;
          }
          
          .spinner-ring:nth-child(3) {
            width: 40px;
            height: 40px;
            top: 20px;
            left: 20px;
            border-top-color: #f59e0b;
            animation-duration: 0.9s;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .loading-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
          }
          
          .loading-subtitle {
            color: #6b7280;
            font-size: 1rem;
            margin-bottom: 2rem;
          }
          
          .loading-progress {
            width: 100%;
            height: 4px;
            background: #e5e7eb;
            border-radius: 2px;
            overflow: hidden;
          }
          
          .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #10b981, #f59e0b);
            border-radius: 2px;
            animation: progress 2s ease-in-out infinite;
          }
          
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="modern-assets-table">
      <div className="table-header">
        <div className="table-title">
          <i className="fas fa-table"></i>
          <h5>جدول دارایی‌ها</h5>
        </div>
        <div className="table-subtitle">لیست کامل دارایی‌های ثبت شده در سیستم</div>
      </div>
      
      <div className="table-container">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaIndustry size={48} />
            </div>
            <h4 className="empty-title">
              {search ? "دارایی‌ای یافت نشد" : "هیچ دارایی‌ای ثبت نشده است"}
            </h4>
            <p className="empty-subtitle">
              {search 
                ? "لطفاً عبارت جستجو را تغییر دهید یا فیلترها را تنظیم کنید"
                : "برای شروع، اولین دارایی خود را اضافه کنید"
              }
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th className="table-header-cell">
                    <i className="fas fa-hashtag me-2"></i>
                    #
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-industry me-2"></i>
                    نام دارایی
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-building me-2"></i>
                    بخش
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-industry me-2"></i>
                    واحد
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-factory me-2"></i>
                    کارخانه
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-tags me-2"></i>
                    نوع دارایی
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-cog me-2"></i>
                    مدل
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-barcode me-2"></i>
                    سریال
                  </th>
                  <th className="table-header-cell">
                    <i className="fas fa-info-circle me-2"></i>
                    توضیحات
                  </th>
                  <th className="table-header-cell text-center">
                    <i className="fas fa-cogs me-2"></i>
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((asset, index) => (
                  <tr key={asset.id} className="table-row">
                    <td className="index-cell">{index + 1}</td>
                    <td className="asset-name-cell">
                      <div className="asset-info">
                        <i className="fas fa-industry"></i>
                        <span className="fw-bold">{asset.name}</span>
                      </div>
                    </td>
                    <td className="section-cell">
                      <span className="cell-content">{asset.section?.name || "-"}</span>
                    </td>
                    <td className="plant-cell">
                      <span className="cell-content">{asset.section?.plant?.name || "-"}</span>
                    </td>
                    <td className="factory-cell">
                      <span className="cell-content">{asset.section?.plant?.factory?.name || "-"}</span>
                    </td>
                    <td className="type-cell">
                      <span className="asset-type-badge">{asset.asset_type || "-"}</span>
                    </td>
                    <td className="model-cell">
                      <span className="cell-content">{asset.model || "-"}</span>
                    </td>
                    <td className="serial-cell">
                      <span className="serial-badge">{asset.serial_number ? asset.serial_number.substring(0, 7) : "-"}</span>
                    </td>
                    <td className="description-cell">
                      <span className="cell-content" title={asset.description}>
                        {asset.description ? 
                          (asset.description.length > 30 ? 
                            asset.description.substring(0, 30) + "..." : 
                            asset.description
                          ) : "-"
                        }
                      </span>
                    </td>
                    <td className="actions-cell">
                      <Dropdown>
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          id={`dropdown-${asset.id}`}
                          className="modern-dropdown-toggle"
                        >
                          <FaEllipsisV />
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="modern-dropdown-menu">
                          <Dropdown.Item
                            onClick={() => onEdit(asset)}
                            className="dropdown-item-modern edit-item"
                          >
                            <FaEdit />
                            <span>ویرایش</span>
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => onDelete(asset)}
                            className="dropdown-item-modern delete-item"
                          >
                            <FaTrashAlt />
                            <span>حذف</span>
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => onViewSensor(asset)}
                            className="dropdown-item-modern"
                          >
                            <FaChartLine />
                            <span>نمودار سنسور</span>
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => onViewPhotos(asset)}
                            disabled={!asset.photos || asset.photos.length === 0}
                            className="dropdown-item-modern"
                          >
                            <FaImages />
                            <span>({asset.photos?.length || 0}) تصاویر</span>
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => onViewDocuments(asset)}
                            disabled={!asset.documents || asset.documents.length === 0}
                            className="dropdown-item-modern"
                          >
                            <FaFileAlt />
                            <span>({asset.documents?.length || 0}) اسناد</span>
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .modern-assets-table {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        
        .table-header {
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .table-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        
        .table-title i {
          font-size: 1.5rem;
          color: #3b82f6;
        }
        
        .table-title h5 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }
        
        .table-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }
        
        .table-container {
          flex: 1;
          overflow: hidden;
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          padding: 3rem 2rem;
          text-align: center;
        }
        
        .empty-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: #9ca3af;
        }
        
        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }
        
        .empty-subtitle {
          font-size: 1rem;
          color: #6b7280;
          max-width: 400px;
          line-height: 1.6;
        }
        
        .table-responsive {
          height: 100%;
          overflow: auto;
        }
        
        .modern-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 0;
        }
        
        .modern-table thead th {
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          border: none;
          padding: 1rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-align: right;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .modern-table tbody tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #f3f4f6;
        }
        
        .modern-table tbody tr:hover {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        .modern-table tbody td {
          padding: 1rem;
          border: none;
          vertical-align: middle;
          text-align: right;
        }
        
        .index-cell {
          text-align: center;
          font-weight: 600;
          color: #6b7280;
        }
        
        .asset-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .asset-info i {
          color: #3b82f6;
          font-size: 0.875rem;
        }
        
        .cell-content {
          color: #1f2937;
          font-weight: 500;
        }
        
        .asset-type-badge {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .serial-badge {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #92400e;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .actions-cell {
          text-align: center;
        }
        
        .modern-dropdown-toggle {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.5rem;
          color: #6b7280;
          transition: all 0.2s ease;
        }
        
        .modern-dropdown-toggle:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #374151;
        }
        
        .modern-dropdown-menu {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 0.5rem;
          min-width: 200px;
        }
        
        .dropdown-item-modern {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
        }
        
        .dropdown-item-modern:hover {
          background: #f8fafc;
          color: #1f2937;
        }
        
        .dropdown-item-modern.edit-item:hover {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          color: #1e40af;
        }
        
        .dropdown-item-modern.delete-item:hover {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
        }
        
        .dropdown-item-modern:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        @media (max-width: 768px) {
          .table-header {
            padding: 1.5rem 1rem 1rem 1rem;
          }
          
          .modern-table thead th,
          .modern-table tbody td {
            padding: 0.75rem 0.5rem;
            font-size: 0.8rem;
          }
          
          .asset-info {
            flex-direction: column;
            gap: 0.25rem;
            align-items: flex-start;
          }
          
          .empty-state {
            padding: 2rem 1rem;
          }
          
          .empty-icon {
            width: 60px;
            height: 60px;
          }
          
          .empty-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AssetsTable;
