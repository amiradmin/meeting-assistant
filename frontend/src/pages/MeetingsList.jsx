import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaMicrophone,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaRobot,
  FaClock,
  FaSearch,
  FaFilter,
  FaFileAlt
} from 'react-icons/fa';
import './MeetingsList.css';

const API_BASE_URL = 'http://localhost:8000/api';

const MeetingsList = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
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

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/meetings/');
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter(meeting => {
    const matchesSearch = meeting.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'در انتظار',
      'processing': 'در حال پردازش',
      'transcribing': 'در حال تبدیل به متن',
      'summarizing': 'در حال خلاصه‌سازی',
      'completed': 'تکمیل شده',
      'failed': 'خطا'
    };
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    if (status === 'completed') return 'status-completed';
    if (status === 'failed') return 'status-failed';
    if (status === 'processing' || status === 'transcribing' || status === 'summarizing') return 'status-processing';
    return 'status-pending';
  };

  return (
    <div className="meetings-list-container">
      <div className="meetings-list-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> بازگشت
        </button>
        <h1 className="meetings-list-title">
          <FaFileAlt /> لیست جلسات
        </h1>
        <button className="btn-new-meeting" onClick={() => navigate('/meetings/recorder')}>
          <FaMicrophone /> جلسه جدید
        </button>
      </div>

      <div className="meetings-list-filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="جستجوی جلسات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <FaFilter />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">همه</option>
            <option value="completed">تکمیل شده</option>
            <option value="processing">در حال پردازش</option>
            <option value="pending">در انتظار</option>
            <option value="failed">خطا</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <FaSpinner className="spin" />
          <p>در حال بارگذاری جلسات...</p>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="empty-state">
          <FaFileAlt />
          <p>هیچ جلسه‌ای یافت نشد</p>
          <button onClick={() => navigate('/meetings/recorder')}>
            ثبت جلسه جدید
          </button>
        </div>
      ) : (
        <div className="meetings-list-grid">
          {filteredMeetings.map((meeting) => (
            <div key={meeting.id} className="meeting-card" onClick={() => navigate(`/meeting/${meeting.id}`)}>
              <div className="meeting-card-header">
                <h3>{meeting.title}</h3>
                <span className={`meeting-status ${getStatusClass(meeting.status)}`}>
                  {getStatusText(meeting.status)}
                </span>
              </div>

              {meeting.description && (
                <p className="meeting-description">{meeting.description}</p>
              )}

              <div className="meeting-card-footer">
                <div className="meeting-date">
                  <FaClock />
                  {new Date(meeting.created_at).toLocaleDateString('fa-IR')}
                </div>
                {meeting.status === 'completed' && (
                  <div className="meeting-actions">
                    <FaRobot /> مشاهده صورت جلسه
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingsList;