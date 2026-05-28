// components/Chart.jsx
import React, { useEffect, useRef } from 'react';

const ChartComponent = ({ id, type, data, options, height = 400 }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Wait for the canvas element to be available
    if (!canvasRef.current || !window.Chart) {
      return;
    }

    const initializeChart = () => {
      try {
        const ctx = canvasRef.current.getContext('2d');

        if (!ctx) {
          console.error('Could not get 2D context');
          return;
        }

        // Destroy previous chart if it exists
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // Create new chart
        chartInstance.current = new window.Chart(ctx, {
          type: type,
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            ...options
          }
        });
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializeChart, 100);

    return () => {
      clearTimeout(timer);
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options, id]);

  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <canvas
        ref={canvasRef}
        id={id}
        width="400"
        height={height}
      />
    </div>
  );
};

// Pre-configured chart components for the dashboard
export const MyChart2 = () => {
  const data = {
    labels: ['قرمز', 'سبز', 'زرد', 'خاکستری', 'آبی'],
    datasets: [{
      label: 'تعداد رأی',
      data: [6, 8, 5, 2, 3],
      backgroundColor: [
        '#ff6384',
        '#4bc0c0',
        '#ffcd56',
        '#c9cbcf',
        '#36a2eb',
      ]
    }]
  };

  return <ChartComponent id="myChart2" type="polarArea" data={data} options={{}} height={300} />;
};

export const MyChart4 = () => {
  const data = {
    labels: ['قرمز', 'سبز', 'زرد', 'خاکستری', 'آبی'],
    datasets: [{
      label: 'تعداد رأی',
      data: [6, 8, 5, 2, 3],
      backgroundColor: [
        '#ff6384',
        '#4bc0c0',
        '#ffcd56',
        '#c9cbcf',
        '#36a2eb',
      ]
    }]
  };

  return <ChartComponent id="myChart4" type="doughnut" data={data} options={{}} height={250} />;
};

export const MyChart5 = () => {
  const data = {
    labels: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'],
    datasets: [{
      label: 'داده‌های میله‌ای',
      data: [6, 8, 5, 2, 3, 10],
      backgroundColor: '#36a2eb',
      type: 'bar'
    }, {
      label: 'داده‌های خطی',
      data: [8, 12, 6, 3, 5, 12],
      borderColor: '#ff6384',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      type: 'line',
      fill: true
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <ChartComponent id="myChart5" type="bar" data={data} options={options} height={300} />;
};

export default ChartComponent;