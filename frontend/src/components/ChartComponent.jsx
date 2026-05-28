// components/ChartComponent.jsx
import React, { useEffect, useRef } from 'react';

const ChartComponent = ({ id, type, data, options, height = 400 }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && window.Chart) {
      const ctx = chartRef.current.getContext('2d');

      if (!ctx) {
        console.error('Could not get 2D context from canvas');
        return;
      }

      // Destroy existing chart
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Create new chart
      try {
        chartInstance.current = new window.Chart(ctx, {
          type: type,
          data: data,
          options: options
        });
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <canvas
        ref={chartRef}
        id={id}
        width="400"
        height={height}
      />
    </div>
  );
};

export default ChartComponent;