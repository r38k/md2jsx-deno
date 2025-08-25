/**
 * シンタックスハイライト機能
 * 
 * インラインスタイルを使用したコードのシンタックスハイライト
 */

import React from 'react';

/**
 * テーマの型定義
 */
export interface Theme {
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
 * テーマがダークかどうかを判定するヘルパー関数
 */
export const isDarkTheme = (theme: Theme): boolean => {
  return theme.backgroundColor.toLowerCase().includes('#1') || 
         theme.backgroundColor.toLowerCase().includes('#2') || 
         theme.backgroundColor.toLowerCase().includes('#3');
};

/**
 * コードをハイライトする関数
 */
export const tokenizeCode = (code: string, lang: string, theme: Theme): React.ReactNode[] => {
  // 言語に応じたハイライト処理
  if (lang === 'javascript' || lang === 'js' || lang === 'jsx' || lang === 'typescript' || lang === 'ts' || lang === 'tsx') {
    return highlightJavaScript(code, theme);
  } else if (lang === 'css') {
    return highlightCSS(code, theme);
  } else if (lang === 'html' || lang === 'xml') {
    return highlightHTML(code, theme);
  }
  
  // 未対応の言語は単純なハイライトを適用
  return simpleHighlight(code, theme);
};

/**
 * JavaScript/TypeScriptのハイライト
 */
const highlightJavaScript = (code: string, theme: Theme): React.ReactNode[] => {
  const isDark = isDarkTheme(theme);
  const result: React.ReactNode[] = [];
  
  // 行ごとに処理
  const lines = code.split('\n');
  
  lines.forEach((line, lineIndex) => {
    const lineTokens: React.ReactNode[] = [];
    
    // コメント（行コメント）
    const lineCommentMatch = line.match(/\/\/.*/);
    if (lineCommentMatch && lineCommentMatch.index !== undefined) {
      if (lineCommentMatch.index > 0) {
        lineTokens.push(
          ...processJSLine(line.substring(0, lineCommentMatch.index), theme, `${lineIndex}-before-comment`)
        );
      }
      
      lineTokens.push(
        <span 
          key={`comment-${lineIndex}`} 
          style={{ color: isDark ? '#6A9955' : '#008000', fontStyle: 'italic' }}
        >
          {lineCommentMatch[0]}
        </span>
      );
      
      result.push(
        <span key={`line-${lineIndex}`}>
          {lineTokens}
          {lineIndex < lines.length - 1 ? '\n' : ''}
        </span>
      );
      
      return;
    }
    
    // 通常の行処理
    lineTokens.push(...processJSLine(line, theme, `${lineIndex}`));
    
    result.push(
      <span key={`line-${lineIndex}`}>
        {lineTokens}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </span>
    );
  });
  
  return result;
};

/**
 * JavaScript行の処理
 */
const processJSLine = (line: string, theme: Theme, keyPrefix: string): React.ReactNode[] => {
  const isDark = isDarkTheme(theme);
  const segments: React.ReactNode[] = [];
  
  // キーワード
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'interface', 'type', 'enum', 'public', 'private', 'protected', 'static', 'async', 'await', 'yield', 'true', 'false', 'null', 'undefined'];
  
  let remainingLine = line;
  let segmentIndex = 0;
  
