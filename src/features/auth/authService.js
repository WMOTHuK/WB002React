// Функция для регистрации
export async function registerUser(login, password) {
  // ↓↓↓ ТОТ САМЫЙ fetch, просто скопирован из Register.js
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });
    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Ошибка регистрации');
  }
    return response.json();
}

export async function loginUser(login, password) {
  // ↓↓↓ ТОТ САМЫЙ fetch, просто скопирован из Register.js
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password })
  });

  if (!response.ok) {
    throw new Error('Ошибка входа');
  }

  return response.json();
}