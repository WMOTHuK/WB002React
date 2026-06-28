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

export async function fetchMonthlyOH(date, token) {
  const response = await axios.get(`${API}/getmonthlyoh`, {
    params: { date },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function saveMonthlyOH(updates, token) {
  const response = await axios.post(`${API}/savemonthlyoh`, {
    updates
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function updateWBReportsList(dateFrom, dateTo, token) {
  const response = await axios.post(`${API}/updatewbreportslist`, {
    dateFrom,
    dateTo,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchWBReportsList(token) {
  const response = await axios.get(`${API}/getwbreportslist`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchWBReportDetails(reportId, token) {
  const response = await axios.post(`${API}/getwbfireportdetailsbyid`, {
    report_id: reportId,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchWBReportSummary(limit, token) {
  const response = await axios.get(`${API}/getwbfireportsummary`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function calculateWBReport(reportId, token) {
  const response = await axios.post(`${API}/calculatewbreport`, {
    reportId,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchWBReportProducts(limit, token) {
  const response = await axios.get(`${API}/getwbfireportproductsummary`, {
    params: { limit },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}