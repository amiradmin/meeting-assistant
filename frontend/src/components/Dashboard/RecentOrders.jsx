// src/components/Dashboard/RecentOrders.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecentOrders.css'
const API_BASE_URL = 'http://localhost:8000/api/production';
const LF_API_BASE_URL = 'http://localhost:8000/api/lf';

const RecentOrders = () => {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [orderData, setOrderData] = useState({});

  // Axios instance with auth
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  const axiosLfInstance = axios.create({
    baseURL: LF_API_BASE_URL,
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

  axiosLfInstance.interceptors.request.use(
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
    fetchRecentOrders();
  }, []);

  const fetchRecentOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const response = await axiosInstance.get('/orders/?ordering=-created_at&limit=10');
      const orders = response.data.results || response.data;
      setRecentOrders(orders);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const toggleRowExpand = async (orderId) => {
    const isExpanding = !expandedRows[orderId];

    setExpandedRows(prev => ({
      ...prev,
      [orderId]: isExpanding
    }));

    if (isExpanding && !orderData[orderId]) {
      await fetchOrderData(orderId);
    }
  };

  const fetchOrderData = async (orderId) => {
    try {
      const orderResponse = await axiosInstance.get(`/orders/${orderId}/`);
      const order = orderResponse.data;

      let buckets = order.buckets || [];

      if (buckets.length === 0) {
        const bucketsResponse = await axiosInstance.get(`/buckets/?order_id=${orderId}`);
        buckets = bucketsResponse.data.results || bucketsResponse.data;
      }

      const bucketsWithHeats = await Promise.all(buckets.map(async (bucket) => {
        try {
          const heatsResponse = await axiosLfInstance.get(`/heats/?bucket=${bucket.id}`);
          const heats = heatsResponse.data.results || heatsResponse.data;
          return { ...bucket, heats: heats };
        } catch (error) {
          return { ...bucket, heats: [] };
        }
      }));

      setOrderData(prev => ({
        ...prev,
        [orderId]: { order: order, buckets: bucketsWithHeats }
      }));

    } catch (error) {
      console.error('Error fetching order data:', error);
      setOrderData(prev => ({
        ...prev,
        [orderId]: { order: null, buckets: [] }
      }));
    }
  };

  const handleOrderSelect = async (order) => {
    setSelectedOrder(order);
    try {
      const response = await axiosInstance.get(`/orders/${order.id}/`);
      setOrderDetails(response.data);
      setShowOrderDetails(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleGoToProduction = () => {
    navigate(`/production/orders`);
  };

  const handleGoToBucket = () => {
    navigate(`/production/buckets`);
  };

  const handleGoToHeat = (heatId) => {
    navigate(`/lf/monitoring?heatId=${heatId}`);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { icon: 'fas fa-file-alt', text: 'Draft', class: 'status-draft' },
      confirmed: { icon: 'fas fa-check-circle', text: 'Confirmed', class: 'status-confirmed' },
      in_progress: { icon: 'fas fa-play-circle', text: 'In Progress', class: 'status-in-progress' },
      completed: { icon: 'fas fa-check-double', text: 'Completed', class: 'status-completed' },
      cancelled: { icon: 'fas fa-times-circle', text: 'Cancelled', class: 'status-cancelled' }
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`status-badge ${config.class}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { icon: 'fas fa-arrow-down', text: 'Low', class: 'priority-low' },
      normal: { icon: 'fas fa-minus', text: 'Normal', class: 'priority-normal' },
      high: { icon: 'fas fa-arrow-up', text: 'High', class: 'priority-high' },
      urgent: { icon: 'fas fa-exclamation-triangle', text: 'Urgent', class: 'priority-urgent' }
    };
    const config = priorityConfig[priority] || priorityConfig.normal;
    return (
      <span className={`priority-badge ${config.class}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  const getHeatStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: 'fas fa-clock', text: 'Pending', class: 'status-pending' },
      running: { icon: 'fas fa-play', text: 'Running', class: 'status-running' },
      completed: { icon: 'fas fa-check-circle', text: 'Completed', class: 'status-completed' },
      cancelled: { icon: 'fas fa-times-circle', text: 'Cancelled', class: 'status-cancelled' },
      ready_to_tap: { icon: 'fas fa-check-double', text: 'Ready to Tap', class: 'status-ready' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`heat-status-badge ${config.class}`}>
        <i className={config.icon}></i>
        {config.text}
      </span>
    );
  };

  const getProgressBar = (percentage) => {
    return (
      <div className="progress-bar-wrapper">
        <div className="progress-bar-fill" style={{ width: `${percentage || 0}%` }}></div>
        <span className="progress-text">{percentage || 0}%</span>
      </div>
    );
  };

  const getOrderData = (orderId) => {
    return orderData[orderId] || { order: null, buckets: [] };
  };

  return (
    <>
      <div className="recent-orders-card">
        <div className="card-header">
          <h3 className="card-title">
            <i className="fas fa-shopping-cart"></i>
            Recent Production Orders
          </h3>
          <div className="card-actions">
            <Link to="/production/orders" className="btn-link">
              View All Orders <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </div>
        <div className="card-body">
          {isLoadingOrders ? (
            <div className="loading-spinner">Loading orders...</div>
          ) : (
            <div className="orders-table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th style={{ width: '30px' }}></th>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Steel Grade</th>
                    <th>Quantity (tons)</th>
                    <th>Progress</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const orderDataItem = getOrderData(order.id);
                    const buckets = orderDataItem.buckets;
                    const isLoading = !orderData[order.id] && expandedRows[order.id];

                    return (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td className="expand-cell">
                            <button
                              className="expand-btn"
                              onClick={() => toggleRowExpand(order.id)}
                            >
                              <i className={`fas fa-chevron-${expandedRows[order.id] ? 'down' : 'right'}`}></i>
                            </button>
                          </td>
                          <td className="order-number-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            <strong>{order.order_number}</strong>
                          </td>
                          <td className="customer-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            {order.customer_name}
                          </td>
                          <td className="steel-grade-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            {order.steel_grade_code}
                          </td>
                          <td className="quantity-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            <span className="completed-qty">{order.completed_quantity?.toFixed(1) || 0}</span>
                            <span className="total-qty"> / {order.quantity_tons}</span>
                          </td>
                          <td className="progress-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            {getProgressBar(order.progress_percentage)}
                          </td>
                          <td className="priority-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            {getPriorityBadge(order.priority)}
                          </td>
                          <td className="status-cell" onClick={() => handleOrderSelect(order)} style={{ cursor: 'pointer' }}>
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="actions-cell">
                            <div className="order-action-buttons">
                              <button
                                className="btn-order-details"
                                onClick={(e) => { e.stopPropagation(); handleOrderSelect(order); }}
                                title="View order details"
                              >
                                <i className="fas fa-info-circle"></i> Details
                              </button>
                              <button
                                className="btn-order-production"
                                onClick={(e) => { e.stopPropagation(); handleGoToProduction(); }}
                                title="Go to Production"
                              >
                                <i className="fas fa-industry"></i> Production
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expanded Row */}
                        {expandedRows[order.id] && (
                          <tr className="expanded-row">
                            <td colSpan="9">
                              <div className="expanded-content">
                                <div className="buckets-container">
                                  <h4>
                                    <i className="fas fa-layer-group"></i>
                                    Production Buckets
                                  </h4>
                                  {isLoading ? (
                                    <div className="loading-spinner-small">
                                      <i className="fas fa-spinner fa-spin"></i> Loading buckets...
                                    </div>
                                  ) : buckets && buckets.length > 0 ? (
                                    <div className="buckets-list">
                                      {buckets.map((bucket) => (
                                        <div key={bucket.id} className="bucket-item">
                                          <div className="bucket-header">
                                            <div className="bucket-info">
                                              <strong>
                                                <i className="fas fa-cube"></i>
                                                Bucket: {bucket.bucket_number}
                                              </strong>
                                              <span className={`bucket-status ${bucket.status}`}>
                                                {bucket.status?.replace('_', ' ') || 'planned'}
                                              </span>
                                            </div>
                                            <div className="bucket-quantity">
                                              <span className="actual">{bucket.actual_quantity || 0}</span>
                                              <span className="planned"> / {bucket.planned_quantity} tons</span>
                                            </div>
                                            <button
                                              className="btn-view-bucket"
                                              onClick={() => handleGoToBucket()}
                                            >
                                              <i className="fas fa-external-link-alt"></i> View Bucket
                                            </button>
                                          </div>

                                          {/* Heats within this bucket */}
                                          {bucket.heats && bucket.heats.length > 0 && (
                                            <div className="heats-container">
                                              <div className="heats-header">
                                                <i className="fas fa-thermometer-half"></i>
                                                Heats in this bucket ({bucket.heats.length})
                                              </div>
                                              <table className="heats-mini-table">
                                                <thead>
                                                  <tr>
                                                    <th>Heat #</th>
                                                    <th>Weight (tons)</th>
                                                    <th>Status</th>
                                                    <th>Phase</th>
                                                    <th>Actions</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {bucket.heats.map((heat) => (
                                                    <tr key={heat.id}>
                                                      <td>
                                                        <strong>#{heat.heat_number}</strong>
                                                      </td>
                                                      <td>{heat.liquid_weight || 0} tons</td>
                                                      <td>{getHeatStatusBadge(heat.status)}</td>
                                                      <td>
                                                        <span className="phase-badge">{heat.current_phase || 'preparation'}</span>
                                                      </td>
                                                      <td>
                                                        <button
                                                          className="btn-view-heat"
                                                          onClick={() => handleGoToHeat(heat.id)}
                                                        >
                                                          <i className="fas fa-tint"></i> LF Control
                                                        </button>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                          {(!bucket.heats || bucket.heats.length === 0) && (
                                            <div className="no-heats-message">
                                              <i className="fas fa-info-circle"></i>
                                              No heats assigned to this bucket yet.
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="no-buckets">
                                      <i className="fas fa-info-circle"></i>
                                      No buckets found for this order. Create buckets first.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan="9" className="no-data">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && orderDetails && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-shopping-cart"></i>
                Order Details: {orderDetails.order_number}
              </h3>
              <button className="modal-close" onClick={() => setShowOrderDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info-grid">
                <div className="info-group">
                  <label>Order Number:</label>
                  <span><strong>{orderDetails.order_number}</strong></span>
                </div>
                <div className="info-group">
                  <label>Customer:</label>
                  <span>{orderDetails.customer_name}</span>
                </div>
                <div className="info-group">
                  <label>Customer PO:</label>
                  <span>{orderDetails.customer_po || '—'}</span>
                </div>
                <div className="info-group">
                  <label>Steel Grade:</label>
                  <span>{orderDetails.steel_grade_code} - {orderDetails.steel_grade_name}</span>
                </div>
                <div className="info-group">
                  <label>Total Quantity:</label>
                  <span>{orderDetails.quantity_tons} tons</span>
                </div>
                <div className="info-group">
                  <label>Completed Quantity:</label>
                  <span className="success-text">{orderDetails.completed_quantity?.toFixed(1) || 0} tons</span>
                </div>
                <div className="info-group">
                  <label>Remaining Quantity:</label>
                  <span className="warning-text">{orderDetails.remaining_quantity?.toFixed(1) || orderDetails.quantity_tons} tons</span>
                </div>
                <div className="info-group">
                  <label>Number of Heats:</label>
                  <span>{orderDetails.heat_count || 0} heats</span>
                </div>
                <div className="info-group">
                  <label>Completed Heats:</label>
                  <span className="success-text">{orderDetails.completed_heat_count || 0}</span>
                </div>
                <div className="info-group">
                  <label>Progress:</label>
                  <div className="progress-display">
                    <div className="progress-bar-large">
                      <div className="progress-fill" style={{ width: `${orderDetails.progress_percentage}%` }}></div>
                    </div>
                    <span>{orderDetails.progress_percentage}%</span>
                  </div>
                </div>
                <div className="info-group">
                  <label>Priority:</label>
                  <span>{getPriorityBadge(orderDetails.priority)}</span>
                </div>
                <div className="info-group">
                  <label>Status:</label>
                  <span>{getStatusBadge(orderDetails.status)}</span>
                </div>
                <div className="info-group">
                  <label>Required By:</label>
                  <span>{orderDetails.required_by_date ? new Date(orderDetails.required_by_date).toLocaleDateString() : '—'}</span>
                </div>
                <div className="info-group">
                  <label>Created At:</label>
                  <span>{new Date(orderDetails.created_at).toLocaleString()}</span>
                </div>
                <div className="info-group full-width">
                  <label>Temperature Specifications:</label>
                  <div className="temp-specs">
                    <span className="temp-min">Min: {orderDetails.temp_min}°C</span>
                    <span className="temp-target">Target: {orderDetails.temp_target}°C</span>
                    <span className="temp-max">Max: {orderDetails.temp_max}°C</span>
                  </div>
                </div>
                {orderDetails.product_description && (
                  <div className="info-group full-width">
                    <label>Product Description:</label>
                    <p>{orderDetails.product_description}</p>
                  </div>
                )}
                {orderDetails.notes && (
                  <div className="info-group full-width">
                    <label>Notes:</label>
                    <p>{orderDetails.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowOrderDetails(false)}>Close</button>
              <button className="btn-primary" onClick={() => {
                setShowOrderDetails(false);
                handleGoToProduction();
              }}>
                <i className="fas fa-industry"></i> Go to Production
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RecentOrders;