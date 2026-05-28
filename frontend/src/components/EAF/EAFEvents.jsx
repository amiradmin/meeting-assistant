// src/components/EAF/EAFEvents.jsx
import React, { useState, useEffect } from 'react';
import {
  FaList,
  FaCalendarAlt,
  FaUser,
  FaInfoCircle,
  FaBolt,
  FaTruck,
  FaThermometerHalf,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
} from 'react-icons/fa';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/eaf';

const EAFEvents = ({ eafData }) => {
  const { heatData } = eafData;
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(false);

  // Fetch events from various sources
  useEffect(() => {
    if (heatData) {
      fetchEvents();
    }
  }, [heatData]);

  const fetchEvents = async () => {
    if (!heatData?.id) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');

      // Fetch charging records as events
      const chargingResponse = await fetch(`${API_BASE_URL}/heats/${heatData.id}/chargings/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chargingData = chargingResponse.ok ? await chargingResponse.json() : [];

      // Fetch delays as events
      const delaysResponse = await fetch(`${API_BASE_URL}/delays/?heat=${heatData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const delaysData = delaysResponse.ok ? await delaysResponse.json() : [];

      // Build events array
      const eventsList = [];

      // Add heat creation event
      eventsList.push({
        id: `heat_${heatData.id}`,
        type: 'heat_start',
        description: `Heat #${heatData.heat_number} started`,
        time: heatData.created_at,
        user: heatData.operator_name || 'System',
        icon: <FaBolt />
      });

      // Add status change events based on status
      if (heatData.start_time) {
        eventsList.push({
          id: `status_melting`,
          type: 'status_change',
          description: `Melting started`,
          time: heatData.start_time,
          user: heatData.operator_name || 'System',
          icon: <FaThermometerHalf />
        });
      }

      if (heatData.end_time) {
        eventsList.push({
          id: `status_completed`,
          type: 'status_change',
          description: `Heat completed`,
          time: heatData.end_time,
          user: heatData.operator_name || 'System',
          icon: <FaCheckCircle />
        });
      }

      // Add phase change events based on phase_start_time
      if (heatData.phase_start_time && heatData.current_phase) {
        eventsList.push({
          id: `phase_${heatData.current_phase}`,
          type: 'phase_change',
          description: `Phase changed to ${heatData.current_phase.replace('_', ' ')}`,
          time: heatData.phase_start_time,
          user: 'System',
          icon: <FaInfoCircle />
        });
      }

      // Add charging events
      const chargings = chargingData.results || chargingData;
      chargings.forEach((charge) => {
        eventsList.push({
          id: `charge_${charge.id}`,
          type: 'charging',
          description: `${charge.charging_type === 'bucket' ? 'Bucket charging' : 'DRI continuous charging'}: ${charge.material} (${charge.weight} tons)`,
          time: charge.charging_time,
          user: charge.operator_name || 'System',
          icon: <FaTruck />
        });
      });

      // Add delay events
      const delays = delaysData.results || delaysData;
      delays.forEach((delay) => {
        // Add delay start event
        eventsList.push({
          id: `delay_start_${delay.id}`,
          type: 'delay',
          description: `Delay started: ${delay.code} - ${delay.description}`,
          time: delay.start_time,
          user: 'System',
          icon: <FaExclamationTriangle />
        });

        // Add delay end event if completed
        if (delay.end_time) {
          eventsList.push({
            id: `delay_end_${delay.id}`,
            type: 'delay_end',
            description: `Delay ended: ${delay.code} (Duration: ${Math.floor(delay.duration / 60)} min ${delay.duration % 60} sec)`,
            time: delay.end_time,
            user: 'System',
            icon: <FaClock />
          });
        }
      });

      // Sort events by time (newest first)
      eventsList.sort((a, b) => new Date(b.time) - new Date(a.time));

      setEvents(eventsList);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    const icons = {
      heat_start: <FaBolt className="event-icon-heat" />,
      status_change: <FaThermometerHalf className="event-icon-status" />,
      phase_change: <FaInfoCircle className="event-icon-phase" />,
      charging: <FaTruck className="event-icon-charging" />,
      delay: <FaExclamationTriangle className="event-icon-delay" />,
      delay_end: <FaClock className="event-icon-delay-end" />,
    };
    return icons[type] || <FaInfoCircle />;
  };

  const filteredEvents = filter === 'all'
    ? events
    : events.filter(e => e.type === filter);

  if (!heatData) {
    return (
      <div className="card">
        <p>No active heat. Please select a heat.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="eaf-events">
      <div className="card">
        <div className="card-header">
          <h3>
            <FaList />
            Events & Timeline
          </h3>
          <div className="event-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'phase_change' ? 'active' : ''}`}
              onClick={() => setFilter('phase_change')}
            >
              Phase Changes
            </button>
            <button
              className={`filter-btn ${filter === 'charging' ? 'active' : ''}`}
              onClick={() => setFilter('charging')}
            >
              Charging
            </button>
            <button
              className={`filter-btn ${filter === 'delay' ? 'active' : ''}`}
              onClick={() => setFilter('delay')}
            >
              Delays
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="timeline-container">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-marker">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-time">
                      <FaCalendarAlt /> {new Date(event.time).toLocaleString()}
                    </div>
                    <div className="timeline-description">{event.description}</div>
                    <div className="timeline-user">
                      <FaUser /> {event.user || 'System'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-events">
                <FaInfoCircle />
                <p>No events found for this heat</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EAFEvents;