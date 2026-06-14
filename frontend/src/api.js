/**
 * api.js — Express Backend REST API CRUD İşlemleri
 */

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:5001/api'
  : '/api';

async function request(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP hata kodu! Durum: ${response.status}`);
  }
  return response.json();
}

export const api = {
  // GET - All Bottles
  getBottles: async () => {
    return request('/bottles');
  },

  // POST - Create Bottle
  createBottle: async (data) => {
    return request('/bottles', 'POST', data);
  },

  // PUT - Update Bottle
  updateBottle: async (id, data) => {
    return request(`/bottles/${id}`, 'PUT', data);
  },

  // DELETE - Remove Bottle
  deleteBottle: async (id) => {
    return request(`/bottles/${id}`, 'DELETE');
  }
};
