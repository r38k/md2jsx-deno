/**
 * Webアプリのヘッダーコンポーネント
 */

import React from 'react';

interface HeaderProps {
  currentTheme: string;
  enableOGP: boolean;
}

// テーマに基づいたスタイル定義
const getThemeStyles = (themeName: string) => {
  const themes = {
    light: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-800',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      buttonInactive: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    },
    dark: {
      bg: 'bg-gray-900',
      cardBg: 'bg-gray-800',
      textPrimary: 'text-gray-100',
      textSecondary: 'text-gray-300',
      border: 'border-gray-700',
      buttonInactive: 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600',
    },
    sepia: {
      bg: 'bg-amber-50',
      cardBg: 'bg-amber-100',
      textPrimary: 'text-amber-900',
      textSecondary: 'text-amber-800',
      border: 'border-amber-200',
      buttonInactive: 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-200',
    },
    nord: {
      bg: 'bg-slate-800',
      cardBg: 'bg-slate-700',
      textPrimary: 'text-slate-100',
      textSecondary: 'text-slate-300',
      border: 'border-slate-600',
      buttonInactive: 'bg-slate-600 text-slate-300 border-slate-500 hover:bg-slate-500',
    },
    github: {
      bg: 'bg-gray-50',
      cardBg: 'bg-white',
      textPrimary: 'text-gray-900',
      textSecondary: 'text-gray-600',
      border: 'border-gray-200',
      buttonInactive: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
    },
    dracula: {
      bg: 'bg-purple-900',
      cardBg: 'bg-purple-800',
      textPrimary: 'text-purple-100',
      textSecondary: 'text-purple-200',
      border: 'border-purple-700',
      buttonInactive: 'bg-purple-700 text-purple-200 border-purple-600 hover:bg-purple-600',
    },
  };
  
  return themes[themeName as keyof typeof themes] || themes.dark;
};

const Header: React.FC<HeaderProps> = ({ currentTheme, enableOGP }) => {
  const themes = [
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
    { key: 'sepia', label: 'Sepia' },
    { key: 'nord', label: 'Nord' },
    { key: 'github', label: 'GitHub' },
    { key: 'dracula', label: 'Dracula' },
  ];

  const themeStyles = getThemeStyles(currentTheme);

  return (
    <div className="mb-4">
      {/* タイトル */}
      <div className="mb-4">
        <h1 className={`text-2xl font-bold mb-1 ${themeStyles.textPrimary}`}>MarkdownToJsx デモ</h1>
        <p className={`text-sm ${themeStyles.textSecondary}`}>Markdownをインラインスタイル付きJSXに変換するツール</p>
      </div>

      {/* コントロールパネル */}
      <div className={`${themeStyles.cardBg} rounded-lg shadow-sm border ${themeStyles.border} p-4`}>
        {/* テーマ選択 */}
        <div className="mb-4">
          <h3 className={`text-base font-semibold mb-2 ${themeStyles.textPrimary}`}>テーマ選択</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {themes.map((theme) => (
              <a
                key={theme.key}
                href={`?theme=${theme.key}${enableOGP ? '&ogp=true' : ''}`}
                className={`
                  px-3 py-2 rounded-md text-sm text-center font-medium transition-all duration-200
                  border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  ${currentTheme === theme.key 
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md' 
                    : themeStyles.buttonInactive
                  }
                `}
              >
                {theme.label}
              </a>
            ))}
          </div>
        </div>

        {/* OGP設定 */}
        <div>
          <h3 className={`text-base font-semibold mb-2 ${themeStyles.textPrimary}`}>OGP プレビュー</h3>
          <div className="flex items-center gap-3">
            <a
              href={`?theme=${currentTheme}&ogp=${!enableOGP}`}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                border hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1
                ${enableOGP 
                  ? 'bg-green-500 text-white border-green-500 shadow-md hover:bg-green-600 focus:ring-green-500' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-gray-300 focus:ring-blue-500'
                }
              `}
            >
              {enableOGP ? 'ON' : 'OFF'}
            </a>
            <div className={`text-sm ${themeStyles.textSecondary}`}>
              {enableOGP ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  スタンドアロンリンクがOGPカードとして表示されます
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  通常のリンク表示
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;