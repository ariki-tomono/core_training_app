import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs, getMenus } from '../storage';

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function fmt(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [logs, setLogs] = useState({});
  const [menus, setMenus] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLogs(await getLogs());
        setMenus(await getMenus());
      })();
    }, [])
  );

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = new Date().toISOString().split('T')[0];

  const getStatus = (dateStr) => {
    const dayLog = logs[dateStr];
    if (!dayLog || menus.length === 0) return 'none';
    const done = menus.filter((m) => dayLog[m.id] != null && dayLog[m.id] >= m.target).length;
    if (done === menus.length) return 'complete';
    if (done > 0) return 'partial';
    return 'none';
  };

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth}><Text style={styles.arrow}>◀</Text></TouchableOpacity>
        <Text style={styles.title}>{year}年{month + 1}月</Text>
        <TouchableOpacity onPress={nextMonth}><Text style={styles.arrow}>▶</Text></TouchableOpacity>
      </View>
      <View style={styles.weekRow}>
        {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
          <Text key={d} style={styles.weekDay}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day == null) return <View key={`e${i}`} style={styles.cell} />;
          const dateStr = fmt(year, month, day);
          const status = getStatus(dateStr);
          const isToday = dateStr === todayStr;
          return (
            <View key={dateStr} style={[styles.cell, isToday && styles.today]}>
              <Text style={styles.dayNum}>{day}</Text>
              {status === 'complete' && <Text style={styles.emoji}>🟢</Text>}
              {status === 'partial' && <Text style={styles.emoji}>🟡</Text>}
            </View>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Text>🟢 全達成　🟡 一部達成</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  arrow: { fontSize: 24, padding: 8 },
  title: { fontSize: 20, fontWeight: 'bold' },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekDay: { flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#666' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  today: { backgroundColor: '#e3f2fd' },
  dayNum: { fontSize: 14 },
  emoji: { fontSize: 12 },
  legend: { marginTop: 16, alignItems: 'center' },
});
