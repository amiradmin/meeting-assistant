// hooks/useEmployeeData.js
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://192.168.150.10:8000/api';

export const useEmployeeData = () => {
  const [employeeData, setEmployeeData] = useState({
    total_employees: 0,
    active_employees: 0,
    inactive_employees: 0,
    roles_breakdown: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/dashboard/employees/summary/`);

        if (!response.ok) {
          throw new Error('Failed to fetch employee data');
        }

        const data = await response.json();
        setEmployeeData({
          ...data,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error fetching employee data:', error);
        setEmployeeData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchEmployeeData();
  }, []);

  return employeeData;
};