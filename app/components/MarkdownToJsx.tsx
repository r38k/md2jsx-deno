/**
 * MarkdownをJSXに変換するコンポーネント
 *
 * LINEWORKSの掲示板の仕様上，スタイルを適用するにはインラインスタイルを使用する必要がある
 *
 */

import React, { useMemo } from "react";
import {
    tokenizeCode,
    Theme as HighlighterTheme,
} from "../components/syntax/SyntaxHighlighter.tsx";
import type { Parent } from "unist";
import type { Root, Link as MdastLink, RootContent } from "mdast";
import { markdownToAst } from "../utils/parser/markdownParser.ts";
import { type OGPInfo } from '../utils/ogp.ts';
import OGPCard from './OGPCard.tsx';
import TwitterCard from './TwitterCard.tsx';
import TwitterWidgetsCard from './TwitterWidgetsCard.tsx';
import { isTwitterUrl, type TwitterEmbedData } from '../utils/twitter.ts';

/**
 * テーマの型定義
 */
interface Theme {
    backgroundColor: string;
    textColor: string;
    mutedColor: string;
    accentColor: string;
    borderColor: string;
    hashColor: string;
    rowAltColor: string;
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
    // humble（デフォルト）
    humble: {
        backgroundColor: "#0a0a0b",
        textColor: "#e8e8f0",
        mutedColor: "#8a8a90",
        accentColor: "#d4a574",
        borderColor: "#2a2a3a",
        hashColor: "#5a5a6a",
        rowAltColor: "rgba(255, 250, 240, 0.022)",
        linkColor: "#d4a574",
        codeBackgroundColor: "#050507",
        codeTextColor: "#b8b8c0",
        blockquoteBackgroundColor: "transparent",
        blockquoteBorderColor: "#8b7355",
        blockquoteTextColor: "#e8e8f0",
        tableHeaderBackgroundColor: "rgba(255, 250, 240, 0.028)",
        tableBorderColor: "#2a2a3a",
        horizontalRuleColor: "#2a2a3a",
    },

    // ライトテーマ
    light: {
        backgroundColor: "#ffffff",
        textColor: "#333333",
        mutedColor: "#6a737d",
        accentColor: "#007bff",
        borderColor: "#dfe2e5",
        hashColor: "#c6cbd1",
        rowAltColor: "rgba(0, 0, 0, 0.025)",
        linkColor: "#007bff",
        codeBackgroundColor: "#f0f0f0",
        codeTextColor: "#333333",
        blockquoteBackgroundColor: "rgba(0, 123, 255, 0.06)",
        blockquoteBorderColor: "#007bff",
        blockquoteTextColor: "#555",
        tableHeaderBackgroundColor: "rgba(0, 0, 0, 0.025)",
        tableBorderColor: "#dfe2e5",
        horizontalRuleColor: "#dfe2e5",
    },

    // ダークテーマ
    dark: {
        backgroundColor: "#1e1e1e",
        textColor: "#e0e0e0",
        mutedColor: "#9a9a9a",
        accentColor: "#4da3ff",
        borderColor: "#3a3a3a",
        hashColor: "#666666",
        rowAltColor: "rgba(255, 255, 255, 0.03)",
        linkColor: "#4da3ff",
        codeBackgroundColor: "#2d2d2d",
        codeTextColor: "#e0e0e0",
        blockquoteBackgroundColor: "rgba(77, 163, 255, 0.1)",
        blockquoteBorderColor: "#4da3ff",
        blockquoteTextColor: "#bbb",
        tableHeaderBackgroundColor: "rgba(255, 255, 255, 0.03)",
        tableBorderColor: "#3a3a3a",
        horizontalRuleColor: "#3a3a3a",
    },

    // セピアテーマ
    sepia: {
        backgroundColor: "#f4ecd8",
        textColor: "#5b4636",
        mutedColor: "#8a7858",
        accentColor: "#1e7b75",
        borderColor: "#c3b393",
        hashColor: "#b0a07d",
        rowAltColor: "rgba(91, 70, 54, 0.04)",
        linkColor: "#1e7b75",
        codeBackgroundColor: "#e8e0cc",
        codeTextColor: "#5b4636",
        blockquoteBackgroundColor: "rgba(30, 123, 117, 0.1)",
        blockquoteBorderColor: "#1e7b75",
        blockquoteTextColor: "#7d6b56",
        tableHeaderBackgroundColor: "rgba(91, 70, 54, 0.04)",
        tableBorderColor: "#c3b393",
        horizontalRuleColor: "#c3b393",
    },

    // Nordテーマ
    nord: {
        backgroundColor: "#2e3440",
        textColor: "#d8dee9",
        mutedColor: "#81a1c1",
        accentColor: "#88c0d0",
        borderColor: "#4c566a",
        hashColor: "#4c566a",
        rowAltColor: "rgba(255, 255, 255, 0.03)",
        linkColor: "#88c0d0",
        codeBackgroundColor: "#3b4252",
        codeTextColor: "#d8dee9",
        blockquoteBackgroundColor: "rgba(136, 192, 208, 0.12)",
        blockquoteBorderColor: "#88c0d0",
        blockquoteTextColor: "#e5e9f0",
        tableHeaderBackgroundColor: "rgba(255, 255, 255, 0.03)",
        tableBorderColor: "#4c566a",
        horizontalRuleColor: "#4c566a",
    },

    // GitHubテーマ
    github: {
        backgroundColor: "#ffffff",
        textColor: "#24292e",
        mutedColor: "#6a737d",
        accentColor: "#0366d6",
        borderColor: "#e1e4e8",
        hashColor: "#c6cbd1",
        rowAltColor: "rgba(27, 31, 35, 0.04)",
        linkColor: "#0366d6",
        codeBackgroundColor: "#f6f8fa",
        codeTextColor: "#24292e",
        blockquoteBackgroundColor: "rgba(3, 102, 214, 0.06)",
        blockquoteBorderColor: "#0366d6",
        blockquoteTextColor: "#6a737d",
        tableHeaderBackgroundColor: "rgba(27, 31, 35, 0.04)",
        tableBorderColor: "#e1e4e8",
        horizontalRuleColor: "#e1e4e8",
    },

    // Draculaテーマ
    dracula: {
        backgroundColor: "#282a36",
        textColor: "#f8f8f2",
        mutedColor: "#6272a4",
        accentColor: "#8be9fd",
        borderColor: "#44475a",
        hashColor: "#6272a4",
        rowAltColor: "rgba(98, 114, 164, 0.08)",
        linkColor: "#8be9fd",
        codeBackgroundColor: "#44475a",
        codeTextColor: "#f8f8f2",
        blockquoteBackgroundColor: "rgba(139, 233, 253, 0.1)",
        blockquoteBorderColor: "#8be9fd",
        blockquoteTextColor: "#f8f8f2",
        tableHeaderBackgroundColor: "rgba(98, 114, 164, 0.08)",
        tableBorderColor: "#44475a",
        horizontalRuleColor: "#44475a",
    },
} as const;

/**
 * フォントスタック
 */
const FONT_SANS =
    '"Inter", "Noto Sans JP", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
const FONT_MONO =
    '"JetBrains Mono", "Fira Code", "SFMono-Regular", ui-monospace, Menlo, monospace';

// ヘックスカラーに透明度を適用する簡易ユーティリティ
const withAlpha = (hex: string, alpha: number): string => {
    const m = hex.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return hex;
    let r: number, g: number, b: number;
    if (m[1].length === 3) {
        r = parseInt(m[1][0] + m[1][0], 16);
        g = parseInt(m[1][1] + m[1][1], 16);
        b = parseInt(m[1][2] + m[1][2], 16);
    } else {
        r = parseInt(m[1].slice(0, 2), 16);
        g = parseInt(m[1].slice(2, 4), 16);
        b = parseInt(m[1].slice(4, 6), 16);
    }
    const a = Math.min(Math.max(alpha, 0), 1);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * 利用可能なテーマ名
 */
export type ThemeName = keyof typeof themes;

/**
 * MarkdownToJsx コンポーネントのプロパティ
 */
interface MarkdownToJsxProps {
    markdown: string; // AST の代わりに Markdown 文字列を受け取る
    themeName?: keyof typeof themes;
    customTheme?: Theme;
    enableOGP?: boolean;
    ogpData?: Map<string, OGPInfo>;
    twitterData?: Map<string, TwitterEmbedData>;
    twitterMode?: 'widgets' | 'inline'; // Twitter表示モード
}

// --- カスタムノード型（カード・フッター） ---
type CardType = 'info' | 'warning' | 'tip' | 'danger' | 'note';

interface CardNode {
    type: 'card';
    cardType: CardType;
    title?: string;
    children: RootContent[];
}

interface FooterNode {
    type: 'footer';
    children: RootContent[];
}

type AstNode = RootContent | Root | CardNode | FooterNode;

const cardTypeConfig: Record<CardType, { color: string; defaultTitle: string }> = {
    info:    { color: '#3498db', defaultTitle: 'INFO' },
    tip:     { color: '#2ecc71', defaultTitle: 'TIP' },
    warning: { color: '#f39c12', defaultTitle: 'WARNING' },
    danger:  { color: '#e74c3c', defaultTitle: 'DANGER' },
    note:    { color: '#9b59b6', defaultTitle: 'NOTE' },
};

/**
 * インラインコードコンポーネント
 */
const InlineCode: React.FC<{ code: string; theme: Theme }> = ({
    code,
    theme,
}) => {
    const style: React.CSSProperties = {
        fontFamily: FONT_MONO,
        fontSize: "13px",
        backgroundColor: theme.codeBackgroundColor,
        color: theme.accentColor,
        padding: "2px 6px",
        border: `1px solid ${theme.borderColor}`,
        borderRadius: "3px",
    };

    return <code style={style}>{code}</code>;
};

/**
 * 太字コンポーネント
 */
const Bold: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    const style = {
        fontWeight: "bold",
    };

    return <strong style={style}>{children}</strong>;
};

