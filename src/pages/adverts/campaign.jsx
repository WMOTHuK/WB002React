// src/pages/adverts/campaign.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/ui/Modal';
import { UserContext } from '../../context/context';
import { fetchActiveCompaigns, updateCRMFromWB, fetchCardsForCampaign } from '../../services/api/advertService';
import { fetchGoodsGroups } from '../../services/api/goodsService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import { buttonColumns } from '../../config/columnPresets';
import { sortGroupedData, createGroupSeparator } from '../../utils/sortAndGroup';
import styles from '../../styles/styles.module.css';

const CRM_Campaigns = () => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Модалка с карточками
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [cardsData, setCardsData] = useState([]);
  const [cardsColumns, setCardsColumns] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const handleShowCards = async (row) => {
    setModalTitle(`Карточки кампании: ${row.campaign_name || row.advertid}`);
    setModalOpen(true);
    setCardsLoading(true);

    try {
      const cards = await fetchCardsForCampaign(row.advertid, token);

      // Сортируем
      const sorted = sortGroupedData(cards);
      setCardsData(sorted);

      if (sorted.length > 0) {
        const keys = getTableKeys(sorted);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({ keys, translations, mode: 'edit', onChange: handleCardChange, });
        setCardsColumns(cols);
      }
    } catch (err) {
      console.error('Ошибка загрузки карточек:', err);
    } finally {
      setCardsLoading(false);
    }
  };

  const handleCardChange = (field, value, row) => {
    setCardsData(prev =>
      prev.map(item =>
        item.nmid === row.nmid ? { ...item, [field]: value } : item
      )
    );
  };

  // Переопределяем _cards колонку с onClick
  const buildColumnsWithActions = (baseColumns) => {
    return baseColumns.map(col => {
      if (col.accessorKey === '_cards') {
        return {
          ...col,
          cellRender: (_, row) => (
            <button
              className={styles.centeredButton}
              style={{ padding: '2px 8px', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowCards(row);
              }}
            >
              {buttonColumns._cards.label}
            </button>
          ),
        };
      }
      return col;
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      await updateCRMFromWB(token);
      const campaigns = await fetchActiveCompaigns(token);
      setData(campaigns);

      if (campaigns.length > 0) {
        const allKeys = [...getTableKeys(campaigns), '_groups', '_cards'];
        const translations = await getTableLocale(allKeys, locale, token);
        const cols = buildTableConfig({ keys: allKeys, translations, mode: 'view' });
        const colsWithActions = buildColumnsWithActions(cols);
        setColumns(colsWithActions);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return (
    <WideWidget title="Рекламные кампании">
      <div className={styles.contentCentered}>Загрузка...</div>
    </WideWidget>
  );

  return (
    <WideWidget title="Рекламные кампании">
      <div className={styles.contentCentered}>
        {error && <div className={styles.error}>Ошибка: {error}</div>}

        {data.length > 0 ? (
          <DataTable data={data} columns={columns} />
        ) : (
          !error && <p>Нет активных рекламных кампаний</p>
        )}
      </div>

      {modalOpen && (
        <Modal title={modalTitle} onClose={() => setModalOpen(false)}>
          {cardsLoading ? (
            <div>Загрузка...</div>
          ) : cardsData.length > 0 ? (
            <DataTable
              data={cardsData}
              columns={cardsColumns}
              renderRowBefore={createGroupSeparator(
                [
                  { key: 'goods_type_name' },
                  { key: 'goods_grp_name' },
                ],
                cardsColumns.length
              )}
            />
          ) : (
            <p>Нет карточек для этой кампании</p>
          )}
        </Modal>
      )}
    </WideWidget>
  );
};

export default CRM_Campaigns;