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
        backgroundColor: "#ffffff",
        textColor: "#333333",
        linkColor: "#007bff",
        codeBackgroundColor: "#f0f0f0",
        codeTextColor: "#333333",
        blockquoteBackgroundColor: "#f9f9f9",
        blockquoteBorderColor: "#ccc",
        blockquoteTextColor: "#666",
        tableHeaderBackgroundColor: "#f2f2f2",
        tableBorderColor: "#ddd",
        horizontalRuleColor: "#ccc",
    },

    // ダークテーマ
    dark: {
        backgroundColor: "#1e1e1e",
        textColor: "#e0e0e0",
        linkColor: "#4da3ff",
        codeBackgroundColor: "#2d2d2d",
        codeTextColor: "#e0e0e0",
        blockquoteBackgroundColor: "#2a2a2a",
        blockquoteBorderColor: "#555",
        blockquoteTextColor: "#aaa",
        tableHeaderBackgroundColor: "#2a2a2a",
        tableBorderColor: "#555",
        horizontalRuleColor: "#555",
    },

    // セピアテーマ
    sepia: {
        backgroundColor: "#f4ecd8",
        textColor: "#5b4636",
        linkColor: "#1e7b75",
        codeBackgroundColor: "#e8e0cc",
        codeTextColor: "#5b4636",
        blockquoteBackgroundColor: "#eae0c9",
        blockquoteBorderColor: "#c3b393",
        blockquoteTextColor: "#7d6b56",
        tableHeaderBackgroundColor: "#e8e0cc",
        tableBorderColor: "#c3b393",
        horizontalRuleColor: "#c3b393",
    },

    // Nordテーマ
    nord: {
        backgroundColor: "#2e3440",
        textColor: "#d8dee9",
        linkColor: "#88c0d0",
        codeBackgroundColor: "#3b4252",
        codeTextColor: "#d8dee9",
        blockquoteBackgroundColor: "#3b4252",
        blockquoteBorderColor: "#81a1c1",
        blockquoteTextColor: "#e5e9f0",
        tableHeaderBackgroundColor: "#3b4252",
        tableBorderColor: "#4c566a",
        horizontalRuleColor: "#4c566a",
    },

    // GitHubテーマ
    github: {
        backgroundColor: "#ffffff",
        textColor: "#24292e",
        linkColor: "#0366d6",
        codeBackgroundColor: "#f6f8fa",
        codeTextColor: "#24292e",
        blockquoteBackgroundColor: "#f6f8fa",
        blockquoteBorderColor: "#dfe2e5",
        blockquoteTextColor: "#6a737d",
        tableHeaderBackgroundColor: "#f6f8fa",
        tableBorderColor: "#dfe2e5",
        horizontalRuleColor: "#e1e4e8",
    },

    // Draculaテーマ
    dracula: {
        backgroundColor: "#282a36",
        textColor: "#f8f8f2",
        linkColor: "#8be9fd",
        codeBackgroundColor: "#44475a",
        codeTextColor: "#f8f8f2",
        blockquoteBackgroundColor: "#44475a",
        blockquoteBorderColor: "#6272a4",
        blockquoteTextColor: "#f8f8f2",
        tableHeaderBackgroundColor: "#44475a",
        tableBorderColor: "#6272a4",
        horizontalRuleColor: "#6272a4",
    },

	// my theme
	myTheme: {
		backgroundColor: "#0F0F0F",
		textColor: "#f8f8f2",
		linkColor: "#8be9fd",
		codeBackgroundColor: "#16191d",
		codeTextColor: "#f8f8f2",
		blockquoteBackgroundColor: "#3C3D37",
		blockquoteBorderColor: "#6272a4",
		blockquoteTextColor: "#9e978c",
		tableHeaderBackgroundColor: "#232D3F",
		tableBorderColor: "#6272a4",
		horizontalRuleColor: "#6272a4",
	},
} as const;

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
    themeName?: keyof typeof themes | "light" | "dark";
    customTheme?: Theme;
    enableOGP?: boolean;
    ogpData?: Map<string, OGPInfo>;
}

// --- カスタムノード型（注釈・フッター） ---
interface NoteNode {
    type: 'note';
    label?: string;
    title?: string;
    children: RootContent[];
}

interface FooterNode {
    type: 'footer';
    children: RootContent[];
}

type AstNode = RootContent | Root | NoteNode | FooterNode;

/**
 * インラインコードコンポーネント
 */
