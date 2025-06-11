import { createRoute } from 'honox/factory'
import MarkdownToJsx from '../components/MarkdownToJsx.tsx'
import Header from '../components/Header.tsx'
import { prepareOGPData } from '../utils/prepareOgp.ts'

export default createRoute(async (c) => {
  const themeName = (c.req.query('theme') || 'dark') as 'light' | 'dark' | 'sepia' | 'nord' | 'github' | 'dracula';
  const enableOGP = c.req.query('ogp') === 'true';
  
  // 拡張されたサンプルMarkdown - 新しい機能を含む
  const sampleMd = `# Markdown変換デモ
## 基本的な書式

これは段落テキストです。**太字**, *イタリック*, ~~取り消し線~~, そして \`インラインコード\` を含みます。

> これは引用です。引用内でも **書式** が使えます。

## 文章
「子」という表現は、日本語で特に年齢や経験が自分より下の人を親しみを込めて表現するときに使われる傾向があり、必ずしも悪意や軽視があるわけではないが、上下関係や対等でないニュアンスを含む場合がある。この表現は日本特有とは言えないものの、特に年功序列的な意識が強い日本社会では頻繁に使われる傾向がある。

また、職場環境や個人の価値観が多様化する中で、こうした表現に対して違和感を覚える人も増えてきている。特に、研修や指導の場面において、新人を一人前の社会人として尊重する姿勢を伝えるためには、「新人の方」「新入社員」「○○さん」など、より中立的で対等な表現を使う方が適切とされる。

「新人の子」という言葉に違和感を覚えること自体が、新人を対等な存在として尊重しようとする意識の表れでもあるため、「新人の方」「新人さん」など、代替表現を意識的に使うようにするとよい。

### リスト

#### 箇条書きリスト
- リストアイテム 1
- リストアイテム 2
  - ネストされたアイテム
- リストアイテム 3

#### 番号付きリスト
1. 最初のアイテム
2. 2番目のアイテム
3. 3番目のアイテム

#### チェックボックス
- [x] 完了したタスク
- [ ] 未完了のタスク
- [x] もう一つの完了タスク

### リンクと画像

[外部リンク](https://example.com)

[GitHub - 世界最大の開発プラットフォーム](https://github.com)

[Stack Overflow - 開発者向けQ&Aサイト](https://stackoverflow.com)

![](/cat_icon_600.jpg)

### 水平線

以下は水平線です:

---

### コードブロック

\`\`\`javascript
// JavaScriptのサンプルコード
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
greet('World');
\`\`\`

\`\`\`css
/* CSSのサンプル */
body {
  font-family: 'Arial', sans-serif;
  color: #333333;
  margin: 0;
  padding: 20px;
}
\`\`\`

### 引用と引用元

> デザインとは、単に見た目や感触を良くすることではない。
> デザインとは、どう機能するかということだ。
> -- スティーブ・ジョブズ

> 成功とは、失敗から失敗へと情熱を失わずに進むことである。
> -- ウィンストン・チャーチル

### テーブル

| 名前 | 年齢 | 職業 |
|------|------|------|
| 山田 | 28 | エンジニア |
| 佐藤 | 34 | デザイナー |
| 鈴木 | 42 | マネージャー |

### 数式（未対応）

インライン数式: $E=mc^2$

ブロック数式:
$$
\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$$

### HTMLタグ（一部対応）

<div style="color: red;">
  HTMLタグは部分的にサポートされています。
</div>
`

  // OGPデータを事前に取得
  const ogpData = enableOGP ? await prepareOGPData(sampleMd) : undefined;

  const themeBackgrounds = {
    light: 'bg-gray-50',
    dark: 'bg-gray-900',
    sepia: 'bg-amber-50',
    nord: 'bg-slate-800',
    github: 'bg-gray-50',
    dracula: 'bg-purple-900',
  };

  const bgClass = themeBackgrounds[themeName as keyof typeof themeBackgrounds] || 'bg-gray-50';

  return c.render(
    <div className={`min-h-screen ${bgClass}`}>
      <div className="max-w-6xl mx-auto p-6">
        <Header currentTheme={themeName} enableOGP={enableOGP} />
        
        <div className="rounded-lg shadow-sm overflow-hidden">
          <MarkdownToJsx markdown={sampleMd} themeName={themeName} ogpData={ogpData} />
        </div>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>Markdown to JSX コンバーター - 2025</p>
        </footer>
      </div>
    </div>
  )
})