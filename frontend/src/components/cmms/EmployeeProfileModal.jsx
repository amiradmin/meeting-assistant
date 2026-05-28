// src/components/cmms/EmployeeProfileModal.jsx
import React from "react";
import {
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaBuilding,
  FaUserTag,
  FaUserCheck,
  FaUserTimes,
  FaIdCard,
  FaMapMarkerAlt
} from "react-icons/fa";

export default function EmployeeProfileModal({ show, onHide, employee }) {
  if (!show || !employee) return null;

  const getRoleConfig = (role) => {
    const config = {
      'Worker': {
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
        text: 'کارگر',
        icon: '👷'
      },
      'Engineer': {
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.1)',
        text: 'مهندس',
        icon: '🔧'
      },
      'Expert': {
        color: '#059669',
        bg: 'rgba(5, 150, 105, 0.1)',
        text: 'کارشناس',
        icon: '📊'
      },
      'Manager': {
        color: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.1)',
        text: 'مدیر',
        icon: '👔'
      },
      'Other': {
        color: '#6b7280',
        bg: 'rgba(107, 114, 128, 0.1)',
        text: 'سایر',
        icon: '👤'
      }
    };
    return config[role] || config['Other'];
  };

  const getStatusConfig = (isActive) => {
    return isActive ? {
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      text: 'فعال',
      icon: <FaUserCheck />
    } : {
      color: '#6b7280',
      bg: 'rgba(107, 114, 128, 0.1)',
      text: 'غیرفعال',
      icon: <FaUserTimes />
    };
  };

  const getMediaUrl = (mediaPath) => {
    if (!mediaPath) return null;
    if (mediaPath.includes(':8000')) return mediaPath;
    if (mediaPath.includes('localhost')) {
      return mediaPath.replace('http://localhost', 'http://192.168.150.10:8000');
    }
    return mediaPath;
  };

  const role = getRoleConfig(employee.role);
  const status = getStatusConfig(employee.is_active);

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-header-content">
            <div className="profile-avatar-section">
              {employee.profile_picture ? (
                <div className="profile-avatar-large">
                  <img
                    src={getMediaUrl(employee.profile_picture)}
                    alt={employee.full_name}
                    className="profile-image-large"
                  />
                </div>
              ) : (
                <div className="profile-avatar-placeholder">
                  <span className="avatar-initials">
                    {employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <div className="profile-basic-info">
              <h2 className="employee-name">{employee.full_name}</h2>
              <div className="profile-badges">
                <div
                  className="role-badge-large"
                  style={{
                    backgroundColor: role.bg,
                    color: role.color,
                    borderColor: role.color
                  }}
                >
                  <span className="role-icon">{role.icon}</span>
                  <span>{role.text}</span>
                </div>
                <div
                  className="status-badge-large"
                  style={{
                    backgroundColor: status.bg,
                    color: status.color,
                    borderColor: status.color
                  }}
                >
                  <span className="status-icon">{status.icon}</span>
                  <span>{status.text}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onHide}
            className="profile-modal-close-btn"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="profile-modal-body">
          <div className="profile-sections">
            {/* Contact Information */}
            <div className="profile-section">
              <h3 className="section-title">
                <FaIdCard className="section-icon" />
                اطلاعات تماس
              </h3>
              <div className="section-content">
                <div className="info-grid">
                  {employee.mobile && (
                    <div className="info-item">
                      <div className="info-label">
                        <FaPhone className="info-icon" />
                        موبایل
                      </div>
                      <div className="info-value">{employee.mobile}</div>
                    </div>
                  )}

                  {employee.email && (
                    <div className="info-item">
                      <div className="info-label">
                        <FaEnvelope className="info-icon" />
                        ایمیل
                      </div>
                      <div className="info-value">
                        <a href={`mailto:${employee.email}`} className="email-link">
                          {employee.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {employee.ext && (
                    <div className="info-item">
                      <div className="info-label">
                        <FaPhone className="info-icon" />
                        شماره داخلی
                      </div>
                      <div className="info-value">{employee.ext}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="profile-section">
              <h3 className="section-title">
                <FaBuilding className="section-icon" />
                اطلاعات سازمانی
              </h3>
              <div className="section-content">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">
                      <FaUserTag className="info-icon" />
                      نقش
                    </div>
                    <div className="info-value">
                      <span
                        className="role-text"
                        style={{ color: role.color }}
                      >
                        {role.text}
                      </span>
                    </div>
                  </div>

                  {employee.department && (
                    <div className="info-item">
                      <div className="info-label">
                        <FaBuilding className="info-icon" />
                        دپارتمان
                      </div>
                      <div className="info-value">{employee.department}</div>
                    </div>
                  )}

                  <div className="info-item">
                    <div className="info-label">
                      <FaUserCheck className="info-icon" />
                      وضعیت
                    </div>
                    <div className="info-value">
                      <span
                        className="status-text"
                        style={{ color: status.color }}
                      >
                        {status.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="profile-section">
              <h3 className="section-title">
                <FaMapMarkerAlt className="section-icon" />
                اطلاعات اضافی
              </h3>
              <div className="section-content">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">کد پرسنلی</div>
                    <div className="info-value">{employee.id}</div>
                  </div>

                  {employee.user && (
                    <div className="info-item">
                      <div className="info-label">کاربر سیستم</div>
                      <div className="info-value">
                        {employee.user.username}
                      </div>
                    </div>
                  )}

                  <div className="info-item">
                    <div className="info-label">تاریخ ایجاد</div>
                    <div className="info-value">
                      {employee.created_at ? new Date(employee.created_at).toLocaleDateString('fa-IR') : '---'}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-label">آخرین بروزرسانی</div>
                    <div className="info-value">
                      {employee.updated_at ? new Date(employee.updated_at).toLocaleDateString('fa-IR') : '---'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="profile-modal-footer">
          <button
            onClick={onHide}
            className="close-profile-btn"
          >
            بستن
          </button>
        </div>
      </div>

      <style jsx>{`
        .profile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }

        .profile-modal-content {
          background: white;
          border-radius: 24px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          width: 100%;

          max-height: 75vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .profile-modal-header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 2rem;
          position: relative;
        }

        .profile-header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .profile-avatar-section {
          flex-shrink: 0;
        }

        .profile-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid rgba(255, 255, 255, 0.3);
          background: white;
        }

        .profile-image-large {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-avatar-placeholder {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 4px solid rgba(255, 255, 255, 0.3);
          font-weight: bold;
        }

        .avatar-initials {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .profile-basic-info {
          flex: 1;
        }

        .employee-name {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 1rem 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .profile-badges {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .role-badge-large, .status-badge-large {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 25px;
          border: 2px solid;
          font-size: 0.9rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .role-icon, .status-icon {
          font-size: 1rem;
        }

        .profile-modal-close-btn {
          position: absolute;
          top: 1.5rem;
          left: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .profile-modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .profile-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          background: #f8fafc;
        }

        .profile-sections {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 1.5rem 0;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #f3f4f6;
        }

        .section-icon {
          color: #3b82f6;
          font-size: 1rem;
        }

        .section-content {
          margin-top: 1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
        }

        .info-icon {
          color: #9ca3af;
          font-size: 0.75rem;
        }

        .info-value {
          font-size: 1rem;
          color: #1f2937;
          font-weight: 500;
        }

        .email-link {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .email-link:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .role-text, .status-text {
          font-weight: 600;
        }

        .profile-modal-footer {
          padding: 1.5rem 2rem;
          background: white;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
        }

        .close-profile-btn {
          background: #6b7280;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .close-profile-btn:hover {
          background: #4b5563;
          transform: translateY(-2px);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-modal-content {
            margin: 0.5rem;
            border-radius: 16px;
          }

          .profile-modal-header {
            padding: 1.5rem;
          }

          .profile-header-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .profile-badges {
            justify-content: center;
          }

          .profile-modal-body {
            padding: 1.5rem;
          }

          .profile-section {
            padding: 1.25rem;
          }

          .info-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .employee-name {
            font-size: 1.5rem;
          }

          .profile-avatar-large,
          .profile-avatar-placeholder {
            width: 80px;
            height: 80px;
          }
        }

        @media (max-width: 480px) {
          .profile-modal-header {
            padding: 1.25rem;
          }

          .profile-modal-body {
            padding: 1rem;
          }

          .profile-section {
            padding: 1rem;
          }

          .section-title {
            font-size: 1rem;
          }
        }

        /* Scrollbar Styling */
        .profile-modal-body::-webkit-scrollbar {
          width: 6px;
        }

        .profile-modal-body::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .profile-modal-body::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .profile-modal-body::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}