/**
 * イタリックコンポーネント
 */
const Italic: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    const style = {
        fontStyle: "italic",
    };

    return <em style={style}>{children}</em>;
};

/**
 * 取り消し線コンポーネント
 */
const Strikethrough: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    const style = {
        textDecoration: "line-through",
    };

    return <del style={style}>{children}</del>;
};

/**
 * リンクコンポーネント
 */
const Link: React.FC<{
    children: React.ReactNode;
    url: string;
    title?: string;
    theme: Theme;
}> = ({ children, url, title, theme }) => {
    const style: React.CSSProperties = {
        color: theme.accentColor,
        textDecoration: "underline",
        textDecorationColor: withAlpha(theme.accentColor, 0.45),
        textUnderlineOffset: "2px",
    };

    // 外部リンクの場合は新しいタブで開く
    const isExternal = url.startsWith("http://") || url.startsWith("https://");

    return (
        <a
            href={url}
            style={style}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            title={title}
        >
            {children}
        </a>
    );
};

/**
 * 画像コンポーネント
 */
const Image: React.FC<{
    alt?: string;
    src: string;
    title?: string;
    theme: Theme;
}> = ({ alt, src, title, theme }) => {
    const style = {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        margin: "10px 0",
    };

    return <img src={src} alt={alt ?? ""} title={title} style={style} />;
};

/**
 * 見出しコンポーネント
 *
 * humble 仕様:
 *   - h1/h2 は全幅アンダーライン（見出し自体に border-bottom）
 *   - h3/h4 は文字幅アンダーライン（内側 span に border-bottom を付けることで、
 *     見出し同士が連続しても横並びにならないようにする）
 *   - すべての見出し先頭に # プレフィクス（hashColor・mono font）
 */
const Heading: React.FC<{
    level: 1 | 2 | 3 | 4;
    children: React.ReactNode;
    anchorId?: string;
    theme: Theme;
}> = ({ level, children, anchorId, theme }) => {
    const specs: Record<1 | 2 | 3 | 4, {
        outer: React.CSSProperties;
        inner?: React.CSSProperties;
        hashSize: string;
    }> = {
        1: {
            outer: {
                fontFamily: FONT_SANS,
                fontSize: "30px",
                fontWeight: 650,
                letterSpacing: "-0.5px",
                margin: "0 0 10px",
                color: theme.textColor,
                lineHeight: 1.25,
                paddingBottom: "10px",
                borderBottom: `2px solid ${withAlpha(theme.accentColor, 0.75)}`,
            },
            hashSize: "26px",
        },
        2: {
            outer: {
                fontFamily: FONT_SANS,
                fontSize: "21px",
                fontWeight: 600,
                margin: "38px 0 10px",
                color: withAlpha(theme.textColor, 0.97),
                lineHeight: 1.3,
                paddingBottom: "6px",
                borderBottom: `1.5px solid ${withAlpha(theme.accentColor, 0.75)}`,
            },
            hashSize: "18px",
        },
        3: {
            outer: {
                fontFamily: FONT_SANS,
                fontSize: "16.5px",
                fontWeight: 600,
                margin: "26px 0 6px",
                color: withAlpha(theme.textColor, 0.92),
            },
            inner: {
                display: "inline-block",
                paddingBottom: "3px",
                borderBottom: `1px solid ${withAlpha(theme.accentColor, 0.45)}`,
            },
            hashSize: "14.5px",
        },
        4: {
            outer: {
                fontFamily: FONT_SANS,
                fontSize: "14px",
                fontWeight: 600,
                margin: "20px 0 4px",
                color: withAlpha(theme.textColor, 0.78),
            },
            inner: {
                display: "inline-block",
                paddingBottom: "2px",
                borderBottom: `1px dashed ${theme.mutedColor}`,
            },
            hashSize: "12px",
        },
    };

    const spec = specs[level];
    const hashStyle: React.CSSProperties = {
        color: theme.hashColor,
        fontFamily: FONT_MONO,
        fontWeight: 400,
        marginRight: "10px",
        letterSpacing: "-0.5px",
        userSelect: "none",
        fontSize: spec.hashSize,
    };
    const hashEl = <span style={hashStyle}>{"#".repeat(level)}</span>;

    const inner = spec.inner ? (
        <span style={spec.inner}>
            {hashEl}
            {children}
        </span>
    ) : (
        <>
            {hashEl}
            {children}
        </>
    );

    switch (level) {
        case 1:
            return (
                <h1 id={anchorId} style={spec.outer}>
                    {inner}
                </h1>
            );
        case 2:
            return (
                <h2 id={anchorId} style={spec.outer}>
                    {inner}
                </h2>
            );
        case 3:
            return (
                <h3 id={anchorId} style={spec.outer}>
                    {inner}
                </h3>
            );
        case 4:
            return (
                <h4 id={anchorId} style={spec.outer}>
                    {inner}
                </h4>
            );
    }
};

/**
 * 引用コンポーネント
 */
const Blockquote: React.FC<{
    children: React.ReactNode;
    source?: string;
    theme: Theme;
}> = ({ children, source, theme }) => {
    const style: React.CSSProperties = {
        margin: "28px 0",
        padding: "4px 0 4px 20px",
        borderLeft: `1px solid ${theme.blockquoteBorderColor}`,
        backgroundColor: theme.blockquoteBackgroundColor,
        color: theme.blockquoteTextColor,
        fontStyle: "italic",
    };

    const sourceStyle: React.CSSProperties = {
        display: "block",
        marginTop: "10px",
        color: theme.mutedColor,
        fontFamily: FONT_MONO,
        fontSize: "11px",
        fontStyle: "normal",
        letterSpacing: "0.15em",
        wordBreak: "break-word",
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
const CodeBlock: React.FC<{
    content: string;
    language?: string;
    theme: Theme;
}> = ({ content, language, theme }) => {
    const style: React.CSSProperties = {
        margin: "18px 0 22px",
        padding: "18px 22px",
        borderRadius: "2px",
        borderLeft: `1px solid ${theme.borderColor}`,
        backgroundColor: theme.codeBackgroundColor,
        color: theme.codeTextColor,
        fontFamily: FONT_MONO,
        fontSize: "12.5px",
        lineHeight: 1.85,
        letterSpacing: 0,
        overflow: "auto",
    };

    // シンタックスハイライト処理（インラインスタイルで実装）
    const highlightedCode = useMemo(() => {
        if (!language) return content;
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
    const style: React.CSSProperties = {
        margin: "40px 0",
        border: "none",
        height: "1px",
        background: `linear-gradient(90deg, transparent 0%, ${theme.horizontalRuleColor} 20%, ${theme.horizontalRuleColor} 80%, transparent 100%)`,
    };

    return <hr style={style} />;
};

/**
 * 段落コンポーネント
 */
const Paragraph: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    const style: React.CSSProperties = {
        margin: "0 0 16px",
        fontFamily: FONT_SANS,
        fontSize: "15px",
        lineHeight: 1.95,
        color: theme.textColor,
        whiteSpace: "pre-wrap",
    };

    return <p style={style}>{children}</p>;
};

/**
 * チェックボックスコンポーネント
 */
const Checkbox: React.FC<{ checked: boolean; theme: Theme }> = ({
    checked,
    theme,
}) => {
    const style = {
        marginRight: "8px",
        verticalAlign: "middle",
    };

    return <input type="checkbox" checked={checked} readOnly style={style} />;
};

/**
 * リストアイテムコンポーネント
 */
const ListItem: React.FC<{
    children: React.ReactNode;
    theme: Theme;
    style?: React.CSSProperties;
}> = ({ children, theme, style = {} }) => {
    const baseStyle: React.CSSProperties = {
        marginBottom: "2px",
        display: "list-item",
        color: theme.textColor,
        lineHeight: 1.7,
    };

    return <li style={{ ...baseStyle, ...style }}>{children}</li>;
};

/**
 * 順序なしリストコンポーネント
 */
const UnorderedList: React.FC<{
    children: React.ReactNode;
    theme: Theme;
    style?: React.CSSProperties;
}> = ({ children, theme, style = {} }) => {
    // ul に muted 系の color を指定すると ::marker がそれを継承する。
    // 各 <li> で textColor を上書きして本文の色は保つ。
    const baseStyle: React.CSSProperties = {
        margin: "4px 0 14px",
        paddingLeft: "22px",
        listStyleType: "disc",
        color: theme.mutedColor,
        fontSize: "15px",
        lineHeight: 1.7,
    };

    return <ul style={{ ...baseStyle, ...style }}>{children}</ul>;
};

/**
 * 順序付きリストコンポーネント
 */
const OrderedList: React.FC<{
    children: React.ReactNode;
    theme: Theme;
    style?: React.CSSProperties;
}> = ({ children, theme, style = {} }) => {
    const baseStyle: React.CSSProperties = {
        margin: "4px 0 14px",
        paddingLeft: "22px",
        listStyleType: "decimal",
        color: theme.mutedColor,
        fontSize: "15px",
        lineHeight: 1.7,
    };

    return <ol style={{ ...baseStyle, ...style }}>{children}</ol>;
};

/**
 * テーブルコンポーネント
 */
const Table: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    const style: React.CSSProperties = {
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13.5px",
        border: `1px solid ${theme.tableBorderColor}`,
        borderRadius: "6px",
        overflow: "hidden",
        margin: "10px 0 18px",
        color: theme.textColor,
    };

    return <table style={style}>{children}</table>;
};

/**
 * テーブルヘッダーコンポーネント
 */
const TableHeader: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    return (
        <thead style={{ backgroundColor: theme.tableHeaderBackgroundColor }}>
            {children}
        </thead>
    );
};

/**
 * テーブルボディコンポーネント
 */
const TableBody: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    return <tbody>{children}</tbody>;
};