const InlineCode: React.FC<{ code: string; theme: Theme }> = ({
    code,
    theme,
}) => {
    const style = {
        backgroundColor: theme.codeBackgroundColor,
        color: theme.codeTextColor,
        padding: "2px 4px",
        borderRadius: "3px",
        fontFamily: "monospace",
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
    const style = {
        color: theme.linkColor,
        textDecoration: "underline",
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
 */
const Heading: React.FC<{
    level: 1 | 2 | 3 | 4;
    children: React.ReactNode;
    theme: Theme;
}> = ({ level, children, theme }) => {
    const styles = {
        h1: {
            fontSize: "1.9em",
            fontWeight: "bold",
            margin: "1.0em 0",
            color: withAlpha(theme.textColor, 0.9),
            lineHeight: "1.2",
            letterSpacing: "-0.03em",
            paddingBottom: "0.5rem",
            borderBottom: "3px solid #3498db",
        },
        h2: {
            fontSize: "1.45em",
            fontWeight: "bold",
            margin: "0.75em 0",
            color: withAlpha(theme.textColor, 0.9),
            lineHeight: "1.3",
            paddingLeft: "1rem",
            borderLeft: "5px solid #2ecc71",
        },
        h3: {
            fontSize: "1.12em",
            fontWeight: "bold",
            margin: "0.5em 0",
            color: withAlpha(theme.textColor, 0.88),
            paddingBottom: "0.4rem",
            display: "inline-block",
        },
		h4: {
			fontSize: "1.05em",
			fontWeight: "bold",
			margin: "0.25em 0",
			color: withAlpha(theme.textColor, 0.88),
			paddingBottom: "0.4rem",
			display: "inline-block",
		},
    };

    switch (level) {
        case 1:
            return <h1 style={styles.h1}>{children}</h1>;
        case 2:
            return <h2 style={styles.h2}>{children}</h2>;
        case 3:
            return <h3 style={styles.h3}>{children}</h3>;
        case 4:
            return <h4 style={styles.h4}>{children}</h4>;
        default:
            return <h4 style={styles.h4}>{children}</h4>;
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
    const style = {
        borderLeft: `4px solid ${theme.blockquoteBorderColor}`,
        paddingLeft: "16px",
        paddingTop: "8px",
        paddingBottom: "8px",
        backgroundColor: theme.blockquoteBackgroundColor,
        color: theme.blockquoteTextColor,
        margin: "1.5em 0",
        borderRadius: "0 4px 4px 0",
        position: "relative" as const,
    };

    const sourceStyle = {
        display: "block",
        textAlign: "right" as const,
        marginTop: "8px",
        fontSize: "0.9em",
        fontStyle: "italic" as const,
        opacity: 0.8,
        wordBreak: "break-word" as const,
        maxWidth: "100%",
        paddingRight: "8px",
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
    const style = {
        backgroundColor: theme.codeBackgroundColor,
        color: theme.codeTextColor,
        padding: "10px",
        borderRadius: "4px",
        overflowX: "auto" as const,
        fontFamily: "monospace",
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
        border: "0",
        borderTop: `1px solid ${theme.horizontalRuleColor}`,
        margin: "1em 0",
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
    const style = {
        margin: "1em 0",
		paddingLeft: "10px",
        color: theme.textColor,
        whiteSpace: "pre-wrap" as const,
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
    const baseStyle = {
		margin: 0,
        display: "list-item" as const,
        color: theme.textColor,
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
    const baseStyle = {
		margin: 0,
        paddingLeft: "30px",
        listStyleType: "disc" as const,
        color: theme.textColor,
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
    const baseStyle = {
		margin: 0,
        paddingLeft: "30px",
        listStyleType: "decimal" as const,
        color: theme.textColor,
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
    const style = {
        borderCollapse: "collapse" as const,
        width: "100%",
        margin: "1em 0",
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
    return <thead style={{ color: theme.textColor }}>{children}</thead>;
};

/**
 * テーブルボディコンポーネント
 */
const TableBody: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    return <tbody style={{ color: theme.textColor }}>{children}</tbody>;
};

/**
 * テーブル行コンポーネント
 */
const TableRow: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    return <tr style={{ color: theme.textColor }}>{children}</tr>;
};

/**
 * テーブルヘッダーセルコンポーネント
 */
const TableHeaderCell: React.FC<{
    children: React.ReactNode;
    theme: Theme;
}> = ({ children, theme }) => {
    const style = {
        border: `1px solid ${theme.tableBorderColor}`,
        padding: "8px",
        backgroundColor: theme.tableHeaderBackgroundColor,
        color: theme.textColor,
        textAlign: "left" as const,
    };

    return <th style={style}>{children}</th>;
};

/**
 * テーブルデータセルコンポーネント
 */
const TableDataCell: React.FC<{ children: React.ReactNode; theme: Theme }> = ({
    children,
    theme,
}) => {
    const style = {
        border: `1px solid ${theme.tableBorderColor}`,
        padding: "8px",
        color: theme.textColor,
        textAlign: "left" as const,
    };

    return <td style={style}>{children}</td>;
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
        parentNode?: RootContent | Root;
    }
): React.ReactNode => {
    const key = `${node.type}-${index ?? "0"}`;

    // Parent型かどうかをチェックする型ガード
    const isParent = (n: any): n is Parent => {
        return n && Array.isArray(n.children);
    };

    // 子ノードをレンダリングするヘルパー関数
    const renderChildren = (
        parent: Parent,
        currentTheme: Theme
    ): React.ReactNode[] => {
        return parent.children.map((child, i) =>
            renderAstNode(child as RootContent, currentTheme, i, options)
        );
    };

    switch (node.type) {
        // --- カスタムノードの描画 ---
        case 'note': {
            const note = node as NoteNode;
            const containerStyle: React.CSSProperties = {
                borderLeft: `4px solid ${theme.linkColor}`,
                backgroundColor: theme.blockquoteBackgroundColor,
                color: theme.textColor,
                padding: '12px 16px',
                margin: '1em 0',
                borderRadius: 4,
            };
            const titleStyle: React.CSSProperties = {
                fontWeight: 'bold',
                marginBottom: 6,
            };
            return (
                <div style={containerStyle} key={key}>
                    {(note.label || note.title) && (
                        <div style={titleStyle}>
                            {note.label ? `${note.label.toUpperCase()}` : 'NOTE'}
                            {note.title ? `: ${note.title}` : ''}
                        </div>
                    )}
                    {note.children.map((c, i) => renderAstNode(c, theme, i, options))}
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
                options?.ogpData &&
                paragraphNode.children.length === 1 &&
                paragraphNode.children[0].type === "link"
            ) {
                const linkNode = paragraphNode.children[0] as MdastLink;
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
            
            return (
                <Paragraph theme={theme} key={key}>
                    {renderChildren(paragraphNode, theme)}
                </Paragraph>
            );
        }
        case "heading": {
            // Headingコンポーネントが受け付けるlevelは1-4のため調整
            const level = Math.min(Math.max(node.depth, 1), 4) as 1 | 2 | 3 | 4;
            return (
                <Heading level={level} theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
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
            const headerRow = node.children[0];
            const bodyRows = node.children.slice(1);
            return (
                <Table theme={theme} key={key}>
                    <TableHeader theme={theme}>
                        {renderAstNode(headerRow as RootContent, theme, 0)}
                    </TableHeader>
                    <TableBody theme={theme}>
                        {bodyRows.map((row, i) =>
                            renderAstNode(row as RootContent, theme, i + 1)
                        )}
                    </TableBody>
                </Table>
            );
        }
        case "tableRow":
            return (
                <TableRow theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </TableRow>
            );
        case "tableCell": {
            const CellComponent = TableDataCell;
            return (
                <CellComponent theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </CellComponent>
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
    themeName = "myTheme",
    customTheme,
    enableOGP = false,
    ogpData,
}) => {
    // テーマの選択
    const theme = customTheme || themes[themeName] || themes.dark;

    // コンテナスタイル
    const containerStyle = {
        backgroundColor: theme.backgroundColor,
        color: theme.textColor,
        padding: "30px",
        borderRadius: "5px",
        transition: "all 0.3s ease",
        maxWidth: "800px",
        margin: "0 auto",
    };

    // メモ化によりパフォーマンスを向上 (Markdown文字列とテーマが変更された場合のみ再計算)
    const jsxElements = useMemo(() => {
        if (!markdown) return null; // markdownがない場合はnullを返す
        // コンポーネント内部で AST を生成
        const ast = markdownToAst(markdown);

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

            const parseNoteHeader = (text: string) => {
                // ::: NOTE xxx(Title)
                const m = text.match(/^:::\s*NOTE(?:\s+([^()]+))?(?:\(([^)]*)\))?\s*$/i);
                if (!m) return null;
                const label = m[1]?.trim();
                const title = m[2]?.trim();
                return { label, title };
            };

            for (let i = 0; i < children.length; i++) {
                const n = children[i];
                // 注釈ブロック開始
                if (
                    isParagraphWithText(n, /^:::\s*NOTE\b/i)
                ) {
                    const headerText = (paraText(n) ?? '').toString();
                    const meta = parseNoteHeader(headerText);
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
                    const noteNode: NoteNode = {
                        type: 'note',
                        label: meta?.label || 'note',
                        title: meta?.title,
                        children: content,
                    };
                    transformed.push(noteNode as unknown as RootContent);
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
        return renderAstNode(transformedAst, theme, 0, { enableOGP, ogpData });
    }, [markdown, theme, enableOGP, ogpData]); // 依存配列を更新

    return <div style={containerStyle}>{jsxElements}</div>;
};

export default MarkdownToJsx;
