/**
 * OGPカードコンポーネント
 */

import React from 'react';
import type { OGPInfo } from '../utils/ogp.ts';

interface OGPCardProps {
  url: string;
  ogpInfo: OGPInfo;
  theme: {
    backgroundColor: string;
    textColor: string;
    linkColor: string;
    tableBorderColor: string;
  };
}

/**
 * OGPカードをインラインスタイルで表示するコンポーネント
 */
const OGPCard: React.FC<OGPCardProps> = ({ url, ogpInfo, theme }) => {
  const cardStyle: React.CSSProperties = {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    border: `1px solid ${theme.tableBorderColor}`,
    borderRadius: '12px',
    overflow: 'hidden',
    margin: '20px 0',
    backgroundColor: theme.backgroundColor,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    maxWidth: '600px',
  };

  const cardContentStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    height: '100px', // minHeightをheightに変更で高さ統一
    width: '100%',
  };

  const textContainerStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minWidth: 0, // flexboxで省略記号を有効にする
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '15px',
    fontWeight: 'bold',
    color: theme.textColor,
    marginBottom: '4px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 1,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.3',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '12px',
    color: theme.textColor,
    opacity: 0.75,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.3',
    marginBottom: '6px',
    flex: 1,
  };

  const urlStyle: React.CSSProperties = {
    fontSize: '11px',
    color: theme.linkColor,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontWeight: '500',
    textTransform: 'lowercase',
  };

  const imageContainerStyle: React.CSSProperties = {
    width: '100px',
    height: '100px', // 高さを明示的に指定
    flexShrink: 0,
    backgroundColor: theme.tableBorderColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // 画像がはみ出さないように
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block', // 画像の下の空白を防ぐ
  };

  // URLのホスト名を取得
  const getHostname = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={cardContentStyle}>
        <div style={textContainerStyle}>
          <div>
            {ogpInfo.title && <div style={titleStyle}>{ogpInfo.title}</div>}
            {ogpInfo.description && <div style={descriptionStyle}>{ogpInfo.description}</div>}
          </div>
          <div style={urlStyle}>
            {ogpInfo.siteName || getHostname(ogpInfo.url || url)}
          </div>
        </div>
        {ogpInfo.image && (
          <div style={imageContainerStyle}>
            <img
              src={ogpInfo.image}
              alt={ogpInfo.title || 'OGP Image'}
              style={imageStyle}
              loading="lazy"
              onError={(e) => {
                // 画像読み込みエラー時は画像コンテナを非表示
                const target = e.currentTarget as HTMLImageElement;
                if (target.parentElement) {
                  target.parentElement.style.display = 'none';
                }
              }}
            />
          </div>
        )}
      </div>
    </a>
  );
};

export default OGPCard;