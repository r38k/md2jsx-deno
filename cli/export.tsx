// export.ts
import * as path from "https://deno.land/std/path/mod.ts";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownToJsx from "../app/components/MarkdownToJsx.tsx";
import { prepareOGPData } from "../app/utils/prepareOgp.ts";

// コマンドライン引数の解析
let inputPath: string | undefined;
let enableOGP = false;
let themeName: 'light' | 'dark' | 'sepia' | 'nord' | 'github' | 'dracula' = 'dark';

for (let i = 0; i < Deno.args.length; i++) {
  const arg = Deno.args[i];
  if (arg === '--ogp') {
    enableOGP = true;
  } else if (arg === '--theme' && i + 1 < Deno.args.length) {
    const theme = Deno.args[++i];
    if (['light', 'dark', 'sepia', 'nord', 'github', 'dracula'].includes(theme)) {
      themeName = theme as typeof themeName;
    } else {
      console.error(`Invalid theme: ${theme}`);
      Deno.exit(1);
    }
  } else if (!inputPath) {
    inputPath = arg;
  }
}

if (!inputPath) {
  console.error("Usage: deno run --allow-read --allow-write --allow-net cli/export.tsx [--ogp] [--theme <theme-name>] <markdown-file>");
  console.error("Options:");
  console.error("  --ogp    Enable OGP preview for standalone links");
  console.error("  --theme  Theme name (light, dark, sepia, nord, github, dracula)");
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

// OGPデータを事前に取得
const ogpData = enableOGP ? await prepareOGPData(markdownText) : undefined;

// ReactコンポーネントをHTMLに変換（bodyの中身のみ）
const bodyContent = renderToStaticMarkup(
  <MarkdownToJsx markdown={markdownText} themeName={themeName} enableOGP={enableOGP} ogpData={ogpData} />
);

// クリップボードにコピーするHTML（bodyの中身のみ）
const outputHTML = bodyContent;

// HTMLファイルエクスポート機能（コメントアウト）
// const outputPath = path.join(
//   path.dirname(inputPath),
//   path.basename(inputPath, path.extname(inputPath)) + ".html",
// );

// Deno.writeTextFileSync(outputPath, outputHTML);
// console.log(`Exported to ${outputPath}`);
if (enableOGP) {
  console.log("OGP preview enabled for standalone links");
}
console.log(`Theme: ${themeName}`);

// クリップボードにコピー処理 (Linux only)
try {
  const command = new Deno.Command("xsel", {
    args: ["--clipboard", "--input"],
    stdin: "piped",
  });
  
  const child = command.spawn();
  const writer = child.stdin.getWriter();
  await writer.write(new TextEncoder().encode(outputHTML));
  await writer.close();
  
  const { success } = await child.status;
  
  if (success) {
    console.log("HTML content copied to clipboard!");
  } else {
    throw new Error("xsel command failed");
  }
} catch (error) {
  console.error("Failed to copy to clipboard:", error);
  console.log("Make sure xsel is installed: sudo apt-get install xsel");
}

// OGP機能の許可についての注意
 if (enableOGP) {
  console.log("\nNote: OGP fetching requires --allow-net permission");
}

// プロセスを終了
Deno.exit(0);
