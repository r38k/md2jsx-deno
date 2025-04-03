// export.ts
import * as path from "https://deno.land/std/path/mod.ts";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownToJsx from "../app/components/MarkdownToJsx.tsx";

// 引数からMarkdownファイル取得
const inputPath = Deno.args[0];
if (!inputPath) {
  console.error("Usage: deno run --allow-read --allow-write cli/export.tsx <markdown-file>");
  Deno.exit(1);
}

try {
  await Deno.stat(inputPath); // ファイル存在チェック
} catch (error) {
  if (error instanceof Deno.errors.NotFound) {
    console.error(`Error: Input file not found at ${inputPath}`);
    Deno.exit(1);
  } else {
    console.error("An unexpected error occurred:", error);
    Deno.exit(1);
  }
}

const markdownText = Deno.readTextFileSync(inputPath);

// ReactコンポーネントをHTMLに変換
const html = renderToStaticMarkup(
  <html lang="ja">
    <head>
      <link rel="stylesheet" href="./style.css" />
    </head>
    <body>
      <MarkdownToJsx markdown={markdownText} themeName="dark" />
    </body>
  </html>
);

// 出力するHTML（<!DOCTYPE>を含む）
const outputHTML = `<!DOCTYPE html>\n${html}`;

const outputPath = path.join(
  path.dirname(inputPath),
  path.basename(inputPath, path.extname(inputPath)) + ".html",
);

Deno.writeTextFileSync(outputPath, outputHTML);
console.log(`Exported to ${outputPath}`);

// クリップボードにコピー処理

// プロセスを終了
Deno.exit(0);
