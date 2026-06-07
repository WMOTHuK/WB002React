// src/services/api/financeService.js
import axios from 'axios';

const API = '/api/fi';

export async function fetchOverheadTypes(locale, token) {
  const response = await axios.get(`${API}/getohtypes`, {
    params: { locale },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function addOverheadType({ name, description, locale }, token) {
  const response = await axios.post(`${API}/addohtype`, {
    name,
    description,
    locale
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}