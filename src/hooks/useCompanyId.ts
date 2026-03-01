export function getCompanyId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id_company || 0;
    }
  } catch (error) {
    console.error('Error al obtener id_company:', error);
  }
  return 0;
}

export function getUserId(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      return user.id || user.id_user || 0;
    }
  } catch (error) {
    console.error('Error al obtener userId:', error);
  }
  return 0;
}
