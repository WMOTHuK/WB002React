import React, { useState, useEffect, useContext, useMemo, useRef} from 'react';
import WideWidget from '../../components/ui/widewidget/WideWidget';
import DataTable from '../../components/table/DataTable';
import Modal from '../../components/ui/Modal';
import { UserContext } from '../../context/context';
import { fetchCompaigns, updateCRMFromWB, fetchCardsForCampaign, 
        syncCampaignSubCards, fetchCampaignCards, fetchGoodsGroupsWithTypes,
        linkGroupToCampaign, updateCRMCampaignsCosts, fetchCostsByAdvertId  } from '../../services/api/advertService';
import { fetchGoodsGroups } from '../../services/api/goodsService';
import { getTableKeys } from '../../utils/tableHelpers';
import { getTableLocale } from '../../services/api/tableService';
import { buildTableConfig } from '../../utils/buildTableConfig';
import { buttonColumns } from '../../config/columnPresets';
import { sortGroupedData, createGroupSeparator } from '../../utils/sortAndGroup';
import SyncByDateForm from '../../components/ui/SyncByDateForm';
import styles from '../../styles/styles.module.css';

const CRM_Campaigns = ({ activeOnly = true }) => {
  const userdata = useContext(UserContext);
  const token = userdata.userData?.userInfo?.token;
  const locale = userdata.userData?.locale || 'RU';

  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCampaignId, setCurrentCampaignId] = useState(null);

  // Referencies  
  const campaignIdRef = useRef(null);

  // Modal with cards
  const [modalSource, setModalSource] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [cardsData, setCardsData] = useState([]);
  const [cardsColumns, setCardsColumns] = useState([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  // Modal with groups
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupModalTitle, setGroupModalTitle] = useState('');
  const [groupsData, setGroupsData] = useState([]);
  const [groupsColumns, setGroupsColumns] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Modal with costs
  const [costsModalOpen, setCostsModalOpen] = useState(false);
  const [costsModalTitle, setCostsModalTitle] = useState('');
  const [costsData, setCostsData] = useState([]);
  const [costsColumns, setCostsColumns] = useState([]);
  const [costsLoading, setCostsLoading] = useState(false);


  const handleShowCards = async (row, source) => {
    campaignIdRef.current = row.advertid;
    setModalSource(source);
    setModalTitle(`Карточки кампании: ${row.campaign_name || row.advertid}`);
    setModalOpen(true);
    setCardsLoading(true);

    try {
      const cards = source === 'cards'
        ? await fetchCampaignCards(row.advertid, token)
        : await fetchCardsForCampaign(row.advertid, token);

      const sorted = sortGroupedData(cards);
      setCardsData(sorted);

      if (sorted.length > 0) {
        const keys = getTableKeys(sorted);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({
          keys,
          translations,
          mode: 'edit',
          onChange: (field, value, row) => {
            if (field === 'has_link') {
              handleHasLinkChange(value, row);
            }
          },
        });
        setCardsColumns(cols);
      }
    } catch (err) {
      console.error('Ошибка загрузки карточек:', err);
    } finally {
      setCardsLoading(false);
    }
  };


  const handleShowGroups = async (row) => {
    campaignIdRef.current = row.advertid;
    setGroupModalTitle(`Привязка группы к кампании: ${row.campaign_name || row.advertid}`);
    setGroupModalOpen(true);
    setGroupsLoading(true);

    try {
      const groups = await fetchGoodsGroupsWithTypes(token);
      const enriched = groups.map(g => ({
        ...g,
        _linked: false, 
      }));

      // Сортируем по типу → группе
      const sorted = sortGroupedData(enriched, [
        { key: 'goods_type_name', type: 'string' },
        { key: 'goods_grp_name', type: 'string' },
      ]);
      setGroupsData(sorted);

      if (sorted.length > 0) {
        const keys = getTableKeys(sorted);
        const translations = await getTableLocale(keys, locale, token);

        const cols = buildTableConfig({
          keys: getTableKeys(sorted),  // ← уже содержит _linked
          translations,
          mode: 'edit',
          onChange: (field, value, row) => {
            if (field === '_linked') {
              handleGroupToggle(value, row);
            }
          },
        });

        setGroupsColumns(cols);
      }
    } catch (err) {
      console.error('Ошибка загрузки групп:', err);
    } finally {
      setGroupsLoading(false);
    }
  };

  const handleShowCosts = async (row) => {
    setCostsModalTitle(`Затраты кампании: ${row.campaign_name || row.advertid}`);
    setCostsModalOpen(true);
    setCostsLoading(true);

    try {
      const costs = await fetchCostsByAdvertId(row.advertid, token);
      setCostsData(costs);

      if (costs.length > 0) {
        const keys = getTableKeys(costs);
        const translations = await getTableLocale(keys, locale, token);
        const cols = buildTableConfig({ keys, translations, mode: 'view' });
        setCostsColumns(cols);
      }
    } catch (err) {
      console.error('Ошибка загрузки затрат:', err);
    } finally {
      setCostsLoading(false);
    }
  };

  const handleGroupToggle = async (checked, groupRow) => {
    if (!checked) return; // Снятие чекбокса не делаем

    const advertid = campaignIdRef.current;
    const goods_grp_id = groupRow.goods_grp_id;

    // 1. Оптимистично обновляем UI — ставим галочку
    setGroupsData(prev =>
      prev.map(item =>
        item.goods_grp_id === goods_grp_id ? { ...item, _linked: true } : item
      )
    );

    // 2. Отправляем на сервер
    try {
      await linkGroupToCampaign(advertid, goods_grp_id, token);
      // Успех — галочка остаётся
    } catch (err) {
      // 3. Откат
      setGroupsData(prev =>
        prev.map(item =>
          item.goods_grp_id === goods_grp_id ? { ...item, _linked: false } : item
        )
      );
      console.error('Ошибка привязки группы:', err);
    }
  };

  const handleHasLinkChange = async (value, row) => {
    setCardsData(prev =>
      prev.map(item =>
        item.nmid === row.nmid ? { ...item, has_link: value } : item
      )
    );

    try {
      await syncCampaignSubCards(campaignIdRef.current, [{  // ← берём из ref
        vendorcode: row.vendorcode,
        has_link: value,
      }], token);
    } catch (err) {
      setCardsData(prev =>
        prev.map(item =>
          item.nmid === row.nmid ? { ...item, has_link: !value } : item
        )
      );
    }
  };

  // Переопределяем _cards колонку с onClick
  const buildColumnsWithActions = (baseColumns) => {
    return baseColumns.map(col => {
      if (col.accessorKey === '_costs') {
        return {
          ...col,
          cellRender: (_, row) => (
            <button
              className={styles.centeredButton}
              style={{ padding: '2px 8px', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowCosts(row);
              }}
            >
              Затраты
            </button>
          ),
        };
      }
      if (col.accessorKey === '_cards') {
        return {
          ...col,
          cellRender: (_, row) => (
            <button
              className={styles.centeredButton}
              style={{ padding: '2px 8px', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowCards(row, 'subCards');
              }}
            >
              {buttonColumns._cards.label}
            </button>
          ),
        };
      }
      if (col.accessorKey === '_groups') {
        return {
          ...col,
          cellRender: (_, row) => (
            <button
              className={styles.centeredButton}
              style={{ padding: '2px 8px', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowGroups(row);
              }}
            >
              {buttonColumns._groups.label}
            </button>
          ),
        };
      }
      if (col.accessorKey === 'cards') {
        return {
          ...col,
          cellRender: (_, row) => (
            <button
              className={styles.centeredButton}
              style={{ padding: '2px 8px', fontSize: 13 }}
              onClick={(e) => {
                e.stopPropagation();
                handleShowCards(row, 'cards');
              }}
            >
              {buttonColumns.cards.label}
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
      const campaigns = await fetchCompaigns(token, activeOnly);
      setData(campaigns);

      if (campaigns.length > 0) {
        const allKeys = [...getTableKeys(campaigns), '_costs', 'cards', '_groups', '_cards' ];
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
      <SyncByDateForm
        label="Получить с серверов WB затраты по компаниям за период с"
        apiFn={updateCRMCampaignsCosts}
        token={token}
      />

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

      {groupModalOpen && (
        <Modal title={groupModalTitle} onClose={() => setGroupModalOpen(false)}>
          {groupsLoading ? (
            <div>Загрузка...</div>
          ) : groupsData.length > 0 ? (
            <DataTable
              data={groupsData}
              columns={groupsColumns}
              renderRowBefore={createGroupSeparator(
                [{ key: 'goods_type_name', label: 'Тип' }],
                groupsColumns.length
              )}
            />
          ) : (
            <p>Нет доступных групп</p>
          )}
        </Modal>
      )}
      {costsModalOpen && (
        <Modal title={costsModalTitle} onClose={() => setCostsModalOpen(false)}>
          {costsLoading ? (
            <div>Загрузка...</div>
          ) : costsData.length > 0 ? (
            <DataTable data={costsData} columns={costsColumns} />
          ) : (
            <p>Нет данных о затратах</p>
          )}
        </Modal>
      )}
      </div>
    </WideWidget>
  );
};

export default CRM_Campaigns;