/**
 * MarkdownをJSXに変換するコンポーネント
 * 
 * LINEWORKSの掲示板の仕様上，スタイルを適用するにはインラインスタイルを使用する必要がある
 * 
 */

import React, { JSX, useMemo } from 'react';
import { tokenizeCode, Theme as HighlighterTheme } from '../components/syntax/SyntaxHighlighter.tsx';
import { type OGPInfo } from '../utils/ogp.ts';
import OGPCard from './OGPCard.tsx';

/**
 * テーマの型定義
 */
interface Theme {
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  codeBackgroundColor: string;
  codeTextColor: string;
  blockquoteBackgroundColor: string;
  blockquoteBorderColor: string;
  blockquoteTextColor: string;
  tableHeaderBackgroundColor: string;
  tableBorderColor: string;
  horizontalRuleColor: string;
}

/**
 * テーマコレクション
 */
const themes = {
  // ライトテーマ
  light: {
    backgroundColor: '#ffffff',
    textColor: '#333333',
    linkColor: '#007bff',
    codeBackgroundColor: '#f0f0f0',
    codeTextColor: '#333333',
    blockquoteBackgroundColor: '#f9f9f9',
    blockquoteBorderColor: '#ccc',
    blockquoteTextColor: '#666',
    tableHeaderBackgroundColor: '#f2f2f2',
    tableBorderColor: '#ddd',
    horizontalRuleColor: '#ccc',
  },
  
  // ダークテーマ
  dark: {
    backgroundColor: '#1e1e1e',
    textColor: '#e0e0e0',
    linkColor: '#4da3ff',
    codeBackgroundColor: '#2d2d2d',
    codeTextColor: '#e0e0e0',
    blockquoteBackgroundColor: '#2a2a2a',
    blockquoteBorderColor: '#555',
    blockquoteTextColor: '#aaa',
    tableHeaderBackgroundColor: '#2a2a2a',
    tableBorderColor: '#555',
    horizontalRuleColor: '#555',
  },
  
  // セピアテーマ
  sepia: {
    backgroundColor: '#f4ecd8',
    textColor: '#5b4636',
    linkColor: '#1e7b75',
    codeBackgroundColor: '#e8e0cc',
    codeTextColor: '#5b4636',
    blockquoteBackgroundColor: '#eae0c9',
    blockquoteBorderColor: '#c3b393',
    blockquoteTextColor: '#7d6b56',
    tableHeaderBackgroundColor: '#e8e0cc',
    tableBorderColor: '#c3b393',
    horizontalRuleColor: '#c3b393',
  },
  
  // Nordテーマ
  nord: {
    backgroundColor: '#2e3440',
    textColor: '#d8dee9',
    linkColor: '#88c0d0',
    codeBackgroundColor: '#3b4252',
    codeTextColor: '#d8dee9',
    blockquoteBackgroundColor: '#3b4252',
    blockquoteBorderColor: '#81a1c1',
    blockquoteTextColor: '#e5e9f0',
    tableHeaderBackgroundColor: '#3b4252',
    tableBorderColor: '#4c566a',
    horizontalRuleColor: '#4c566a',
  },
  
  // GitHubテーマ
  github: {
    backgroundColor: '#ffffff',
    textColor: '#24292e',
    linkColor: '#0366d6',
    codeBackgroundColor: '#f6f8fa',
    codeTextColor: '#24292e',
    blockquoteBackgroundColor: '#f6f8fa',
    blockquoteBorderColor: '#dfe2e5',
    blockquoteTextColor: '#6a737d',
    tableHeaderBackgroundColor: '#f6f8fa',
    tableBorderColor: '#dfe2e5',
    horizontalRuleColor: '#e1e4e8',
  },
  
  // Draculaテーマ
  dracula: {
    backgroundColor: '#282a36',
    textColor: '#f8f8f2',
    linkColor: '#8be9fd',
    codeBackgroundColor: '#44475a',
    codeTextColor: '#f8f8f2',
    blockquoteBackgroundColor: '#44475a',
    blockquoteBorderColor: '#6272a4',
    blockquoteTextColor: '#f8f8f2',
    tableHeaderBackgroundColor: '#44475a',
    tableBorderColor: '#6272a4',
    horizontalRuleColor: '#6272a4',
  },
} as const;

/**
 * 利用可能なテーマ名
 */
export type ThemeName = keyof typeof themes;

/**
 * MarkdownToJsxプロパティのインターフェース
 */
interface MarkdownToJsxProps {
  markdown: string;
  themeName?: ThemeName; // テーマ名
  customTheme?: Theme; // カスタムテーマのオプションプロパティ
  ogpData?: Map<string, OGPInfo>; // OGPデータのマップ
}

/**
 * インラインコードコンポーネント
 */
const InlineCode: React.FC<{ code: string; theme: Theme }> = ({ code, theme }) => {
  const style = {
    // backgroundColor: theme.codeBackgroundColor,
    // color: theme.codeTextColor,
    padding: '2px 4px',
    borderRadius: '3px',
    fontFamily: 'monospace',
  };
  
  return <code style={style}>{code}</code>;
};

/**
 * 太字コンポーネント
 */
const Bold: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
  const style = {
    fontWeight: 'bold' as const,
    color: theme.textColor,
  };
  
  return <strong style={style}>{text}</strong>;
};

/**
 * イタリックコンポーネント
 */
const Italic: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
  const style = {
    fontStyle: 'italic' as const,
    color: theme.textColor,
  };
  
  return <em style={style}>{text}</em>;
};

/**
 * 取り消し線コンポーネント
 */
const Strikethrough: React.FC<{ text: string; theme: Theme }> = ({ text, theme }) => {
  const style = {
    textDecoration: 'line-through' as const,
    color: theme.textColor,
  };
  
  return <del style={style}>{text}</del>;
};

/**
 * リンクコンポーネント
 */
const Link: React.FC<{ text: string; url: string; theme: Theme; ogpInfo?: OGPInfo | null; isStandalone?: boolean }> = ({ text, url, theme, ogpInfo, isStandalone = false }) => {
  const style = {
    color: theme.linkColor,
    textDecoration: 'underline' as const,
  };
  
  // URLのサニタイズ (javascript: プロトコルなどを防止)
  const sanitizedUrl = url.startsWith('javascript:') ? '#' : url;
  
  // スタンドアロンリンクでOGP情報がある場合はカード表示
  if (isStandalone && ogpInfo && (ogpInfo.title || ogpInfo.description)) {
    return <OGPCard url={sanitizedUrl} ogpInfo={ogpInfo} theme={theme} />;
  }
  
  return (
    <a
      href={sanitizedUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
    >
      {text}
    </a>
  );
};

/**
 * 画像コンポーネント
 */
const Image: React.FC<{ alt: string; src: string; title?: string; theme: Theme }> = ({ alt, src, title, theme }) => {
  const style = {
    maxWidth: '100%',
  };
  
  return <img src={src} alt={alt} title={title} style={style} />;
};

/**
 * 見出しコンポーネント
 */
const Heading: React.FC<{ level: 1 | 2 | 3; children: React.ReactNode; theme: Theme }> = ({ level, children, theme }) => {
  const styles = {
    h1: {
      fontSize: '2em',
      fontWeight: 'bold',
      margin: '0.67em 0',
      color: theme.textColor,
    },
    h2: {
      fontSize: '1.5em',
      fontWeight: 'bold',
      margin: '0.83em 0',
      color: theme.textColor,
    },
    h3: {
      fontSize: '1.17em',
      fontWeight: 'bold',
      margin: '1em 0',
      color: theme.textColor,
    },
  };
  
  switch (level) {
    case 1:
      return <h1 style={styles.h1}>{children}</h1>;
    case 2:
      return <h2 style={styles.h2}>{children}</h2>;
    case 3:
      return <h3 style={styles.h3}>{children}</h3>;
    default:
      return <h3 style={styles.h3}>{children}</h3>;
  }
};

/**
 * 引用コンポーネント
 */
const Blockquote: React.FC<{ children: React.ReactNode; source?: string; theme: Theme }> = ({ children, source, theme }) => {
  const style = {
    borderLeft: `4px solid ${theme.blockquoteBorderColor}`,
    paddingLeft: '16px',
    paddingTop: '12px',
    paddingBottom: '12px',
    backgroundColor: theme.blockquoteBackgroundColor,
    color: theme.blockquoteTextColor,
    margin: '1.5em 0',
    borderRadius: '0 4px 4px 0',
    position: 'relative' as const,
  };
  
  const sourceStyle = {
    display: 'block',
    textAlign: 'right' as const,
    marginTop: '8px',
    fontSize: '0.9em',
    fontStyle: 'italic' as const,
    opacity: 0.8,
    wordBreak: 'break-word' as const,
    maxWidth: '100%',
    paddingRight: '8px',
  };
  
  return (
    <blockquote style={style}>
      {children}
      {source && <cite style={sourceStyle}>— {source}</cite>}
    </blockquote>
  );
};

/**
 * コードブロックコンポーネント
 */
const CodeBlock: React.FC<{ content: string; language?: string; theme: Theme }> = ({ content, language, theme }) => {
  const style = {
    backgroundColor: theme.codeBackgroundColor,
    color: theme.codeTextColor,
    padding: '10px',
    borderRadius: '4px',
    overflowX: 'auto' as const,
    fontFamily: 'monospace',
  };
  
  // シンタックスハイライト処理（インラインスタイルで実装）
  const highlightedCode = useMemo(() => {
    if (!language) return content;
    
    // 言語に応じたシンプルなトークン化処理
    return tokenizeCode(content, language, theme as HighlighterTheme);
  }, [content, language, theme]);
  
  return (
    <pre style={style}>
      <code>{highlightedCode}</code>
    </pre>
  );
};

/**
 * 水平線コンポーネント
 */
const HorizontalRule: React.FC<{ theme: Theme }> = ({ theme }) => {
  const style = {
    border: '0',
    borderTop: `1px solid ${theme.horizontalRuleColor}`,
    margin: '1em 0',
  };
  
  return <hr style={style} />;
};

/**
 * 段落コンポーネント
 */
const Paragraph: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  const style = {
    margin: '1em 0',
    color: theme.textColor,
  };
  
  return <p style={style}>{children}</p>;
};

