import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getLogs, getMenus, saveLog } from '../storage';

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
  const [selectedDate, setSelectedDate] = useState(null);
  const [inputs, setInputs] = useState({});

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
  const todayStr = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();

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

  const openDay = (dateStr) => {
    setSelectedDate(dateStr);
    const dayLog = logs[dateStr] || {};
    const inp = {};
    menus.forEach((menu) => {
      inp[menu.id] = dayLog[menu.id] != null ? String(dayLog[menu.id]) : '';
    });
    setInputs(inp);
  };

  const handleSave = async (menuId) => {
    const val = Number(inputs[menuId]) || 0;
    const updated = await saveLog(selectedDate, menuId, val);
    setLogs(updated);
  };

  const closeModal = () => setSelectedDate(null);

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
            <TouchableOpacity key={dateStr} style={[styles.cell, isToday && styles.today]} onPress={() => openDay(dateStr)}>
              <Text style={styles.dayNum}>{day}</Text>
              {status === 'complete' && <Text style={styles.emoji}>🟢</Text>}
              {status === 'partial' && <Text style={styles.emoji}>🟡</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.legend}>
        <Text>🟢 全達成　🟡 一部達成</Text>
      </View>

      <Modal visible={selectedDate != null} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📅 {selectedDate}</Text>
              <TouchableOpacity onPress={closeModal}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {menus.map((item) => {
                const dayLog = logs[selectedDate] || {};
                const recorded = dayLog[item.id];
                const achieved = recorded != null && recorded >= item.target;
                return (
                  <View key={item.id} style={[styles.card, achieved && styles.cardDone]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.target}>目標: {item.target}{item.unit}</Text>
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={inputs[item.id]}
                        onChangeText={(t) => setInputs((p) => ({ ...p, [item.id]: t }))}
                        placeholder="0"
                      />
                      <Text style={styles.unit}>{item.unit}</Text>
                      <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(item.id)}>
                        <Text style={styles.saveBtnText}>記録</Text>
                      </TouchableOpacity>
                    </View>
                    {recorded != null && (
                      <Text style={achieved ? styles.ok : styles.ng}>
                        {achieved ? '✅ 達成！' : `⏳ あと${item.target - recorded}${item.unit}`}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  closeBtn: { fontSize: 24, color: '#888', padding: 4 },
  card: { backgroundColor: '#f9f9f9', borderRadius: 12, padding: 14, marginBottom: 10 },
  cardDone: { backgroundColor: '#e8f5e9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold' },
  target: { fontSize: 13, color: '#888' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, width: 70, textAlign: 'center', fontSize: 16 },
  unit: { marginLeft: 8, fontSize: 14, color: '#666' },
  saveBtn: { marginLeft: 'auto', backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  ok: { color: '#4CAF50', marginTop: 6, fontWeight: 'bold', fontSize: 13 },
  ng: { color: '#FF9800', marginTop: 6, fontSize: 13 },
});
