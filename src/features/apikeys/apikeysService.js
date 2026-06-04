const API_URL = '/api/apikeys';

/**
 * Get all key types
 */
export async function fetchApiKeyTypes(token) {
  const response = await fetch(`${API_URL}/getapikeytypes`, {
    headers: {
      'Authorization': `Bearer ${token}`  
    }
  });

  if (!response.ok) {
    throw new Error('Ошибка загрузки типов ключей');
  }

  return response.json();
}

/**
 * Get current user keys
 */
export async function fetchUserApiKeys(userId, token) {
  const response = await fetch(`${API_URL}/getuserapikeysdata?user_id=${userId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Ошибка загрузки ключей пользователя');
  }

  return response.json();
}

/**
 * Save or update key
 */
export async function saveUserApiKey(userId, keyType, apiKey, token) {
  const response = await fetch(`${API_URL}/saveuserapikey`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      user_id: userId,
      key_type: keyType,
      api_key: apiKey
    })
  });

  if (!response.ok) {
    throw new Error('Ошибка сохранения ключа');
  }

  return response.json();
}
