# md2jsx-deno

Markdown を JSX に変換するための Deno ベースのツールです。インラインスタイルを使用して、さまざまなテーマでマークダウンを美しく表示します。

## 特徴

- 複数のテーマ（ライト、ダーク、セピア、Nord、GitHub、Dracula）
- Web アプリケーションとコマンドラインインターフェース（CLI）の両方をサポート
- 以下のマークダウン要素をサポート:
  - 見出し (h1, h2, h3)
  - 太字、イタリック、取り消し線
  - リンクと画像
  - コードブロックとインラインコード（シンタックスハイライト付き）
  - 引用
  - リスト（順序付き、順序なし、チェックボックス）
  - テーブル
  - 水平線

## インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/md2jsx-deno.git
cd md2jsx-deno

# 依存関係をインストール
deno cache --reload deno.json
```

## 使用方法

### Web アプリケーション

Web アプリケーションを起動するには:

```bash
deno task dev
```

ブラウザで `http://localhost:5173` を開いて、マークダウンエディタにアクセスします。

### CLI ツール

CLI ツールをビルドするには:

```bash
deno task build
```

これにより、`bin/md2jsx` 実行可能ファイルが作成されます。

マークダウンファイルを HTML に変換するには:

```bash
./bin/md2jsx path/to/your/markdown-file.md
```

これにより、同じディレクトリに HTML ファイルが生成されます。

## テーマ

以下のテーマが利用可能です:

- `light` - 白背景に暗いテキスト
- `dark` - 暗い背景に明るいテキスト
- `sepia` - セピア調の背景とテキスト
- `nord` - Nord カラースキーム
- `github` - GitHub スタイル
- `dracula` - Dracula カラースキーム

Web アプリケーションでテーマを変更するには、テーマセレクターを使用します。

CLI でテーマを指定するには、`export.tsx` ファイルの `themeName` プロパティを編集します。

## カスタマイズ

カスタムテーマを作成するには、`MarkdownToJsx.tsx` ファイルの `themes` オブジェクトに新しいテーマを追加します。

## 開発

### 前提条件

- [Deno](https://deno.land/) 1.37.0 以上
- [Node.js](https://nodejs.org/) 18.0.0 以上（一部の依存関係に必要）

### 開発サーバーの起動

```bash
deno task dev
```

### ビルド

```bash
deno task build
```

## TODO

- [ ] クリップボード機能の追加
- [ ] より多くのマークダウン拡張機能のサポート
- [ ] カスタムテーマエディタ
- [ ] エクスポートオプションの拡張

## ライセンス

MIT

## 貢献

プルリクエストは歓迎します。大きな変更を行う場合は、まず問題を開いて議論してください。
