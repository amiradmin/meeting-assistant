// src/components/LF/LFEvents.jsx
import React, { useState } from 'react';
import {
  FaHistory,
  FaList,
  FaIndustry,
  FaThermometerHalf,
  FaFlask,
  FaCubes,
  FaExclamationTriangle,
  FaPlay,
  FaBolt,
  FaChartLine,
  FaUser,
  FaInbox,
  FaFire,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

const LFEvents = ({ lfData }) => {
  const { heatData } = lfData;
  const [filter, setFilter] = useState('all');

  // رویدادهای نمونه (در حالت واقعی از API می‌آید)
  const [events] = useState([
    { id: 1, time: '08:00:00', type: 'start', category: 'process', description: 'Heat started', user: 'System', icon: 'play', color: '#10b981' },
    { id: 2, time: '08:05:00', type: 'measurement', category: 'measurement', description: 'Temperature measurement: 1560°C', user: 'Operator A', icon: 'thermometer', color: '#f59e0b' },
    { id: 3, time: '08:10:00', type: 'analysis', category: 'quality', description: 'Sample taken - ID: A001', user: 'Laboratory', icon: 'flask', color: '#8b5cf6' },
    { id: 4, time: '08:15:00', type: 'phase', category: 'process', description: 'Phase changed: Heating', user: 'System', icon: 'bolt', color: '#3b82f6' },
    { id: 5, time: '08:20:00', type: 'addition', category: 'material', description: 'FeMn added: 820 kg', user: 'Weighing System', icon: 'cubes', color: '#ec4899' },
    { id: 6, time: '08:25:00', type: 'analysis', category: 'quality', description: 'Analysis completed - C: 0.12%, Mn: 0.58%', user: 'System', icon: 'chart', color: '#8b5cf6' },
    { id: 7, time: '08:30:00', type: 'alarm', category: 'alarm', description: 'Temperature high warning', user: 'System', icon: 'alert', color: '#ef4444' },
    { id: 8, time: '08:35:00', type: 'phase', category: 'process', description: 'Phase changed: Alloying', user: 'System', icon: 'cubes', color: '#3b82f6' },
    { id: 9, time: '08:40:00', type: 'addition', category: 'material', description: 'FeSi added: 410 kg', user: 'Weighing System', icon: 'cubes', color: '#ec4899' },
    { id: 10, time: '08:45:00', type: 'measurement', category: 'measurement', description: 'Temperature measurement: 1585°C', user: 'Operator A', icon: 'thermometer', color: '#f59e0b' }
  ]);

  const getFilteredEvents = () => {
    if (filter === 'all') return events;
    return events.filter(e => e.category === filter);
  };

  // تابع برای دریافت آیکون مناسب بر اساس نام آیکون
  const getEventIcon = (iconName) => {
    switch(iconName) {
      case 'play': return <FaPlay />;
      case 'thermometer': return <FaThermometerHalf />;
      case 'flask': return <FaFlask />;
      case 'bolt': return <FaBolt />;
      case 'cubes': return <FaCubes />;
      case 'chart': return <FaChartLine />;
      case 'alert': return <FaExclamationTriangle />;
      default: return <FaClock />;
    }
  };

  const categories = [
    { id: 'all', name: 'All Events', icon: FaList },
    { id: 'process', name: 'Process', icon: FaIndustry },
    { id: 'measurement', name: 'Measurements', icon: FaThermometerHalf },
    { id: 'quality', name: 'Quality', icon: FaFlask },
    { id: 'material', name: 'Materials', icon: FaCubes },
    { id: 'alarm', name: 'Alarms', icon: FaExclamationTriangle }
  ];

  return (
    <div className="lf-events">
      <div className="card">
        <div className="card-header">
          <h3>
            <FaHistory />
            Heat Events Log
          </h3>
          <div className="event-filters">
            {categories.map(cat => {
              const IconComponent = cat.icon;
              return (
                <button
                  key={cat.id}
                  className={`filter-btn ${filter === cat.id ? 'active' : ''}`}
                  onClick={() => setFilter(cat.id)}
                >
                  <IconComponent />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="timeline-container">
          {getFilteredEvents().map(event => (
            <div key={event.id} className="timeline-item">
              <div className="timeline-marker" style={{ backgroundColor: event.color }}>
                {getEventIcon(event.icon)}
              </div>
              <div className="timeline-content">
                <div className="timeline-time">{event.time}</div>
                <div className="timeline-description">{event.description}</div>
                <div className="timeline-user">
                  <FaUser />
                  {event.user}
                </div>
              </div>
            </div>
          ))}
        </div>

        {getFilteredEvents().length === 0 && (
          <div className="no-events">
            <FaInbox />
            <p>No events found for this category</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LFEvents;