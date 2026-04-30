import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs, getMenus } from '../storage';

function fmt(d) {
  return d.toISOString().split('T')[0];
}

export default function StatsScreen() {
  const [streak, setStreak] = useState(0);
  const [weekRate, setWeekRate] = useState(0);
  const [monthRate, setMonthRate] = useState(0);
  const [menuStats, setMenuStats] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const logs = await getLogs();
        const menus = await getMenus();
        if (menus.length === 0) return;

        const isComplete = (dateStr) => {
          const dayLog = logs[dateStr];
          if (!dayLog) return false;
          return menus.every((m) => dayLog[m.id] != null && dayLog[m.id] >= m.target);
        };

        // 連続達成日数
        let s = 0;
        const d = new Date();
        while (true) {
          if (isComplete(fmt(d))) { s++; d.setDate(d.getDate() - 1); }
          else break;
        }
        setStreak(s);

        // 週の達成率
        const now = new Date();
        let weekDone = 0;
        const dayOfWeek = now.getDay() || 7;
        for (let i = 0; i < dayOfWeek; i++) {
          const dd = new Date(now);
          dd.setDate(now.getDate() - i);
          if (isComplete(fmt(dd))) weekDone++;
        }
        setWeekRate(Math.round((weekDone / dayOfWeek) * 100));

        // 月の達成率
        const daysInMonth = now.getDate();
        let monthDone = 0;
        for (let i = 1; i <= daysInMonth; i++) {
          const dd = new Date(now.getFullYear(), now.getMonth(), i);
          if (isComplete(fmt(dd))) monthDone++;
        }
        setMonthRate(Math.round((monthDone / daysInMonth) * 100));

        // メニュー別統計（今月）
        const stats = menus.map((m) => {
          let done = 0;
          for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = fmt(new Date(now.getFullYear(), now.getMonth(), i));
            const dayLog = logs[dateStr];
            if (dayLog && dayLog[m.id] != null && dayLog[m.id] >= m.target) done++;
          }
          return { ...m, done, total: daysInMonth, rate: Math.round((done / daysInMonth) * 100) };
        });
        setMenuStats(stats);
      })();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>🔥 連続達成日数</Text>
        <Text style={styles.bigNum}>{streak}日</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>📊 今週の達成率</Text>
          <Text style={styles.bigNum}>{weekRate}%</Text>
          <View style={styles.bar}><View style={[styles.barFill, { width: `${weekRate}%` }]} /></View>
        </View>
        <View style={[styles.card, styles.half]}>
          <Text style={styles.label}>📊 今月の達成率</Text>
          <Text style={styles.bigNum}>{monthRate}%</Text>
          <View style={styles.bar}><View style={[styles.barFill, { width: `${monthRate}%` }]} /></View>
        </View>
      </View>

      <Text style={styles.section}>メニュー別（今月）</Text>
      {menuStats.map((m) => (
        <View key={m.id} style={styles.card}>
          <View style={styles.menuRow}>
            <Text style={styles.menuName}>{m.name}</Text>
            <Text style={styles.menuRate}>{m.done}/{m.total}日 ({m.rate}%)</Text>
          </View>
          <View style={styles.bar}><View style={[styles.barFill, { width: `${m.rate}%` }]} /></View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  half: { flex: 1, marginHorizontal: 4 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, color: '#888', marginBottom: 4 },
  bigNum: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
  bar: { height: 8, backgroundColor: '#e0e0e0', borderRadius: 4, marginTop: 8 },
  barFill: { height: 8, backgroundColor: '#4CAF50', borderRadius: 4 },
  section: { fontSize: 18, fontWeight: 'bold', marginTop: 8, marginBottom: 8 },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between' },
  menuName: { fontSize: 16, fontWeight: 'bold' },
  menuRate: { fontSize: 14, color: '#666' },
});
