// src/components/Production/ProductionOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaPlay,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaExclamationTriangle,
  FaEye,
  FaCalendarAlt,
  FaUser,
  FaIndustry,
  FaCheck,
  FaTimes,
  FaSave,
  FaSyncAlt,
  FaChartLine,
  FaFilter,
  FaDownload,
  FaPrint
} from 'react-icons/fa';
import axios from 'axios';
import './ProductionOrders.css';

const API_BASE_URL = 'http://localhost:8000/api/production';

const ProductionOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showAddHeatModal, setShowAddHeatModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [steelGrades, setSteelGrades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    customer: ''
  });

  // Form states
  const [newOrder, setNewOrder] = useState({
    order_number: '',
    customer_name: '',
    customer_po: '',
    product_description: '',
    steel_grade: '',
    quantity_tons: 0,
    quantity_heats: 1,
    required_by_date: '',
    temp_target: 1600,
    temp_min: 1580,
    temp_max: 1620,
    priority: 'normal',
    notes: ''
  });

  const [editOrder, setEditOrder] = useState(null);
  const [newHeat, setNewHeat] = useState({
    heat_number: '',
    liquid_weight: 120,
    operator_name: '',
    shift_id: 'A'
  });

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
    fetchOrders();
    fetchSteelGrades();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/orders/');
      setOrders(response.data.results || response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSteelGrades = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost:8000/api/lf/steel-grades/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSteelGrades(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching steel grades:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(order => order.priority === filters.priority);
    }
    if (filters.customer) {
      filtered = filtered.filter(order =>
        order.customer_name.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleCreateOrder = async () => {
    if (!newOrder.order_number || !newOrder.customer_name || !newOrder.steel_grade || !newOrder.quantity_tons) {
      alert('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post('/orders/', newOrder);
      if (response.status === 201 || response.status === 200) {
        await fetchOrders();
        setShowCreateModal(false);
        resetNewOrderForm();
        alert('Order created successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!editOrder) return;

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.patch(`/orders/${editOrder.id}/`, editOrder);
      if (response.status === 200) {
        await fetchOrders();
        setShowEditModal(false);
        setEditOrder(null);
//         alert('Order updated successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    setIsSubmitting(true);
    try {
      const response = await axiosInstance.delete(`/orders/${orderId}/`);
      if (response.status === 204) {
        await fetchOrders();
        setShowDeleteConfirm(null);
        alert('Order deleted successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmOrder = async (order) => {
    if (window.confirm(`Confirm order ${order.order_number}?`)) {
      try {
        const response = await axiosInstance.post(`/orders/${order.id}/confirm/`);
        if (response.status === 200) {
          await fetchOrders();
          alert('Order confirmed!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to confirm order');
      }
    }
  };

  const handleStartProduction = async (order) => {
    if (window.confirm(`Start production for order ${order.order_number}?`)) {
      try {
        const response = await axiosInstance.post(`/orders/${order.id}/start_production/`);
        if (response.status === 200) {
          await fetchOrders();
          alert('Production started!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to start production');
      }
    }
  };

  const handleCompleteOrder = async (order) => {
    if (window.confirm(`Complete order ${order.order_number}?`)) {
      try {
        const response = await axiosInstance.post(`/orders/${order.id}/complete/`);
        if (response.status === 200) {
          await fetchOrders();
          alert('Order completed!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to complete order');
      }
    }
  };

  const handleCancelOrder = async (order) => {
    if (window.confirm(`Cancel order ${order.order_number}?`)) {
      try {
        const response = await axiosInstance.post(`/orders/${order.id}/cancel/`);
        if (response.status === 200) {
          await fetchOrders();
          alert('Order cancelled!');
        }
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to cancel order');
      }
    }
  };

  const handleAddHeat = async () => {
    if (!newHeat.heat_number || !newHeat.liquid_weight) {
      alert('Please fill required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axiosInstance.post(`/orders/${selectedOrder.id}/add_heat/`, newHeat);
      if (response.status === 201) {
        await fetchOrders();
        setShowAddHeatModal(false);
        setNewHeat({
          heat_number: '',
          liquid_weight: 120,
          operator_name: '',
          shift_id: 'A'
        });
        alert('Heat added successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add heat');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetNewOrderForm = () => {
    setNewOrder({
      order_number: '',
      customer_name: '',
      customer_po: '',
      product_description: '',
      steel_grade: '',
      quantity_tons: 0,
      quantity_heats: 1,
      required_by_date: '',
      temp_target: 1600,
      temp_min: 1580,
      temp_max: 1620,
      priority: 'normal',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      draft: <span className="badge-pending"><FaTimesCircle /> Draft</span>,
      confirmed: <span className="badge-info"><FaCheckCircle /> Confirmed</span>,
      in_progress: <span className="badge-running"><FaPlay /> In Progress</span>,
      completed: <span className="badge-success"><FaCheckCircle /> Completed</span>,
      cancelled: <span className="badge-danger"><FaTimesCircle /> Cancelled</span>
    };
    return badges[status] || badges.draft;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: <span className="badge-info">Low</span>,
      normal: <span className="badge-success">Normal</span>,
      high: <span className="badge-warning">High</span>,
      urgent: <span className="badge-danger">Urgent</span>
    };
    return badges[priority] || badges.normal;
  };

  const getStatusActions = (order) => {
    const actions = [];

    if (order.status === 'draft') {
      actions.push(
        <button key="confirm" className="btn-confirm-order" onClick={() => handleConfirmOrder(order)} title="Confirm Order">
          <FaCheckCircle /> Confirm
        </button>,
        <button key="edit" className="btn-edit-order" onClick={() => {
          setEditOrder(order);
          setShowEditModal(true);
        }} title="Edit Order">
          <FaEdit /> Edit
        </button>
      );
    }

    if (order.status === 'confirmed') {
      actions.push(
        <button key="start" className="btn-start-order" onClick={() => handleStartProduction(order)} title="Start Production">
          <FaPlay /> Start
        </button>
      );
    }

    if (order.status === 'in_progress') {
      actions.push(
        <button key="complete" className="btn-complete-order" onClick={() => handleCompleteOrder(order)} title="Complete Order">
          <FaCheckCircle /> Complete
        </button>
      );
    }

    if (order.status !== 'completed' && order.status !== 'cancelled') {
      actions.push(
        <button key="cancel" className="btn-cancel-order" onClick={() => handleCancelOrder(order)} title="Cancel Order">
          <FaTimesCircle /> Cancel
        </button>
      );
    }

    if (order.status === 'draft' || order.status === 'confirmed') {
      actions.push(
        <button key="add-heat" className="btn-add-heat-order" onClick={() => {
          setSelectedOrder(order);
          setShowAddHeatModal(true);
        }} title="Add Heat">
          <FaPlus /> Add Heat
        </button>
      );
    }

    actions.push(
      <button key="delete" className="btn-delete-order" onClick={() => setShowDeleteConfirm(order)} title="Delete Order">
        <FaTrashAlt /> Delete
      </button>
    );

    return actions;
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin" />
        <p>Loading production orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <FaExclamationTriangle />
        <h3>Error Loading Orders</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchOrders}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="production-orders-page">
      <div className="page-header">
        <h2>
          <FaShoppingCart />
          Production Orders
        </h2>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> New Order
          </button>
          <button className="btn-refresh" onClick={fetchOrders}>
            <FaSyncAlt /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-header">
          <FaFilter />
          <span>Filters</span>
        </div>
        <div className="filters-grid">
          <div className="filter-group">
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Priority</label>
            <select value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})}>
              <option value="">All</option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Customer</label>
            <input
              type="text"
              placeholder="Search customer..."
              value={filters.customer}
              onChange={(e) => setFilters({...filters, customer: e.target.value})}
            />
          </div>
          <div className="filter-group">
            <button className="btn-clear-filters" onClick={() => setFilters({status: '', priority: '', customer: ''})}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="orders-table-card">
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order </th>
                <th>Customer</th>
                <th>Steel Grade</th>
                <th>Quantity (tons)</th>
                <th>Heats</th>
                <th>Progress</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-number-cell">
                    <strong>{order.order_number}</strong>
                    <button
                      className="btn-view-order"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowViewModal(true);
                      }}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.steel_grade_code}</td>
                  <td>
                    <div className="quantity-info">
                      <span className="completed-qty">{order.completed_quantity?.toFixed(1) || 0}</span>
                      <span className="total-qty"> / {order.quantity_tons}</span>
                    </div>
                  </td>
                  <td>
                    <div className="heats-info">
                      <span className="completed-heats">{order.completed_heat_count || 0}</span>
                      <span className="total-heats"> / {order.heat_count || 0}</span>
                    </div>
                  </td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${order.progress_percentage}%` }}
                        />
                      </div>
                      <span className="progress-text">{order.progress_percentage}%</span>
                    </div>
                  </td>
                  <td>{getPriorityBadge(order.priority)}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td className="action-buttons">
                    <div className="actions-group">
                      {getStatusActions(order)}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="9" className="no-data">
                    No orders found. Create your first order!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPlus /> Create New Production Order</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group half">
                  <label>Order Number *</label>
                  <input
                    type="text"
                    value={newOrder.order_number}
                    onChange={(e) => setNewOrder({ ...newOrder, order_number: e.target.value })}
                    placeholder="e.g., PO-2024-001"
                  />
                </div>
                <div className="form-group half">
                  <label>Customer Name *</label>
                  <input
                    type="text"
                    value={newOrder.customer_name}
                    onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Customer PO Number</label>
                  <input
                    type="text"
                    value={newOrder.customer_po}
                    onChange={(e) => setNewOrder({ ...newOrder, customer_po: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Steel Grade *</label>
                  <select
                    value={newOrder.steel_grade}
                    onChange={(e) => setNewOrder({ ...newOrder, steel_grade: e.target.value })}
                  >
                    <option value="">Select Steel Grade</option>
                    {steelGrades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.code} - {grade.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Quantity (tons) *</label>
                  <input
                    type="number"
                    value={newOrder.quantity_tons}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity_tons: parseFloat(e.target.value) })}
                    step="10"
                  />
                </div>
                <div className="form-group half">
                  <label>Number of Heats</label>
                  <input
                    type="number"
                    value={newOrder.quantity_heats}
                    onChange={(e) => setNewOrder({ ...newOrder, quantity_heats: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Required By Date</label>
                  <input
                    type="date"
                    value={newOrder.required_by_date}
                    onChange={(e) => setNewOrder({ ...newOrder, required_by_date: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Priority</label>
                  <select
                    value={newOrder.priority}
                    onChange={(e) => setNewOrder({ ...newOrder, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Product Description</label>
                  <textarea
                    rows="2"
                    value={newOrder.product_description}
                    onChange={(e) => setNewOrder({ ...newOrder, product_description: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Temperature Specifications</label>
                  <div className="inline-group">
                    <input
                      type="number"
                      placeholder="Min °C"
                      value={newOrder.temp_min}
                      onChange={(e) => setNewOrder({ ...newOrder, temp_min: parseInt(e.target.value) })}
                    />
                    <input
                      type="number"
                      placeholder="Target °C"
                      value={newOrder.temp_target}
                      onChange={(e) => setNewOrder({ ...newOrder, temp_target: parseInt(e.target.value) })}
                    />
                    <input
                      type="number"
                      placeholder="Max °C"
                      value={newOrder.temp_max}
                      onChange={(e) => setNewOrder({ ...newOrder, temp_max: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="2"
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
                  placeholder="Additional notes or special requirements..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateOrder} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditModal && editOrder && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEdit /> Edit Order: {editOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group half">
                  <label>Customer Name</label>
                  <input
                    type="text"
                    value={editOrder.customer_name}
                    onChange={(e) => setEditOrder({ ...editOrder, customer_name: e.target.value })}
                  />
                </div>
                <div className="form-group half">
                  <label>Customer PO Number</label>
                  <input
                    type="text"
                    value={editOrder.customer_po || ''}
                    onChange={(e) => setEditOrder({ ...editOrder, customer_po: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>Quantity (tons)</label>
                  <input
                    type="number"
                    value={editOrder.quantity_tons}
                    onChange={(e) => setEditOrder({ ...editOrder, quantity_tons: parseFloat(e.target.value) })}
                    step="10"
                  />
                </div>
                <div className="form-group half">
                  <label>Required By Date</label>
                  <input
                    type="date"
                    value={editOrder.required_by_date || ''}
                    onChange={(e) => setEditOrder({ ...editOrder, required_by_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  rows="3"
                  value={editOrder.notes || ''}
                  onChange={(e) => setEditOrder({ ...editOrder, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateOrder} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaSave />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
{/* View Order Modal */}
{showViewModal && selectedOrder && (
  <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
    <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
      <div className="modal-header">
        <h3><FaEye /> Order Details: {selectedOrder.order_number}</h3>
        <button className="modal-close" onClick={() => setShowViewModal(false)}>
          <FaTimes />
        </button>
      </div>
      <div className="modal-body" style={{ textAlign: 'left', direction: 'ltr' }}>
        <div className="order-details-grid">
          <div className="detail-group">
            <label>Order Number:</label>
            <span>{selectedOrder.order_number}</span>
          </div>
          <div className="detail-group">
            <label>Customer:</label>
            <span>{selectedOrder.customer_name}</span>
          </div>
          <div className="detail-group">
            <label>Customer PO:</label>
            <span>{selectedOrder.customer_po || '—'}</span>
          </div>
          <div className="detail-group">
            <label>Steel Grade:</label>
            <span>{selectedOrder.steel_grade_code} - {selectedOrder.steel_grade_name}</span>
          </div>
          <div className="detail-group">
            <label>Quantity:</label>
            <span>{selectedOrder.quantity_tons} tons</span>
          </div>
          <div className="detail-group">
            <label>Heats:</label>
            <span>{selectedOrder.heat_count || 0} heats</span>
          </div>
          <div className="detail-group">
            <label>Progress:</label>
            <span>{selectedOrder.progress_percentage}%</span>
          </div>
          <div className="detail-group">
            <label>Priority:</label>
            <span>{getPriorityBadge(selectedOrder.priority)}</span>
          </div>
          <div className="detail-group">
            <label>Status:</label>
            <span>{getStatusBadge(selectedOrder.status)}</span>
          </div>
          <div className="detail-group">
            <label>Required By:</label>
            <span>{selectedOrder.required_by_date || '—'}</span>
          </div>
          <div className="detail-group full-width">
            <label>Product Description:</label>
            <p>{selectedOrder.product_description || '—'}</p>
          </div>
          <div className="detail-group full-width">
            <label>Notes:</label>
            <p>{selectedOrder.notes || '—'}</p>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
      </div>
    </div>
  </div>
)}

      {/* Add Heat Modal */}
      {showAddHeatModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowAddHeatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaPlus /> Add Heat to Order {selectedOrder.order_number}</h3>
              <button className="modal-close" onClick={() => setShowAddHeatModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Heat Number *</label>
                <input
                  type="number"
                  value={newHeat.heat_number}
                  onChange={(e) => setNewHeat({ ...newHeat, heat_number: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Liquid Weight (tons) *</label>
                <input
                  type="number"
                  value={newHeat.liquid_weight}
                  onChange={(e) => setNewHeat({ ...newHeat, liquid_weight: parseFloat(e.target.value) })}
                  step="0.5"
                />
              </div>
              <div className="form-group">
                <label>Operator Name</label>
                <input
                  type="text"
                  value={newHeat.operator_name}
                  onChange={(e) => setNewHeat({ ...newHeat, operator_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Shift</label>
                <select
                  value={newHeat.shift_id}
                  onChange={(e) => setNewHeat({ ...newHeat, shift_id: e.target.value })}
                >
                  <option value="A">Shift A (06:00-14:00)</option>
                  <option value="B">Shift B (14:00-22:00)</option>
                  <option value="C">Shift C (22:00-06:00)</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddHeatModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddHeat} disabled={isSubmitting}>
                {isSubmitting ? <FaSpinner className="spin" /> : <FaPlus />}
                Add Heat
              </button>
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
              <p>Are you sure you want to delete this order?</p>
              <p><strong>Order:</strong> {showDeleteConfirm.order_number}</p>
              <p><strong>Customer:</strong> {showDeleteConfirm.customer_name}</p>
              <p className="warning-text">This action cannot be undone!</p>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDeleteOrder(showDeleteConfirm.id)} disabled={isSubmitting}>
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

export default ProductionOrders;