/**
 * チェックボックスコンポーネント
 */
const Checkbox: React.FC<{ checked: boolean; theme: Theme }> = ({ checked, theme }) => {
  const style = {
    marginRight: '8px',
    verticalAlign: 'middle',
  };
  
  return (
    <input
      type="checkbox"
      checked={checked}
      readOnly
      style={style}
    />
  );
};

/**
 * ネストされたリストアイテムコンポーネント
 */
interface NestedListItem {
  content: React.ReactNode;
  level: number;
  type: 'ul' | 'ol';
  checked?: boolean;
  children: NestedListItem[];
}

/**
 * リストアイテムコンポーネント
 */
const ListItem: React.FC<{ children: React.ReactNode; theme: Theme; style?: React.CSSProperties }> = ({ children, theme, style = {} }) => {
  const baseStyle = {
    margin: '0.5em 0',
    display: 'list-item' as const,
    color: theme.textColor,
  };
  
  return <li style={{ ...baseStyle, ...style }}>{children}</li>;
};

/**
 * 順序なしリストコンポーネント
 */
const UnorderedList: React.FC<{ children: React.ReactNode; theme: Theme; style?: React.CSSProperties }> = ({ children, theme, style = {} }) => {
  const baseStyle = {
    margin: '1em 0',
    paddingLeft: '30px',
    listStyleType: 'disc' as const,
    color: theme.textColor,
  };
  
  return <ul style={{ ...baseStyle, ...style }}>{children}</ul>;
};

/**
 * 順序付きリストコンポーネント
 */
const OrderedList: React.FC<{ children: React.ReactNode; theme: Theme; style?: React.CSSProperties }> = ({ children, theme, style = {} }) => {
  const baseStyle = {
    margin: '1em 0',
    paddingLeft: '30px',
    listStyleType: 'decimal' as const,
    color: theme.textColor,
  };
  
  return <ol style={{ ...baseStyle, ...style }}>{children}</ol>;
};

/**
 * テーブルコンポーネント
 */
const Table: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  const style = {
    borderCollapse: 'collapse' as const,
    width: '100%',
    margin: '1em 0',
    color: theme.textColor,
  };
  
  return <table style={style}>{children}</table>;
};

/**
 * テーブルヘッダーコンポーネント
 */
const TableHeader: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  return <thead style={{ color: theme.textColor }}>{children}</thead>;
};

/**
 * テーブルボディコンポーネント
 */
const TableBody: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  return <tbody style={{ color: theme.textColor }}>{children}</tbody>;
};

/**
 * テーブル行コンポーネント
 */
const TableRow: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  return <tr style={{ color: theme.textColor }}>{children}</tr>;
};

/**
 * テーブルヘッダーセルコンポーネント
 */
const TableHeaderCell: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  const style = {
    border: `1px solid ${theme.tableBorderColor}`,
    padding: '8px',
    backgroundColor: theme.tableHeaderBackgroundColor,
    color: theme.textColor,
    textAlign: 'left' as const,
  };
  
  return <th style={style}>{children}</th>;
};

/**
 * テーブルデータセルコンポーネント
 */
const TableDataCell: React.FC<{ children: React.ReactNode; theme: Theme }> = ({ children, theme }) => {
  const style = {
    border: `1px solid ${theme.tableBorderColor}`,
    padding: '8px',
    color: theme.textColor,
    textAlign: 'left' as const,
  };
  
  return <td style={style}>{children}</td>;
};

/**
 * ネストされたリスト構造をJSXに変換する関数
 */
const renderNestedList = (items: NestedListItem[], key: string, theme: Theme): JSX.Element => {
  // リスト項目をレベルごとにグループ化
  const groupedByLevel: { [level: number]: NestedListItem[] } = {};
  
  items.forEach(item => {
    if (!groupedByLevel[item.level]) {
      groupedByLevel[item.level] = [];
    }
    groupedByLevel[item.level].push(item);
  });
  
  // 最小レベル（ルートレベル）を取得
  const minLevel = Math.min(...Object.keys(groupedByLevel).map(Number));
  
  // ルートレベルのリスト項目を処理
  const rootItems = groupedByLevel[minLevel];
  const rootType = rootItems[0]?.type || 'ul';
  
  // 再帰的にリスト項目とその子を処理する関数
  const processItems = (items: NestedListItem[], parentKey: string): JSX.Element[] => {
    return items.map((item, idx) => {
      const itemKey = `${parentKey}-${idx}`;
      
      // 子リストがある場合は再帰的に処理
      let childList: JSX.Element | null = null;
      if (item.children.length > 0) {
        const childType = item.children[0].type;
        const childItems = processItems(item.children, `${itemKey}-child`);
        
        childList = childType === 'ul' 
          ? <UnorderedList key={`${itemKey}-ul`} theme={theme}>{childItems}</UnorderedList>
          : <OrderedList key={`${itemKey}-ol`} theme={theme}>{childItems}</OrderedList>;
      }
      
      // チェックボックス付きの場合
      let content = item.content;
      if (item.checked !== undefined) {
        content = (
          <>
            <Checkbox checked={item.checked} theme={theme} />
            {item.content}
          </>
        );
      }
      
      return (
        <ListItem key={itemKey} theme={theme}>
          {content}
          {childList}
        </ListItem>
      );
    });
  };
  
  const listItems = processItems(rootItems, key);
  
  return rootType === 'ul'
    ? <UnorderedList key={`${key}-root-ul`} theme={theme}>{listItems}</UnorderedList>
    : <OrderedList key={`${key}-root-ol`} theme={theme}>{listItems}</OrderedList>;
};


type PatternType = 'code' | 'bold' | 'italic' | 'strikethrough' | 'link' | 'image';
  
interface Pattern {
  type: PatternType;
  regex: RegExp;
  process: (match: RegExpExecArray, theme: Theme, ogpData?: Map<string, OGPInfo>) => JSX.Element;
}

