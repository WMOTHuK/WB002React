// src/services/api/advertService.js
import axios from 'axios';

const CRM_API = '/api/CRM';

export async function updateCRMFromWB(token) {
  const response = await axios.get(`${CRM_API}/updatecrmfromwb`,{
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchActiveCompaigns(token) {
  const response = await axios.get(`${CRM_API}/getactivecompaigns`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchCardsForCampaign(campaignId, token) {
  const response = await axios.get(`${CRM_API}/getallcardsforcampaign`, {
    params: { campaign_id: campaignId },
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function syncCampaignSubCards(advertid, cards, token) {
  const response = await axios.post(`${CRM_API}/synccampaignsubcards`, {
    advertid,
    cards,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}
