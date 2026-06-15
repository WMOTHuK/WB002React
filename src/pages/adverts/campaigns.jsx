// src/pages/adverts/campaign.jsx
import React from 'react';
import CRM_Campaigns from '../../features/adverts/CRM_Campaigns';
import WideWidget from '../../components/ui/widewidget/WideWidget';


const CampaignPage = () => (
    <CRM_Campaigns activeOnly={true} />
);

export default CampaignPage;