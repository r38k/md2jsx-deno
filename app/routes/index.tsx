import { createRoute } from 'honox/factory'
import MarkdownToJsx from '../components/MarkdownToJsx' // Import the component

export default createRoute((c) => {
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

  return c.render(
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">MarkdownToJsx デモ</h1>
      <div className="border rounded-lg shadow-sm ">
        <MarkdownToJsx markdown={sampleMd} themeName="dark" />
      </div>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Markdown to JSX コンバーター - 2025</p>
      </footer>
    </div>
  )
})
