import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRobot,
  FaFileAlt,
  FaList,
  FaClipboardList,
  FaLightbulb,
  FaDownload
} from 'react-icons/fa';
import './MeetingDetails.css';

const API_BASE_URL = 'http://localhost:8000/api';

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(null);

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

  const fetchMeeting = async () => {
    try {
      const response = await axiosInstance.get(`/meetings/${id}/`);
      setMeeting(response.data);

      // If still processing, continue polling
      if (response.data.status === 'processing' ||
          response.data.status === 'transcribing' ||
          response.data.status === 'summarizing') {
        if (!polling) {
          const interval = setInterval(fetchMeeting, 3000);
          setPolling(interval);
        }
      } else if (polling) {
        clearInterval(polling);
        setPolling(null);
      }
    } catch (error) {
      console.error('Error fetching meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();

    return () => {
      if (polling) {
        clearInterval(polling);
      }
    };
  }, [id]);

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

  const downloadContent = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="meeting-details-loading">
        <FaSpinner className="spin" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="meeting-details-error">
        <FaExclamationTriangle />
        <p>جلسه مورد نظر یافت نشد</p>
        <button onClick={() => navigate('/meetings')}>بازگشت به لیست جلسات</button>
      </div>
    );
  }

  const isProcessing = meeting.status === 'processing' ||
                       meeting.status === 'transcribing' ||
                       meeting.status === 'summarizing';

  return (
    <div className="meeting-details-container">
      <div className="meeting-details-header">
        <button className="btn-back" onClick={() => navigate('/meetings')}>
          <FaArrowLeft /> بازگشت
        </button>
        <h1 className="meeting-details-title">
          <FaFileAlt /> {meeting.title}
        </h1>
      </div>

      <div className="meeting-details-content">
        {/* Status Card */}
        <div className="status-card">
          <div className="status-info">
            <span className="status-label">وضعیت:</span>
            <span className={`status-badge ${getStatusClass(meeting.status)}`}>
              {getStatusText(meeting.status)}
            </span>
          </div>
          <div className="date-info">
            تاریخ ثبت: {new Date(meeting.created_at).toLocaleDateString('fa-IR')}
          </div>
        </div>

        {isProcessing && (
          <div className="processing-card">
            <FaSpinner className="spin" />
            <h3>در حال پردازش جلسه</h3>
            <p>لطفاً منتظر بمانید...</p>
            <div className="processing-steps">
              <div className={`step ${meeting.status === 'transcribing' ? 'active' : meeting.status === 'summarizing' ? 'completed' : ''}`}>
                <FaRobot /> تبدیل صدا به متن
              </div>
              <div className={`step ${meeting.status === 'summarizing' ? 'active' : meeting.status === 'completed' ? 'completed' : ''}`}>
                <FaClipboardList /> تولید صورت جلسه
              </div>
            </div>
          </div>
        )}

        {/* Transcription Section */}
        {meeting.transcription && (
          <div className="section-card">
            <div className="section-header">
              <h2><FaList /> متن پیاده شده</h2>
              <button
                className="btn-download"
                onClick={() => downloadContent(meeting.transcription, `${meeting.title}_transcription.txt`)}
              >
                <FaDownload /> دانلود متن
              </button>
            </div>
            <div className="section-content transcription-content">
              <p>{meeting.transcription}</p>
            </div>
          </div>
        )}

        {/* Summary Section */}
        {meeting.summary && (
          <div className="section-card">
            <div className="section-header">
              <h2><FaClipboardList /> خلاصه جلسه</h2>
              <button
                className="btn-download"
                onClick={() => downloadContent(meeting.summary, `${meeting.title}_summary.txt`)}
              >
                <FaDownload /> دانلود خلاصه
              </button>
            </div>
            <div className="section-content summary-content">
              <p>{meeting.summary}</p>
            </div>
          </div>
        )}

        {/* Action Items */}
        {meeting.action_items && meeting.action_items.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <h2><FaCheckCircle /> اقدامات</h2>
            </div>
            <ul className="action-items-list">
              {meeting.action_items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Decisions */}
        {meeting.decisions && meeting.decisions.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <h2><FaLightbulb /> تصمیمات</h2>
            </div>
            <ul className="decisions-list">
              {meeting.decisions.map((decision, index) => (
                <li key={index}>{decision}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Points */}
        {meeting.key_points && meeting.key_points.length > 0 && (
          <div className="section-card">
            <div className="section-header">
              <h2><FaList /> نکات کلیدی</h2>
            </div>
            <ul className="key-points-list">
              {meeting.key_points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
        )}

        {/* If no content yet */}
        {!isProcessing && !meeting.transcription && !meeting.summary && (
          <div className="empty-content-card">
            <FaRobot />
            <p>هنوز خروجی‌ای برای این جلسه تولید نشده است</p>
            <small>پس از اتمام پردازش، صورت جلسه در این صفحه نمایش داده می‌شود</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetails;