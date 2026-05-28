// src/components/Production/ProductionBuckets.jsx
import React, { useState, useEffect } from 'react';
import {
  FaLayerGroup,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaSave,
  FaTimes,
  FaChartLine,
  FaCalendarAlt,
  FaIndustry,
  FaClock
} from 'react-icons/fa';
import axios from 'axios';
import './ProductionBuckets.css';
const API_BASE_URL = 'http://localhost:8000/api/production';

const ProductionBuckets = () => {
  const [buckets, setBuckets] = useState([]);
  const [filteredBuckets, setFilteredBuckets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');

  // Form states
  const [newBucket, setNewBucket] = useState({
    bucket_number: '',
    bucket_sequence: 1,
    planned_quantity: 0,
    planned_start_date: '',
    planned_end_date: '',
    notes: ''
  });

  const [editBucket, setEditBucket] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');

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
    fetchBuckets();
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [buckets, searchTerm, statusFilter, orderFilter]);

  const fetchBuckets = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/buckets/');
      setBuckets(response.data.results || response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axiosInstance.get('/orders/');
      setOrders(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...buckets];

    if (searchTerm) {
      filtered = filtered.filter(bucket =>
        bucket.bucket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bucket.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(bucket => bucket.status === statusFilter);
    }

    if (orderFilter) {
      filtered = filtered.filter(bucket => bucket.order?.id === parseInt(orderFilter));
    }

    setFilteredBuckets(filtered);
  };

  const handleCreateBucket = async () => {
    if (!selectedOrderId) {
      alert('Please select an order');
      return;
    }

    if (!newBucket.bucket_number || !newBucket.planned_quantity) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/orders/${selectedOrderId}/add_bucket/`, newBucket);
      if (response.status === 201 || response.status === 200) {
        await fetchBuckets();
        setShowCreateModal(false);
        resetNewBucketForm();
        setSelectedOrderId('');
        alert('Bucket created successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create bucket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateBucket = async () => {
    if (!editBucket) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.patch(`/buckets/${editBucket.id}/`, editBucket);
      if (response.status === 200) {
        await fetchBuckets();
        setShowEditModal(false);
        setEditBucket(null);
        alert('Bucket updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update bucket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBucket = async (bucketId) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.delete(`/buckets/${bucketId}/`);
      if (response.status === 204) {
        await fetchBuckets();
        setShowDeleteConfirm(null);
        alert('Bucket deleted successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete bucket');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartBucket = async (bucket) => {
    if (window.confirm(`Start production for bucket ${bucket.bucket_number}?`)) {
      try {
        const response = await axiosInstance.post(`/buckets/${bucket.id}/start/`);
        if (response.status === 200) {
          await fetchBuckets();
          alert('Bucket production started!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to start bucket');
      }
    }
  };

  const handleCompleteBucket = async (bucket) => {
    if (window.confirm(`Complete bucket ${bucket.bucket_number}?`)) {
      try {
        const response = await axiosInstance.post(`/buckets/${bucket.id}/complete/`);
        if (response.status === 200) {
          await fetchBuckets();
          alert('Bucket completed!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to complete bucket');
      }
    }
  };

  const resetNewBucketForm = () => {
    setNewBucket({
      bucket_number: '',
      bucket_sequence: 1,
      planned_quantity: 0,
      planned_start_date: '',
      planned_end_date: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      planned: <span className="badge-info"><FaClock /> Planned</span>,
      in_progress: <span className="badge-running"><FaPlay /> In Progress</span>,
      completed: <span className="badge-success"><FaCheckCircle /> Completed</span>,
      cancelled: <span className="badge-danger"><FaTimesCircle /> Cancelled</span>
    };
    return badges[status] || badges.planned;
  };

  if (loading && buckets.length === 0) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin" />
        <p>Loading production buckets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <FaExclamationTriangle />
        <h3>Error Loading Buckets</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchBuckets}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="production-buckets-page">
      <div className="page-header">
        <h2>
          <FaLayerGroup />
          Production Buckets
        </h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> New Bucket
          </button>
          <button className="btn-refresh" onClick={fetchBuckets}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
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
              placeholder="Search by bucket number or order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Order</label>
            <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
              <option value="">All Orders</option>
              {orders.map(order => (
                <option key={order.id} value={order.id}>
                  {order.order_number} - {order.customer_name}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <button className="btn-clear-filters" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setOrderFilter('');
            }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Buckets Table */}
      <div className="buckets-table-card">
        <div className="table-responsive">
          <table className="buckets-table">
            <thead>
              <tr>
                <th>Bucket #</th>
                <th>Order</th>
                <th>Customer</th>
                <th>Planned (tons)</th>
                <th>Actual (tons)</th>
                <th>Progress</th>
                <th>Heats</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBuckets.map((bucket) => (
                <tr key={bucket.id}>
                  <td className="bucket-number-cell">
                    <strong>{bucket.bucket_number}</strong>
                    <button
                      className="btn-view-bucket"
                      onClick={() => {
                        setSelectedBucket(bucket);
                        setShowViewModal(true);
                      }}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                  <td className="order-cell">{bucket.order?.order_number || '—'}</td>
                  <td className="customer-cell">{bucket.order?.customer_name || '—'}</td>
                  <td className="planned-cell">{bucket.planned_quantity} tons</td>
                  <td className="actual-cell">
                    <span className="actual-quantity">{bucket.actual_quantity || 0}</span>
                    <span className="total-quantity"> / {bucket.planned_quantity}</span>
                  </td>
                  <td className="progress-cell">
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill" style={{ width: `${bucket.progress_percentage || 0}%` }} />
                      <span className="progress-text">{bucket.progress_percentage || 0}%</span>
                    </div>
                  </td>
                  <td className="heats-cell">
                    <span className="heat-count">{bucket.heat_count || 0}</span>
                    <span className="total-heats"> heats</span>
                  </td>
                  <td className="status-cell">{getStatusBadge(bucket.status)}</td>
                  <td className="action-buttons">
                    <div className="actions-group">
                      {bucket.status === 'planned' && (
                        <>
                          <button
                            className="btn-start-bucket"
                            onClick={() => handleStartBucket(bucket)}
                            title="Start Production"
                          >
                            <FaPlay /> Start
                          </button>
                          <button
                            className="btn-edit-bucket"
                            onClick={() => {
                              setEditBucket(bucket);
                              setShowEditModal(true);
                            }}
                            title="Edit Bucket"
                          >
                            <FaEdit /> Edit
                          </button>
                        </>
                      )}
                      {bucket.status === 'in_progress' && (
                        <button
                          className="btn-complete-bucket"
                          onClick={() => handleCompleteBucket(bucket)}
                          title="Complete Bucket"
                        >
                          <FaCheckCircle /> Complete
                        </button>
                      )}
                      {(bucket.status === 'planned' || bucket.status === 'in_progress') && (
                        <button
                          className="btn-delete-bucket"
                          onClick={() => setShowDeleteConfirm(bucket)}
                          title="Delete Bucket"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBuckets.length === 0 && (
                <tr>
                  <td colSpan="9" className="no-data">
                    No buckets found. Create your first bucket!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Bucket Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPlus /> Create New Production Bucket</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Select Order *</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  required
                >
                  <option value="">Select Order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.customer_name} ({order.steel_grade_code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Bucket Number *</label>
                  <input
                    type="text"
                    value={newBucket.bucket_number}
                    onChange={(e) => setNewBucket({ ...newBucket, bucket_number: e.target.value })}
                    placeholder="e.g., B001"
                  />
                </div>
                <div className="form-group half">
                  <label>Sequence</label>
                  <input
                    type="number"
                    value={newBucket.bucket_sequence}
                    onChange={(e) => setNewBucket({ ...newBucket, bucket_sequence: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Planned Quantity (tons) *</label>
                <input
                  type="number"
                  value={newBucket.planned_quantity}
                  onChange={(e) => setNewBucket({ ...newBucket, planned_quantity: parseFloat(e.target.value) })}
                  step="10"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Planned Start Date</label>
                  <input
                    type="datetime-local"
                    value={newBucket.planned_start_date}
                    onChange={(e) => setNewBucket({ ...newBucket, planned_start_date: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Planned End Date</label>
                  <input
                    type="datetime-local"
                    value={newBucket.planned_end_date}
                    onChange={(e) => setNewBucket({ ...newBucket, planned_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={newBucket.notes}
                  onChange={(e) => setNewBucket({ ...newBucket, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateBucket} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Create Bucket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Bucket Modal */}
      {showEditModal && editBucket && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit /> Edit Bucket: {editBucket.bucket_number}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Planned Quantity (tons)</label>
                <input
                  type="number"
                  value={editBucket.planned_quantity}
                  onChange={(e) => setEditBucket({ ...editBucket, planned_quantity: parseFloat(e.target.value) })}
                  step="10"
                />
              </div>
              <div className="form-row">
                <div className="form-group half">
                  <label>Planned Start Date</label>
                  <input
                    type="datetime-local"
                    value={editBucket.planned_start_date || ''}
                    onChange={(e) => setEditBucket({ ...editBucket, planned_start_date: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Planned End Date</label>
                  <input
                    type="datetime-local"
                    value={editBucket.planned_end_date || ''}
                    onChange={(e) => setEditBucket({ ...editBucket, planned_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editBucket.status}
                  onChange={(e) => setEditBucket({ ...editBucket, status: e.target.value })}
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={editBucket.notes || ''}
                  onChange={(e) => setEditBucket({ ...editBucket, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateBucket} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Bucket Modal */}
      {showViewModal && selectedBucket && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEye /> Bucket Details: {selectedBucket.bucket_number}</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="bucket-details-grid">
                <div className="detail-group">
                  <label>Bucket Number:</label>
                  <span><strong>{selectedBucket.bucket_number}</strong></span>
                </div>
                <div className="detail-group">
                  <label>Order:</label>
                  <span>{selectedBucket.order?.order_number}</span>
                </div>
                <div className="detail-group">
                  <label>Customer:</label>
                  <span>{selectedBucket.order?.customer_name}</span>
                </div>
                <div className="detail-group">
                  <label>Steel Grade:</label>
                  <span>{selectedBucket.order?.steel_grade_code}</span>
                </div>
                <div className="detail-group">
                  <label>Planned Quantity:</label>
                  <span>{selectedBucket.planned_quantity} tons</span>
                </div>
                <div className="detail-group">
                  <label>Actual Quantity:</label>
                  <span className="success-text">{selectedBucket.actual_quantity || 0} tons</span>
                </div>
                <div className="detail-group">
                  <label>Remaining:</label>
                  <span className="warning-text">{selectedBucket.remaining_quantity?.toFixed(2) || selectedBucket.planned_quantity} tons</span>
                </div>
                <div className="detail-group">
                  <label>Progress:</label>
                  <div className="progress-display">
                    <div className="progress-bar-large">
                      <div className="progress-fill" style={{ width: `${selectedBucket.progress_percentage || 0}%` }} />
                    </div>
                    <span>{selectedBucket.progress_percentage || 0}%</span>
                  </div>
                </div>
                <div className="detail-group">
                  <label>Heats:</label>
                  <span>{selectedBucket.heat_count || 0} heats</span>
                </div>
                <div className="detail-group">
                  <label>Status:</label>
                  <span>{getStatusBadge(selectedBucket.status)}</span>
                </div>
                <div className="detail-group">
                  <label>Planned Start:</label>
                  <span>{selectedBucket.planned_start_date ? new Date(selectedBucket.planned_start_date).toLocaleString() : '—'}</span>
                </div>
                <div className="detail-group">
                  <label>Planned End:</label>
                  <span>{selectedBucket.planned_end_date ? new Date(selectedBucket.planned_end_date).toLocaleString() : '—'}</span>
                </div>
                {selectedBucket.actual_start_date && (
                  <div className="detail-group">
                    <label>Actual Start:</label>
                    <span>{new Date(selectedBucket.actual_start_date).toLocaleString()}</span>
                  </div>
                )}
                {selectedBucket.actual_end_date && (
                  <div className="detail-group">
                    <label>Actual End:</label>
                    <span>{new Date(selectedBucket.actual_end_date).toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-group full-width">
                  <label>Notes:</label>
                  <p>{selectedBucket.notes || '—'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
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
              <p>Are you sure you want to delete this bucket?</p>
              <p><strong>Bucket:</strong> {showDeleteConfirm.bucket_number}</p>
              <p><strong>Order:</strong> {showDeleteConfirm.order?.order_number}</p>
              <p className="warning-text">This action cannot be undone!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteBucket(showDeleteConfirm.id)} disabled={isSubmitting}>
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

export default ProductionBuckets;