// src/components/Production/ProductionHeats.jsx
import React, { useState, useEffect } from 'react';
import {
  FaThermometerHalf,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaPlus,
  FaSpinner,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaPlay,
  FaPause,
  FaChartLine,
  FaIndustry,
  FaCalendarAlt,
  FaUser,
  FaTint,
  FaClock
} from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api/lf';
const PRODUCTION_API_URL = 'http://localhost:8000/api/production';

const ProductionHeats = () => {
  const navigate = useNavigate();
  const [heats, setHeats] = useState([]);
  const [filteredHeats, setFilteredHeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [buckets, setBuckets] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHeat, setSelectedHeat] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [bucketFilter, setBucketFilter] = useState('');

  // Axios instances with auth
  const axiosLfInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
  });

  const axiosProdInstance = axios.create({
    baseURL: PRODUCTION_API_URL,
    timeout: 30000,
  });

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

  axiosProdInstance.interceptors.request.use(
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
    fetchHeats();
    fetchOrders();
    fetchBuckets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [heats, searchTerm, statusFilter, orderFilter, bucketFilter]);

  const fetchHeats = async () => {
    setLoading(true);
    try {
      const response = await axiosLfInstance.get('/heats/?ordering=-heat_number');
      const heatsData = response.data.results || response.data;

      // Enrich heats with bucket and order information
      const enrichedHeats = await Promise.all(heatsData.map(async (heat) => {
        if (heat.bucket) {
          try {
            // Fetch bucket details
            const bucketResponse = await axiosProdInstance.get(`/buckets/${heat.bucket}/`);
            const bucketData = bucketResponse.data;

            // Fetch order details
            if (bucketData.order) {
              const orderResponse = await axiosProdInstance.get(`/orders/${bucketData.order}/`);
              return {
                ...heat,
                bucket: bucketData,
                order: orderResponse.data
              };
            }
            return {
              ...heat,
              bucket: bucketData
            };
          } catch (e) {
            console.error('Error fetching bucket/order details:', e);
          }
        }
        return heat;
      }));

      setHeats(enrichedHeats);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axiosProdInstance.get('/orders/');
      setOrders(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const fetchBuckets = async () => {
    try {
      const response = await axiosProdInstance.get('/buckets/');
      setBuckets(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching buckets:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...heats];

    if (searchTerm) {
      filtered = filtered.filter(heat =>
        heat.heat_number?.toString().includes(searchTerm) ||
        heat.steel_grade_detail?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        heat.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        heat.bucket?.bucket_number?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(heat => heat.status === statusFilter);
    }

    if (orderFilter) {
      filtered = filtered.filter(heat => heat.order?.id === parseInt(orderFilter));
    }

    if (bucketFilter) {
      filtered = filtered.filter(heat => heat.bucket?.id === parseInt(bucketFilter));
    }

    setFilteredHeats(filtered);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="badge-pending"><FaClock /> Pending</span>,
      running: <span className="badge-running"><FaPlay /> Running</span>,
      completed: <span className="badge-success"><FaCheckCircle /> Completed</span>,
      cancelled: <span className="badge-danger"><FaTimesCircle /> Cancelled</span>,
      ready_to_tap: <span className="badge-info"><FaCheckCircle /> Ready to Tap</span>
    };
    return badges[status] || badges.pending;
  };

  const getPhaseBadge = (phase) => {
    const phases = {
      preparation: <span className="phase-preparation">Preparation</span>,
      ladle_arrival: <span className="phase-ladle">Ladle Arrival</span>,
      heating: <span className="phase-heating">Heating</span>,
      alloying: <span className="phase-alloying">Alloying</span>,
      trimming: <span className="phase-trimming">Trimming</span>,
      holding: <span className="phase-holding">Holding</span>,
      tapping: <span className="phase-tapping">Tapping</span>
    };
    return phases[phase] || phase;
  };

  const handleViewHeat = (heat) => {
    setSelectedHeat(heat);
    setShowViewModal(true);
  };

  const handleGoToLFControl = (heat) => {
    navigate(`/lf/monitoring?heatId=${heat.id}`);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <FaSpinner className="spin" />
        <p>Loading heats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-card">
        <FaExclamationTriangle />
        <h3>Error Loading Heats</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchHeats}>
          <FaSyncAlt /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="production-heats-page">
      <div className="page-header">
        <h2>
          <FaThermometerHalf />
          Production Heats
        </h2>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchHeats}>
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
              placeholder="Search by heat number, steel grade, order, bucket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="ready_to_tap">Ready to Tap</option>
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
            <label>Bucket</label>
            <select value={bucketFilter} onChange={(e) => setBucketFilter(e.target.value)}>
              <option value="">All Buckets</option>
              {buckets.map(bucket => (
                <option key={bucket.id} value={bucket.id}>
                  {bucket.bucket_number} - {bucket.order?.order_number}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <button className="btn-clear-filters" onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setOrderFilter('');
              setBucketFilter('');
            }}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Heats Table */}
      <div className="heats-table-card">
        <div className="table-responsive">
          <table className="heats-table">
            <thead>
              <tr>
                <th>Heat #</th>
                <th>Order</th>
                <th>Bucket</th>
                <th>Steel Grade</th>
                <th>Weight (tons)</th>
                <th>Temperature</th>
                <th>Phase</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHeats.map((heat) => (
                <tr key={heat.id}>
                  <td className="heat-number-cell">
                    <strong>#{heat.heat_number}</strong>
                    <button
                      className="btn-view-heat"
                      onClick={() => handleViewHeat(heat)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                  </td>
                  <td className="order-cell">
                    {heat.order?.order_number || '—'}
                    {heat.order?.order_number && (
                      <small className="order-customer">{heat.order?.customer_name}</small>
                    )}
                  </td>
                  <td className="bucket-cell">
                    {heat.bucket?.bucket_number || '—'}
                    {heat.bucket?.bucket_number && (
                      <small className="bucket-sequence">Seq: {heat.bucket?.bucket_sequence}</small>
                    )}
                  </td>
                  <td className="grade-cell">
                    <strong>{heat.steel_grade_detail?.code || heat.steel_grade}</strong>
                    <small>{heat.steel_grade_detail?.name}</small>
                  </td>
                  <td className="weight-cell">
                    <span className="weight-value">{heat.liquid_weight || 0}</span>
                    <span className="weight-unit"> tons</span>
                    {heat.target_liquid_weight && (
                      <small className="target-weight">/ {heat.target_liquid_weight}</small>
                    )}
                  </td>
                  <td className="temp-cell">
                    <div className="temp-info">
                      <span className={`temp-value ${heat.last_temperature?.temperature > (heat.temp_max || 1620) ? 'temp-high' : heat.last_temperature?.temperature < (heat.temp_min || 1580) ? 'temp-low' : 'temp-ok'}`}>
                        {heat.last_temperature?.temperature || '—'}°C
                      </span>
                      {heat.temp_target && (
                        <small>Target: {heat.temp_target}°C</small>
                      )}
                    </div>
                  </td>
                  <td className="phase-cell">
                    {getPhaseBadge(heat.current_phase)}
                  </td>
                  <td className="status-cell">
                    {getStatusBadge(heat.status)}
                  </td>
                  <td className="action-buttons">
                    <div className="actions-group">
                      <button
                        className="btn-lf-control"
                        onClick={() => handleGoToLFControl(heat)}
                        title="Go to LF Control"
                      >
                        <FaTint /> LF Control
                      </button>
                      {heat.status === 'running' && (
                        <button
                          className="btn-monitor"
                          onClick={() => handleViewHeat(heat)}
                          title="Monitor"
                        >
                          <FaChartLine /> Monitor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredHeats.length === 0 && (
                <tr>
                  <td colSpan="9" className="no-data">
                    No heats found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Heat Modal */}
      {showViewModal && selectedHeat && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><FaEye /> Heat Details: #{selectedHeat.heat_number}</h3>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>
                <FaTimesCircle />
              </button>
            </div>
            <div className="modal-body">
              <div className="heat-details-grid">
                <div className="detail-group">
                  <label>Heat Number:</label>
                  <span><strong>#{selectedHeat.heat_number}</strong></span>
                </div>
                <div className="detail-group">
                  <label>Steel Grade:</label>
                  <span>{selectedHeat.steel_grade_detail?.code} - {selectedHeat.steel_grade_detail?.name}</span>
                </div>
                <div className="detail-group">
                  <label>Order:</label>
                  <span>{selectedHeat.order?.order_number || '—'}</span>
                </div>
                <div className="detail-group">
                  <label>Bucket:</label>
                  <span>{selectedHeat.bucket?.bucket_number || '—'}</span>
                </div>
                <div className="detail-group">
                  <label>Liquid Weight:</label>
                  <span>{selectedHeat.liquid_weight || 0} tons</span>
                </div>
                <div className="detail-group">
                  <label>Target Weight:</label>
                  <span>{selectedHeat.target_liquid_weight || 0} tons</span>
                </div>
                <div className="detail-group">
                  <label>Temperature Target:</label>
                  <span>{selectedHeat.temp_target || '—'}°C</span>
                  <small>Min: {selectedHeat.temp_min || '—'}°C / Max: {selectedHeat.temp_max || '—'}°C</small>
                </div>
                <div className="detail-group">
                  <label>Last Temperature:</label>
                  <span>{selectedHeat.last_temperature?.temperature || '—'}°C</span>
                </div>
                <div className="detail-group">
                  <label>Current Phase:</label>
                  <span>{getPhaseBadge(selectedHeat.current_phase)}</span>
                </div>
                <div className="detail-group">
                  <label>Status:</label>
                  <span>{getStatusBadge(selectedHeat.status)}</span>
                </div>
                <div className="detail-group">
                  <label>Start Time:</label>
                  <span>{selectedHeat.start_time ? new Date(selectedHeat.start_time).toLocaleString() : '—'}</span>
                </div>
                <div className="detail-group">
                  <label>End Time:</label>
                  <span>{selectedHeat.end_time ? new Date(selectedHeat.end_time).toLocaleString() : '—'}</span>
                </div>
                <div className="detail-group">
                  <label>Operator:</label>
                  <span>{selectedHeat.operator_name || '—'}</span>
                </div>
                <div className="detail-group">
                  <label>Shift:</label>
                  <span>{selectedHeat.shift_id || '—'}</span>
                </div>
                <div className="detail-group">
                  <label>Heating Power:</label>
                  <span>{selectedHeat.heating_power || '—'} MW</span>
                </div>
                <div className="detail-group">
                  <label>Argon Flow:</label>
                  <span>{selectedHeat.argon_flow || '—'} L/min</span>
                </div>
                <div className="detail-group full-width">
                  <label>Notes:</label>
                  <p>{selectedHeat.notes || '—'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
              <button className="btn-primary" onClick={() => {
                setShowViewModal(false);
                handleGoToLFControl(selectedHeat);
              }}>
                <FaTint /> Go to LF Control
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionHeats;