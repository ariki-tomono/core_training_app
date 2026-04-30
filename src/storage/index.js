import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MENUS: 'training_menus',
  LOGS: 'training_logs',
};

const DEFAULT_MENUS = [
  { id: '1', name: 'プランク', target: 60, unit: '秒' },
  { id: '2', name: 'スクワット', target: 50, unit: '回' },
  { id: '3', name: '腕立て伏せ', target: 10, unit: '回' },
];

export async function getMenus() {
  const json = await AsyncStorage.getItem(KEYS.MENUS);
  if (!json) {
    await AsyncStorage.setItem(KEYS.MENUS, JSON.stringify(DEFAULT_MENUS));
    return DEFAULT_MENUS;
  }
  return JSON.parse(json);
}

export async function saveMenus(menus) {
  await AsyncStorage.setItem(KEYS.MENUS, JSON.stringify(menus));
}

export async function getLogs() {
  const json = await AsyncStorage.getItem(KEYS.LOGS);
  return json ? JSON.parse(json) : {};
}

// logs: { "2024-01-15": { "1": 60, "2": 45 }, ... }
export async function saveLog(date, menuId, value) {
  const logs = await getLogs();
  if (!logs[date]) logs[date] = {};
  logs[date][menuId] = value;
  await AsyncStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  return logs;
}

export async function getLogForDate(date) {
  const logs = await getLogs();
  return logs[date] || {};
}
