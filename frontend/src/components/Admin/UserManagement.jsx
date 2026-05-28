// src/components/Admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaSpinner,
  FaExclamationTriangle,
  FaSyncAlt,
  FaSave,
  FaTimes,
  FaUserShield,
  FaUserCog,
  FaUserTie,
  FaHardHat,
  FaFlask,
  FaEye,
  FaHistory,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaBan,
  FaUserCheck,
  FaUserSlash
} from 'react-icons/fa';
import axios from 'axios';
import './UserManagement.css';

const API_BASE_URL = 'http://localhost:8000/api/accounts';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    employee_id: '',
    department: '',
    position: '',
    phone_number: '',
    shift: '',
    role: 'viewer',
    is_active: true
  });

  const [editUser, setEditUser] = useState(null);
  const [newRole, setNewRole] = useState('');

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

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchTerm, roleFilter, departmentFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/users/');
      setUsers(response.data.results || response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async (userId) => {
    try {
      const response = await axiosInstance.get(`/activity-logs/?user_id=${userId}`);
      setActivityLogs(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.employee_id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter) {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (departmentFilter) {
      filtered = filtered.filter(user => user.department?.toLowerCase().includes(departmentFilter.toLowerCase()));
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/users/', newUser);
      if (response.status === 201) {
        await fetchUsers();
        setShowCreateModal(false);
        resetNewUserForm();
        alert('User created successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editUser) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.patch(`/users/${editUser.id}/`, editUser);
      if (response.status === 200) {
        await fetchUsers();
        setShowEditModal(false);
        setEditUser(null);
        alert('User updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/users/${selectedUser.id}/change_role/`, { role: newRole });
      if (response.status === 200) {
        await fetchUsers();
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
        alert('User role updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to change role');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivateUser = async (user) => {
    if (window.confirm(`Activate user ${user.username}?`)) {
      try {
        const response = await axiosInstance.post(`/users/${user.id}/activate/`);
        if (response.status === 200) {
          await fetchUsers();
          alert('User activated successfully!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to activate user');
      }
    }
  };

  const handleDeactivateUser = async (user) => {
    if (window.confirm(`Deactivate user ${user.username}?`)) {
      try {
        const response = await axiosInstance.post(`/users/${user.id}/deactivate/`);
        if (response.status === 200) {
          await fetchUsers();
          alert('User deactivated successfully!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to deactivate user');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setIsSubmitting(true);
      try {
        const response = await axiosInstance.delete(`/users/${userId}/`);
        if (response.status === 204) {
          await fetchUsers();
          setShowDeleteConfirm(null);
          alert('User deleted successfully!');
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleViewActivity = async (user) => {
    setSelectedUser(user);
    await fetchActivityLogs(user.id);
    setShowActivityModal(true);
  };

  const resetNewUserForm = () => {
    setNewUser({
      username: '',
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      employee_id: '',
      department: '',
      position: '',
      phone_number: '',
      shift: '',
      role: 'viewer',
      is_active: true
    });
  };

  const getRoleIcon = (role) => {
    const icons = {
      admin: <FaUserShield />,
      production_manager: <FaUserTie />,
      production_planner: <FaUserCog />,
      lf_operator: <FaHardHat />,
      eaf_operator: <FaHardHat />,
      ccm_operator: <FaHardHat />,
      quality_engineer: <FaFlask />,
      viewer: <FaEye />
    };
    return icons[role] || <FaUserCog />;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge-danger',
      production_manager: 'badge-primary',
      production_planner: 'badge-info',
      lf_operator: 'badge-success',
      eaf_operator: 'badge-success',
      ccm_operator: 'badge-success',
      quality_engineer: 'badge-warning',
      viewer: 'badge-secondary'
    };
    return badges[role] || 'badge-secondary';
  };

  const getRoleDisplay = (role) => {
    const displays = {
      admin: 'Administrator',
      production_manager: 'Production Manager',
      production_planner: 'Production Planner',
      lf_operator: 'LF Operator',
      eaf_operator: 'EAF Operator',
      ccm_operator: 'CCM Operator',
      quality_engineer: 'Quality Engineer',
      viewer: 'Viewer'
    };
    return displays[role] || role;
  };

  const getShiftDisplay = (shift) => {
    const shifts = {
      MORNING: 'Morning (06:00-14:00)',
      AFTERNOON: 'Afternoon (14:00-22:00)',
      NIGHT: 'Night (22:00-06:00)'
    };
    return shifts[shift] || '—';
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin" />
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <FaExclamationTriangle />
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchUsers}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <div className="page-header">
        <h2>
          <FaUsers />
          User Management
        </h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> New User
          </button>
          <button className="btn-refresh" onClick={fetchUsers}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-header">
          <FaFilter />
          <span>Search & Filters</span>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label><FaSearch /> Search</label>
            <input
              type="text"
              placeholder="Search by username, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="production_manager">Production Manager</option>
              <option value="production_planner">Production Planner</option>
              <option value="lf_operator">LF Operator</option>
              <option value="eaf_operator">EAF Operator</option>
              <option value="ccm_operator">CCM Operator</option>
              <option value="quality_engineer">Quality Engineer</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Department</label>
            <input
              type="text"
              placeholder="Filter by department..."
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <button className="btn-clear-filters" onClick={() => {
              setSearchTerm('');
              setRoleFilter('');
              setDepartmentFilter('');
            }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-card">
        <div className="table-responsive">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="username-cell">
                    <strong>{user.username}</strong>
                  </td>
                  <td className="name-cell">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td className="employee-id-cell">{user.employee_id || '—'}</td>
                  <td className="department-cell">{user.department || '—'}</td>
                  <td className="role-cell">
                    <span className={`role-badge ${getRoleBadge(user.role)}`}>
                      {getRoleIcon(user.role)} {getRoleDisplay(user.role)}
                    </span>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                      {user.is_active ? <FaCheckCircle /> : <FaBan />}
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <div className="actions-group">
                      <button
                        className="btn-edit-user"
                        onClick={() => {
                          setEditUser(user);
                          setShowEditModal(true);
                        }}
                        title="Edit User"
                      >
                        <FaEdit /> Edit
                      </button>
                      <button
                        className="btn-change-role"
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role);
                          setShowRoleModal(true);
                        }}
                        title="Change Role"
                      >
                        <FaUserShield /> Role
                      </button>
                      {user.is_active ? (
                        <button
                          className="btn-deactivate-user"
                          onClick={() => handleDeactivateUser(user)}
                          title="Deactivate User"
                        >
                          <FaUserSlash /> Deactivate
                        </button>
                      ) : (
                        <button
                          className="btn-activate-user"
                          onClick={() => handleActivateUser(user)}
                          title="Activate User"
                        >
                          <FaUserCheck /> Activate
                        </button>
                      )}
                      <button
                        className="btn-view-activity"
                        onClick={() => handleViewActivity(user)}
                        title="View Activity Log"
                      >
                        <FaHistory /> Logs
                      </button>
                      <button
                        className="btn-delete-user"
                        onClick={() => setShowDeleteConfirm(user)}
                        title="Delete User"
                      >
                        <FaTrashAlt /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPlus /> Create New User</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group half">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Password *</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    value={newUser.confirm_password}
                    onChange={(e) => setNewUser({ ...newUser, confirm_password: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={newUser.employee_id}
                    onChange={(e) => setNewUser({ ...newUser, employee_id: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Position</label>
                  <input
                    type="text"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={newUser.phone_number}
                    onChange={(e) => setNewUser({ ...newUser, phone_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Shift</label>
                  <select
                    value={newUser.shift}
                    onChange={(e) => setNewUser({ ...newUser, shift: e.target.value })}
                  >
                    <option value="">Select Shift</option>
                    <option value="MORNING">Morning (06:00-14:00)</option>
                    <option value="AFTERNOON">Afternoon (14:00-22:00)</option>
                    <option value="NIGHT">Night (22:00-06:00)</option>
                  </select>
                </div>
                <div className="form-group half">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  >
                    <option value="admin">Administrator</option>
                    <option value="production_manager">Production Manager</option>
                    <option value="production_planner">Production Planner</option>
                    <option value="lf_operator">LF Operator</option>
                    <option value="eaf_operator">EAF Operator</option>
                    <option value="ccm_operator">CCM Operator</option>
                    <option value="quality_engineer">Quality Engineer</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newUser.is_active}
                    onChange={(e) => setNewUser({ ...newUser, is_active: e.target.checked })}
                  />
                  Active Account
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateUser} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Create User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit /> Edit User: {editUser.username}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group half">
                  <label>First Name</label>
                  <input
                    type="text"
                    value={editUser.first_name || ''}
                    onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editUser.last_name || ''}
                    onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editUser.email || ''}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Employee ID</label>
                  <input
                    type="text"
                    value={editUser.employee_id || ''}
                    onChange={(e) => setEditUser({ ...editUser, employee_id: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Department</label>
                  <input
                    type="text"
                    value={editUser.department || ''}
                    onChange={(e) => setEditUser({ ...editUser, department: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Position</label>
                  <input
                    type="text"
                    value={editUser.position || ''}
                    onChange={(e) => setEditUser({ ...editUser, position: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={editUser.phone_number || ''}
                    onChange={(e) => setEditUser({ ...editUser, phone_number: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Shift</label>
                  <select
                    value={editUser.shift || ''}
                    onChange={(e) => setEditUser({ ...editUser, shift: e.target.value })}
                  >
                    <option value="">Select Shift</option>
                    <option value="MORNING">Morning (06:00-14:00)</option>
                    <option value="AFTERNOON">Afternoon (14:00-22:00)</option>
                    <option value="NIGHT">Night (22:00-06:00)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={editUser.is_active}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.checked })}
                  />
                  Active Account
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateUser} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {showRoleModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaUserShield /> Change Role: {selectedUser.username}</h3>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select New Role</label>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="admin">Administrator</option>
                  <option value="production_manager">Production Manager</option>
                  <option value="production_planner">Production Planner</option>
                  <option value="lf_operator">LF Operator</option>
                  <option value="eaf_operator">EAF Operator</option>
                  <option value="ccm_operator">CCM Operator</option>
                  <option value="quality_engineer">Quality Engineer</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRoleModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleChangeRole} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Change Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Logs Modal */}
      {showActivityModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaHistory /> Activity Logs: {selectedUser.username}</h3>
              <button className="modal-close" onClick={() => setShowActivityModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              {activityLogs.length > 0 ? (
                <div className="activity-logs-list">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="activity-log-item">
                      <div className="log-header">
                        <span className="log-action">{log.action}</span>
                        <span className="log-time">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="log-details">
                        <span className="log-module">Module: {log.module}</span>
                        {log.ip_address && <span className="log-ip">IP: {log.ip_address}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">No activity logs found</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowActivityModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header warning">
              <FaExclamationTriangle />
              <h3>Confirm Delete</h3>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this user?</p>
              <p><strong>User:</strong> {showDeleteConfirm.username}</p>
              <p><strong>Name:</strong> {showDeleteConfirm.first_name} {showDeleteConfirm.last_name}</p>
              <p className="warning-text">This action cannot be undone!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteUser(showDeleteConfirm.id)} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaTrashAlt />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;