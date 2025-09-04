/**
 * Twitter/X埋め込みカードコンポーネント（インラインスタイル版）
 */

import React from 'react';
import type { TwitterEmbedData } from '../utils/twitter.ts';

interface TwitterCardProps {
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
 * Twitter/X投稿をインラインスタイルで表示するコンポーネント
 * LINE WORKSなど外部スクリプトが使えない環境向け
 */
const TwitterCard: React.FC<TwitterCardProps> = ({ url, embedData, theme }) => {
  // HTMLから情報を抽出
  const extractContent = () => {
    const html = embedData.html;
    
    // ツイート本文を抽出
    const textMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    let text = '';
    let hashtags: string[] = [];
    
    if (textMatch) {
      // ハッシュタグのリンクを抽出
      const hashtagMatches = textMatch[1].matchAll(/<a[^>]*href="[^"]*hashtag[^"]*"[^>]*>([^<]*)<\/a>/g);
      for (const match of hashtagMatches) {
        hashtags.push(match[1]);
      }
      
      // テキストをクリーンアップ（HTMLタグを削除、改行を保持）
      text = textMatch[1]
        .replace(/<a[^>]*href="[^"]*hashtag[^"]*"[^>]*>([^<]*)<\/a>/g, '$1') // ハッシュタグ
        .replace(/<a[^>]*>([^<]*)<\/a>/g, '$1') // その他のリンク
        .replace(/<br\s*\/?>/g, '\n') // <br>タグを改行に変換
        .replace(/<\/p>\s*<p[^>]*>/g, '\n\n') // 段落間を改行に変換
        .replace(/<[^>]*>/g, '') // 残りのHTMLタグ
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .trim(); // 前後の空白を削除
    }
    
    // 日付を抽出
    const dateMatch = html.match(/<a[^>]*>([^<]*\d{4})<\/a>/);
    const date = dateMatch ? dateMatch[1] : '';
    
    return { text, date, hashtags };
  };
  
  const { text, date, hashtags } = extractContent();
  
  // テーマに基づいた色設定
  const isDark = () => {
    const hex = theme.backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness < 128;
  };
  
  const dark = isDark();
  
  const cardStyle: React.CSSProperties = {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: dark ? '#15202b' : '#ffffff',
    border: `1px solid ${dark ? '#38444d' : '#cfd9de'}`,
    borderRadius: '16px',
    padding: '12px 16px',
    margin: '20px 0',
    maxWidth: '550px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  };
  
  const avatarStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: dark ? '#1d9bf0' : '#1d9bf0',
    marginRight: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const xLogoStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    fill: '#ffffff',
  };
  
  const authorContainerStyle: React.CSSProperties = {
    flex: 1,
  };
  
  const authorNameStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '15px',
    color: dark ? '#f7f9fa' : '#0f1419',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };
  
  const verifiedStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    fill: '#1d9bf0',
  };
  
  const authorHandleStyle: React.CSSProperties = {
    fontSize: '15px',
    color: dark ? '#8b98a5' : '#536471',
  };
  
  const contentStyle: React.CSSProperties = {
    fontSize: '15px',
    lineHeight: '20px',
    color: dark ? '#f7f9fa' : '#0f1419',
    marginTop: '12px',
    marginBottom: '12px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  };
  
  const hashtagStyle: React.CSSProperties = {
    color: '#1d9bf0',
  };
  
  const footerStyle: React.CSSProperties = {
    fontSize: '15px',
    color: dark ? '#8b98a5' : '#536471',
    paddingTop: '12px',
    borderTop: `1px solid ${dark ? '#38444d' : '#cfd9de'}`,
  };
  
  const xBrandStyle: React.CSSProperties = {
    float: 'right',
    fontSize: '13px',
    color: dark ? '#8b98a5' : '#536471',
  };
  
  // テキスト内のハッシュタグをハイライト
  const renderTextWithHashtags = (text: string) => {
    let result = text;
    hashtags.forEach(tag => {
      result = result.replace(tag, `<span style="color: #1d9bf0">${tag}</span>`);
    });
    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      style={cardStyle}
    >
      <div style={headerStyle}>
        <div style={avatarStyle}>
          <svg style={xLogoStyle} viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
        <div style={authorContainerStyle}>
          <div style={authorNameStyle}>
            {embedData.author_name}
            <svg style={verifiedStyle} viewBox="0 0 22 22">
              <path fill="#1d9bf0" d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"/>
            </svg>
          </div>
          <div style={authorHandleStyle}>
            @{embedData.author_name.toLowerCase().replace(/\s/g, '')}
          </div>
        </div>
      </div>
      
      <div style={contentStyle}>
        {renderTextWithHashtags(text)}
      </div>
      
      <div style={footerStyle}>
        {date}
        <span style={xBrandStyle}>X で表示</span>
      </div>
    </a>
  );
};

export default TwitterCard;