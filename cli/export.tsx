// export.ts
import * as path from "https://deno.land/std/path/mod.ts";
import { renderToStaticMarkup } from "react-dom/server";
import MarkdownToJsx from "../app/components/MarkdownToJsx.tsx";
import { prepareOGPData } from "../app/utils/prepareOgp.ts";
import { prepareTwitterData } from "../app/utils/prepareTwitter.ts";

// コマンドライン引数の解析
let inputPath: string | undefined;
let enableOGP = false;
let themeName: 'light' | 'dark' | 'sepia' | 'nord' | 'github' | 'dracula' = 'dark';
let outputToFile = false;
let outputPath: string | undefined;

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
  } else if (arg === '--out' || arg === '-o') {
    // Enable file output with default path (no argument consumed)
    outputToFile = true;
  } else if (arg.startsWith('--out=')) {
    outputToFile = true;
    outputPath = arg.substring('--out='.length);
  } else if (arg.startsWith('-o=')) {
    outputToFile = true;
    outputPath = arg.substring('-o='.length);
  } else if (!inputPath) {
    inputPath = arg;
  }
}

if (!inputPath) {
  console.error("Usage: deno run --allow-read --allow-write --allow-net --allow-run cli/export.tsx [--ogp] [--theme <theme-name>] [--out[=<file.html>]] <markdown-file>");
  console.error("Options:");
  console.error("  --ogp    Enable OGP preview for standalone links");
  console.error("  --theme  Theme name (light, dark, sepia, nord, github, dracula)");
  console.error("  --out    Write HTML file instead of copying to clipboard");
  console.error("           With =<file>, writes to the specified path");
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
const twitterData = enableOGP ? await prepareTwitterData(markdownText) : undefined;

// ReactコンポーネントをHTMLに変換（bodyの中身のみ）
const bodyContent = renderToStaticMarkup(
  <MarkdownToJsx 
    markdown={markdownText} 
    themeName={themeName} 
    enableOGP={enableOGP} 
    ogpData={ogpData}
    twitterData={twitterData}
  />
);

// 出力するHTML（bodyの中身のみ）
const outputHTML = bodyContent;

// --out が指定された場合はファイルに書き出す（デフォルトはクリップボード）
if (outputToFile) {
  const finalOutputPath = outputPath ?? path.join(
    path.dirname(inputPath),
    path.basename(inputPath, path.extname(inputPath)) + ".html",
  );
  Deno.writeTextFileSync(finalOutputPath, outputHTML);
  console.log(`Exported to ${finalOutputPath}`);
}
if (enableOGP) {
  console.log("OGP preview enabled for standalone links");
}
console.log(`Theme: ${themeName}`);

// クリップボードにコピー処理 (Linux only)。--out 指定時はスキップ
if (!outputToFile) {
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
}

// プロセスを終了
Deno.exit(0);
