/**
 * Twitter/X埋め込みカードコンポーネント（widgets.js版）
 */

import React, { useEffect, useRef } from 'react';
import type { TwitterEmbedData } from '../utils/twitter.ts';

interface TwitterWidgetsCardProps {
  url: string;
  embedData: TwitterEmbedData;
  theme: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    tableBorderColor: string;
  };
}

/**
 * Twitter/X投稿をwidgets.jsで表示するコンポーネント
 */
const TwitterWidgetsCard: React.FC<TwitterWidgetsCardProps> = ({ url, embedData, theme }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // テーマに基づいてダークモードかライトモードを判定
  const isDarkTheme = () => {
    const hex = theme.backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
  };
  
  // テーマに応じてdata-theme属性を設定したHTMLを生成
  const getThemedHtml = () => {
    const twitterTheme = isDarkTheme() ? 'dark' : 'light';
    return embedData.html.replace(
      '<blockquote class="twitter-tweet"',
      `<blockquote class="twitter-tweet" data-theme="${twitterTheme}"`
    );
  };
  
  useEffect(() => {
    // Twitter Widgetsスクリプトが既に読み込まれている場合は再レンダリング
    if ((window as any).twttr?.widgets) {
      (window as any).twttr.widgets.load(containerRef.current);
    }
  }, [embedData.html, theme]);
  
  const containerStyle: React.CSSProperties = {
    margin: '20px 0',
    maxWidth: '550px',
  };
  
  return (
    <div 
      style={containerStyle} 
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: getThemedHtml() }}
    />
  );
};

export default TwitterWidgetsCard;