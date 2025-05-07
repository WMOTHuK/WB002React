import React from 'react';
import WideWidget from '../Vidgets/WideWidget';
import CRM_Headers from './CRM_headers';

const CRM_campaigns = () => (
  <WideWidget title="Рекламные кампании">
    {/* Можно добавить уникальный контент между тегами */}
  {/*  <p>Статистика по кампаниям</p> */}
    <CRM_Headers />
  </WideWidget> 
);

export default CRM_campaigns;