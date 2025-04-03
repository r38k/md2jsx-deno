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
    let currentIndex = 0;
    const lineTokens: React.ReactNode[] = [];
    
    // コメント（行コメント）
    const lineCommentMatch = line.match(/\/\/.*/);
    if (lineCommentMatch && lineCommentMatch.index !== undefined) {
      if (lineCommentMatch.index > 0) {
        lineTokens.push(
          <span key={`code-${lineIndex}-${currentIndex}`}>
            {line.substring(0, lineCommentMatch.index)}
          </span>
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
    
    // キーワード
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'try', 'catch', 'throw', 'new', 'this', 'super', 'extends', 'implements', 'interface', 'type', 'enum', 'public', 'private', 'protected', 'static', 'async', 'await', 'yield', 'true', 'false', 'null', 'undefined'];
    
    // 文字列、キーワード、関数呼び出し、プロパティなどを検出
    let remainingLine = line;
    let segments: { text: string; style?: React.CSSProperties; }[] = [];
    
    // 文字列を検出
    const stringRegex = /(["'`])((?:\\.|[^\\])*?)\1/g;
    let stringMatch;
    while ((stringMatch = stringRegex.exec(remainingLine)) !== null) {
      if (stringMatch.index > 0) {
        const beforeString = remainingLine.substring(0, stringMatch.index);
        
        // キーワードを検出
        let processedBeforeString = beforeString;
        keywords.forEach(keyword => {
          const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'g');
          processedBeforeString = processedBeforeString.replace(
            keywordRegex, 
            match => `###KEYWORD_START###${match}###KEYWORD_END###`
          );
        });
        
        // console.logのような関数呼び出しを検出
        processedBeforeString = processedBeforeString.replace(
          /(\.)(\w+)(?=\s*\()/g,
          (match, dot, name) => `${dot}###METHOD_START###${name}###METHOD_END###`
        );
        
        // 関数名を検出
        processedBeforeString = processedBeforeString.replace(
          /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
          (match, name) => `###FUNCTION_START###${name}###FUNCTION_END###`
        );
        
        // プロパティを検出
        processedBeforeString = processedBeforeString.replace(
          /\.([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*\()/g,
          (match, name) => `.###PROPERTY_START###${name}###PROPERTY_END###`
        );
        
        // マーカーを実際のスタイル付きspanに置き換え
        const parts = processedBeforeString.split(/###(KEYWORD|METHOD|FUNCTION|PROPERTY)_(START|END)###/);
        let currentStyle: string | null = null;
        let currentText = '';
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] === 'KEYWORD' && parts[i+1] === 'START') {
            if (currentText) {
              segments.push({ text: currentText });
              currentText = '';
            }
            currentStyle = 'KEYWORD';
            i += 1;
          } else if (parts[i] === 'METHOD' && parts[i+1] === 'START') {
            if (currentText) {
              segments.push({ text: currentText });
              currentText = '';
            }
            currentStyle = 'METHOD';
            i += 1;
          } else if (parts[i] === 'FUNCTION' && parts[i+1] === 'START') {
            if (currentText) {
              segments.push({ text: currentText });
              currentText = '';
            }
            currentStyle = 'FUNCTION';
            i += 1;
          } else if (parts[i] === 'PROPERTY' && parts[i+1] === 'START') {
            if (currentText) {
              segments.push({ text: currentText });
              currentText = '';
            }
            currentStyle = 'PROPERTY';
            i += 1;
          } else if ((parts[i] === 'KEYWORD' || parts[i] === 'METHOD' || parts[i] === 'FUNCTION' || parts[i] === 'PROPERTY') && parts[i+1] === 'END') {
            if (currentStyle === 'KEYWORD') {
              segments.push({ 
                text: currentText, 
                style: { color: isDark ? '#569CD6' : '#0000ff' } 
              });
            } else if (currentStyle === 'METHOD') {
              segments.push({ 
                text: currentText, 
                style: { color: isDark ? '#DCDCAA' : '#795E26' } 
              });
            } else if (currentStyle === 'FUNCTION') {
              segments.push({ 
                text: currentText, 
                style: { color: isDark ? '#DCDCAA' : '#795E26' } 
              });
            } else if (currentStyle === 'PROPERTY') {
              segments.push({ 
                text: currentText, 
                style: { color: isDark ? '#9CDCFE' : '#001080' } 
              });
            }
            currentStyle = null;
            currentText = '';
            i += 1;
          } else if (parts[i]) {
            currentText += parts[i];
          }
        }
        
        if (currentText) {
          segments.push({ text: currentText });
        }
      }
      
      // 文字列を追加
      segments.push({ 
        text: stringMatch[0], 
        style: { color: isDark ? '#CE9178' : '#a31515' } 
      });
      
      remainingLine = remainingLine.substring(stringMatch.index + stringMatch[0].length);
      stringRegex.lastIndex = 0;
    }
    
    // 残りの部分を処理
    if (remainingLine) {
      // キーワードを検出
      let processedRemaining = remainingLine;
      keywords.forEach(keyword => {
        const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'g');
        processedRemaining = processedRemaining.replace(
          keywordRegex, 
          match => `###KEYWORD_START###${match}###KEYWORD_END###`
        );
      });
      
      // console.logのような関数呼び出しを検出
      processedRemaining = processedRemaining.replace(
        /(\.)(\w+)(?=\s*\()/g,
        (match, dot, name) => `${dot}###METHOD_START###${name}###METHOD_END###`
      );
      
      // 関数名を検出
      processedRemaining = processedRemaining.replace(
        /\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
        (match, name) => `###FUNCTION_START###${name}###FUNCTION_END###`
      );
      
      // プロパティを検出
      processedRemaining = processedRemaining.replace(
        /\.([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?!\s*\()/g,
        (match, name) => `.###PROPERTY_START###${name}###PROPERTY_END###`
      );
      
      // マーカーを実際のスタイル付きspanに置き換え
      const parts = processedRemaining.split(/###(KEYWORD|METHOD|FUNCTION|PROPERTY)_(START|END)###/);
      let currentStyle: string | null = null;
      let currentText = '';
      
      for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'KEYWORD' && parts[i+1] === 'START') {
          if (currentText) {
            segments.push({ text: currentText });
            currentText = '';
          }
          currentStyle = 'KEYWORD';
          i += 1;
        } else if (parts[i] === 'METHOD' && parts[i+1] === 'START') {
          if (currentText) {
            segments.push({ text: currentText });
            currentText = '';
          }
          currentStyle = 'METHOD';
          i += 1;
        } else if (parts[i] === 'FUNCTION' && parts[i+1] === 'START') {
          if (currentText) {
            segments.push({ text: currentText });
            currentText = '';
          }
          currentStyle = 'FUNCTION';
          i += 1;
        } else if (parts[i] === 'PROPERTY' && parts[i+1] === 'START') {
          if (currentText) {
            segments.push({ text: currentText });
            currentText = '';
          }
          currentStyle = 'PROPERTY';
          i += 1;
        } else if ((parts[i] === 'KEYWORD' || parts[i] === 'METHOD' || parts[i] === 'FUNCTION' || parts[i] === 'PROPERTY') && parts[i+1] === 'END') {
          if (currentStyle === 'KEYWORD') {
            segments.push({ 
              text: currentText, 
              style: { color: isDark ? '#569CD6' : '#0000ff' } 
            });
          } else if (currentStyle === 'METHOD') {
            segments.push({ 
              text: currentText, 
              style: { color: isDark ? '#DCDCAA' : '#795E26' } 
            });
          } else if (currentStyle === 'FUNCTION') {
            segments.push({ 
              text: currentText, 
              style: { color: isDark ? '#DCDCAA' : '#795E26' } 
            });
          } else if (currentStyle === 'PROPERTY') {
            segments.push({ 
              text: currentText, 
              style: { color: isDark ? '#9CDCFE' : '#001080' } 
            });
          }
          currentStyle = null;
          currentText = '';
          i += 1;
        } else if (parts[i]) {
          currentText += parts[i];
        }
      }
      
      if (currentText) {
        segments.push({ text: currentText });
      }
    }
    
    // セグメントをJSX要素に変換
    const jsxSegments = segments.map((segment, i) => (
      <span key={`segment-${lineIndex}-${i}`} style={segment.style}>
        {segment.text}
      </span>
    ));
    
    result.push(
      <span key={`line-${lineIndex}`}>
        {jsxSegments}
        {lineIndex < lines.length - 1 ? '\n' : ''}
      </span>
    );
  });
  
  return result;
};

/**
 * CSSのハイライト
 */
const highlightCSS = (code: string, theme: Theme): React.ReactNode[] => {
  const isDark = isDarkTheme(theme);
  const result: React.ReactNode[] = [];
  
  // 行ごとに処理
  const lines = code.split('\n');
  
  lines.forEach((line, lineIndex) => {
    const lineTokens: React.ReactNode[] = [];
    
    // コメント
    if (line.includes('/*') || line.includes('*/')) {
      // コメント行はそのまま色を適用
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
        
        // 色コード
        const colorMatch = afterProp.match(/(:\s*)(#[a-fA-F0-9]{3,8})\b/);
        if (colorMatch && colorMatch.index !== undefined) {
          lineTokens.push(
            <span key={`colon-${lineIndex}`}>
              {afterProp.substring(0, colorMatch.index + colorMatch[1].length)}
            </span>
          );
          
          lineTokens.push(
            <span 
              key={`color-${lineIndex}`} 
              style={{ color: isDark ? '#CE9178' : '#a31515' }}
            >
              {colorMatch[2]}
            </span>
          );
          
          if (colorMatch.index + colorMatch[0].length < afterProp.length) {
            lineTokens.push(
              <span key={`after-color-${lineIndex}`}>
                {afterProp.substring(colorMatch.index + colorMatch[0].length)}
              </span>
            );
          }
        } else {
          // 単位付き数値
          const unitMatch = afterProp.match(/(:\s*)(\d+)(px|em|rem|vh|vw|%|s|ms|deg|rad|fr)\b/);
          if (unitMatch && unitMatch.index !== undefined) {
            lineTokens.push(
              <span key={`colon-${lineIndex}`}>
                {afterProp.substring(0, unitMatch.index + unitMatch[1].length)}
              </span>
            );
            
            lineTokens.push(
              <span 
                key={`number-${lineIndex}`} 
                style={{ color: isDark ? '#B5CEA8' : '#098658' }}
              >
                {unitMatch[2] + unitMatch[3]}
              </span>
            );
            
            if (unitMatch.index + unitMatch[0].length < afterProp.length) {
              lineTokens.push(
                <span key={`after-unit-${lineIndex}`}>
                  {afterProp.substring(unitMatch.index + unitMatch[0].length)}
                </span>
              );
            }
          } else {
            lineTokens.push(
              <span key={`after-prop-${lineIndex}`}>
                {afterProp}
              </span>
            );
          }
        }
      } else {
        // セレクタや括弧
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
  // 簡易実装
  return simpleHighlight(code, theme);
};

/**
 * 簡易ハイライト（未対応言語用）
 */
const simpleHighlight = (code: string, theme: Theme): React.ReactNode[] => {
  return [<span key="simple">{code}</span>];
};
