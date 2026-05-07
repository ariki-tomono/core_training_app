import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Platform, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMenus, saveMenus, exportAllData, importAllData } from '../storage';

const TABS = ['メニュー管理', 'データ管理', 'このアプリについて'];

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [menus, setMenus] = useState([]);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('回');
  const [editId, setEditId] = useState(null);
  const fileInputRef = useRef(null);

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

  const handleExport = async () => {
    try {
      const json = await exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `core_training_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Alert.alert('完了', 'データをエクスポートしました');
    } catch (e) {
      Alert.alert('エラー', 'エクスポートに失敗しました');
    }
  };

  const handleImport = () => {
    if (Platform.OS === 'web') {
      fileInputRef.current?.click();
    }
  };

  const onFileSelected = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await importAllData(e.target.result);
        setMenus(await getMenus());
        Alert.alert('完了', 'データをインポートしました');
      } catch (err) {
        Alert.alert('エラー', 'ファイルの形式が正しくありません');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const renderMenuTab = () => (
    <View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{editId ? 'メニュー編集' : 'メニュー追加'}</Text>
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
      {menus.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            <Text style={styles.menuName}>{item.name}</Text>
            <Text style={styles.menuTarget}>目標: {item.target}{item.unit}</Text>
          </View>
          <TouchableOpacity onPress={() => handleEdit(item)}><Text style={styles.editBtn}>✏️</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}><Text style={styles.deleteBtn}>🗑️</Text></TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderDataTab = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>データ管理</Text>
      <Text style={styles.description}>記録データのバックアップや端末移行に使用します。</Text>
      <View style={[styles.row, { marginTop: 12 }]}>
        <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
          <Text style={styles.exportBtnText}>📤 エクスポート</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
          <Text style={styles.importBtnText}>📥 インポート</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'web' && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={onFileSelected}
        />
      )}
      <Text style={styles.hint}>エクスポート: メニュー設定と全記録を JSON ファイルで保存</Text>
      <Text style={styles.hint}>インポート: JSON ファイルからデータを復元</Text>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.section}>
      <Text style={styles.aboutTitle}>💪 コアトレーニング管理アプリ</Text>
      <Text style={styles.aboutText}>毎日のトレーニング記録を管理し、達成状況を可視化するアプリです。</Text>
      <View style={styles.aboutList}>
        <Text style={styles.aboutItem}>📝 トレーニング記録の入力・管理</Text>
        <Text style={styles.aboutItem}>📅 カレンダーで達成状況を一覧表示</Text>
        <Text style={styles.aboutItem}>📊 統計ダッシュボードで達成率を確認</Text>
        <Text style={styles.aboutItem}>⚙️ メニューの追加・編集・削除</Text>
        <Text style={styles.aboutItem}>💾 データのエクスポート・インポート</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === i && styles.tabActive]}
            onPress={() => setActiveTab(i)}
          >
            <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.content}>
        {activeTab === 0 && renderMenuTab()}
        {activeTab === 1 && renderDataTab()}
        {activeTab === 2 && renderAboutTab()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#4CAF50' },
  tabText: { fontSize: 13, color: '#888' },
  tabTextActive: { color: '#4CAF50', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
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
  description: { fontSize: 14, color: '#666' },
  hint: { fontSize: 12, color: '#999', marginTop: 8 },
  exportBtn: { flex: 1, backgroundColor: '#2196F3', borderRadius: 8, padding: 14, alignItems: 'center' },
  exportBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  importBtn: { flex: 1, backgroundColor: '#FF9800', borderRadius: 8, padding: 14, alignItems: 'center' },
  importBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  aboutTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  aboutText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  aboutList: { gap: 8 },
  aboutItem: { fontSize: 14, color: '#444' },
});
