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
// OGP関連をコメントアウト
// import { type OGPInfo } from '../utils/ogp.ts';
// import OGPCard from './OGPCard.tsx';

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
    // OGPデータをコメントアウト
    // ogpData?: Map<string, OGPInfo>;
}

/**
 * インラインコードコンポーネント
 */
const InlineCode: React.FC<{ code: string; theme: Theme }> = ({
    code,
    theme,
}) => {
    const style = {
        // backgroundColor: theme.codeBackgroundColor,
        // color: theme.codeTextColor,
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
            fontSize: "2em",
            fontWeight: "bold",
            margin: "1.0em 0",
            color: theme.textColor,
            lineHeight: "1.2",
            letterSpacing: "-0.03em",
            paddingBottom: "0.5rem",
            borderBottom: "3px solid #3498db",
        },
        h2: {
            fontSize: "1.5em",
            fontWeight: "bold",
            margin: "0.75em 0",
            color: theme.textColor,
            lineHeight: "1.3",
            paddingLeft: "1rem",
            borderLeft: "5px solid #2ecc71",
        },
        h3: {
            fontSize: "1.17em",
            fontWeight: "bold",
            margin: "0.5em 0",
            color: theme.textColor,
            paddingBottom: "0.4rem",
            display: "inline-block",
        },
		h4: {
			fontSize: "1.1em",
			fontWeight: "bold",
			margin: "0.25em 0",
			color: theme.textColor,
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
    node: RootContent | Root,
    theme: Theme,
    index?: number
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
            renderAstNode(child as RootContent, currentTheme, i)
        );
    };

    switch (node.type) {
        case "root":
            return (
                <React.Fragment key={key}>
                    {renderChildren(node as Parent, theme)}
                </React.Fragment>
            );
        case "paragraph":
            return (
                <Paragraph theme={theme} key={key}>
                    {renderChildren(node as Parent, theme)}
                </Paragraph>
            );
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
            console.warn(
                "Raw HTML rendering is disabled for security.",
                node.value
            );
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
    };

    // メモ化によりパフォーマンスを向上 (Markdown文字列とテーマが変更された場合のみ再計算)
    const jsxElements = useMemo(() => {
        if (!markdown) return null; // markdownがない場合はnullを返す
        // コンポーネント内部で AST を生成
        const ast = markdownToAst(markdown);
        // Rootノードからレンダリングを開始
        return renderAstNode(ast, theme);
    }, [markdown, theme]); // 依存配列を markdown に変更

    return <div style={containerStyle}>{jsxElements}</div>;
};

export default MarkdownToJsx;