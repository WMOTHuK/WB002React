import axios from 'axios';
const USER_API = '/api/user';

export async function fetchUserSettings(token) {
  const response = await axios.get(`${USER_API}/getusersettings`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function changeUserLocale(locale, token) {
  const response = await axios.post(`${USER_API}/changeuserlocale`, {
    locale,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function changeUserTaxRates({ sellerTax, vatTax, validFrom }, token) {
  const response = await axios.post(`${USER_API}/changeusertaxrates`, {
    sellerTax,
    vatTax,
    validFrom,
  }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function saveUserSettingsRow(row, originalRow, token) {
  const changedFields = [];
  for (const key of ['locale', 'seller_tax_rate', 'vat_tax_rate']) {
    if (String(row[key] ?? '') !== String(originalRow?.[key] ?? '')) {
      changedFields.push(key);
    }
  }

  if (changedFields.length === 0) return { success: true };

  const errors = [];

  // 1. Если изменилась локаль — меняем её
  if (changedFields.includes('locale')) {
    try {
      await changeUserLocale(row.locale, token);
    } catch (err) {
      errors.push(`Ошибка смены локали: ${err.response?.data?.error || err.message}`);
    }
  }

  // 2. Если изменились налоговые ставки — меняем их
  const taxFields = ['seller_tax_rate', 'vat_tax_rate'];
  if (changedFields.some(f => taxFields.includes(f))) {
    try {
      await changeUserTaxRates({
        sellerTax: row.seller_tax_rate,
        vatTax: row.vat_tax_rate,
        validFrom: row.valid_from || new Date().toISOString().slice(0, 10),
      }, token);
    } catch (err) {
      errors.push(`Ошибка смены налоговых ставок: ${err.response?.data?.error || err.message}`);
    }
  }

  if (errors.length > 0) {
    return { success: false, error: errors.join('; ') };
  }

  return { success: true };
}
