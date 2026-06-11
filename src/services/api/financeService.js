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

export async function addOverheadType({ name, description, oh_grp_id, locale,  }, token) {
  const response = await axios.post(`${API}/addohtype`, {
    name,
    description,
    locale,
    oh_grp_id
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchOverheadGroups(locale, token) {
  const response = await axios.get(`${API}/getohgroups`, {
    params: { locale },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function addOverheadGroup({ name, description, locale }, token) {
  const response = await axios.post(`${API}/addohgroup`, {
    name,
    description,
    locale
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function changeOverheadTypeGroup({ id, oh_grp_id }, token) {
  const response = await axios.post(`${API}/changeohtypegroup`, {
    id,
    oh_grp_id
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchMonthlyOH({ user_id, date }, token) {
  const response = await axios.get(`${API}/getmonthlyoh`, {
    params: { user_id, date },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}