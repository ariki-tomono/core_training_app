import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMenus, getLogForDate, saveLog } from '../storage';

const today = () => new Date().toISOString().split('T')[0];

export default function HomeScreen() {
  const [menus, setMenus] = useState([]);
  const [logs, setLogs] = useState({});
  const [inputs, setInputs] = useState({});
  const date = today();

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const m = await getMenus();
        const l = await getLogForDate(date);
        setMenus(m);
        setLogs(l);
        const inp = {};
        m.forEach((menu) => {
          inp[menu.id] = l[menu.id] != null ? String(l[menu.id]) : '';
        });
        setInputs(inp);
      })();
    }, [date])
  );

  const handleSave = async (menuId) => {
    const val = Number(inputs[menuId]) || 0;
    const updated = await saveLog(date, menuId, val);
    setLogs(updated[date] || {});
  };

  const renderItem = ({ item }) => {
    const recorded = logs[item.id];
    const achieved = recorded != null && recorded >= item.target;
    return (
      <View style={[styles.card, achieved && styles.cardDone]}>
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
          <TouchableOpacity style={styles.btn} onPress={() => handleSave(item.id)}>
            <Text style={styles.btnText}>記録</Text>
          </TouchableOpacity>
        </View>
        {recorded != null && (
          <Text style={achieved ? styles.ok : styles.ng}>
            {achieved ? '✅ 達成！' : `⏳ あと${item.target - recorded}${item.unit}`}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>📅 {date}</Text>
      <FlatList data={menus} keyExtractor={(i) => i.id} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  date: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardDone: { backgroundColor: '#e8f5e9' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: 'bold' },
  target: { fontSize: 14, color: '#888' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, width: 80, textAlign: 'center', fontSize: 16 },
  unit: { marginLeft: 8, fontSize: 16, color: '#666' },
  btn: { marginLeft: 'auto', backgroundColor: '#4CAF50', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  ok: { color: '#4CAF50', marginTop: 8, fontWeight: 'bold' },
  ng: { color: '#FF9800', marginTop: 8 },
});
