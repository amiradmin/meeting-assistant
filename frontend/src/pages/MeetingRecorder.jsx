import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaMicrophone,
  FaStop,
  FaUpload,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaArrowLeft,
  FaFileAudio,
  FaTrash,
  FaPlay,
  FaPause,
  FaSave,
  FaClock,
  FaFileAlt,
  FaRobot,
  FaInfoCircle
} from 'react-icons/fa';
import './MeetingRecorder.css';

const API_BASE_URL = 'http://localhost:8000/api';

const MeetingRecorder = () => {
  const navigate = useNavigate();

  // States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDescription, setMeetingDescription] = useState('');
  const [recentMeetings, setRecentMeetings] = useState([]);
  const [processingId, setProcessingId] = useState(null);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [audioDevices, setAudioDevices] = useState([]);

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioPlayerRef = useRef(null);
  const timerRef = useRef(null);

  // Axios instance with auth
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000,
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

  // Check available audio devices
  const checkAudioDevices = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setMicrophoneAvailable(false);
        return;
      }

      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      setAudioDevices(audioInputs);

      if (audioInputs.length === 0) {
        setMicrophoneAvailable(false);
        setMessage({
          type: 'warning',
          text: 'هیچ میکروفونی در سیستم یافت نشد. لطفاً از گزینه آپلود فایل استفاده کنید.'
        });
      } else {
        setMicrophoneAvailable(true);
      }
    } catch (error) {
      console.error('Error checking audio devices:', error);
      setMicrophoneAvailable(false);
    }
  };

  // Fetch recent meetings
  const fetchRecentMeetings = async () => {
    try {
      const response = await axiosInstance.get('/meetings/');
      setRecentMeetings(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => {
    fetchRecentMeetings();
    checkAudioDevices();

    // Listen for device changes
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', checkAudioDevices);
      return () => {
        navigator.mediaDevices.removeEventListener('devicechange', checkAudioDevices);
      };
    }
  }, []);

  useEffect(() => {
    if (processingId) {
      const interval = setInterval(checkProcessingStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [processingId]);

  // Check processing status
  const checkProcessingStatus = async () => {
    if (!processingId) return;

    try {
      const response = await axiosInstance.get(`/meetings/${processingId}/status/`);
      if (response.data.status === 'completed') {
        setMessage({ type: 'success', text: 'جلسه با موفقیت پردازش شد!' });
        setProcessingId(null);
        fetchRecentMeetings();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else if (response.data.status === 'failed') {
        setMessage({ type: 'error', text: 'خطا در پردازش جلسه' });
        setProcessingId(null);
      }
    } catch (error) {
      console.error('Error checking status:', error);
    }
  };

  // Start recording
  const startRecording = async () => {
    if (!microphoneAvailable) {
      setMessage({
        type: 'error',
        text: 'میکروفونی در دسترس نیست. لطفاً از گزینه آپلود فایل استفاده کنید.'
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      setMessage({ type: 'success', text: 'ضبط شروع شد...' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);

    } catch (error) {
      console.error('Error accessing microphone:', error);

      let errorMessage = 'دسترسی به میکروفون امکان پذیر نیست.';
      if (error.name === 'NotFoundError') {
        errorMessage = 'میکروفونی یافت نشد. لطفاً میکروفون خود را وصل کنید.';
        setMicrophoneAvailable(false);
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'دسترسی به میکروفون مجاز نیست. لطفاً مجوز را در مرورگر فعال کنید.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'میکروفون در حال استفاده توسط برنامه دیگری است.';
      }

      setMessage({ type: 'error', text: errorMessage });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Format time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play/Pause audio
  const togglePlay = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Clear recording
  const clearRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setMeetingTitle('');
    setMeetingDescription('');
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/mp3'];
    const validExtensions = /\.(mp3|wav|m4a|ogg|mp4)$/i;

    if (file && (validTypes.includes(file.type) || validExtensions.test(file.name))) {
      if (file.size > 50 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'حجم فایل نباید بیشتر از 50 مگابایت باشد.' });
        return;
      }

      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioUrl(url);
      setMessage({ type: 'success', text: 'فایل با موفقیت بارگذاری شد' });
      setTimeout(() => setMessage({ type: '', text: '' }), 2000);
    } else {
      setMessage({ type: 'error', text: 'لطفاً یک فایل صوتی معتبر انتخاب کنید (MP3, WAV, M4A, OGG)' });
    }
  };

  // Upload to backend
  const handleUploadToBackend = async () => {
    if (!audioBlob) {
      setMessage({ type: 'error', text: 'هیچ فایل صوتی برای آپلود وجود ندارد' });
      return;
    }

    if (!meetingTitle.trim()) {
      setMessage({ type: 'error', text: 'لطفاً عنوان جلسه را وارد کنید' });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('title', meetingTitle);
    formData.append('description', meetingDescription);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `meeting_${timestamp}.wav`;
    const file = new File([audioBlob], filename, { type: 'audio/wav' });
    formData.append('audio_file', file);

    try {
      const response = await axiosInstance.post('/meetings/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          }
        },
      });

      setMessage({ type: 'success', text: 'فایل با موفقیت آپلود شد. در حال پردازش...' });
      setProcessingId(response.data.id);
      setMeetingTitle('');
      setMeetingDescription('');
      clearRecording();
      fetchRecentMeetings();

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || 'خطا در آپلود فایل. لطفاً مجدداً تلاش کنید.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // View meeting details
  const viewMeetingDetails = (id) => {
    navigate(`/meeting/${id}`);
  };

  return (
    <div className="recorder-container">
      <div className="recorder-header">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>
          <FaArrowLeft /> بازگشت
        </button>
        <h1 className="recorder-title">
          <FaMicrophone /> ضبط و آپلود جلسه
        </h1>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`recorder-message ${message.type}`}>
          {message.type === 'success' ? <FaCheckCircle /> :
           message.type === 'warning' ? <FaInfoCircle /> : <FaExclamationTriangle />}
          {message.text}
        </div>
      )}

      {/* Microphone Warning */}
      {!microphoneAvailable && (
        <div className="mic-warning">
          <FaExclamationTriangle />
          <div>
            <strong>میکروفون یافت نشد!</strong>
            <p>برای ضبط صدا به میکروفون نیاز دارید. می‌توانید از گزینه آپلود فایل استفاده کنید.</p>
          </div>
        </div>
      )}

      <div className="recorder-content">
        {/* Recording Section - فقط در صورت وجود میکروفون نمایش داده شود */}
        {microphoneAvailable && (
          <div className="recording-section">
            <div className="section-title">
              <FaMicrophone /> ضبط مستقیم صدا
            </div>

            <div className="recording-controls">
              {!isRecording ? (
                <button
                  className="btn-record"
                  onClick={startRecording}
                  disabled={uploading}
                >
                  <FaMicrophone /> شروع ضبط
                </button>
              ) : (
                <button
                  className="btn-stop"
                  onClick={stopRecording}
                >
                  <FaStop /> توقف ضبط
                </button>
              )}
            </div>

            {isRecording && (
              <div className="recording-indicator">
                <div className="recording-wave">
                  <span></span><span></span><span></span><span></span><span></span>
                </div>
                <div className="recording-time">
                  <FaClock /> {formatTime(recordingTime)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload Section */}
        <div className="upload-section">
          <div className="section-title">
            <FaUpload /> آپلود فایل صوتی
          </div>

          <label className="upload-area">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              disabled={uploading}
              hidden
            />
            <div className="upload-content">
              <FaFileAudio />
              <p>برای آپلود فایل کلیک کنید</p>
              <small>MP3, WAV, M4A, OGG (حداکثر 50MB)</small>
            </div>
          </label>
        </div>

        {/* Audio Preview */}
        {(audioUrl || audioBlob) && (
          <div className="audio-preview">
            <div className="section-title">
              <FaFileAlt /> پیش‌نمایش فایل
            </div>

            <div className="audio-player">
              <audio
                ref={audioPlayerRef}
                src={audioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <button className="play-btn" onClick={togglePlay}>
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <div className="audio-info">
                <span className="audio-name">
                  {audioBlob.name || `recording_${new Date().getTime()}.wav`}
                </span>
                <span className="audio-size">
                  {audioBlob.size ? `${(audioBlob.size / 1024 / 1024).toFixed(2)} MB` : ''}
                </span>
              </div>
              <button className="clear-btn" onClick={clearRecording} disabled={uploading}>
                <FaTrash />
              </button>
            </div>

            {/* Meeting Info Form */}
            <div className="meeting-info-form">
              <input
                type="text"
                className="meeting-title-input"
                placeholder="عنوان جلسه (اجباری)"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                disabled={uploading}
              />
              <textarea
                className="meeting-desc-input"
                placeholder="توضیحات جلسه (اختیاری)"
                rows="3"
                value={meetingDescription}
                onChange={(e) => setMeetingDescription(e.target.value)}
                disabled={uploading}
              />

              <button
                className="btn-submit"
                onClick={handleUploadToBackend}
                disabled={uploading || !meetingTitle.trim()}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="spin" />
                    در حال آپلود... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <FaSave />
                    ذخیره و پردازش جلسه
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Recent Meetings */}
        {recentMeetings.length > 0 && (
          <div className="recent-meetings">
            <div className="section-title">
              <FaClock /> جلسات اخیر
            </div>

            <div className="meetings-list">
              {recentMeetings.map((meeting) => (
                <div key={meeting.id} className="meeting-item">
                  <div className="meeting-info">
                    <h4>{meeting.title}</h4>
                    <div className="meeting-meta">
                      <span className={`status-badge ${meeting.status}`}>
                        {meeting.status === 'pending' && 'در انتظار'}
                        {meeting.status === 'processing' && 'در حال پردازش'}
                        {meeting.status === 'completed' && 'تکمیل شده'}
                        {meeting.status === 'failed' && 'خطا'}
                      </span>
                      <span className="meeting-date">
                        {new Date(meeting.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn-view"
                    onClick={() => viewMeetingDetails(meeting.id)}
                  >
                    <FaRobot /> مشاهده صورت جلسه
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Processing Modal */}
      {processingId && (
        <div className="processing-overlay">
          <div className="processing-modal">
            <FaSpinner className="spin large" />
            <h3>در حال پردازش جلسه</h3>
            <p>لطفاً منتظر بمانید...</p>
            <small>تبدیل صدا به متن و تولید صورت جلسه</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingRecorder;