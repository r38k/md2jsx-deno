# リポジトリ運用ガイドライン

注記: 本ドキュメントおよび本リポジトリ内のコミュニケーションは、特段の指定がない限り日本語をデフォルトとします。

## プロジェクト構成とモジュール配置
- `app/`: Web プレビュー用の React 19 アプリ（components/, routes/, utils/, hooks/, `client.ts`, `server.ts`）。
- `cli/`: Markdown をインラインスタイルの JSX/HTML にレンダリングする CLI エントリ（`export.tsx`）。
- `bin/`: コンパイル済み CLI バイナリ（`md2jsx`）。手動で編集しないでください。
- `tests/`: Deno テスト（例: `tests/cli/cli.test.ts`）。
- ルート: `deno.json`（imports/tasks）、`vite.config.ts`、`README.md`。

## ビルド・テスト・開発コマンド
- `deno task dev`: Vite の開発サーバーを `http://localhost:5173` で起動。
- `deno task build`: CLI を `bin/md2jsx` にコンパイル（実行権限が必要）。
- `./bin/md2jsx input.md`: Markdown を変換。必要に応じて `--theme github` や `--ogp` を追加。
- `deno test --allow-run --allow-read --allow-write`: テストを実行。CLI テストはバイナリを起動し一時出力を書き込みます。
- `deno fmt && deno lint`: コード整形と Lint を実行。

## コーディング規約と命名
- TypeScript を使用し、React の自動 JSX（`jsxImportSource: react`）を有効にする。
- 整形は `deno fmt` のデフォルトに従い、import の順序を保つ。
- コンポーネント: `app/components` 配下はパスカルケース（例: `MarkdownToJsx.tsx`）。
- ユーティリティ/フック: ファイル名はキャメルケース（例: `prepareOgp.ts`, `extractLinks.ts`）。
- ルート: `app/routes` 配下は慣習名（`index.tsx`、`_error.tsx`、`_renderer.tsx` など）。
- インラインスタイルを優先（対象プラットフォーム要件により CSS はインライン）。

## テスト方針
- フレームワーク: Deno test（`tests/` 配下の `*.test.ts`）。
- 権限: テストには `--allow-run --allow-read --allow-write` が必要。
- 命名: テスト対象機能に対応（例: `tests/cli/cli.test.ts`）。
- 任意: カバレッジ取得は `deno test -A --coverage=coverage && deno coverage coverage`。

## コミットとプルリクエストのガイドライン
- コミット: 簡潔で現在形の要約（例: "Add OGP card support"）。必要に応じてスコープを付与。
- PR: 明確な説明、関連 Issue、Before/After のスクリーンショット（Web）または CLI 出力例を含め、必要権限があれば明記。
- CI 期待値: PR 作成前にローカルで CLI ビルドとテストを実行。

## セキュリティと設定のヒント
- Deno 権限: OGP 取得には `--allow-net` が必要。CLI のクリップボードコピーは Linux で `xsel` を用い、`--allow-run` が必要。
- 新しいフラグや外部フェッチを追加する場合は、必要な権限を `README.md` とテストに記載。