const patterns: Pattern[] = [
  { 
    type: 'code', 
    regex: /`([^`]+?)`/g, 
    process: (match: RegExpExecArray, theme: Theme) => 
      <InlineCode 
        key={`inline-code-${Math.random().toString(36).substring(2)}`} 
        code={match[1]} 
        theme={theme} 
      />
  },
  { 
    type: 'bold', 
    regex: /\*\*([^*]+?)\*\*/g, 
    process: (match: RegExpExecArray, theme: Theme) => 
      <Bold 
        key={`bold-${Math.random().toString(36).substring(2)}`} 
        text={match[1]} 
        theme={theme} 
      />
  },
  { 
    type: 'italic', 
    regex: /\*([^*]+?)\*/g, 
    process: (match: RegExpExecArray, theme: Theme) => 
      <Italic 
        key={`italic-${Math.random().toString(36).substring(2)}`} 
        text={match[1]} 
        theme={theme} 
      />
  },
  { 
    type: 'strikethrough', 
    regex: /\~\~([^~]+?)\~\~/g, 
    process: (match: RegExpExecArray, theme: Theme) => 
      <Strikethrough 
        key={`strike-${Math.random().toString(36).substring(2)}`} 
        text={match[1]} 
        theme={theme} 
      />
  },
  { 
    type: 'link', 
    regex: /\[([^\]]+?)\]\(([^)]+?)\)/g, 
    process: (match: RegExpExecArray, theme: Theme, ogpData?: Map<string, OGPInfo>) => 
      <Link 
        key={`link-${Math.random().toString(36).substring(2)}`} 
        text={match[1]} 
        url={match[2]} 
        theme={theme}
        ogpInfo={ogpData?.get(match[2])}
        isStandalone={false}
      />
  },
  { 
    type: 'image', 
    regex: /\!\[([^\]]*?)\]\(([^)"]+?)(?:\s+"([^"]+?)")?\)/g, 
    process: (match: RegExpExecArray, theme: Theme) => 
      <Image 
        key={`img-${Math.random().toString(36).substring(2)}`} 
        alt={match[1] || ''} 
        src={match[2]} 
        title={match[3]} 
        theme={theme} 
      />
  }
];

const parseInlineMarkdown = (text: string, theme: Theme, ogpData?: Map<string, OGPInfo>): (string | JSX.Element)[] => {
  // テキストを分割して処理
  let result: (string | JSX.Element)[] = [text];

  // 各パターンを順番に適用
  for (const pattern of patterns) {
    const tempResult: (string | JSX.Element)[] = [];
    
    for (const item of result) {
      // 既にJSX要素の場合はそのまま追加
      if (typeof item !== 'string') {
        tempResult.push(item);
        continue;
      }

      const parts: (string | JSX.Element)[] = [];
      let lastIndex = 0;
      
      // 正規表現の状態をリセット
      pattern.regex.lastIndex = 0;
      let match;

      // 文字列内のすべてのマッチを処理
      while ((match = pattern.regex.exec(item)) !== null) {
        const matchedText = match[0];
        const startIndex = match.index;

        // マッチ前のテキストを追加
        if (startIndex > lastIndex) {
          parts.push(item.substring(lastIndex, startIndex));
        }

        // マッチした部分をJSX要素に変換
        parts.push(pattern.process(match, theme, ogpData));

        lastIndex = startIndex + matchedText.length;
      }

      // 残りのテキストを追加
      if (lastIndex < item.length) {
        parts.push(item.substring(lastIndex));
      }

      // 結果を追加
      if (parts.length > 0) {
        tempResult.push(...parts);
      } else {
        tempResult.push(item);
      }
    }
    
    // 結果を更新
    result = tempResult;
  }

  return result;
};

/**
 * Markdownをパースし、適切なJSX要素のグループを返す
 */
const parseMarkdown = (markdown: string, theme: Theme, ogpData?: Map<string, OGPInfo>): JSX.Element[] => {
  const lines = markdown.split('\n');
  const jsxElements: JSX.Element[] = [];

  // コードブロック、リスト、テーブルの状態を追跡
  let inCodeBlock = false;
  let codeBlockContent = '';
  let codeBlockLang = '';
  
  let inList = false;
  let nestedListItems: NestedListItem[] = [];
  let currentListLevel = 0;
  
  let inTable = false;
  let tableRows: JSX.Element[] = [];
  let isHeaderRow = true;

  // 行をひとつずつ処理
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const trimmedLine = line.trim();
    
    // コードブロック処理
    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        // コードブロック終了
        jsxElements.push(
          <CodeBlock 
            key="codeblock-end" 
            content={codeBlockContent.trim()} 
            language={codeBlockLang} 
            theme={theme}
          />
        );
        inCodeBlock = false;
        codeBlockContent = '';
        codeBlockLang = '';
        
        // コードブロック終了後に空の段落を挿入して区切りを明確にする
        jsxElements.push(<div key={`codeblock-spacer-${i}`} style={{ height: '16px' }}></div>);
      } else {
        // コードブロック開始
        inCodeBlock = true;
        codeBlockLang = trimmedLine.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n';
      continue;
    }

    // リストの終了をチェック
    if (inList && (trimmedLine === '' || !(/^(\s*[-*+]|\s*\d+\.)/).test(line))) {
      // リストを終了して要素に追加
      jsxElements.push(renderNestedList(nestedListItems, `list-${i}`, theme));
      inList = false;
      nestedListItems = [];
      currentListLevel = 0;
      
      // 空行の場合は次へ
      if (trimmedLine === '') continue;
    }

    // テーブルの終了をチェック
    if (inTable && !trimmedLine.includes('|')) {
      jsxElements.push(
        <Table key={`table-${i}`} theme={theme}>
          <TableHeader theme={theme}>
            {tableRows[0]}
          </TableHeader>
          <TableBody theme={theme}>
            {tableRows.slice(1)}
          </TableBody>
        </Table>
      );
      inTable = false;
      tableRows = [];
      isHeaderRow = true;
      
      // 空行の場合は次へ
      if (trimmedLine === '') continue;
    }

    // 水平線
    if (/^-{3,}$|^_{3,}$|^\*{3,}$/.test(trimmedLine)) {
      jsxElements.push(<HorizontalRule key={`hr-${i}`} theme={theme} />);
    }
    // 見出し
    else if (trimmedLine.startsWith('### ')) {
      const headingContent = parseInlineMarkdown(trimmedLine.substring(4), theme, ogpData);
      jsxElements.push(<Heading key={`h3-${i}`} level={3} theme={theme}>{headingContent}</Heading>);
    }
    else if (trimmedLine.startsWith('## ')) {
      const headingContent = parseInlineMarkdown(trimmedLine.substring(3), theme, ogpData);
      jsxElements.push(<Heading key={`h2-${i}`} level={2} theme={theme}>{headingContent}</Heading>);
    }
    else if (trimmedLine.startsWith('# ')) {
      const headingContent = parseInlineMarkdown(trimmedLine.substring(2), theme, ogpData);
      jsxElements.push(<Heading key={`h1-${i}`} level={1} theme={theme}>{headingContent}</Heading>);
    }
    // 引用
    else if (trimmedLine.startsWith('> ')) {
      // 複数行の引用をサポート
      let quoteContent = trimmedLine.substring(2);
      let j = i + 1;
      let source: string | undefined = undefined;

      // 引用が複数行続くか確認
      while (j < lines.length && lines[j] && lines[j].trim().startsWith('>')) {
        const quoteLine = lines[j].trim().substring(1).trim();
        
        // 引用元の特殊な形式をチェック（「-- 」または「― 」で始まる行）
        if (quoteLine.match(/^(--|—|―)\s+(.+)$/)) {
          source = quoteLine.replace(/^(--|—|―)\s+/, '');
          j++;
          break;
        } else {
          quoteContent += '\n' + quoteLine;
          j++;
        }
      }
      
      // インデックスを更新
      if (j > i + 1) {
        i = j - 1;
      }
      
      const parsedContent = parseInlineMarkdown(quoteContent, theme, ogpData);
      jsxElements.push(
        <Blockquote key={`quote-${i}`} theme={theme} source={source}>
          {parsedContent}
        </Blockquote>
      );
    }
    // チェックボックス付きリストアイテム
    else if (/^\s*- \[(x| )\]/.test(line)) {
      // インデントレベルを計算（スペース2つで1レベル）
      const leadingSpaces = line.length - line.trimStart().length;
      const level = Math.floor(leadingSpaces / 2);
      
      const checked = line.includes('[x]');
      const match = line.match(/^\s*- \[(x| )\] (.*)/);
      if (match) {
        const textContent = parseInlineMarkdown(match[2] ?? '', theme, ogpData);
        
        // リスト開始または継続
        if (!inList) {
          inList = true;
          currentListLevel = level;
        }
        
        // 新しいリストアイテムを作成
        const newItem: NestedListItem = {
          content: textContent,
          level,
          type: 'ul',
          checked,
          children: []
        };
        
        // 親アイテムを見つけて子として追加するか、ルートとして追加
        if (level > currentListLevel && nestedListItems.length > 0) {
          // 直近の親アイテムを見つける
          let parentIndex = nestedListItems.length - 1;
          while (parentIndex >= 0 && nestedListItems[parentIndex].level >= level) {
            parentIndex--;
          }
          
          if (parentIndex >= 0) {
            nestedListItems[parentIndex].children.push(newItem);
          } else {
            nestedListItems.push(newItem);
          }
        } else {
          nestedListItems.push(newItem);
        }
        
        currentListLevel = level;
      }
    }
    // 箇条書きリスト
    else if (/^\s*[-*+] /.test(line)) {
      // インデントレベルを計算（スペース2つで1レベル）
      const leadingSpaces = line.length - line.trimStart().length;
      const level = Math.floor(leadingSpaces / 2);
      
      const match = line.match(/^\s*[-*+] (.*)/);
      if (match) {
        const listItemContent = parseInlineMarkdown(match[1] ?? '', theme, ogpData);
        
        // リスト開始または継続
        if (!inList) {
          inList = true;
          currentListLevel = level;
        }
        
        // 新しいリストアイテムを作成
        const newItem: NestedListItem = {
          content: listItemContent,
          level,
          type: 'ul',
          children: []
        };
        
        // 親アイテムを見つけて子として追加するか、ルートとして追加
        if (level > currentListLevel && nestedListItems.length > 0) {
          // 直近の親アイテムを見つける
          let parentIndex = nestedListItems.length - 1;
          while (parentIndex >= 0 && nestedListItems[parentIndex].level >= level) {
            parentIndex--;
          }
          
          if (parentIndex >= 0) {
            nestedListItems[parentIndex].children.push(newItem);
          } else {
            nestedListItems.push(newItem);
          }
        } else {
          nestedListItems.push(newItem);
        }
        
        currentListLevel = level;
      }
    }
    // 番号付きリスト
    else if (/^\s*\d+\. /.test(line)) {
      // インデントレベルを計算（スペース2つで1レベル）
      const leadingSpaces = line.length - line.trimStart().length;
      const level = Math.floor(leadingSpaces / 2);
      
      const match = line.match(/^\s*\d+\. (.*)/);
      if (match) {
        const listItemContent = parseInlineMarkdown(match[1] ?? '', theme, ogpData);
        
        // リスト開始または継続
        if (!inList) {
          inList = true;
          currentListLevel = level;
        }
        
        // 新しいリストアイテムを作成
        const newItem: NestedListItem = {
          content: listItemContent,
          level,
          type: 'ol',
          children: []
        };
        
        // 親アイテムを見つけて子として追加するか、ルートとして追加
        if (level > currentListLevel && nestedListItems.length > 0) {
          // 直近の親アイテムを見つける
          let parentIndex = nestedListItems.length - 1;
          while (parentIndex >= 0 && nestedListItems[parentIndex].level >= level) {
            parentIndex--;
          }
          
          if (parentIndex >= 0) {
            nestedListItems[parentIndex].children.push(newItem);
          } else {
            nestedListItems.push(newItem);
          }
        } else {
          nestedListItems.push(newItem);
        }
        
        currentListLevel = level;
      }
    }
    // テーブル
    else if (trimmedLine.includes('|')) {
      // セパレータ行をスキップ（ヘッダとボディの区切り行）
      if (/^\|?\s*:?-+:?\s*\|/.test(trimmedLine)) {
        isHeaderRow = false;
        continue;
      }
      
      // テーブル開始または継続
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      
      // セルに分割
      const cells = trimmedLine.split('|')
        .filter((cell, idx, arr) => {
          // 最初と最後の空セルを除外
          if (idx === 0 && cell === '') return false;
          if (idx === arr.length - 1 && cell === '') return false;
          return true;
        })
        .map(cell => cell.trim());
      
      // 行を作成
      const cellElements = cells.map((cell, cellIdx) => {
        const cellContent = parseInlineMarkdown(cell, theme, ogpData);
        return isHeaderRow 
          ? <TableHeaderCell key={`th-${cellIdx}`} theme={theme}>{cellContent}</TableHeaderCell>
          : <TableDataCell key={`td-${cellIdx}`} theme={theme}>{cellContent}</TableDataCell>;
      });
      
      tableRows.push(<TableRow key={`tr-${i}`} theme={theme}>{cellElements}</TableRow>);
    }
    // 段落（デフォルト）
    else if (trimmedLine !== '') {
      // スタンドアロンリンクのチェック（段落全体が単一のリンクの場合）
      const standaloneLinkMatch = trimmedLine.match(/^\[([^\]]+?)\]\(([^)]+?)\)$/);      
      if (standaloneLinkMatch) {
        // スタンドアロンリンクの場合
        const url = standaloneLinkMatch[2];
        const ogpInfo = ogpData?.get(url);
        
        // OGP情報がある場合は直接カードを配置、ない場合は段落内にリンク
        if (ogpInfo && (ogpInfo.title || ogpInfo.description)) {
          jsxElements.push(
            <Link 
              key={`link-${i}`}
              text={standaloneLinkMatch[1]} 
              url={url} 
              theme={theme}
              ogpInfo={ogpInfo}
              isStandalone={true}
            />
          );
        } else {
          jsxElements.push(
            <Paragraph key={`p-${i}`} theme={theme}>
              <Link 
                text={standaloneLinkMatch[1]} 
                url={url} 
                theme={theme}
                ogpInfo={ogpInfo}
                isStandalone={false}
              />
            </Paragraph>
          );
        }
        continue;
      }
      
      // 通常の段落処理
      const paragraphContent = parseInlineMarkdown(trimmedLine, theme, ogpData);
      
      // 前の要素が段落かどうかチェック
      const lastIndex = jsxElements.length - 1;
      const lastElement = lastIndex >= 0 ? jsxElements[lastIndex] : null;
      
      // 前の行が特殊な行でないかチェック
      const isPreviousLineSpecial = i > 0 && 
        ['#', '>', '```', '---', '- ', '* ', '+ ', '1. ', '|'].some(prefix => 
          lines[i-1].trim().startsWith(prefix)
        );
      
      // 空行でない連続した行を同じ段落にまとめる
      if (lastElement && 
          lastElement.type === Paragraph && 
          !isPreviousLineSpecial && 
          i > 0 && 
          lines[i-1].trim() !== '') {
        
        // 既存の段落内容を取得
        const existingContent = lastElement.props.children;
        
        // 改行を追加して新しい内容を結合
        let newContent;
        if (Array.isArray(existingContent)) {
          newContent = [...existingContent, <br key={`br-${i}`} />];
          if (Array.isArray(paragraphContent)) {
            newContent = [...newContent, ...paragraphContent];
          } else {
            newContent.push(paragraphContent);
          }
        } else {
          newContent = [existingContent, <br key={`br-${i}`} />];
          if (Array.isArray(paragraphContent)) {
            newContent = [...newContent, ...paragraphContent];
          } else {
            newContent.push(paragraphContent);
          }
        }
        
        // 既存の段落を更新
        jsxElements[lastIndex] = <Paragraph key={`p-${i}`} theme={theme}>{newContent}</Paragraph>;
      } else {
        // 新しい段落を作成
        jsxElements.push(<Paragraph key={`p-${i}`} theme={theme}>{paragraphContent}</Paragraph>);
      }
    }
  }

  // 閉じていない状態の処理
  if (inCodeBlock) {
    jsxElements.push(
      <CodeBlock 
        key="codeblock-end" 
        content={codeBlockContent.trim()} 
        language={codeBlockLang} 
        theme={theme}
      />
    );
  }
  
  if (inList) {
    jsxElements.push(renderNestedList(nestedListItems, `list-end`, theme));
  }
  
  if (inTable) {
    jsxElements.push(
      <Table key="table-end" theme={theme}>
        <TableHeader theme={theme}>
          {tableRows[0]}
        </TableHeader>
        <TableBody theme={theme}>
          {tableRows.slice(1)}
        </TableBody>
      </Table>
    );
  }

  return jsxElements;
};

/**
 * メインのMarkdownToJsxコンポーネント
 * パフォーマンス向上のためにuseMemoを使用
 */
const MarkdownToJsx: React.FC<MarkdownToJsxProps> = ({ markdown, themeName = 'dark', customTheme, ogpData }) => {
  // テーマの選択
  const theme = customTheme || themes[themeName] || themes.dark;
  
  // コンテナスタイル
  const containerStyle = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    padding: '20px',
    borderRadius: '5px',
    transition: 'all 0.3s ease',
  };
  
  // メモ化によりパフォーマンスを向上
  const jsxElements = useMemo(() => parseMarkdown(markdown, theme, ogpData), [markdown, theme, ogpData]);
  
  return (
    <div style={containerStyle}>
      {jsxElements}
    </div>
  );
};

export default MarkdownToJsx;
