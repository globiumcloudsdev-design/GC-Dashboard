// src/services/agentPayrollService.js
import api from '@/lib/api';

export const agentPayrollService = {
  // Get all payroll records for the logged-in agent (history)
  getMyPayrolls: async (params = {}) => {
    try {
      const response = await api.get('/payroll/my', { params });
      return response.data;
    } catch (error) {
      console.error("❌ Fetch My Payrolls Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Generate or Preview payroll for a specific month
  generateMyPayroll: async (month, year) => {
    try {
      const response = await api.post('/payroll/my/generate', { month, year });
      return response.data;
    } catch (error) {
      console.error("❌ Generate Payroll Error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get details of a specific payroll
  getPayrollById: async (id) => {
    try {
      const response = await api.get(`/payroll/my/${id}`);
      return response.data;
    } catch (error) {
      console.error("❌ Fetch Payroll Detail Error:", error.response?.data || error.message);
      throw error;
    }
  }
};