/**
 * テーブル行コンポーネント
 *
 * rowIndex が偶数（0, 2, 4...）ならデフォルト、奇数なら alt 背景（zebra stripe）。
 * ヘッダー行は -1 を渡して alt を適用しない。
 */
const TableRow: React.FC<{
    children: React.ReactNode;
    theme: Theme;
    rowIndex?: number;
}> = ({ children, theme, rowIndex = 0 }) => {
    const style: React.CSSProperties = {
        backgroundColor: rowIndex >= 0 && rowIndex % 2 === 1
            ? theme.rowAltColor
            : undefined,
    };
    return <tr style={style}>{children}</tr>;
};

/**
 * テーブルヘッダーセルコンポーネント
 */
const TableHeaderCell: React.FC<{
    children: React.ReactNode;
    theme: Theme;
}> = ({ children, theme }) => {
    const style: React.CSSProperties = {
        padding: "10px 14px",
        fontSize: "12px",
        fontWeight: 600,
        letterSpacing: "0.4px",
        textTransform: "uppercase",
        color: theme.accentColor,
        borderBottom: `1px solid ${theme.tableBorderColor}`,
        textAlign: "left",
    };

    return <th style={style}>{children}</th>;
};

/**
 * テーブルデータセルコンポーネント（列の先頭セルかどうかで色を変える）
 */
const TableDataCell: React.FC<{
    children: React.ReactNode;
    theme: Theme;
    isFirst?: boolean;
    isLastRow?: boolean;
}> = ({ children, theme, isFirst = false, isLastRow = false }) => {
    const style: React.CSSProperties = {
        padding: "9px 14px",
        borderBottom: isLastRow
            ? "none"
            : `1px solid ${theme.tableBorderColor}`,
        color: isFirst ? theme.textColor : theme.mutedColor,
        fontWeight: isFirst ? 500 : undefined,
        textAlign: "left",
    };

    return <td style={style}>{children}</td>;
};

const isParentNode = (node: unknown): node is Parent => {
    return Boolean(node && Array.isArray((node as Parent).children));
};

const getNodeText = (node: RootContent): string => {
    if (node.type === "text" || node.type === "inlineCode") {
        return node.value ?? "";
    }
    if (isParentNode(node)) {
        return node.children.map((child) => getNodeText(child as RootContent)).join(
            ""
        );
    }
    return "";
};

const getNodesText = (nodes: RootContent[]): string => {
    return nodes.map((node) => getNodeText(node)).join("");
};

