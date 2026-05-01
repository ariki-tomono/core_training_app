# 💪 コアトレーニング管理アプリ

毎日のトレーニング記録を管理し、達成状況を可視化する React Native (Expo) アプリです。

## 機能

- **トレーニング記録** — 日々の実績値を入力し、目標との差分を確認
- **カレンダー表示** — 月別で達成状況を 🟢全達成 / 🟡一部達成 で色分け表示
- **統計ダッシュボード** — 連続達成日数、週/月の達成率、メニュー別達成率をグラフ表示
- **メニュー管理** — トレーニングメニューの追加・編集・削除
- **リマインダー通知** — 毎日 20:00 に未完了の場合プッシュ通知

## デフォルトメニュー

| メニュー | 目標 |
|---|---|
| プランク | 60秒 |
| スクワット | 50回 |
| 腕立て伏せ | 10回 |

## 技術スタック

| 項目 | 技術 |
|---|---|
| フレームワーク | React Native (Expo SDK 54) |
| ナビゲーション | React Navigation (Bottom Tabs) |
| データ保存 | AsyncStorage (ローカル) |
| 通知 | Expo Notifications |

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動（Expo Go で実機テスト）
npm start

# プラットフォーム別起動
npm run android
npm run ios
npm run web
```

## WSL 環境での起動方法

Windows 上の PowerShell / ターミナルから直接 `npm start` を実行すると、Windows 側の Node.js が使われてエラーになります。
必ず WSL 内のシェルで実行してください。

### 方法 1: WSL ターミナルを開いて実行

```bash
# WSL のシェルに入る（PowerShell / cmd から）
wsl -d Ubuntu-22.04

# nvm で Node.js 22 を有効化
source ~/.nvm/nvm.sh
nvm use 22

# プロジェクトディレクトリへ移動
cd /home/ariki/src/tool/core_training_app

# 依存パッケージのインストール（初回のみ）
npm install

# Web 版で起動
npx expo start --web

# Expo Go で実機テスト
npx expo start

# Expo Go で実機テスト（WSL などネットワーク問題がある場合はトンネルモード）
npx expo start --tunnel
```

### 方法 2: PowerShell からワンライナーで実行

```powershell
wsl -d Ubuntu-22.04 -- bash -c "source ~/.nvm/nvm.sh && nvm use 22 && cd /home/ariki/src/tool/core_training_app && npx expo start --web"
```

### 注意事項

- Node.js >= 20.19.4 が必要です（nvm use 22 推奨）
- PowerShell のパス `\\wsl.localhost\...` から直接 npm/npx を実行しないでください
- Web 版起動後、ブラウザで `http://localhost:8081` が自動で開きます
- 実機テストの場合は同一 Wi-Fi 上で Expo Go アプリから QR コードを読み取ってください

## プロジェクト構成

```
src/
├── screens/
│   ├── HomeScreen.js       # 今日のトレーニング記録
│   ├── CalendarScreen.js   # カレンダー表示
│   ├── StatsScreen.js      # 統計ダッシュボード
│   └── SettingsScreen.js   # メニュー管理
├── storage/
│   └── index.js            # AsyncStorage データ永続化
└── notifications.js        # プッシュ通知設定
```

## データ構造

トレーニング記録は AsyncStorage に以下の形式で保存されます。

```json
{
  "2024-01-15": { "1": 60, "2": 45, "3": 10 },
  "2024-01-16": { "1": 60, "2": 50, "3": 8 }
}
```

## トラブルシューティング

### Render Error: `expected dynamic type 'boolean', but had type 'string'`（2025-06 解決済み）

**原因**: 依存パッケージが Expo SDK 54 の互換バージョンより新しすぎた。

| パッケージ | 問題のバージョン | 修正後 |
|---|---|---|
| `react-native-screens` | 4.24.0 | ~4.16.0 |
| `@react-native-async-storage/async-storage` | 3.0.2 | 2.2.0 |
| `expo-notifications` | 55.0.21 | ~0.32.17 |
| `expo-device` | 55.0.15 | ~8.0.10 |
| `react-native-safe-area-context` | 5.7.0 | ~5.6.0 |

**解決方法**:

```bash
npx expo install --fix
```

**補足**: `App.js` の通知初期化処理に try-catch を追加し、通知セットアップ失敗時にアプリ全体がクラッシュしないよう改善。

**予防策**: パッケージ追加・更新時は `npm install` ではなく `npx expo install パッケージ名` を使うと、Expo SDK と互換性のあるバージョンが自動選択される。

## ライセンス

MIT
