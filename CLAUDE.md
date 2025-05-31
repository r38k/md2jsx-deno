# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトは、MarkdownをインラインスタイルのReact JSXコンポーネントに変換するツール（md2jsx-deno）です。静的HTML生成用のCLIツールと、ライブプレビュー用のWebアプリケーションの両方を提供します。インラインスタイリングは、外部CSSをサポートしないプラットフォーム（LINE WORKSの掲示板など）向けに設計されています。

## 主要コマンド

### 開発
- `deno task dev` - 開発サーバーを起動（ホットリロード対応）
- `deno task build` - CLIバイナリを`bin/md2jsx`にビルド

### CLI使用方法
ビルド後、以下のようにCLIを使用できます：
```bash
./bin/md2jsx <markdown-file>
```
入力ファイルと同じディレクトリにインラインスタイル付きHTMLファイルを生成します。

## アーキテクチャ

### 技術スタック
- **ランタイム**: Deno
- **Webフレームワーク**: HonoX
- **UI**: React 19 (TypeScript/JSX)
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS（Webアプリ）+ インラインスタイル（生成コンテンツ）

### コアコンポーネント

1. **MarkdownToJsxコンポーネント** (`app/components/MarkdownToJsx.tsx`)
   - Markdownをインラインスタイル付きJSXに変換するメインコンバーター
   - 複数テーマ対応（light, dark, sepia, nord, github, dracula）
   - 標準的なMarkdown要素をすべてサポート

2. **SyntaxHighlighter** (`app/components/syntax/SyntaxHighlighter.tsx`)
   - コードブロックのシンタックスハイライト機能
   - JavaScript、CSS、HTMLをサポート

3. **CLIエクスポート** (`cli/export.tsx`)
   - MarkdownToJsxをサーバーサイドでレンダリングして静的HTMLファイルを生成
   - ReactDOMServerを使用してサーバーサイドレンダリング

### サポートされるMarkdown機能
- 見出し（h1-h6）
- 段落と強調（太字、斜体、取り消し線）
- リスト（順序付き、順序なし、ネスト、チェックボックス付き）
- シンタックスハイライト付きコードブロック
- テーブル
- 引用文（出典サポート付き）
- 水平線
- リンクと画像

## 開発時の注意点

- ViteによるHMR対応の開発環境
- 制限された環境で動作させるため、生成される出力のスタイルはすべてインラインである必要がある
- Webアプリは変換をテストするためのライブプレビューインターフェースを提供
- 現在テストフレームワークは設定されていない
- OGP機能はクライアントサイドでのみ動作（SSR非対応）

## OGP機能について

- `enableOGP`プロパティでOGPプレビュー機能を有効化
- スタンドアロンリンク（段落内に単独で存在するリンク）のみOGPカードとして表示
- OGP情報の取得には`fetchOGPInfo`関数を使用（キャッシュ機能付き）
- CLIではOGP機能は使用できない（サーバーサイドレンダリングのため）