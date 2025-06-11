import React, { useEffect, useState } from 'react';
import type { OGPInfo } from '../utils/ogp.ts';
import type { ThemeName } from './MarkdownToJsx.tsx';

interface MarkdownToJsxClientProps {
  markdown: string;
  themeName?: ThemeName;
  ogpData?: Map<string, OGPInfo>;
}

export const MarkdownToJsxClient: React.FC<MarkdownToJsxClientProps> = (props) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ動的インポート
    import('./MarkdownToJsx.tsx').then((module) => {
      setComponent(() => module.default);
    });
  }, []);

  // SSRまたはコンポーネント読み込み中
  if (!Component) {
    const theme = {
      light: { bg: '#ffffff', text: '#333333' },
      dark: { bg: '#1e1e1e', text: '#e0e0e0' },
      sepia: { bg: '#f4ecd8', text: '#5b4636' },
      nord: { bg: '#2e3440', text: '#d8dee9' },
      github: { bg: '#ffffff', text: '#24292e' },
      dracula: { bg: '#282a36', text: '#f8f8f2' },
    };

    const selectedTheme = theme[props.themeName || 'dark'] || theme.dark;

    return (
      <div style={{
        minHeight: '500px',
        backgroundColor: selectedTheme.bg,
        color: selectedTheme.text,
        padding: '20px',
        borderRadius: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>Loading Markdown Parser...</div>
      </div>
    );
  }

  return <Component {...props} />;
};

export default MarkdownToJsxClient;