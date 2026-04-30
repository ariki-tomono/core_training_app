import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMenus, saveMenus } from '../storage';

export default function SettingsScreen() {
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('回');
  const [editId, setEditId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      (async () => setMenus(await getMenus()))();
    }, [])
  );

  const handleSave = async () => {
    if (!name.trim() || !target.trim()) {
      Alert.alert('エラー', '名前と目標値を入力してください');
      return;
    }
    let updated;
    if (editId) {
      updated = menus.map((m) =>
        m.id === editId ? { ...m, name: name.trim(), target: Number(target), unit } : m
      );
    } else {
      updated = [...menus, { id: Date.now().toString(), name: name.trim(), target: Number(target), unit }];
    }
    await saveMenus(updated);
    setMenus(updated);
    resetForm();
  };

  const handleDelete = (id) => {
    Alert.alert('確認', '削除しますか？', [
      { text: 'キャンセル' },
      {
        text: '削除', style: 'destructive', onPress: async () => {
          const updated = menus.filter((m) => m.id !== id);
          await saveMenus(updated);
          setMenus(updated);
        },
      },
    ]);
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setName(item.name);
    setTarget(String(item.target));
    setUnit(item.unit);
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setTarget('');
    setUnit('回');
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>{editId ? 'メニュー編集' : 'メニュー追加'}</Text>
        <TextInput style={styles.input} placeholder="名前" value={name} onChangeText={setName} />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="目標値" keyboardType="numeric" value={target} onChangeText={setTarget} />
          <View style={styles.unitRow}>
            {['回', '秒'].map((u) => (
              <TouchableOpacity key={u} style={[styles.unitBtn, unit === u && styles.unitActive]} onPress={() => setUnit(u)}>
                <Text style={unit === u ? styles.unitTextActive : styles.unitText}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>{editId ? '更新' : '追加'}</Text>
          </TouchableOpacity>
          {editId && (
            <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
              <Text style={styles.cancelBtnText}>キャンセル</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={menus}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuTarget}>目標: {item.target}{item.unit}</Text>
            </View>
            <TouchableOpacity onPress={() => handleEdit(item)}><Text style={styles.editBtn}>✏️</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.deleteBtn}>🗑️</Text></TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  form: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 8, fontSize: 16 },
  row: { flexDirection: 'row', gap: 8 },
  unitRow: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  unitBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  unitActive: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  unitText: { color: '#666' },
  unitTextActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: { flex: 1, backgroundColor: '#4CAF50', borderRadius: 8, padding: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelBtn: { flex: 1, backgroundColor: '#eee', borderRadius: 8, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  menuName: { fontSize: 16, fontWeight: 'bold' },
  menuTarget: { fontSize: 14, color: '#888' },
  editBtn: { fontSize: 20, marginRight: 12 },
  deleteBtn: { fontSize: 20 },
});
