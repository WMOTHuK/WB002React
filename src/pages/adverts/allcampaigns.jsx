import React from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import CRM_Campaigns from '../../features/adverts/CRM_Campaigns';

const AllCampaignsPage = () => (
    <CRM_Campaigns activeOnly={false} />
);

export default AllCampaignsPage;