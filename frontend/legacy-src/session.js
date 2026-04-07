export function getSession() {
  return JSON.parse(localStorage.getItem('maintenanceSession') || 'null');
}

export function setSession(session) {
  localStorage.setItem('maintenanceSession', JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem('maintenanceSession');
}
