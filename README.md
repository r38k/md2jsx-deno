# md2jsx-deno

MarkdownをインラインスタイルのReact JSXコンポーネントに変換するツールです。LINE WORKSの掲示板などの外部CSSをサポートしないプラットフォーム向けに設計されています。

## 機能

- Markdownからインラインスタイル付きHTMLへの変換
- 複数のテーマサポート（light, dark, sepia, nord, github, dracula）
- シンタックスハイライト付きコードブロック
- Webアプリケーションとしてのライブプレビュー
- CLIツールとしての静的HTML生成
- OGPプレビュー機能（SSR対応）

## 使い方

### Webアプリとして起動

```bash
deno task dev
```

ブラウザで http://localhost:5173 を開くと、Markdownエディタが表示されます。

#### OGPプレビュー機能
- OGP設定をONにすると、スタンドアロンリンク（段落内に単独で存在するリンク）がOGPカードとして表示されます
- SSR対応により、WebアプリとCLIツール両方で利用可能

### CLIツールとして使用

1. CLIツールをビルド:
```bash
deno task build
```

2. Markdownファイルを変換:
```bash
./bin/md2jsx input.md
```

3. オプション:
```bash
# テーマを指定して変換
./bin/md2jsx --theme github input.md

# OGP機能を有効にして変換
./bin/md2jsx --ogp input.md

# 利用可能なテーマ: light, dark, sepia, nord, github, dracula
```

変換されたHTMLファイルは `input.html` として同じディレクトリに出力されます。

## サポートされるMarkdown機能

- 見出し（h1-h6）
- 段落と強調（太字、斜体、取り消し線）
- リスト（順序付き、順序なし、ネスト、チェックボックス付き）
- シンタックスハイライト付きコードブロック
- テーブル
- 引用文（出典サポート付き）
- 水平線
- リンクと画像
- OGPカード（スタンドアロンリンク）

## 技術スタック

- Deno
- React 19
- HonoX
- Vite
- TypeScript