  // 文字列を先に検出
  const stringMatches: Array<{ match: RegExpMatchArray; index: number }> = [];
  const stringRegex = /(["'`])((?:\\.|[^\\])*?)\1/g;
  let stringMatch;
  while ((stringMatch = stringRegex.exec(line)) !== null) {
    stringMatches.push({ match: stringMatch, index: stringMatch.index });
  }
  
  let currentPos = 0;
  
  stringMatches.forEach(({ match, index }) => {
    // 文字列前の部分を処理
    if (index > currentPos) {
      const beforeString = line.substring(currentPos, index);
      segments.push(...processNonStringPart(beforeString, keywords, theme, `${keyPrefix}-${segmentIndex++}`));
    }
    
    // 文字列を追加
    segments.push(
      <span 
        key={`${keyPrefix}-string-${segmentIndex++}`} 
        style={{ color: isDark ? '#CE9178' : '#a31515' }}
      >
        {match[0]}
      </span>
    );
    
    currentPos = index + match[0].length;
  });
  
  // 残りの部分を処理
  if (currentPos < line.length) {
    const remaining = line.substring(currentPos);
    segments.push(...processNonStringPart(remaining, keywords, theme, `${keyPrefix}-${segmentIndex++}`));
  }
  
  return segments;
};

/**
 * 文字列以外の部分を処理
 */
const processNonStringPart = (text: string, keywords: string[], theme: Theme, keyPrefix: string): React.ReactNode[] => {
  const isDark = isDarkTheme(theme);
  const segments: React.ReactNode[] = [];
  
  let processedText = text;
  
  // キーワードを処理
  keywords.forEach(keyword => {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'g');
    processedText = processedText.replace(
      keywordRegex, 
      match => `###KEYWORD_START###${match}###KEYWORD_END###`
    );
  });
  
  // 関数呼び出しを処理
  processedText = processedText.replace(
    /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
    (match, name) => `###FUNCTION_START###${name}###FUNCTION_END###`
  );
  
  // メソッド呼び出しを処理
  processedText = processedText.replace(
    /(\.)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
    (match, dot, name) => `${dot}###METHOD_START###${name}###METHOD_END###`
  );
  
  // プロパティアクセスを処理
  processedText = processedText.replace(
    /(\.)\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*\()/g,
    (match, dot, name) => `${dot}###PROPERTY_START###${name}###PROPERTY_END###`
  );
  
  // マーカーを解析してセグメントに変換
  const parts = processedText.split(/###(KEYWORD|FUNCTION|METHOD|PROPERTY)_(START|END)###/);
  let currentStyle: string | null = null;
  let currentText = '';
  let segmentIndex = 0;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (['KEYWORD', 'FUNCTION', 'METHOD', 'PROPERTY'].includes(part) && parts[i + 1] === 'START') {
      if (currentText) {
        segments.push(<span key={`${keyPrefix}-text-${segmentIndex++}`}>{currentText}</span>);
        currentText = '';
      }
      currentStyle = part;
      i++;
    } else if (['KEYWORD', 'FUNCTION', 'METHOD', 'PROPERTY'].includes(part) && parts[i + 1] === 'END') {
      if (currentStyle && currentText) {
        let style: React.CSSProperties = {};
        
        if (currentStyle === 'KEYWORD') {
          style = { color: isDark ? '#569CD6' : '#0000ff' };
        } else if (currentStyle === 'FUNCTION' || currentStyle === 'METHOD') {
          style = { color: isDark ? '#DCDCAA' : '#795E26' };
        } else if (currentStyle === 'PROPERTY') {
          style = { color: isDark ? '#9CDCFE' : '#001080' };
        }
        
        segments.push(
          <span key={`${keyPrefix}-${currentStyle.toLowerCase()}-${segmentIndex++}`} style={style}>
            {currentText}
          </span>
        );
      }
      currentStyle = null;
      currentText = '';
      i++;
    } else if (part) {
      currentText += part;
    }
  }
  
  if (currentText) {
    segments.push(<span key={`${keyPrefix}-final-${segmentIndex++}`}>{currentText}</span>);
  }
  
  return segments;
};

/**
 * CSSのハイライト
 */
const highlightCSS = (code: string, theme: Theme): React.ReactNode[] => {
  const isDark = isDarkTheme(theme);
  const result: React.ReactNode[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, lineIndex) => {
    const lineTokens: React.ReactNode[] = [];
    
    // コメント
    if (line.includes('/*') || line.includes('*/')) {
      lineTokens.push(
        <span 
          key={`comment-${lineIndex}`} 
          style={{ color: isDark ? '#6A9955' : '#008000', fontStyle: 'italic' }}
        >
          {line}
        </span>
      );
    } else {
      // プロパティ名
      const propertyMatch = line.match(/([a-zA-Z-]+)\s*:/);
      if (propertyMatch && propertyMatch.index !== undefined) {
        if (propertyMatch.index > 0) {
          lineTokens.push(
            <span key={`before-prop-${lineIndex}`}>
              {line.substring(0, propertyMatch.index)}
            </span>
          );
        }
        
        lineTokens.push(
          <span 
            key={`prop-${lineIndex}`} 
            style={{ color: isDark ? '#9CDCFE' : '#ff0000' }}
          >
            {propertyMatch[1]}
          </span>
        );
        
        const afterProp = line.substring(propertyMatch.index + propertyMatch[1].length);
        lineTokens.push(
          <span key={`after-prop-${lineIndex}`}>
            {afterProp}
          </span>
        );
      } else {
        lineTokens.push(
          <span key={`line-${lineIndex}`}>
            {line}
          </span>
        );
      }
    }
    
    result.push(
      <span key={`line-${lineIndex}`}>
        {lineTokens}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </span>
    );
  });
  
  return result;
};

/**
 * HTMLのハイライト
 */
const highlightHTML = (code: string, theme: Theme): React.ReactNode[] => {
  return simpleHighlight(code, theme);
};

/**
 * 簡易ハイライト（未対応言語用）
 */
const simpleHighlight = (code: string, theme: Theme): React.ReactNode[] => {
  return [<span key="simple">{code}</span>];
};