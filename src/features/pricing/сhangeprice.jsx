// src/features/pricing/Changeprice.jsx
import React, { useState, useEffect, useContext } from 'react';
import styles from '../../styles/styles.module.css';
import '../../styles/App.css';
import { getTableFromDB, getTableLocale, sendDataToBackend } from '../../services/api/tableService';
import { fetchWBdata } from '../../services/api/wbservice';
import { downloadGoodsData, enrichWithGoodsData } from '../../services/api/goodsservice';
import EditableTable from '../../components/table/EditableTable';
import { UserContext } from '../../context/context';
import { getTableKeys } from '../../utils/tableHelpers';

const renderInputFields = ['dayprice', 'daydisc', 'nightprice', 'nightdisc'];
const rendercheckboxfields = ['active'];

function Changeprice() {
    const [status, setStatus] = useState([]);
    const [pricedata, setPdata] = useState(null);
    const [translations, settrans] = useState([]);
    const userdata = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeData = async () => {
            setStatus([]);
            setIsLoading(true);

            await downloadGoodsData(userdata, setStatus);
            setStatus(prev => [...prev, `Перерыв между функциями`]);
            await fetchData();
            setIsLoading(false);
        };
        initializeData();
    }, []);

    const fetchData = async () => {
        setPdata(null);
        settrans([]);
        setStatus(prev => [...prev, `запуск процедуры по ценам`]);

        try {
            const url = 'https://discounts-prices-api.wb.ru/api/v2/list/goods/filter?limit=1000&offset=0';
            const wbData = await fetchWBdata(url, userdata.apikeyprice);
            setStatus(prev => [...prev, `Данные из Вайлдберриз получены успешно(Цены)`]);

            const results = await sendDataToBackend('/api/content/updateprices', wbData);
            if (results) {
                setStatus(prev => [...prev, `Произведено обновление БД(Цены)`]);
            } else {
                throw new Error('Ошибка обновления цен в базе данных');
            }

            const finaldata = await getTableFromDB('prices');
            if (!finaldata) throw new Error('Ошибка считывания цен из базы данных');

            finaldata.sort((a, b) => a.vendorcode.localeCompare(b.vendorcode));
            setStatus(prev => [...prev, `Данные загружены из БД(Цены)`]);

            const resultData = await enrichWithGoodsData(finaldata);
            setPdata(resultData);

            const tablekeys = getTableKeys(resultData);
            const translations = await getTableLocale(tablekeys, userdata.locale);
            settrans(translations);

        } catch (error) {
            setStatus(prev => [...prev, `Ошибка: ${error.message}`]);
            setPdata(null);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={styles.pagecontainer}>
                <div className={styles.vidget}>
                    <p>Загрузка данных......</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.vidget}>
            {pricedata && (
                <EditableTable
                    tablename={'prices'}
                    tablekey={'nmid'}
                    data={pricedata}
                    renderInput={renderInputFields}
                    rendercheckbox={rendercheckboxfields}
                    norender={['promocode', 'dayprice', 'nightprice']}
                    translations={translations}
                    img={'big'}
                />
            )}
        </div>
    );
}

export default Changeprice;