// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUser, FaEnvelope, FaIdCard, FaBuilding, FaBriefcase,
  FaPhone, FaClock, FaSave, FaEdit, FaKey, FaHistory,
  FaSpinner, FaCheckCircle, FaExclamationTriangle,
  FaArrowLeft, FaUserCircle, FaMoon, FaSun, FaTimes
} from 'react-icons/fa';
import { useTheme } from '../theme';
import './Profile.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

const Profile = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    department: '',
    position: '',
    phone_number: '',
    shift: ''
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [passwordErrors, setPasswordErrors] = useState({});

  // Shift options
  const shiftOptions = [
    { value: 'MORNING', label: 'Morning (06:00 - 14:00)' },
    { value: 'AFTERNOON', label: 'Afternoon (14:00 - 22:00)' },
    { value: 'NIGHT', label: 'Night (22:00 - 06:00)' }
  ];

  // Axios instance with auth
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Fetch user profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/profile/');
      setProfile(response.data);
      setFormData({
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        email: response.data.email || '',
        employee_id: response.data.employee_id || '',
        department: response.data.department || '',
        position: response.data.position || '',
        phone_number: response.data.phone_number || '',
        shift: response.data.shift || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile data' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    try {
      const response = await axiosInstance.get('/activity-logs/');
      setActivityLogs(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  // Update profile - using the update_profile endpoint from your backend
  const handleUpdateProfile = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axiosInstance.patch('/users/update_profile/', formData);
      setProfile(response.data);
      setEditMode(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.message || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    setSaving(true);
    setPasswordErrors({});

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordErrors({ confirm_password: 'Passwords do not match' });
      setSaving(false);
      return;
    }

    if (passwordData.new_password.length < 6) {
      setPasswordErrors({ new_password: 'Password must be at least 6 characters' });
      setSaving(false);
      return;
    }

    try {
      await axiosInstance.post('/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      setShowPasswordModal(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      if (error.response?.data) {
        setPasswordErrors(error.response.data);
      } else {
        setPasswordErrors({ old_password: 'Failed to change password' });
      }
    } finally {
      setSaving(false);
    }
  };

  // View activity logs
  const handleViewActivity = async () => {
    await fetchActivityLogs();
    setShowActivityModal(true);
  };

  // Get role badge
  const getRoleBadge = (role) => {
    const badges = {
      'admin': 'badge-danger',
      'production_manager': 'badge-primary',
      'production_planner': 'badge-info',
      'lf_operator': 'badge-success',
      'eaf_operator': 'badge-success',
      'ccm_operator': 'badge-success',
      'quality_engineer': 'badge-warning',
      'viewer': 'badge-secondary'
    };
    return badges[role] || 'badge-secondary';
  };

  const getRoleDisplay = (role) => {
    const displays = {
      'admin': 'Administrator',
      'production_manager': 'Production Manager',
      'production_planner': 'Production Planner',
      'lf_operator': 'LF Operator',
      'eaf_operator': 'EAF Operator',
      'ccm_operator': 'CCM Operator',
      'quality_engineer': 'Quality Engineer',
      'viewer': 'Viewer'
    };
    return displays[role] || role;
  };

  const getShiftDisplay = (shift) => {
    const shiftMap = {
      'MORNING': 'Morning (06:00-14:00)',
      'AFTERNOON': 'Afternoon (14:00-22:00)',
      'NIGHT': 'Night (22:00-06:00)'
    };
    return shiftMap[shift] || shift || '—';
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className={`profile-loading ${theme}`}>
        <FaSpinner className="spin" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={`profile-container ${theme}`}>
      {/* Header */}
      <div className="profile-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> Back to Dashboard
        </button>
        <h1 className="profile-title">
          <FaUser /> My Profile
        </h1>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          {message.text}
        </div>
      )}

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <div className="profile-avatar-placeholder">
              <FaUserCircle />
            </div>
            <div className="profile-role">
              <span className={`role-badge ${getRoleBadge(profile?.role)}`}>
                {getRoleDisplay(profile?.role)}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-info-section">
          <div className="info-header">
            <h2>Personal Information</h2>
            {!editMode ? (
              <button className="btn-edit" onClick={() => setEditMode(true)}>
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="btn-cancel" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleUpdateProfile} disabled={saving}>
                  {saving ? <FaSpinner className="spin" /> : <FaSave />}
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="info-grid">
            <div className="info-item">
              <label><FaUser /> Username</label>
              <div className="info-value">{profile?.username || '—'}</div>
            </div>

            <div className="info-item">
              <label><FaUser /> First Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="profile-input"
                  placeholder="First Name"
                />
              ) : (
                <div className="info-value">{profile?.first_name || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaUser /> Last Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="profile-input"
                  placeholder="Last Name"
                />
              ) : (
                <div className="info-value">{profile?.last_name || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaEnvelope /> Email</label>
              {editMode ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="profile-input"
                  placeholder="Email"
                />
              ) : (
                <div className="info-value">{profile?.email || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaIdCard /> Employee ID</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="profile-input"
                  placeholder="Employee ID"
                />
              ) : (
                <div className="info-value">{profile?.employee_id || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaBuilding /> Department</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="profile-input"
                  placeholder="Department"
                />
              ) : (
                <div className="info-value">{profile?.department || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaBriefcase /> Position</label>
              {editMode ? (
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="profile-input"
                  placeholder="Position"
                />
              ) : (
                <div className="info-value">{profile?.position || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaPhone /> Phone Number</label>
              {editMode ? (
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="profile-input"
                  placeholder="Phone Number"
                />
              ) : (
                <div className="info-value">{profile?.phone_number || '—'}</div>
              )}
            </div>

            <div className="info-item">
              <label><FaClock /> Shift</label>
              {editMode ? (
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="profile-select"
                >
                  <option value="">Select Shift</option>
                  {shiftOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <div className="info-value">{getShiftDisplay(profile?.shift)}</div>
              )}
            </div>
          </div>

          {/* Account Actions */}
          <div className="account-actions">
            <button className="action-btn password" onClick={() => setShowPasswordModal(true)}>
              <FaKey /> Change Password
            </button>
            <button className="action-btn history" onClick={handleViewActivity}>
              <FaHistory /> View Activity Log
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaKey /> Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {passwordErrors.non_field_errors && (
                <div className="error-message">{passwordErrors.non_field_errors}</div>
              )}
              {passwordErrors.detail && (
                <div className="error-message">{passwordErrors.detail}</div>
              )}
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.old_password}
                  onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  className="form-control"
                />
                {passwordErrors.old_password && (
                  <small className="error-text">{passwordErrors.old_password}</small>
                )}
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="form-control"
                />
                {passwordErrors.new_password && (
                  <small className="error-text">{passwordErrors.new_password}</small>
                )}
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="form-control"
                />
                {passwordErrors.confirm_password && (
                  <small className="error-text">{passwordErrors.confirm_password}</small>
                )}
              </div>
              <div className="password-hint">
                <small>Password must be at least 6 characters long.</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPasswordModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleChangePassword} disabled={saving}>
                {saving ? <FaSpinner className="spin" /> : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Log Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaHistory /> Activity Log</h3>
              <button className="modal-close" onClick={() => setShowActivityModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {activityLogs.length > 0 ? (
                <div className="activity-logs">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="log-item">
                      <div className="log-header">
                        <span className="log-action">{log.action}</span>
                        <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="log-details">
                        {log.module && <span>Module: {log.module}</span>}
                        {log.ip_address && <span>IP: {log.ip_address}</span>}
                      </div>
                      {log.details && typeof log.details === 'object' ? (
                        <div className="log-description">{JSON.stringify(log.details)}</div>
                      ) : log.details ? (
                        <div className="log-description">{log.details}</div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-logs">
                  <FaHistory />
                  <p>No activity logs found</p>
                  <small>Your activities will appear here as you use the system</small>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowActivityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;