import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const saveContractAcceptance = async (data) => {
  try {
    const response = await axios.post(`${API_URL}/contract/accept`, data);
    return response.data;
  } catch (error) {
    console.error('Error saving contract acceptance:', error);
    throw error;
  }
}; 