const extractHeadingAnchor = (headingNode: Parent): {
    anchorId?: string;
    children: RootContent[];
} => {
    const originalChildren = headingNode.children as RootContent[];
    if (originalChildren.length === 0) {
        return { children: originalChildren };
    }

    let anchorId: string | undefined;
    let cleanedChildren = originalChildren;
    const lastChild = originalChildren[originalChildren.length - 1];
    if (lastChild.type === "text") {
        const match = lastChild.value.match(/^(.*?)(?:\s*\{#([A-Za-z0-9_-]+)\})\s*$/);
        if (match) {
            anchorId = match[2];
            const cleanedText = match[1].trimEnd();
            if (cleanedText.length === 0) {
                cleanedChildren = originalChildren.slice(0, -1);
            } else {
                cleanedChildren = originalChildren.slice(0, -1).concat({
                    ...lastChild,
                    value: cleanedText,
                });
            }
        }
    }

    const fallbackText = getNodesText(cleanedChildren).trim();
    if (!anchorId && fallbackText.length > 0) {
        anchorId = fallbackText;
    }

    return { anchorId, children: cleanedChildren };
};

/**
 * ASTノードを再帰的にJSXに変換する関数
 */
const renderAstNode = (
    node: AstNode,
    theme: Theme,
    index?: number,
    options?: {
        enableOGP?: boolean;
        ogpData?: Map<string, OGPInfo>;
        twitterData?: Map<string, TwitterEmbedData>;
        twitterMode?: 'widgets' | 'inline';
        parentNode?: RootContent | Root;
    }
): React.ReactNode => {
    const key = `${node.type}-${index ?? "0"}`;

    // Parent型かどうかをチェックする型ガード
    const isParent = (n: any): n is Parent => {
        return n && Array.isArray(n.children);
    };

    const renderChildNodes = (
        children: RootContent[],
        currentTheme: Theme
    ): React.ReactNode[] => {
        return children.map((child, i) =>
            renderAstNode(child as RootContent, currentTheme, i, options)
        );
    };

    // 子ノードをレンダリングするヘルパー関数
    const renderChildren = (
        parent: Parent,
        currentTheme: Theme
    ): React.ReactNode[] => {
        return renderChildNodes(parent.children as RootContent[], currentTheme);
    };

    switch (node.type) {
        // --- カスタムノードの描画 ---
        case 'card': {
            const card = node as CardNode;
            const config = cardTypeConfig[card.cardType];
            const containerStyle: React.CSSProperties = {
                borderLeft: `4px solid ${config.color}`,
                backgroundColor: withAlpha(config.color, 0.08),
                color: theme.textColor,
                padding: '12px 16px',
                margin: '1em 0',
                borderRadius: 4,
            };
            const titleStyle: React.CSSProperties = {
                fontWeight: 'bold',
                marginBottom: 6,
                color: config.color,
            };
            const displayTitle = card.title || config.defaultTitle;
            return (
                <div style={containerStyle} key={key}>
                    <div style={titleStyle}>{displayTitle}</div>
                    {card.children.map((c, i) => renderAstNode(c, theme, i, options))}
                </div>
            );
        }
        case 'footer': {
            const footer = node as FooterNode;
            const style: React.CSSProperties = {
                borderTop: `1px solid ${theme.horizontalRuleColor}`,
                marginTop: '1.5em',
                paddingTop: '0.75em',
                opacity: 0.85,
                fontSize: '0.95em',
            };
            return (
                <footer style={style} key={key}>
                    {footer.children.map((c, i) => renderAstNode(c, theme, i, options))}
                </footer>
            );
        }
        case "root":
            return (
                <React.Fragment key={key}>
                    {renderChildren(node as Parent, theme)}
                </React.Fragment>
            );
        case "paragraph": {
            const paragraphNode = node as Parent;
            
            // スタンドアロンリンクかチェック（段落内に単一のリンクのみ存在）
            if (
                options?.enableOGP &&
                paragraphNode.children.length === 1 &&
                paragraphNode.children[0].type === "link"
            ) {
                const linkNode = paragraphNode.children[0] as MdastLink;
                
                // Twitter/X URLの場合
                if (isTwitterUrl(linkNode.url) && options?.twitterData) {
                    const twitterEmbed = options.twitterData.get(linkNode.url);
                    if (twitterEmbed) {
                        const TwitterComponent = options?.twitterMode === 'widgets' ? TwitterWidgetsCard : TwitterCard;
                        return (
                            <TwitterComponent
                                url={linkNode.url}
                                embedData={twitterEmbed}
                                theme={theme}
                                key={key}
                            />
                        );
                    }
                }
                
                // 通常のOGPカード
                if (options?.ogpData) {
                    const ogpInfo = options.ogpData.get(linkNode.url);
                    if (ogpInfo) {
                        return (
                            <OGPCard
                                url={linkNode.url}
                                ogpInfo={ogpInfo}
                                theme={theme}
                                key={key}
                            />
                        );
                    }
                }
            }
            
            return (
                <Paragraph theme={theme} key={key}>
                    {renderChildren(paragraphNode, theme)}
                </Paragraph>
            );
        }
        case "heading": {
            // Headingコンポーネントが受け付けるlevelは1-4のため調整
            const level = Math.min(Math.max(node.depth, 1), 4) as 1 | 2 | 3 | 4;
            const { anchorId, children } = extractHeadingAnchor(node as Parent);
            return (
                <Heading level={level} theme={theme} anchorId={anchorId} key={key}>
                    {renderChildNodes(children, theme)}
                </Heading>
            );
        }
        case "thematicBreak":
            return <HorizontalRule theme={theme} key={key} />;
        case "blockquote":
            return (
                <Blockquote theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </Blockquote>
            );
        case "list": {
            const ListComponent = node.ordered ? OrderedList : UnorderedList;
            return (
                <ListComponent theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </ListComponent>
            );
        }
        case "listItem": {
            const listItemNode = node as Parent & { checked?: boolean };

            // listItem の子要素が単一の paragraph ノードかチェック ("tight list" item)
            const isTightListItem =
                listItemNode.children.length === 1 &&
                listItemNode.children[0].type === "paragraph";

            let renderedChildren: React.ReactNode[];

            if (isTightListItem) {
                // tight list の場合: paragraph の *中身* を直接レンダリング
                const paragraphNode = listItemNode.children[0] as Parent;
                renderedChildren = renderChildren(paragraphNode, theme);
            } else {
                // Loose list または複数の子を持つアイテム: 子をレンダリングするが、
                // paragraph は特別扱いして不要なマージンを避ける。
                renderedChildren = listItemNode.children.map((child, i) => {
                    if (child.type === "paragraph") {
                        // paragraph の場合、<p> ラッパーのマージンなしで内容をレンダリング
                        const paragraphNode = child as Parent;
                        // 個別のキーが必要
                        const childKey = `${listItemNode.type}-child-${child.type}-${i}`;
                        // 段落の中身だけを Fragment でラップして返す
                        return (
                            <React.Fragment key={childKey}>
                                {renderChildren(paragraphNode, theme)}
                            </React.Fragment>
                        );
                    } else if (child.type === "list") {
                        // ネストされたリスト: 下マージンを詰めて親 li を膨らませない
                        // (これをしないと ul だけ li 高さが増えて ol との行間差が目立つ)
                        const listChild = child as Parent & { ordered?: boolean };
                        const NestedListComp = listChild.ordered
                            ? OrderedList
                            : UnorderedList;
                        const childKey = `nested-list-${i}`;
                        return (
                            <NestedListComp
                                theme={theme}
                                key={childKey}
                                style={{ marginTop: "4px", marginBottom: 0 }}
                            >
                                {listChild.children.map((subItem, j) =>
                                    renderAstNode(subItem as RootContent, theme, j)
                                )}
                            </NestedListComp>
                        );
                    } else {
                        // 他のタイプのノードは通常通りレンダリング
                        return renderAstNode(child as RootContent, theme, i);
                    }
                });
            }

            // チェックボックスの処理はそのまま維持
            if (typeof listItemNode.checked === "boolean") {
                return (
                    <ListItem
                        theme={theme}
                        key={key}
                        style={{ listStyleType: "none" }}
                    >
                        <Checkbox checked={listItemNode.checked} theme={theme} />
                        <span style={{ marginLeft: "8px" }}>{renderedChildren}</span>
                    </ListItem>
                );
            } else {
                // 通常のリストアイテム
                return (
                    <ListItem theme={theme} key={key}>
                        {renderedChildren}
                    </ListItem>
                );
            }
        } // ブロックスコープ終了
        case "table": {
            const headerRow = node.children[0] as Parent | undefined;
            const bodyRows = (node.children.slice(1) as Parent[]);
            const headerCells = (headerRow?.children ?? []) as Parent[];
            return (
                <Table theme={theme} key={key}>
                    {headerRow && (
                        <TableHeader theme={theme}>
                            <TableRow theme={theme} rowIndex={-1}>
                                {headerCells.map((cell, i) => (
                                    <TableHeaderCell theme={theme} key={i}>
                                        {renderChildNodes(
                                            cell.children as RootContent[],
                                            theme
                                        )}
                                    </TableHeaderCell>
                                ))}
                            </TableRow>
                        </TableHeader>
                    )}
                    <TableBody theme={theme}>
                        {bodyRows.map((row, ri) => {
                            const cells = row.children as Parent[];
                            const isLastRow = ri === bodyRows.length - 1;
                            return (
                                <TableRow theme={theme} key={ri} rowIndex={ri}>
                                    {cells.map((cell, ci) => (
                                        <TableDataCell
                                            theme={theme}
                                            key={ci}
                                            isFirst={ci === 0}
                                            isLastRow={isLastRow}
                                        >
                                            {renderChildNodes(
                                                cell.children as RootContent[],
                                                theme
                                            )}
                                        </TableDataCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            );
        }
        case "tableRow":
            // "table" ケース内で直接描画するため通常は到達しない
            return (
                <TableRow theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </TableRow>
            );
        case "tableCell": {
            // "table" ケース内で直接描画するため通常は到達しない
            return (
                <TableDataCell theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </TableDataCell>
            );
        }
        case "html":
            return null;
        case "code":
            return (
                <CodeBlock
                    content={node.value}
                    language={node.lang || ""}
                    theme={theme}
                    key={key}
                />
            );
        case "yaml":
            return null;
        case "definition":
            return null;
        case "footnoteDefinition":
            return null;

        // --- インライン要素 ---
        case "text":
            return node.value;
        case "emphasis":
            return (
                <Italic theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </Italic>
            );
        case "strong":
            return (
                <Bold theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </Bold>
            );
        case "delete":
            return (
                <Strikethrough theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </Strikethrough>
            );
        case "inlineCode":
            return <InlineCode code={node.value} theme={theme} key={key} />;
        case "break":
            return <br key={key} />;
        case "link": {
            const linkNode = node as MdastLink;
            const linkChildren = renderChildren(linkNode, theme);
            const linkTitle = linkNode.title ?? undefined;
            return (
                <Link
                    url={linkNode.url}
                    title={linkTitle}
                    theme={theme}
                    key={key}
                >
                    {linkChildren}
                </Link>
            );
        }
        case "image":
            return (
                <Image
                    src={node.url}
                    alt={node.alt ?? undefined}
                    title={node.title ?? undefined}
                    theme={theme}
                    key={key}
                />
            );
        case "linkReference": // リンク参照 (未対応)
            console.warn("Link reference rendering not implemented yet.", node);
            return `[${node.label || node.identifier}]`; // fallback
        case "imageReference": // 画像参照 (未対応)
            console.warn(
                "Image reference rendering not implemented yet.",
                node
            );
            return `![${node.alt || node.label || node.identifier}]`; // fallback
        case "footnoteReference": // 脚注参照 (未対応)
            console.warn(
                "Footnote reference rendering not implemented yet.",
                node
            );
            return `[^${node.label || node.identifier}]`; // fallback

        default:
            console.warn(
                `Unhandled AST node type: ${(node as any).type}`,
                node
            );
            if (isParent(node)) {
                return (
                    <React.Fragment key={key}>
                        {renderChildren(node as Parent, theme)}
                    </React.Fragment>
                );
            }
            if (typeof (node as any).value === "string") {
                return (node as any).value;
            }
            return null;
    }
};

/**
 * メインのMarkdownToJsxコンポーネント
 * パフォーマンス向上のためにuseMemoを使用
 */
const MarkdownToJsx: React.FC<MarkdownToJsxProps> = ({
    markdown,
    themeName = "humble",
    customTheme,
    enableOGP = false,
    ogpData,
    twitterData,
    twitterMode = 'inline',
}) => {
    // テーマの選択
    const theme = customTheme || themes[themeName] || themes.humble;

    // コンテナスタイル
    const containerStyle: React.CSSProperties = {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        fontFamily: FONT_SANS,
        fontSize: "15px",
        lineHeight: 1.9,
        letterSpacing: "0.02em",
        padding: "36px 40px",
        borderRadius: "4px",
        transition: "all 0.3s ease",
        margin: "0 auto",
    };

    // メモ化によりパフォーマンスを向上 (Markdown文字列とテーマが変更された場合のみ再計算)
    const jsxElements = useMemo(() => {
        if (!markdown) return null; // markdownがない場合はnullを返す
        // ::: 行の前後に空行を挿入してremarkが個別のparagraphとしてパースできるようにする
        const preprocessed = markdown.replace(
            /^(:::.*?)$/gm,
            (_match, line) => `\n${line}\n`
        );
        // コンポーネント内部で AST を生成
        const ast = markdownToAst(preprocessed);

        // --- カスタム構文のAST変換 ---
        const transformAst = (root: Root): AstNode => {
            const children = [...(root.children as RootContent[])];
            const transformed: RootContent[] = [];

            const paraText = (n: RootContent): string | null => {
                if (n.type !== 'paragraph') return null;
                const p = n as unknown as Parent;
                if (!p.children || p.children.length === 0) return '';
                // 子テキストを結合して評価（強調などが混じっても素のテキストに近い形で判定）
                const text = p.children.map((c: any) => (c.value ?? '')).join('');
                return (text ?? '').toString();
            };
            const isParagraphWithText = (n: RootContent, re: RegExp) => {
                const t = paraText(n);
                if (t == null) return false;
                return re.test(t.trim());
            };

            const validCardTypes = new Set<string>(Object.keys(cardTypeConfig));

            const parseCardHeader = (text: string): { cardType: CardType; title?: string } | null => {
                // :::type タイトル or :::type(タイトル) or :::type
                const m = text.match(/^:::\s*(\w+)(?:\s+(.+?))?(?:\(([^)]*)\))?\s*$/i);
                if (!m) return null;
                const rawType = m[1].toLowerCase();
                if (!validCardTypes.has(rawType)) return null;
                const title = m[3]?.trim() || m[2]?.trim();
                return { cardType: rawType as CardType, title: title || undefined };
            };

            for (let i = 0; i < children.length; i++) {
                const n = children[i];
                // カードブロック開始
                const headerText = paraText(n);
                const cardMeta = headerText != null ? parseCardHeader(headerText.trim()) : null;
                if (cardMeta) {
                    // 終了マーカーを探す
                    let j = i + 1;
                    const content: RootContent[] = [];
                    for (; j < children.length; j++) {
                        const candidate = children[j];
                        if (isParagraphWithText(candidate, /^:::\s*$/)) {
                            break; // 閉じ
                        }
                        content.push(candidate);
                    }
                    const cardNode: CardNode = {
                        type: 'card',
                        cardType: cardMeta.cardType,
                        title: cardMeta.title,
                        children: content,
                    };
                    transformed.push(cardNode as unknown as RootContent);
                    i = j; // 閉じの行まで進める（forループの++で次へ）
                    continue;
                }

                transformed.push(n);
            }

            // フッター（最後の水平線以降をフッターに）
            let lastBreak = -1;
            for (let idx = 0; idx < transformed.length; idx++) {
                if (transformed[idx].type === 'thematicBreak') lastBreak = idx;
            }
            if (lastBreak >= 0 && lastBreak < transformed.length - 1) {
                const head = transformed.slice(0, lastBreak);
                const tail = transformed.slice(lastBreak + 1);
                const footerNode: FooterNode = { type: 'footer', children: tail };
                const out: any = { ...root, children: [...head, footerNode as any] };
                return out as AstNode;
            }

            return { ...root, children: transformed } as AstNode;
        };

        const transformedAst = transformAst(ast as Root);
        // Rootノードからレンダリングを開始
        return renderAstNode(transformedAst, theme, 0, { enableOGP, ogpData, twitterData, twitterMode });
    }, [markdown, theme, enableOGP, ogpData, twitterData, twitterMode]); // 依存配列を更新

    return <div style={containerStyle}>{jsxElements}</div>;
};

export default MarkdownToJsx;
